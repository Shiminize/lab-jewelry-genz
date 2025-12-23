import { NextResponse } from 'next/server';
import { validateConciergeEnv } from '@/config/concierge.validate';

export async function GET() {
  validateConciergeEnv();
  return NextResponse.json({ ok: true });
}
