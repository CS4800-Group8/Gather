import { NextResponse } from 'next/server';

// TODO: Implement signup logic and checks with database integration
export async function POST() {
  return NextResponse.json(
    { message: 'Signup endpoint - coming soon :)' },
    { status: 501 }
  );
}
