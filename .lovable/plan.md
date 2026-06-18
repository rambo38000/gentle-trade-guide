# Authentication Plan — Gentle Trade Guide

Single-user app, email/password via Lovable Cloud auth, persistent session, protected routes, sign-out. No DB/RLS changes.

## 1. Auth context

Create `src/contexts/AuthContext.tsx`:
- Wraps app, exposes `{ user, session, loading, signIn, signUp, signOut }`.
- Registers `supabase.auth.onAuthStateChange` FIRST, then calls `getSession()` to hydrate (avoids deadlock).
- `signIn` / `signUp` use email+password. `signUp` passes `emailRedirectTo: ${window.location.origin}/`.
- Persistent session is on by default in the Supabase client.

## 2. Login page

Create `src/pages/Auth.tsx` at route `/auth`:
- Tabs: Sign In / Sign Up.
- Email + password fields, submit calls context methods, toast on error/success.
- If already authenticated, redirect to `/`.
- Public route (not behind guard).

## 3. Route protection

Create `src/components/auth/ProtectedRoute.tsx`:
- Reads `useAuth()`. While `loading`, render a small spinner.
- If no `user`, `<Navigate to="/auth" replace />`.
- Else render `<Outlet />`.

Update `src/App.tsx`:
- Wrap `<BrowserRouter>` children with `<AuthProvider>`.
- Add `/auth` route (public).
- Wrap the existing `AppLayout` route subtree with `<ProtectedRoute>`.

## 4. Sign-out

Update `src/components/layout/AppLayout.tsx`:
- Add a "Sign out" button in the sidebar footer (and mobile top bar) that calls `signOut()` then navigates to `/auth`.
- Show the signed-in email next to it.

## 5. Future RLS readiness

- All existing Supabase queries already run through the authenticated client; once RLS is later enabled, `auth.uid()` will resolve from the persisted session — no query refactor needed now.
- No changes to `secondBrain.ts`, migrations, or table policies.

## 6. Auth config

- Call `configure_auth` with `auto_confirm_email: true` (single-user dev convenience), `disable_signup: false`, `external_anonymous_users_enabled: false`, `password_hibp_enabled: true`.

## Files

- add: `src/contexts/AuthContext.tsx`
- add: `src/components/auth/ProtectedRoute.tsx`
- add: `src/pages/Auth.tsx`
- edit: `src/App.tsx`
- edit: `src/components/layout/AppLayout.tsx`

No database, edge function, or retrieval changes.
