export const DRAFT_SIGNATURE_TTL_MS = 10 * 60 * 1000

export interface DraftSignatureFields {
  walletAddress: string
  title: string
  location: string
  description: string
  totalValue: number
  expectedMonthlyIncome: number
  tags: string[]
  signatureIssuedAt: string
}

export function buildDraftSignatureMessage(fields: DraftSignatureFields) {
  return [
    'BrickFi property listing draft',
    JSON.stringify({
      walletAddress: fields.walletAddress,
      title: fields.title,
      location: fields.location,
      description: fields.description,
      totalValue: fields.totalValue,
      expectedMonthlyIncome: fields.expectedMonthlyIncome,
      tags: fields.tags,
      signatureIssuedAt: fields.signatureIssuedAt,
    }),
  ].join('\n')
}

export function isDraftSignatureFresh(signatureIssuedAt: string, now = Date.now()) {
  const issuedAt = Date.parse(signatureIssuedAt)
  if (!Number.isFinite(issuedAt)) return false
  const age = now - issuedAt
  return age >= -60_000 && age <= DRAFT_SIGNATURE_TTL_MS
}
