import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Use the authenticated property-generation draft flow instead.' }, { status: 410 })
}
