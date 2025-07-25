/**
 * 🛡️ UTILIDADES DE SEGURIDAD PARA FRONTEND
 *
 * Funciones para sanitización y protección XSS en el cliente
 */

/**
 * Escapar HTML para prevenir XSS
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  const htmlEscapes: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return text.replace(/[&<>"'`=/]/g, match => htmlEscapes[match]);
}

/**
 * Escapar atributos HTML
 */
export function escapeHtmlAttribute(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Sanitizar URLs para prevenir javascript: y data: maliciosos
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '#';
  }

  // Normalizar URL
  const normalizedUrl = url.trim().toLowerCase();

  // Bloquear protocolos peligrosos
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  for (const protocol of dangerousProtocols) {
    if (normalizedUrl.startsWith(protocol)) {
      console.warn(`🚨 URL bloqueada por protocolo peligroso: ${protocol}`);
      return '#';
    }
  }

  // Permitir URLs relativas y protocolos seguros
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const isRelative = !normalizedUrl.includes(':');
  const isSafeProtocol = safeProtocols.some(protocol =>
    normalizedUrl.startsWith(protocol)
  );

  if (isRelative || isSafeProtocol) {
    return url;
  }

  console.warn(`🚨 URL bloqueada por protocolo no seguro: ${url}`);
  return '#';
}

/**
 * Sanitizar CSS para prevenir inyección de estilos maliciosos
 */
export function sanitizeCss(cssText: string): string {
  if (typeof cssText !== 'string') {
    return '';
  }

  // Remover expresiones JavaScript en CSS
  const dangerousPatterns = [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:/gi,
    /url\s*\(\s*javascript\s*:/gi,
    /url\s*\(\s*data\s*:/gi,
    /url\s*\(\s*vbscript\s*:/gi,
    /import\s*['"]/gi,
    /@import/gi,
    /binding\s*:/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
  ];

  let sanitized = cssText;

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '/* blocked */');
  }

  return sanitized;
}

/**
 * Validar y sanitizar nombres de clases CSS
 */
export function sanitizeCssClass(className: string): string {
  if (typeof className !== 'string') {
    return '';
  }

  // Solo permitir caracteres alfanuméricos, guiones y guiones bajos
  return className.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim();
}

/**
 * Crear elemento DOM de forma segura
 */
export function createSafeElement(
  tagName: string,
  attributes: { [key: string]: string } = {},
  textContent?: string
): HTMLElement | null {
  // Lista de elementos permitidos
  const allowedTags = [
    'div',
    'span',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'button',
    'input',
    'label',
    'form',
    'fieldset',
    'legend',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'td',
    'th',
    'img',
    'a',
    'br',
    'hr',
    'pre',
    'code',
    'blockquote',
  ];

  if (!allowedTags.includes(tagName.toLowerCase())) {
    console.warn(`🚨 Elemento HTML no permitido: ${tagName}`);
    return null;
  }

  try {
    const element = document.createElement(tagName);

    // Atributos seguros permitidos
    const safeAttributes = [
      'id',
      'class',
      'title',
      'alt',
      'src',
      'href',
      'target',
      'type',
      'name',
      'value',
      'placeholder',
      'disabled',
      'readonly',
      'required',
      'maxlength',
      'minlength',
      'min',
      'max',
      'step',
      'pattern',
      'aria-label',
      'aria-describedby',
      'role',
      'tabindex',
    ];

    // Aplicar atributos de forma segura
    for (const [key, value] of Object.entries(attributes)) {
      if (safeAttributes.includes(key.toLowerCase())) {
        if (key === 'href') {
          element.setAttribute(key, sanitizeUrl(value));
        } else if (key === 'class') {
          element.setAttribute(key, sanitizeCssClass(value));
        } else {
          element.setAttribute(key, escapeHtmlAttribute(value));
        }
      } else {
        console.warn(`🚨 Atributo HTML no permitido: ${key}`);
      }
    }

    // Establecer contenido de texto de forma segura
    if (textContent !== undefined) {
      element.textContent = textContent;
    }

    return element;
  } catch (error) {
    console.error('Error creando elemento seguro:', error);
    return null;
  }
}

/**
 * Sanitizar contenido HTML dinámico
 */
export function sanitizeHtmlContent(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Crear un elemento temporal para sanitización
  const temp = document.createElement('div');
  temp.textContent = html;

  return temp.innerHTML;
}

/**
 * Validar y limpiar datos de formulario
 */
export function sanitizeFormData(formData: { [key: string]: any }): {
  [key: string]: string;
} {
  const sanitized: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(formData)) {
    // Sanitizar clave
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');

    // Sanitizar valor
    let safeValue = '';
    if (typeof value === 'string') {
      safeValue = escapeHtml(value.trim());
    } else if (typeof value === 'number') {
      safeValue = String(value);
    } else if (typeof value === 'boolean') {
      safeValue = String(value);
    } else {
      safeValue = escapeHtml(String(value));
    }

    sanitized[safeKey] = safeValue;
  }

  return sanitized;
}

/**
 * Configuración de Content Security Policy
 */
export const CSP_CONFIG = {
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://vercel.live',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
    'connect-src': [
      "'self'",
      'https://api.facturacion-autonomos.com',
      'https://fal.run',
      'https://api.openai.com',
      'http:',
      'ws:',
      'wss:',
    ],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
  },

  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'connect-src': [
      "'self'",
      'https://api.facturacion-autonomos.com',
      'https://fal.run',
      'https://api.openai.com',
    ],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': [],
  },
};

