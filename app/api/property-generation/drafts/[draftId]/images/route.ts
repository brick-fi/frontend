import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireDraftAccess } from '@/lib/property-generation/auth'
import {
  parseRoomImagesRequest,
  prepareRoomImageUploads,
  RoomImageUploadValidationError,
  validateCommittedRoomImages,
} from '@/lib/property-generation/room-image-uploads'

export const runtime = 'nodejs'

const REPLACEABLE_JOB_STATUS_VALUES = ['queued', 'failed', 'cancelled']
const REPLACEABLE_JOB_STATUSES = new Set(REPLACEABLE_JOB_STATUS_VALUES)

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

interface ExistingJobRow {
  id: string
  status: string
}

interface JobResponseRow {
  id: string
  status: string
  input_image_paths: string[]
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const draftId = await getDraftId(context)
    const supabase = createSupabaseAdminClient()
    const draft = await requireDraftAccess(supabase, draftId, request)

    const { data: existingJob, error: existingJobError } = await supabase
      .from('property_3d_jobs')
      .select('id,status')
      .eq('draft_id', draftId)
      .maybeSingle<ExistingJobRow>()

    if (existingJobError) {
      return NextResponse.json({ error: existingJobError.message }, { status: 500 })
    }

    if (existingJob && !REPLACEABLE_JOB_STATUSES.has(existingJob.status)) {
      return NextResponse.json({ error: 'Room images cannot be replaced after 3D generation has started' }, { status: 409 })
    }

    const payload = parseRoomImagesRequest(await request.json())
    if (!payload) {
      return NextResponse.json({ error: 'Invalid room image upload payload' }, { status: 400 })
    }

    if (payload.action === 'prepare') {
      const uploads = await prepareRoomImageUploads(draftId, payload.files)
      return NextResponse.json({ uploads })
    }

    await validateCommittedRoomImages(draftId, payload.keys)

    const jobPayload = {
      wallet_address: draft.wallet_address,
      status: 'queued',
      input_image_paths: payload.keys,
      mirrored_asset_refs: {},
      error: null,
    }

    const { data: job, error: jobError } = existingJob
      ? await supabase
          .from('property_3d_jobs')
          .update(jobPayload)
          .eq('id', existingJob.id)
          .in('status', REPLACEABLE_JOB_STATUS_VALUES)
          .select('id,status,input_image_paths')
          .maybeSingle<JobResponseRow>()
      : await supabase
          .from('property_3d_jobs')
          .insert({ ...jobPayload, draft_id: draftId })
          .select('id,status,input_image_paths')
          .single<JobResponseRow>()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: 'Room images cannot be replaced after 3D generation has started' }, { status: 409 })
    }

    return NextResponse.json({ jobId: job.id, status: job.status, imageCount: job.input_image_paths.length })
  } catch (error) {
    const accessResponse = draftAccessErrorResponse(error)
    if (accessResponse) return accessResponse
    if (error instanceof RoomImageUploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload room images' },
      { status: 500 }
    )
  }
}
