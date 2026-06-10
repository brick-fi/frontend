import { randomUUID } from 'crypto'
import { createPropertyAssetKey, createPresignedPutUrl, getS3ObjectMetadata, readS3ObjectRange } from './s3'
import { ROOM_IMAGE_COUNT } from './types'

export const MAX_ROOM_IMAGE_BYTES = 20 * 1024 * 1024

const PRESIGNED_UPLOAD_EXPIRES_SECONDS = 15 * 60
const ROOM_IMAGE_SIGNATURE_RANGE = 'bytes=0-15'
const ALLOWED_ROOM_IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export class RoomImageUploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RoomImageUploadValidationError'
  }
}

interface RoomImageFileInput {
  readonly name: string
  readonly size: number
  readonly contentType: string
}

export interface PreparedRoomImageUpload {
  readonly key: string
  readonly uploadUrl: string
  readonly headers: Record<string, string>
}

export interface PrepareRoomImagesRequest {
  readonly action: 'prepare'
  readonly files: readonly RoomImageFileInput[]
}

export interface CommitRoomImagesRequest {
  readonly action: 'commit'
  readonly keys: readonly string[]
}

export type RoomImagesRequest = PrepareRoomImagesRequest | CommitRoomImagesRequest

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isRoomImageFileInput(value: unknown): value is RoomImageFileInput {
  if (!isRecord(value)) return false

  return (
    typeof value.name === 'string' &&
    typeof value.size === 'number' &&
    Number.isInteger(value.size) &&
    typeof value.contentType === 'string'
  )
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function parseRoomImagesRequest(value: unknown): RoomImagesRequest | null {
  if (!isRecord(value) || typeof value.action !== 'string') return null

  if (value.action === 'prepare') {
    if (!Array.isArray(value.files) || !value.files.every(isRoomImageFileInput)) return null
    return { action: 'prepare', files: value.files }
  }

  if (value.action === 'commit') {
    if (!isStringArray(value.keys)) return null
    return { action: 'commit', keys: value.keys }
  }

  return null
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120) || 'room-image'
}

export function detectRoomImageContentType(bytes: Buffer) {
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

function assertRoomImageFileInput(file: RoomImageFileInput) {
  if (!file.name.trim()) {
    throw new RoomImageUploadValidationError('Room image file name is required')
  }
  if (file.size <= 0) {
    throw new RoomImageUploadValidationError('Room images cannot be empty')
  }
  if (file.size > MAX_ROOM_IMAGE_BYTES) {
    throw new RoomImageUploadValidationError('Each image must be 20MB or smaller')
  }
  if (!ALLOWED_ROOM_IMAGE_CONTENT_TYPES.has(file.contentType)) {
    throw new RoomImageUploadValidationError('Only JPEG, PNG, or WebP room images are allowed')
  }
}

export async function prepareRoomImageUploads(draftId: string, files: readonly RoomImageFileInput[]) {
  if (files.length !== ROOM_IMAGE_COUNT) {
    throw new RoomImageUploadValidationError(`Exactly ${ROOM_IMAGE_COUNT} room images are required`)
  }

  const uploads: PreparedRoomImageUpload[] = []
  for (const [index, file] of files.entries()) {
    assertRoomImageFileInput(file)
    const key = createPropertyAssetKey(draftId, 'images', `${index + 1}-${randomUUID()}-${safeFileName(file.name)}`)
    const uploadUrl = await createPresignedPutUrl({
      key,
      contentType: file.contentType,
      expiresInSeconds: PRESIGNED_UPLOAD_EXPIRES_SECONDS,
    })

    uploads.push({
      key,
      uploadUrl,
      headers: { 'Content-Type': file.contentType },
    })
  }

  return uploads
}

export function isDraftRoomImageKey(draftId: string, key: string) {
  return key.startsWith(`${createPropertyAssetKey(draftId, 'images')}/`)
}

export async function validateCommittedRoomImages(draftId: string, keys: readonly string[]) {
  if (keys.length !== ROOM_IMAGE_COUNT) {
    throw new RoomImageUploadValidationError(`Exactly ${ROOM_IMAGE_COUNT} uploaded images are required`)
  }

  for (const key of keys) {
    if (!isDraftRoomImageKey(draftId, key)) {
      throw new RoomImageUploadValidationError('Uploaded room image key does not belong to this draft')
    }

    const metadata = await getS3ObjectMetadata(key)
    if (!metadata.contentLength || metadata.contentLength > MAX_ROOM_IMAGE_BYTES) {
      throw new RoomImageUploadValidationError('Uploaded room image size is invalid')
    }
    if (!metadata.contentType || !ALLOWED_ROOM_IMAGE_CONTENT_TYPES.has(metadata.contentType)) {
      throw new RoomImageUploadValidationError('Uploaded room image content type is invalid')
    }

    const detectedContentType = detectRoomImageContentType(await readS3ObjectRange(key, ROOM_IMAGE_SIGNATURE_RANGE))
    if (detectedContentType !== metadata.contentType) {
      throw new RoomImageUploadValidationError('Uploaded room image bytes do not match the declared content type')
    }
  }
}
