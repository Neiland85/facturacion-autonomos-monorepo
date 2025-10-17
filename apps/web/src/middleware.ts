/**/**import { NextResponse } from 'next/server';

 * Middleware de autenticación para aplicación Vite/React

 * Implementa validación básica de JWT sin verificar firma (solo leer exp) * Middleware de autenticación para aplicación Vite/Reactimport type { NextRequest } from 'next/server';

 * 

 * NOTA: Este es un enfoque específico para Vite. En Next.js usarías middleware.ts diferente. * Implementa validación básica de JWT sin verificar firma (solo leer exp)

 * Para Vite, esta lógica se implementa como guards de ruta en React Router.

 */ * // Rutas que requieren autenticación



import jwt from 'jsonwebtoken'; * NOTA: Este es un enfoque específico para Vite. En Next.js usarías middleware.ts diferente.const protectedRoutes = ['/dashboard', '/invoices', '/settings', '/profile'];

import { useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom'; * Para Vite, considera mover esta lógica al router de React como guards de ruta.



// Rutas que requieren autenticación */// Rutas públicas (no redirigir si está autenticado)

const protectedRoutes = ['/dashboard', '/invoices', '/settings', '/profile'];

const publicRoutes = ['/login', '/register'];

// Rutas públicas (no redirigir si está autenticado)

const publicRoutes = ['/login', '/register'];import jwt from 'jsonwebtoken';



/**export async function middleware(request: NextRequest) {

 * Decodifica JWT sin verificar firma para leer payload

 */// Rutas que requieren autenticación  const { pathname } = request.nextUrl;

function decodeTokenUnsafe(token: string): any {

  try {const protectedRoutes = ['/dashboard', '/invoices', '/settings', '/profile'];

    // Decodificar sin verificar firma - solo para leer exp

    return jwt.decode(token);  // Verificar si la ruta requiere autenticación

  } catch (error) {

    return null;// Rutas públicas (no redirigir si está autenticado)  const isProtectedRoute = protectedRoutes.some(route =>

  }

}const publicRoutes = ['/login', '/register'];    pathname.startsWith(route)



/**  );

 * Verifica si un token JWT está expirado

 *//**

function isTokenExpired(token: string): boolean {

  const decoded = decodeTokenUnsafe(token); * Decodifica JWT sin verificar firma para leer payload  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!decoded || !decoded.exp) {

    return true; */

  }

function decodeTokenUnsafe(token: string): any {  // Verificar si hay cookies de sesión

  const currentTime = Math.floor(Date.now() / 1000);

  return decoded.exp < currentTime;  try {  const hasAccessToken = request.cookies.has('accessToken');

}

    // Decodificar sin verificar firma - solo para leer exp  const hasRefreshToken = request.cookies.has('refreshToken');

/**

 * Verifica el estado de autenticación basado en cookies    return jwt.decode(token);  const isAuthenticated = hasAccessToken || hasRefreshToken;

 */

export function checkAuthStatus(): { isAuthenticated: boolean; needsRefresh: boolean } {  } catch (error) {

  if (typeof window === 'undefined') {

    return { isAuthenticated: false, needsRefresh: false };    return null;  // Redirigir a login si intenta acceder a ruta protegida sin auth

  }

  }  if (isProtectedRoute && !isAuthenticated) {

  // Obtener cookies (implementación simple - puedes usar js-cookie en producción)

  const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {}    const loginUrl = new URL('/login', request.url);

    const [key, value] = cookie.trim().split('=');

    acc[key] = value;    loginUrl.searchParams.set('redirect', pathname);

    return acc;

  }, {});/**    return NextResponse.redirect(loginUrl);



  const accessToken = cookies.accessToken; * Verifica si un token JWT está expirado  }

  const refreshToken = cookies.refreshToken;

 */

  if (!accessToken && !refreshToken) {

    return { isAuthenticated: false, needsRefresh: false };function isTokenExpired(token: string): boolean {  // Redirigir a dashboard si intenta acceder a login/register estando autenticado

  }

  const decoded = decodeTokenUnsafe(token);  if (isPublicRoute && isAuthenticated) {

  // Si hay accessToken y no está expirado

  if (accessToken && !isTokenExpired(accessToken)) {  if (!decoded || !decoded.exp) {    return NextResponse.redirect(new URL('/dashboard', request.url));

    return { isAuthenticated: true, needsRefresh: false };

  }    return true;  }



  // Si accessToken expiró pero hay refreshToken  }

  if (refreshToken && !isTokenExpired(refreshToken)) {

    return { isAuthenticated: true, needsRefresh: true };    return NextResponse.next();

  }

  const currentTime = Math.floor(Date.now() / 1000);}

  return { isAuthenticated: false, needsRefresh: false };

}  return decoded.exp < currentTime;



