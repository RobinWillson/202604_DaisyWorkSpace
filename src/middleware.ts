import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. 排除登入 API 自身的檢查
  // 現在全域登入 API 位在 /api/auth
  if (pathname === '/api/auth') {
    return NextResponse.next();
  }

  // 2. 針對 /api/second-brain/* 的 API 進行驗證
  if (pathname.startsWith('/api/second-brain')) {
    // 優先檢查 x-api-key (給 AI/外部串接用)
    const apiKey = req.headers.get('x-api-key');
    const secretKey = process.env.DB_API_SECRET_KEY;

    if (secretKey && apiKey === secretKey) {
      return NextResponse.next();
    }

    // 其次檢查 Browser Session Cookie (給網頁版 UI 用)
    const session = req.cookies.get('sb_session');
    if (session?.value === 'authenticated') {
      return NextResponse.next();
    }

    // 如果兩者皆無
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API Key/Session' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

// 也可以擴展 matcher 來保護更多路徑，但目前主要保護 API
export const config = {
  matcher: ['/api/second-brain/:path*', '/api/auth'],
};
