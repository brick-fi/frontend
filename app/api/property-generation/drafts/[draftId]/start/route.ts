import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireDraftAccess } from '@/lib/property-generation/auth'
import { publicUrlForS3Key } from '@/lib/property-generation/s3'
import { ROOM_IMAGE_COUNT } from '@/lib/property-generation/types'
import { startWorldGeneration } from '@/lib/property-generation/world-labs'

export const runtime = 'nodejs'

const STALE_START_LOCK_MS = 15 * 60 * 1000

interface RouteContext {
  params: Promise<unknown>
}

async function getDraftId(context: RouteContext) {
  const params = await context.params
  if (typeof params !== 'object' || params === null || typeof (params as Record<string, unknown>).draftId !== 'string') {
    throw new Error('Invalid draft id')
  }
  return (params as Record<string, string>).draftId
}

interface ListingDraftRow {
  id: string
  title: string
  location: string
  description: string
}

interface GenerationJobRow {
  id: string
  input_image_paths: string[]
  status: string
  worldlabs_operation_id: string | null
  wallet_address: string
  updated_at: string
}

interface ActiveJobRow {
  id: string
}

function draftAccessErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : null
  if (message === 'Missing draft access token') {
    return NextResponse.json({ error: message }, { status: 401 })
  }
  if (message === 'Invalid draft access token') {
    return NextResponse.json({ error: message }, { status: 403 })
  }
  if (message === 'Listing draft not found') {
    return NextResponse.json({ error: message }, { status: 404 })
  }
  return null
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const draftId = await getDraftId(context)
    const supabase = createSupabaseAdminClient()
    await requireDraftAccess(supabase, draftId, request)

    const { data: draft, error: draftError } = await supabase
      .from('property_listing_drafts')
      .select('id,title,location,description')
      .eq('id', draftId)
      .single<ListingDraftRow>()

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Listing draft not found' }, { status: 404 })
    }

    const { data: job, error: jobError } = await supabase
      .from('property_3d_jobs')
      .select('id,input_image_paths,status,worldlabs_operation_id,wallet_address,updated_at')
      .eq('draft_id', draftId)
      .single<GenerationJobRow>()

    if (jobError || !job) {
      return NextResponse.json({ error: '3D job not found. Upload room images first.' }, { status: 404 })
    }

    if (job.input_image_paths.length !== ROOM_IMAGE_COUNT) {
      return NextResponse.json({ error: `Exactly ${ROOM_IMAGE_COUNT} uploaded images are required` }, { status: 400 })
    }

    if (job.status === 'waiting_world_labs' && job.worldlabs_operation_id) {
      return NextResponse.json({ jobId: job.id, status: 'waiting_world_labs', operationId: job.worldlabs_operation_id })
    }

    let startableStatus = job.status
    if (job.status === 'uploading_world_labs_media' && !job.worldlabs_operation_id) {
      const lockAge = Date.now() - Date.parse(job.updated_at)
      if (Number.isFinite(lockAge) && lockAge > STALE_START_LOCK_MS) {
        const { error: resetError } = await supabase
          .from('property_3d_jobs')
          .update({ status: 'queued', error: 'Recovered stale generation start lock' })
          .eq('id', job.id)
          .eq('status', 'uploading_world_labs_media')

        if (resetError) {
          return NextResponse.json({ error: resetError.message }, { status: 500 })
        }
        startableStatus = 'queued'
      }
    }

    if (startableStatus !== 'queued') {
      return NextResponse.json({ jobId: job.id, status: job.status, operationId: job.worldlabs_operation_id })
    }

    const { data: activeJob, error: activeJobError } = await supabase
      .from('property_3d_jobs')
      .select('id')
      .eq('wallet_address', job.wallet_address)
      .neq('id', job.id)
      .in('status', ['uploading_world_labs_media', 'waiting_world_labs', 'finalizing'])
      .limit(1)
      .maybeSingle<ActiveJobRow>()

    if (activeJobError) {
      return NextResponse.json({ error: activeJobError.message }, { status: 500 })
    }

    if (activeJob) {
      return NextResponse.json({ error: 'Only one active 3D generation is allowed per wallet' }, { status: 429 })
    }

    const { data: lockedJob, error: lockError } = await supabase
      .from('property_3d_jobs')
      .update({ status: 'uploading_world_labs_media', error: null })
      .eq('id', job.id)
      .eq('status', 'queued')
      .select('id')
      .single<{ id: string }>()

    if (lockError || !lockedJob) {
      return NextResponse.json({ error: '3D generation is already starting or started' }, { status: 409 })
    }

    let imageUrls: string[]
    try {
      imageUrls = job.input_image_paths.map(publicUrlForS3Key)
      if (imageUrls.length !== ROOM_IMAGE_COUNT) {
        throw new Error('Failed to build all room image URLs')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to build all room image URLs'
      await supabase.from('property_3d_jobs').update({ status: 'queued', error: message }).eq('id', job.id)
      return NextResponse.json({ error: message }, { status: 500 })
    }

    let operationId: string
    try {
      operationId = await startWorldGeneration({
        displayName: draft.title,
        imageUrls,
        textPrompt: `${draft.title}. ${draft.location}. ${draft.description}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start 3D generation'
      await supabase.from('property_3d_jobs').update({ status: 'queued', error: message }).eq('id', job.id)
      throw error
    }

    const { error: updateJobError } = await supabase
      .from('property_3d_jobs')
      .update({ status: 'waiting_world_labs', worldlabs_operation_id: operationId, error: null })
      .eq('id', job.id)

    if (updateJobError) {
      const { error: repairError } = await supabase
        .from('property_3d_jobs')
        .update({ status: 'waiting_world_labs', worldlabs_operation_id: operationId, error: null })
        .eq('id', job.id)

      if (!repairError) {
        await supabase.from('property_listing_drafts').update({ status: 'generating' }).eq('id', draftId)
        return NextResponse.json({ jobId: job.id, status: 'waiting_world_labs', operationId })
      }

      return NextResponse.json({ error: updateJobError.message }, { status: 500 })
    }

    await supabase.from('property_listing_drafts').update({ status: 'generating' }).eq('id', draftId)

    return NextResponse.json({ jobId: job.id, status: 'waiting_world_labs', operationId })
  } catch (error) {
    const accessResponse = draftAccessErrorResponse(error)
    if (accessResponse) return accessResponse

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start 3D generation' },
      { status: 500 }
    )
  }
}
