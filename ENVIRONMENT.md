# Environment Setup

Create `frontend/.env.local` with the values below.

## Supabase

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Apply `supabase/schema.sql` in the Supabase SQL editor.

## World Labs

```bash
WORLD_LABS_API_KEY=
```

The account must have API credits. Multi-image room generation is asynchronous and usually takes about 5 minutes.

## S3 Property Assets

```bash
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
PROPERTY_ASSETS_S3_BUCKET=
PROPERTY_ASSETS_PUBLIC_BASE_URL=
PROPERTY_ASSETS_S3_PREFIX=property-generation
```

S3 stores draft room images immediately when they are uploaded, then reuses those public URLs as final listing images and stores the generated metadata after the 3D generation succeeds. `PROPERTY_ASSETS_PUBLIC_BASE_URL` should be a public HTTPS base URL for the bucket or a CloudFront/custom domain.

The bucket also needs CORS because room photos upload directly from the browser to presigned S3 URLs:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://YOUR_PRODUCTION_DOMAIN"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Use an IAM principal with permission to `s3:PutObject` and `s3:GetObject` for the configured bucket/prefix. If `PROPERTY_ASSETS_PUBLIC_BASE_URL` points at CloudFront, configure it to serve the same bucket/prefix publicly over HTTPS.

## Anthropic

```bash
ANTHROPIC_API_KEY=
```

This powers the existing AI investment insight route.

## Public Web3 Config

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS=
NEXT_PUBLIC_DEMO_USDC_ADDRESS=
```
