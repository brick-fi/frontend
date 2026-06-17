import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireDraftAccess } from '@/lib/property-generation/auth'
import { createPropertyAssetKey, publicUrlForS3Key, uploadJsonToS3 } from '@/lib/property-generation/s3'

export const runtime = 'nodejs'

const METADATA_URI_REF_KEY = '__metadataURI'

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
  total_value: number
  expected_monthly_income: number
  tags: string[]
  status: string
  metadata_uri: string | null
}

interface GenerationJobRow {
  id: string
  status: string
  worldlabs_world_id: string | null
  world_marble_url: string | null
  thumbnail_url: string | null
  pano_url: string | null
  spz_urls: Record<string, string>
  collider_mesh_url: string | null
  input_image_paths: string[]
  mirrored_asset_refs: Record<string, unknown> | null
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

function stringMapFromJson(value: Record<string, unknown> | null) {
  if (!value) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const draftId = await getDraftId(context)
    const supabase = createSupabaseAdminClient()
    await requireDraftAccess(supabase, draftId, request)

    const { data: draft, error: draftError } = await supabase
      .from('property_listing_drafts')
      .select('id,title,location,description,total_value,expected_monthly_income,tags,status,metadata_uri')
      .eq('id', draftId)
      .single<ListingDraftRow>()

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Listing draft not found' }, { status: 404 })
    }

    if (draft.metadata_uri) {
      return NextResponse.json({
        draftId: draft.id,
        status: draft.status,
        metadataURI: draft.metadata_uri,
      })
    }

    const { data: job, error: jobError } = await supabase
      .from('property_3d_jobs')
      .select('id,status,worldlabs_world_id,world_marble_url,thumbnail_url,pano_url,spz_urls,collider_mesh_url,input_image_paths,mirrored_asset_refs')
      .eq('draft_id', draftId)
      .single<GenerationJobRow>()

    if (jobError || !job) {
      return NextResponse.json({ error: '3D job not found' }, { status: 404 })
    }

    if (job.status !== 'succeeded' && job.status !== 'finalizing') {
      return NextResponse.json({ error: '3D job must succeed before metadata can be finalized' }, { status: 400 })
    }

    const { error: finalizingError } = await supabase.from('property_3d_jobs').update({ status: 'finalizing', error: null }).eq('id', job.id)
    if (finalizingError) {
      return NextResponse.json({ error: finalizingError.message }, { status: 500 })
    }

    try {
      const mirroredAssetRefs = stringMapFromJson(job.mirrored_asset_refs)
      const imageURIs: string[] = []
      for (const imagePath of job.input_image_paths) {
        const existingUri = mirroredAssetRefs[imagePath]
        if (existingUri) {
          imageURIs.push(existingUri)
          continue
        }

        const imageUrl = publicUrlForS3Key(imagePath)
        mirroredAssetRefs[imagePath] = imageUrl

        const { error: mirroredAssetRefsError } = await supabase
          .from('property_3d_jobs')
          .update({ mirrored_asset_refs: mirroredAssetRefs })
          .eq('id', job.id)

        if (mirroredAssetRefsError) {
          throw new Error(mirroredAssetRefsError.message)
        }

        imageURIs.push(imageUrl)
      }

      const totalValue = Number(draft.total_value)
      const expectedMonthlyIncome = Number(draft.expected_monthly_income)
      const annualYield = totalValue > 0 ? ((expectedMonthlyIncome * 12) / totalValue * 100).toFixed(2) : '0'
      const metadata = {
        name: draft.title,
        description: draft.description,
        images: imageURIs,
        location: draft.location,
        totalValue,
        expectedMonthlyIncome,
        annualYield,
        tags: draft.tags,
        aiInsights: null,
        worldModel: {
          provider: 'world_labs',
          worldId: job.worldlabs_world_id,
          worldMarbleUrl: job.world_marble_url,
          thumbnailUrl: job.thumbnail_url,
          panoUrl: job.pano_url,
          spzUrls: job.spz_urls,
          colliderMeshUrl: job.collider_mesh_url,
        },
      }

      const metadataURI = mirroredAssetRefs[METADATA_URI_REF_KEY] ||
        (await uploadJsonToS3(metadata, createPropertyAssetKey(draftId, 'metadata.json'))).url

      if (!mirroredAssetRefs[METADATA_URI_REF_KEY]) {
        mirroredAssetRefs[METADATA_URI_REF_KEY] = metadataURI
        const { error: metadataRefError } = await supabase
          .from('property_3d_jobs')
          .update({ mirrored_asset_refs: mirroredAssetRefs })
          .eq('id', job.id)

        if (metadataRefError) {
          throw new Error(metadataRefError.message)
        }
      }

      const { data: updatedDraft, error: updateDraftError } = await supabase
        .from('property_listing_drafts')
        .update({ status: 'ready_to_mint', metadata_uri: metadataURI })
        .eq('id', draftId)
        .select('id,status,metadata_uri')
        .single()

      if (updateDraftError) {
        throw new Error(updateDraftError.message)
      }

      await supabase.from('property_3d_jobs').update({ status: 'succeeded' }).eq('id', job.id)

      return NextResponse.json({
        draftId: updatedDraft.id,
        status: updatedDraft.status,
        metadataURI: updatedDraft.metadata_uri,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to finalize metadata'
      await supabase.from('property_3d_jobs').update({ status: 'succeeded', error: message }).eq('id', job.id)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } catch (error) {
    const accessResponse = draftAccessErrorResponse(error)
    if (accessResponse) return accessResponse

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to finalize metadata' },
      { status: 500 }
    )
  }
}
