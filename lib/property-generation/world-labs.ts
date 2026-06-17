import { WorldLabsAssets } from './types'

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

const WORLD_LABS_BASE_URL = 'https://api.worldlabs.ai/marble/v1'

function worldLabsHeaders() {
  return {
    'Content-Type': 'application/json',
    'WLT-Api-Key': requireEnv('WORLD_LABS_API_KEY'),
  }
}

interface StartWorldGenerationInput {
  displayName: string
  imageUrls: string[]
  textPrompt: string
}

export async function startWorldGeneration({ displayName, imageUrls, textPrompt }: StartWorldGenerationInput) {
  const response = await fetch(`${WORLD_LABS_BASE_URL}/worlds:generate`, {
    method: 'POST',
    headers: worldLabsHeaders(),
    body: JSON.stringify({
      display_name: displayName.slice(0, 64),
      model: 'marble-1.1',
      permission: { public: true },
      tags: ['brickfi', 'property-room'],
      world_prompt: {
        type: 'multi-image',
        reconstruct_images: true,
        multi_image_prompt: imageUrls.map((uri) => ({
          content: {
            source: 'uri',
            uri,
          },
        })),
        text_prompt: textPrompt,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`World Labs generation failed to start: ${await response.text()}`)
  }

  const data = await response.json()
  const operationId = data.operation_id || data.name || data.id
  if (!operationId) {
    throw new Error('World Labs did not return an operation id')
  }

  return operationId as string
}

export async function getWorldLabsOperation(operationId: string) {
  const response = await fetch(`${WORLD_LABS_BASE_URL}/operations/${operationId}`, {
    headers: {
      'WLT-Api-Key': requireEnv('WORLD_LABS_API_KEY'),
    },
  })

  if (!response.ok) {
    throw new Error(`World Labs operation polling failed: ${await response.text()}`)
  }

  return response.json()
}

export async function getWorldLabsWorld(worldId: string) {
  const response = await fetch(`${WORLD_LABS_BASE_URL}/worlds/${worldId}`, {
    headers: {
      'WLT-Api-Key': requireEnv('WORLD_LABS_API_KEY'),
    },
  })

  if (!response.ok) {
    throw new Error(`World Labs world fetch failed: ${await response.text()}`)
  }

  return response.json()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getRecord(value: unknown, key: string): Record<string, unknown> {
  if (!isRecord(value)) return {}
  const child = value[key]
  return isRecord(child) ? child : {}
}

function getString(value: unknown, key: string) {
  if (!isRecord(value)) return null
  const child = value[key]
  return typeof child === 'string' ? child : null
}

function getStringMap(value: unknown, key: string) {
  if (!isRecord(value)) return {}
  const child = value[key]
  if (Array.isArray(child)) {
    return Object.fromEntries(child.filter((item): item is string => typeof item === 'string').map((url, index) => [String(index), url]))
  }
  if (!isRecord(child)) return {}
  return Object.fromEntries(Object.entries(child).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

export function extractWorldLabsAssets(world: unknown): WorldLabsAssets {
  const assets = getRecord(world, 'assets')
  const splats = getRecord(assets, 'splats')
  const mesh = getRecord(assets, 'mesh')
  const imagery = getRecord(assets, 'imagery')

  return {
    worldId: getString(world, 'world_id'),
    worldMarbleUrl: getString(world, 'world_marble_url'),
    thumbnailUrl: getString(assets, 'thumbnail_url'),
    panoUrl: getString(imagery, 'pano_url'),
    spzUrls: getStringMap(splats, 'spz_urls'),
    colliderMeshUrl: getString(mesh, 'collider_mesh_url'),
  }
}
