function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function pinataHeaders() {
  return {
    pinata_api_key: requireEnv('PINATA_API_KEY'),
    pinata_secret_api_key: requireEnv('PINATA_SECRET_KEY'),
  }
}

export async function uploadBlobToPinata(file: Blob, fileName: string) {
  const body = new FormData()
  body.append('file', file, fileName)
  body.append('pinataMetadata', JSON.stringify({ name: `BrickFi Property Image - ${fileName}` }))

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: pinataHeaders(),
    body,
  })

  if (!response.ok) {
    throw new Error(`Pinata image upload failed: ${await response.text()}`)
  }

  const data = await response.json()
  return {
    ipfsHash: data.IpfsHash as string,
    imageURL: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    ipfsURL: `ipfs://${data.IpfsHash}`,
  }
}

export async function uploadJsonToPinata(metadata: unknown, name: string) {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...pinataHeaders(),
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name },
    }),
  })

  if (!response.ok) {
    throw new Error(`Pinata metadata upload failed: ${await response.text()}`)
  }

  const data = await response.json()
  return {
    ipfsHash: data.IpfsHash as string,
    metadataURI: `ipfs://${data.IpfsHash}`,
    gatewayURL: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  }
}
