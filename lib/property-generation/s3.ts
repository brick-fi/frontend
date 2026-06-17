import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function optionalEnv(name: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : null
}

function createS3Client() {
  return new S3Client({ region: requireEnv('AWS_REGION') })
}

function getBucket() {
  return requireEnv('PROPERTY_ASSETS_S3_BUCKET')
}

function getPublicBaseUrl() {
  return requireEnv('PROPERTY_ASSETS_PUBLIC_BASE_URL').replace(/\/+$/, '')
}

function getKeyPrefix() {
  return optionalEnv('PROPERTY_ASSETS_S3_PREFIX')?.replace(/^\/+|\/+$/g, '') || 'property-generation'
}

function safeKeySegment(segment: string) {
  return segment.replace(/[^a-zA-Z0-9._=-]/g, '-')
}

export function createPropertyAssetKey(draftId: string, ...segments: string[]) {
  return [getKeyPrefix(), safeKeySegment(draftId), ...segments.map(safeKeySegment)].join('/')
}

export function publicUrlForS3Key(key: string) {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  return `${getPublicBaseUrl()}/${encodedKey}`
}

interface UploadBufferInput {
  bytes: Buffer
  key: string
  contentType?: string
}

export async function uploadBufferToS3({ bytes, key, contentType }: UploadBufferInput) {
  await createS3Client().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: bytes,
    ContentType: contentType || 'application/octet-stream',
  }))

  return { key, url: publicUrlForS3Key(key) }
}

interface PresignedPutInput {
  key: string
  contentType: string
  expiresInSeconds: number
}

export async function createPresignedPutUrl({ key, contentType, expiresInSeconds }: PresignedPutInput) {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(createS3Client(), command, { expiresIn: expiresInSeconds })
}

export async function getS3ObjectMetadata(key: string) {
  const response = await createS3Client().send(new HeadObjectCommand({
    Bucket: getBucket(),
    Key: key,
  }))

  return {
    contentLength: typeof response.ContentLength === 'number' ? response.ContentLength : null,
    contentType: response.ContentType || null,
  }
}

export async function readS3ObjectRange(key: string, range: string) {
  const response = await createS3Client().send(new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Range: range,
  }))

  if (!response.Body) {
    throw new Error('S3 object body is empty')
  }

  return Buffer.from(await response.Body.transformToByteArray())
}

interface UploadBlobInput {
  file: Blob
  key: string
  contentType?: string
}

export async function uploadBlobToS3({ file, key, contentType }: UploadBlobInput) {
  await createS3Client().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: contentType || file.type || 'application/octet-stream',
  }))

  return { key, url: publicUrlForS3Key(key) }
}

export async function uploadJsonToS3(json: unknown, key: string) {
  await createS3Client().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: JSON.stringify(json),
    ContentType: 'application/json',
  }))

  return { key, url: publicUrlForS3Key(key) }
}
