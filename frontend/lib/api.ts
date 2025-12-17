import axios from "axios"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vgzylypzrudzrhueoros.supabase.co"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
const FORCE_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"

const hasSupabase = SUPABASE_URL.includes("supabase.co")
const isMockMode = FORCE_MOCK && !hasSupabase

console.log("[v0] API Configuration:", {
  API_URL,
  SUPABASE_URL,
  hasSupabase,
  FORCE_MOCK,
  isMockMode,
})

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export const isApiMockMode = isMockMode
export const hasSupabaseIntegration = hasSupabase

export default api
