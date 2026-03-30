import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth – Login
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const expectedUser = process.env.DB_AUTH_USERNAME;
    const expectedPass = process.env.DB_AUTH_PASSWORD;

    if (!expectedUser || !expectedPass) {
      return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    }

    if (username === expectedUser && password === expectedPass) {
      const res = NextResponse.json({ success: true });
      res.cookies.set('sb_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return res;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// DELETE /api/auth – Logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('sb_session', '', { maxAge: 0, path: '/' });
  return res;
}