/**}// Configurar qué rutas ejecutan el middleware

 * Guard de ruta para proteger rutas que requieren autenticación

 */export const config = {

export function routeGuard(pathname: string): 'redirect-to-login' | 'redirect-to-dashboard' | 'continue' {

  const { isAuthenticated } = checkAuthStatus();/**  matcher: [



  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)); * Verifica el estado de autenticación basado en cookies    /*

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

 */     * Match all request paths except:

  // Redirigir a login si intenta acceder a ruta protegida sin auth

  if (isProtectedRoute && !isAuthenticated) {export function checkAuthStatus(): { isAuthenticated: boolean; needsRefresh: boolean } {     * - _next/static (static files)

    return 'redirect-to-login';

  }  if (typeof window === 'undefined') {     * - _next/image (image optimization files)



  // Redirigir a dashboard si intenta acceder a login/register estando autenticado    return { isAuthenticated: false, needsRefresh: false };     * - favicon.ico (favicon file)

  if (isPublicRoute && isAuthenticated) {

    return 'redirect-to-dashboard';  }     * - public folder

  }

     */

  return 'continue';

}  // Obtener cookies (asumiendo que están configuradas como HttpOnly en el backend)    '/((?!_next/static|_next/image|favicon.ico|public).*)',



/**  const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {  ],

 * Hook para usar el guard de autenticación en componentes React

 */    const [key, value] = cookie.trim().split('=');};

export function useAuthGuard() {

  const navigate = useNavigate();    acc[key] = value;

  const location = useLocation();    return acc;

  }, {});

  useEffect(() => {

    const guard = routeGuard(location.pathname);  const accessToken = cookies.accessToken;

  const refreshToken = cookies.refreshToken;

    switch (guard) {

      case 'redirect-to-login':  // Si no hay tokens, no está autenticado

        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });  if (!accessToken && !refreshToken) {

        break;    return { isAuthenticated: false, needsRefresh: false };

      case 'redirect-to-dashboard':  }

        navigate('/dashboard', { replace: true });

        break;  // Si hay accessToken y no está expirado, está autenticado

      case 'continue':  if (accessToken && !isTokenExpired(accessToken)) {

        // No hacer nada, continuar    return { isAuthenticated: true, needsRefresh: false };

        break;  }

    }

  }, [location.pathname, navigate]);  // Si accessToken expirado pero hay refreshToken, necesita refresh

  if (refreshToken && !isTokenExpired(refreshToken)) {

  return checkAuthStatus();    return { isAuthenticated: false, needsRefresh: true };

}  }

  // Ambos tokens expirados o inválidos
  return { isAuthenticated: false, needsRefresh: false };
}

/**
 * Guard de ruta para proteger rutas en React Router
 */
export function routeGuard(pathname: string): { 
  shouldRedirect: boolean; 
  redirectTo?: string; 
} {
  const { isAuthenticated, needsRefresh } = checkAuthStatus();
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirigir a login si intenta acceder a ruta protegida sin auth
  if (isProtectedRoute && !isAuthenticated) {
    return { 
      shouldRedirect: true, 
      redirectTo: `/login?redirect=${encodeURIComponent(pathname)}` 
    };
  }

  // Redirigir a dashboard si intenta acceder a login/register estando autenticado
  if (isPublicRoute && isAuthenticated) {
    return { 
      shouldRedirect: true, 
      redirectTo: '/dashboard' 
    };
  }

  return { shouldRedirect: false };
}

/**
 * Hook para usar en componentes React
 */
export function useAuthGuard() {
  return {
    checkAuthStatus,
    routeGuard
  };
}