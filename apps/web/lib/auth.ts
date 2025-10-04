interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
  }
}

/**
 * Authenticate user with backend auth-service
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001"

  const response = await fetch(`${authServiceUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    if (response.status === 401) {
      throw new Error("Credenciales incorrectas. Por favor, verifica tu email y contraseña.")
    }

    if (response.status === 429) {
      throw new Error("Demasiados intentos. Por favor, intenta de nuevo más tarde.")
    }

    throw new Error(errorData.message || "Error al conectar con el servidor. Por favor, intenta de nuevo.")
  }

  const data = await response.json()
  return data
}

/**
 * Save JWT tokens to storage
 */
export function saveTokens(accessToken: string, refreshToken: string, rememberMe = false): void {
  const storage = rememberMe ? localStorage : sessionStorage

  storage.setItem("accessToken", accessToken)
  storage.setItem("refreshToken", refreshToken)
  storage.setItem("tokenTimestamp", Date.now().toString())
}

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
}

/**
 * Clear all tokens from storage
 */
export function clearTokens(): void {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("tokenTimestamp")
  sessionStorage.removeItem("accessToken")
  sessionStorage.removeItem("refreshToken")
  sessionStorage.removeItem("tokenTimestamp")
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001"

  const response = await fetch(`${authServiceUrl}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearTokens()
    throw new Error("Session expired. Please login again.")
  }

  const data = await response.json()

  // Update access token
  const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage
  storage.setItem("accessToken", data.accessToken)

  return data.accessToken
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
