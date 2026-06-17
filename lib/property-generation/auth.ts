import { SupabaseClient } from '@supabase/supabase-js'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'

export function createDraftAccessToken() {
  return randomBytes(32).toString('base64url')
}

export function hashDraftAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function getBearerToken(request: Request) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim()
}

function safeCompareHash(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex')
  const rightBuffer = Buffer.from(right, 'hex')
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export async function requireDraftAccess(supabase: SupabaseClient, draftId: string, request: Request) {
  const token = getBearerToken(request)
  if (!token) {
    throw new Error('Missing draft access token')
  }

  const { data: draft, error } = await supabase
    .from('property_listing_drafts')
    .select('id,wallet_address,draft_access_token_hash')
    .eq('id', draftId)
    .single()

  if (error || !draft) {
    throw new Error('Listing draft not found')
  }

  const tokenHash = hashDraftAccessToken(token)
  if (!draft.draft_access_token_hash || !safeCompareHash(tokenHash, draft.draft_access_token_hash)) {
    throw new Error('Invalid draft access token')
  }

  return draft as { id: string; wallet_address: string; draft_access_token_hash: string }
}
