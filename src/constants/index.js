console.log(import.meta.env.VITE_API_BACKEND_URL)
export const globalRefs = {
  BACKEND_URL: import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000',
}
