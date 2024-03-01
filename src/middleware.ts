import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
 
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ['/site', '/api/uploadthing'],
  // Routes that can always be accessed, and have
  // no authentication information
  async afterAuth( auth, req ) {
    const url = req.nextUrl
    const searchParams = url.searchParams.toString()
    let hostName = req.headers

    const pathWithSearchParams = `${url.pathname}${searchParams.lenght > 0 ? `?${searchParams}` : ''}`

    // custom logic to redirect to the correct page
    const customSubdomain = hostName.get('host')?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`).filter(Boolean)[0]

    if (customSubdomain){
      return NextResponse.rewrite(new URL(`https://${customSubdomain}${pathWithSearchParams}`, req.url))
    }
    if  (url.pathname === '/sign-in' || url.pathname === '/sign-up'){
      return NextResponse.redirect(new URL(`/agency/sign-in`, req.url))
    }
    if (url.pathname ==='/' || url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN){
      return NextResponse.rewrite(new URL(`/site`, req.url))
    }
  }
});
 
export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};