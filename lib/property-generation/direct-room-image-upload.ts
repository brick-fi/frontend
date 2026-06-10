interface PreparedRoomImageUpload {
  readonly key: string
  readonly uploadUrl: string
  readonly headers: Record<string, string>
}

interface UploadRoomImagesInput {
  readonly draftId: string
  readonly draftAccessToken: string
  readonly images: readonly File[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getErrorMessage(payload: unknown) {
  return isRecord(payload) && typeof payload.error === 'string' ? payload.error : 'Request failed'
}

async function readJsonPayload(response: Response) {
  const payload: unknown = await response.json()
  if (!response.ok) {
    throw new Error(getErrorMessage(payload))
  }
  return payload
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string')
}

function isPreparedRoomImageUpload(value: unknown): value is PreparedRoomImageUpload {
  if (!isRecord(value)) return false

  return (
    typeof value.key === 'string' &&
    typeof value.uploadUrl === 'string' &&
    isStringRecord(value.headers)
  )
}

function parsePreparedUploads(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.uploads) || !payload.uploads.every(isPreparedRoomImageUpload)) {
    throw new Error(getErrorMessage(payload))
  }

  return payload.uploads
}

async function uploadToS3(upload: PreparedRoomImageUpload, file: File) {
  const response = await fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: upload.headers,
    body: file,
  })

  if (!response.ok) {
    throw new Error(`Room image upload failed with status ${response.status}`)
  }
}

export async function uploadRoomImagesDirectly({ draftId, draftAccessToken, images }: UploadRoomImagesInput) {
  const endpoint = `/api/property-generation/drafts/${draftId}/images`
  const prepareResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${draftAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'prepare',
      files: images.map((image) => ({
        name: image.name,
        size: image.size,
        contentType: image.type,
      })),
    }),
  })
  const preparedUploads = parsePreparedUploads(await readJsonPayload(prepareResponse))

  if (preparedUploads.length !== images.length) {
    throw new Error('Room image upload preparation returned an unexpected file count')
  }

  await Promise.all(preparedUploads.map((upload, index) => {
    const image = images[index]
    if (!image) {
      throw new Error('Room image upload preparation returned an unexpected file count')
    }
    return uploadToS3(upload, image)
  }))

  await readJsonPayload(await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${draftAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'commit',
      keys: preparedUploads.map((upload) => upload.key),
    }),
  }))
}
