export const ROOM_IMAGE_COUNT = 8

export type DraftStatus = 'draft' | 'generating' | 'ready_to_mint' | 'minted' | 'failed'

export type GenerationJobStatus =
  | 'queued'
  | 'uploading_world_labs_media'
  | 'waiting_world_labs'
  | 'finalizing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

export interface ListingDraftInput {
  walletAddress: string
  signatureMessage: string
  signatureIssuedAt: string
  walletSignature: `0x${string}`
  title: string
  location: string
  description: string
  totalValue: number
  expectedMonthlyIncome: number
  tags: string[]
}

export interface WorldLabsAssets {
  worldId: string | null
  worldMarbleUrl: string | null
  thumbnailUrl: string | null
  panoUrl: string | null
  spzUrls: Record<string, string>
  colliderMeshUrl: string | null
}

export interface GeneratedWorldMetadata extends WorldLabsAssets {
  provider: 'world_labs'
}
