import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireDraftAccess } from '@/lib/property-generation/auth'
import { extractWorldLabsAssets, getWorldLabsOperation, getWorldLabsWorld } from '@/lib/property-generation/world-labs'

export const runtime = 'nodejs'

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

interface GenerationJobRow {
  id: string
  status: string
  worldlabs_operation_id: string | null
  worldlabs_world_id: string | null
  world_marble_url: string | null
  thumbnail_url: string | null
  pano_url: string | null
  spz_urls: Record<string, string>
  collider_mesh_url: string | null
  error: string | null
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown, key: string) {
  if (!isRecord(value)) return null
  const child = value[key]
  return typeof child === 'string' ? child : null
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const draftId = await getDraftId(context)
    const supabase = createSupabaseAdminClient()
    await requireDraftAccess(supabase, draftId, request)

    const { data: job, error } = await supabase
      .from('property_3d_jobs')
      .select('id,status,worldlabs_operation_id,worldlabs_world_id,world_marble_url,thumbnail_url,pano_url,spz_urls,collider_mesh_url,error')
      .eq('draft_id', draftId)
      .single<GenerationJobRow>()

    if (error || !job) {
      return NextResponse.json({ error: '3D job not found' }, { status: 404 })
    }

    if (job.status !== 'waiting_world_labs' || !job.worldlabs_operation_id) {
      return NextResponse.json({ job })
    }

    const operation = await getWorldLabsOperation(job.worldlabs_operation_id)
    if (!operation.done) {
      return NextResponse.json({ job, operation: { done: false } })
    }

    if (operation.error) {
      const errorMessage = isRecord(operation.error) ? getString(operation.error, 'message') : null
      await supabase
        .from('property_3d_jobs')
        .update({ status: 'failed', error: errorMessage || 'World Labs generation failed' })
        .eq('id', job.id)
      await supabase.from('property_listing_drafts').update({ status: 'failed' }).eq('id', draftId)
      return NextResponse.json({ job: { ...job, status: 'failed', error: errorMessage } })
    }

    const responseWorld = isRecord(operation.response) ? operation.response : null
    const responseWorldId = responseWorld ? getString(responseWorld, 'world_id') : null
    const metadataWorldId = isRecord(operation.metadata) ? getString(operation.metadata, 'world_id') : null
    const worldId = responseWorldId || metadataWorldId
    const world = worldId ? await getWorldLabsWorld(worldId) : responseWorld
    const assets = extractWorldLabsAssets(world)

    const { data: updatedJob, error: updateError } = await supabase
      .from('property_3d_jobs')
      .update({
        status: 'succeeded',
        worldlabs_world_id: assets.worldId,
        world_marble_url: assets.worldMarbleUrl,
        thumbnail_url: assets.thumbnailUrl,
        pano_url: assets.panoUrl,
        spz_urls: assets.spzUrls,
        collider_mesh_url: assets.colliderMeshUrl,
        completed_at: new Date().toISOString(),
        error: null,
      })
      .eq('id', job.id)
      .select('id,status,worldlabs_operation_id,worldlabs_world_id,world_marble_url,thumbnail_url,pano_url,spz_urls,collider_mesh_url,error')
      .single<GenerationJobRow>()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    const accessResponse = draftAccessErrorResponse(error)
    if (accessResponse) return accessResponse

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read 3D job status' },
      { status: 500 }
    )
  }
}
