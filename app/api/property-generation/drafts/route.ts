import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { ListingDraftInput } from '@/lib/property-generation/types'
import { createDraftAccessToken, hashDraftAccessToken } from '@/lib/property-generation/auth'
import { buildDraftSignatureMessage, isDraftSignatureFresh } from '@/lib/property-generation/signature'
import { isAddress, verifyMessage } from 'viem'

export const runtime = 'nodejs'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function parseDraftInput(value: unknown): ListingDraftInput | null {
  if (typeof value !== 'object' || value === null) return null
  const input = value as Record<string, unknown>
  const totalValue = Number(input.totalValue)
  const expectedMonthlyIncome = Number(input.expectedMonthlyIncome)

  if (
    typeof input.walletAddress !== 'string' ||
    !isAddress(input.walletAddress) ||
    typeof input.signatureMessage !== 'string' ||
    typeof input.signatureIssuedAt !== 'string' ||
    typeof input.walletSignature !== 'string' ||
    !input.walletSignature.startsWith('0x') ||
    typeof input.title !== 'string' ||
    typeof input.location !== 'string' ||
    typeof input.description !== 'string' ||
    !Number.isFinite(totalValue) ||
    !Number.isFinite(expectedMonthlyIncome) ||
    !isStringArray(input.tags)
  ) {
    return null
  }

  return {
    walletAddress: input.walletAddress,
    signatureMessage: input.signatureMessage,
    signatureIssuedAt: input.signatureIssuedAt,
    walletSignature: input.walletSignature as `0x${string}`,
    title: input.title,
    location: input.location,
    description: input.description,
    totalValue,
    expectedMonthlyIncome,
    tags: input.tags,
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = parseDraftInput(await request.json())
    if (!input) {
      return NextResponse.json({ error: 'Invalid listing draft payload' }, { status: 400 })
    }

    if (!isDraftSignatureFresh(input.signatureIssuedAt)) {
      return NextResponse.json({ error: 'Wallet signature is expired' }, { status: 401 })
    }

    const expectedSignatureMessage = buildDraftSignatureMessage(input)
    if (input.signatureMessage !== expectedSignatureMessage) {
      return NextResponse.json({ error: 'Wallet signature does not match listing draft payload' }, { status: 401 })
    }

    const isVerified = await verifyMessage({
      address: input.walletAddress as `0x${string}`,
      message: input.signatureMessage,
      signature: input.walletSignature,
    })

    if (!isVerified) {
      return NextResponse.json({ error: 'Wallet signature verification failed' }, { status: 401 })
    }

    const supabase = createSupabaseAdminClient()
    const draftAccessToken = createDraftAccessToken()
    const { data, error } = await supabase
      .from('property_listing_drafts')
      .insert({
        wallet_address: input.walletAddress,
        title: input.title,
        location: input.location,
        description: input.description,
        total_value: input.totalValue,
        expected_monthly_income: input.expectedMonthlyIncome,
        tags: input.tags,
        status: 'draft',
        draft_access_token_hash: hashDraftAccessToken(draftAccessToken),
      })
      .select('id,status')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ draftId: data.id, status: data.status, draftAccessToken })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create listing draft' },
      { status: 500 }
    )
  }
}
