import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireDraftAccess } from '@/lib/property-generation/auth'
import { ROOM_IMAGE_BUCKET, ROOM_IMAGE_COUNT } from '@/lib/property-generation/types'

export const runtime = 'nodejs'

const MAX_ROOM_IMAGE_BYTES = 20 * 1024 * 1024
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

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120)
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

function detectRoomImageContentType(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

interface ValidatedRoomImage {
  bytes: Buffer
  contentType: string
  fileName: string
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

export async function POST(request: NextRequest, context: RouteContext) {
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

    const formData = await request.formData()
    const files = formData.getAll('files').filter((file): file is File => file instanceof File)

    if (files.length !== ROOM_IMAGE_COUNT) {
      return NextResponse.json({ error: `Exactly ${ROOM_IMAGE_COUNT} room images are required` }, { status: 400 })
    }

    const validatedImages: ValidatedRoomImage[] = []
    for (const file of files) {
      if (file.size === 0) {
        return NextResponse.json({ error: 'Room images cannot be empty' }, { status: 400 })
      }
      if (file.size > MAX_ROOM_IMAGE_BYTES) {
        return NextResponse.json({ error: 'Each image must be 20MB or smaller' }, { status: 400 })
      }

      const bytes = Buffer.from(await file.arrayBuffer())
      const contentType = detectRoomImageContentType(bytes)
      if (!contentType) {
        return NextResponse.json({ error: 'Only JPEG, PNG, or WebP room images are allowed' }, { status: 400 })
      }

      validatedImages.push({ bytes, contentType, fileName: file.name })
    }

    const uploadedPaths: string[] = []
    for (const image of validatedImages) {
      const path = `${draftId}/${randomUUID()}-${safeFileName(image.fileName)}`
      const { error } = await supabase.storage
        .from(ROOM_IMAGE_BUCKET)
        .upload(path, image.bytes, {
          contentType: image.contentType,
          upsert: false,
        })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      uploadedPaths.push(path)
    }

    const jobPayload = {
      wallet_address: draft.wallet_address,
      status: 'queued',
      input_image_paths: uploadedPaths,
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

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload room images' },
      { status: 500 }
    )
  }
}
