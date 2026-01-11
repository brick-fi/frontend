import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: Upload image file to IPFS via Pinata
 * POST /api/ipfs/upload-image
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Create FormData for Pinata
    const pinataFormData = new FormData()
    pinataFormData.append('file', file)

    const metadata = JSON.stringify({
      name: `BrickFi Property Image - ${file.name}`,
    })
    pinataFormData.append('pinataMetadata', metadata)

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: pinataFormData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Pinata image upload failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to upload image to IPFS', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const ipfsHash = data.IpfsHash

    return NextResponse.json({
      success: true,
      ipfsHash,
      imageURL: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      ipfsURL: `ipfs://${ipfsHash}`,
    })
  } catch (error) {
    console.error('Error in upload-image API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