/**
 * Generar string de CSP para meta tag
 */
export function generateCSPString(
  environment: 'development' | 'production' = 'production'
): string {
  const config = CSP_CONFIG[environment];
  const directives: string[] = [];

  for (const [directive, sources] of Object.entries(config)) {
    if (sources.length === 0) {
      directives.push(directive);
    } else {
      directives.push(`${directive} ${sources.join(' ')}`);
    }
  }

  return directives.join('; ');
}

/**
 * Hook React para sanitización automática
 */
export function useSafeContent() {
  const safeHtml = (content: string) => ({
    __html: sanitizeHtmlContent(content),
  });

  const safeUrl = (url: string) => sanitizeUrl(url);

  const safeClass = (className: string) => sanitizeCssClass(className);

  const safeAttributes = (attrs: { [key: string]: string }) => {
    const safe: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'href') {
        safe[key] = sanitizeUrl(value);
      } else if (key === 'className' || key === 'class') {
        safe[key] = sanitizeCssClass(value);
      } else {
        safe[key] = escapeHtmlAttribute(value);
      }
    }
    return safe;
  };

  return {
    safeHtml,
    safeUrl,
    safeClass,
    safeAttributes,
    escapeHtml,
    sanitizeFormData,
  };
}

/**
 * Componente para contenido HTML seguro
 */
interface SafeHtmlProps {
  content: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

export function SafeHtml({
  content,
  tag: Tag = 'div',
  className,
  ...props
}: SafeHtmlProps) {
  const sanitizedContent = sanitizeHtmlContent(content);
  const safeClassName = className ? sanitizeCssClass(className) : undefined;

  return (
    <Tag
      {...props}
      className={safeClassName}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

/**
 * Validación de entrada en tiempo real
 */
export function validateInput(
  value: string,
  type: 'email' | 'url' | 'text' | 'number'
): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = escapeHtml(value.trim());
  let isValid = true;

  switch (type) {
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
        errors.push('Formato de email inválido');
        isValid = false;
      }
      break;
    }

    case 'url':
      sanitized = sanitizeUrl(value);
      if (sanitized === '#') {
        errors.push('URL no segura o inválida');
        isValid = false;
      }
      break;

    case 'number': {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push('Debe ser un número válido');
        isValid = false;
      } else {
        sanitized = String(numValue);
      }
      break;
    }

    case 'text':
    default:
      // Ya sanitizado con escapeHtml
      break;
  }

  return { isValid, sanitized, errors };
}
