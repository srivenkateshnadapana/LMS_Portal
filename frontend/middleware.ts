import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  const publicPaths = ['/', '/sign-in', '/sign-up', '/api/auth']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.match(new RegExp(`^${path.replace('(.*)', '(.*)')}$`)))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next/static|_next/image|favicon.ico).*)", "/", "/(api|trpc)(.*)"],
}

