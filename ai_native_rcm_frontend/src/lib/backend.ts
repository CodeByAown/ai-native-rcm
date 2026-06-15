// Resolves the RCM backend base URL from environment.
//
// - On the server (Next.js route handlers) BACKEND_API_URL is read at runtime.
// - In the browser (client components) NEXT_PUBLIC_BACKEND_API_URL is inlined
//   at build time.
//
// Render's `fromService` blueprint binding provides a bare host (no scheme), so
// we prepend https:// when a scheme is missing.
function resolve(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    ''

  if (!raw) return 'http://localhost:9000'
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`
}

export const BACKEND_API_URL = resolve()
