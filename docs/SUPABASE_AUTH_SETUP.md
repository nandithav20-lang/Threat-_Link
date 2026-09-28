# Supabase & Google OAuth Integration Guide

This guide details the integration of Supabase Authentication and Google OAuth 2.0 within the ThreatLink AI platform.

## Architecture

- **Supabase SSR**: `@supabase/ssr` (Server-Side Rendering helpers)
- **Supabase Client**: `@supabase/supabase-js`
- **OAuth Provider**: Google OAuth 2.0 Web Application Client

## Key Files

1. `utils/supabase/client.ts`: Browser-side Supabase client initialization.
2. `utils/supabase/server.ts`: Server-side Supabase client with cookie management.
3. `utils/supabase/middleware.ts`: Refresh session helper for Next.js middleware.
4. `app/auth/callback/route.ts`: API route handler exchanging Google OAuth codes for user sessions.
5. `components/auth/GoogleSignInButton.tsx`: Client component triggering Google OAuth sign-in flow.

## Environment Setup

Add the following to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
```

## Google Cloud Console Whitelist

Authorized Redirect URI:
`https://<your-project-id>.supabase.co/auth/v1/callback`

Authorized JavaScript Origin:
`http://localhost:3000`
