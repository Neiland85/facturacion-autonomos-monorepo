/**
 * 🛡️ DOCUMENTO NEXT.JS CON SEGURIDAD CSP INTEGRADA
 *
 * Configuración de _document.tsx con Content Security Policy y headers de seguridad
 */

import { Head, Html, Main, NextScript } from 'next/document';
import {
  buildCSPString,
  generateNonce,
  SECURITY_HEADERS,
} from '../../../packages/security/src/csp-security';

interface DocumentProps {
  nonce?: string;
}

export default function Document({ nonce }: DocumentProps) {
  const currentNonce = nonce || generateNonce();
  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const cspString = buildCSPString(environment, currentNonce);

  return (
    <Html lang="es">
      <Head>
        {/* Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content={cspString} />

        {/* Headers de Seguridad adicionales */}
        <meta
          httpEquiv="X-Frame-Options"
          content={SECURITY_HEADERS['X-Frame-Options']}
        />
        <meta
          httpEquiv="X-Content-Type-Options"
          content={SECURITY_HEADERS['X-Content-Type-Options']}
        />
        <meta name="referrer" content={SECURITY_HEADERS['Referrer-Policy']} />

        {/* Permissions Policy */}
        <meta
          httpEquiv="Permissions-Policy"
          content={SECURITY_HEADERS['Permissions-Policy']}
        />

        {/* Nonce para uso en componentes */}
        <meta name="csp-nonce" content={currentNonce} />

        {/* Prefetch DNS para dominios conocidos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//api.facturacion-autonomos.com" />

        {/* Preconnect para mejor rendimiento */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Fonts con CSP compliance */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Favicon seguro */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Meta tags de seguridad */}
        <meta name="robots" content="index,follow" />
        <meta name="format-detection" content="telephone=no" />

        {/* Open Graph con seguridad */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Facturación Autónomos" />

        {/* Configuración de viewport segura */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />

        {/* Script de inicialización de seguridad */}
        <script
          nonce={currentNonce}
          dangerouslySetInnerHTML={{
            __html: `
              // 🛡️ Inicialización de seguridad
              (function() {
                'use strict';
                
                // Detectar y reportar violaciones CSP
                document.addEventListener('securitypolicyviolation', function(event) {
                  const violation = {
                    blockedURI: event.blockedURI,
                    violatedDirective: event.violatedDirective,
                    originalPolicy: event.originalPolicy,
                    sourceFile: event.sourceFile,
                    lineNumber: event.lineNumber,
                    columnNumber: event.columnNumber,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                  };
                  
                  console.warn('🚨 CSP Violation:', violation);
                  
                  // En producción, enviar al servidor
                  if (typeof fetch !== 'undefined' && '${environment}' === 'production') {
                    fetch('/api/security/csp-violations', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(violation)
                    }).catch(function(err) {
                      console.error('Error enviando reporte CSP:', err);
                    });
                  }
                });
                
                // Protección contra clickjacking adicional
                if (window.top !== window.self) {
                  try {
                    window.top.location = window.self.location;
                  } catch (e) {
                    document.body.style.display = 'none';
                  }
                }
                
                // Limpiar URLs hash maliciosos
                if (window.location.hash) {
                  const hash = window.location.hash.toLowerCase();
                  const dangerousPatterns = ['javascript:', 'data:', 'vbscript:'];
                  
                  if (dangerousPatterns.some(function(pattern) {
                    return hash.includes(pattern);
                  })) {
                    console.warn('🚨 Hash malicioso detectado y limpiado');
                    window.location.hash = '';
                  }
                }
                
                // Validar origen del referrer
                if (document.referrer) {
                  try {
                    const referrerURL = new URL(document.referrer);
                    const allowedDomains = [
                      'facturacion-autonomos.com',
                      'localhost',
                      '127.0.0.1'
                    ];
                    
                    const isAllowed = allowedDomains.some(function(domain) {
                      return referrerURL.hostname.includes(domain);
                    });
                    
                    if (!isAllowed) {
                      console.info('ℹ️ Referrer externo detectado:', referrerURL.hostname);
                    }
                  } catch (e) {
                    console.warn('⚠️ Error validando referrer:', e);
                  }
                }
                
                // Configurar observador de mutaciones para contenido dinámico
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                          if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;
                            
                            // Verificar scripts inline sin nonce
                            if (element.tagName === 'SCRIPT' && 
                                element.innerHTML && 
                                !element.nonce) {
                              console.warn('🚨 Script inline sin nonce detectado');
                            }
                            
                            // Verificar estilos inline sin nonce
                            if (element.tagName === 'STYLE' && 
                                element.innerHTML && 
                                !element.nonce) {
                              console.warn('🚨 Estilo inline sin nonce detectado');
                            }
                          }
                        });
                      }
                    });
                  });
                  
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true
                  });
                }
                
                console.log('🛡️ Sistema de seguridad inicializado correctamente');
              })();
            `,
          }}
        />
      </Head>
      <body>
        {/* Fallback para JavaScript deshabilitado */}
        <noscript>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              background: '#ff6b6b',
              color: 'white',
              padding: '10px',
              textAlign: 'center',
              zIndex: 9999,
            }}
          >
            ⚠️ Esta aplicación requiere JavaScript para funcionar correctamente.
          </div>
        </noscript>

        <Main />
        <NextScript nonce={currentNonce} />

        {/* Analytics y tracking seguros (solo en producción) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics 4 con CSP compliance */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  nonce={currentNonce}
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  nonce={currentNonce}
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        anonymize_ip: true,
                        cookie_flags: 'SameSite=Strict;Secure'
                      });
                    `,
                  }}
                />
              </>
            )}

            {/* Vercel Analytics con CSP compliance */}
            {process.env.VERCEL && (
              <script
                nonce={currentNonce}
                dangerouslySetInnerHTML={{
                  __html: `
                    (function() {
                      var script = document.createElement('script');
                      script.src = 'https://cdn.vercel-insights.com/v1/script.debug.js';
                      script.defer = true;
                      script.nonce = '${currentNonce}';
                      document.head.appendChild(script);
                    })();
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </Html>
  );
}

// Configuración para obtener props iniciales con nonce
export async function getInitialProps() {
  const nonce = generateNonce();

  return {
    nonce,
  };
}
