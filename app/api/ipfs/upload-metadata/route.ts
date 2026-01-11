import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: Upload JSON metadata to IPFS via Pinata
 * POST /api/ipfs/upload-metadata
 */
export async function POST(request: NextRequest) {
  try {
    // Get Pinata credentials from environment (server-side only)
    const pinataApiKey = process.env.PINATA_API_KEY
    const pinataSecretKey = process.env.PINATA_SECRET_KEY

    if (!pinataApiKey || !pinataSecretKey) {
      return NextResponse.json(
        { error: 'Pinata API credentials not configured on server' },
        { status: 500 }
      )
    }

    // Parse request body
    const metadata = await request.json()

    // Validate metadata
    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { error: 'Invalid metadata format' },
        { status: 400 }
      )
    }

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `BrickFi Property Metadata - ${Date.now()}`,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Pinata upload failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to upload to IPFS', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const ipfsHash = data.IpfsHash

    return NextResponse.json({
      success: true,
      ipfsHash,
      metadataURI: `ipfs://${ipfsHash}`,
      gatewayURL: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    })
  } catch (error) {
    console.error('Error in upload-metadata API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
