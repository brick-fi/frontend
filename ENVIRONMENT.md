# Environment Setup

Create `frontend/.env.local` with the values below.

## Supabase

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ROOM_IMAGES_BUCKET=property-room-images
```

Create a private Supabase Storage bucket named `property-room-images`, then apply `supabase/schema.sql` in the Supabase SQL editor.

## World Labs

```bash
WORLD_LABS_API_KEY=
```

The account must have API credits. Multi-image room generation is asynchronous and usually takes about 5 minutes.

## Pinata

```bash
PINATA_API_KEY=
PINATA_SECRET_KEY=
```

Pinata is used to pin final listing images and metadata after the 3D generation succeeds.

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
