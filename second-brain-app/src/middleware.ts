import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 從環境變數讀取自訂的帳號密碼
  const AUTH_USER = process.env.AUTH_USER;
  const AUTH_PASS = process.env.AUTH_PASS;
  const API_KEY = process.env.API_KEY;

  // 如果沒有設定帳號密碼 (例如在 Local 初次開發），就直接放行，避免開發卡住
  if (!AUTH_USER || !AUTH_PASS) {
    return NextResponse.next();
  }

  // 給 OpenClaw 或其他機器人開的專屬不檢查 Auth 通道 (透過 Header)
  if (API_KEY && req.headers.get('x-api-key') === API_KEY) {
    return NextResponse.next();
  }

  // 取得瀏覽器發送的 Authorization 標頭
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    // 密碼會以 Base64 編碼，我們需要解碼比對
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === AUTH_USER && pwd === AUTH_PASS) {
      return NextResponse.next();
    }
  }

  // 如果帳號密碼不對，或者還沒登入過，就回傳 401 並要求瀏覽器彈出登入視窗
  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Second Brain Secure Area"'
    }
  });
}

// 設定只有當存取網頁或 API 時才會觸發這支檢查程式 (排除靜態資源)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
