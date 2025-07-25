/**
 * 🛡️ COMPONENTES REACT SEGUROS PARA PROTECCIÓN XSS
 *
 * Componentes que automáticamente sanitizan contenido y aplican mejores prácticas de seguridad
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  buildCSPString,
  generateNonce,
  secureFetch,
  setupCSPReporting,
} from './csp-security';
import {
  escapeHtml,
  escapeHtmlAttribute,
  sanitizeCssClass,
  sanitizeFormData,
  sanitizeUrl,
} from './frontend-security';

/**
 * Contexto de seguridad para toda la aplicación
 */
interface SecurityContextType {
  nonce: string;
  isCSPEnabled: boolean;
  reportViolation: (violation: any) => void;
  sanitizeContent: (content: string) => string;
  validateUrl: (url: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

/**
 * Provider de seguridad para la aplicación
 */
interface SecurityProviderProps {
  children: React.ReactNode;
  enableCSP?: boolean;
  customNonce?: string;
}

export function SecurityProvider({
  children,
  enableCSP = true,
  customNonce,
}: SecurityProviderProps) {
  const [nonce] = useState(customNonce || generateNonce());
  const [isCSPEnabled, setIsCSPEnabled] = useState(enableCSP);

  useEffect(() => {
    if (enableCSP && typeof window !== 'undefined') {
      // Aplicar CSP meta tag
      const environment =
        process.env.NODE_ENV === 'production' ? 'production' : 'development';
      const cspString = buildCSPString(environment, nonce);

      let metaCSP = document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
      ) as HTMLMetaElement;
      if (!metaCSP) {
        metaCSP = document.createElement('meta');
        metaCSP.httpEquiv = 'Content-Security-Policy';
        document.head.appendChild(metaCSP);
      }
      metaCSP.content = cspString;

      // Configurar reportes de violaciones
      setupCSPReporting();
      setIsCSPEnabled(true);
    }
  }, [enableCSP, nonce]);

  const reportViolation = useCallback((violation: any) => {
    console.warn('🚨 Violación de seguridad reportada:', violation);

    if (process.env.NODE_ENV === 'production') {
      secureFetch('/api/security/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violation),
      }).catch(console.error);
    }
  }, []);

  const sanitizeContent = useCallback((content: string) => {
    return escapeHtml(content);
  }, []);

  const validateUrl = useCallback((url: string) => {
    const sanitized = sanitizeUrl(url);
    return sanitized !== '#';
  }, []);

  const contextValue: SecurityContextType = {
    nonce,
    isCSPEnabled,
    reportViolation,
    sanitizeContent,
    validateUrl,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

/**
 * Hook para usar el contexto de seguridad
 */
export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity debe usarse dentro de SecurityProvider');
  }
  return context;
}

/**
 * Componente para texto seguro (previene XSS)
 */
interface SafeTextProps {
  children: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  allowHtml?: boolean;
  [key: string]: any;
}

export function SafeText({
  children,
  tag: Tag = 'span',
  className,
  allowHtml = false,
  ...props
}: SafeTextProps) {
  const { sanitizeContent } = useSecurity();

  const safeContent = allowHtml ? children : sanitizeContent(children);
  const safeClassName = className ? sanitizeCssClass(className) : undefined;

  if (allowHtml) {
    return (
      <Tag
        {...props}
        className={safeClassName}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    );
  }

  return (
    <Tag {...props} className={safeClassName}>
      {safeContent}
    </Tag>
  );
}

/**
 * Componente para enlaces seguros
 */
interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  [key: string]: any;
}

export function SafeLink({
  href,
  children,
  className,
  target,
  rel,
  ...props
}: SafeLinkProps) {
  const { validateUrl, reportViolation } = useSecurity();

  const safeHref = sanitizeUrl(href);
  const safeClassName = className ? sanitizeCssClass(className) : undefined;

  // Validar URL
  if (!validateUrl(href)) {
    reportViolation({
      type: 'unsafe_url',
      originalUrl: href,
      sanitizedUrl: safeHref,
      timestamp: Date.now(),
    });

    return (
      <span className={safeClassName} {...props}>
        {children} [URL bloqueada por seguridad]
      </span>
    );
  }

  // Agregar rel="noopener noreferrer" para enlaces externos
  let safeRel = rel;
  if (target === '_blank' && !rel) {
    safeRel = 'noopener noreferrer';
  }

  return (
    <a
      {...props}
      href={safeHref}
      className={safeClassName}
      target={target}
      rel={safeRel}
    >
      {children}
    </a>
  );
}

/**
 * Componente para imágenes seguras
 */
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  [key: string]: any;
}

export function SafeImage({
  src,
  alt,
  className,
  onError,
  ...props
}: SafeImageProps) {
  const { validateUrl, reportViolation } = useSecurity();

  const safeSrc = sanitizeUrl(src);
  const safeAlt = escapeHtmlAttribute(alt);
  const safeClassName = className ? sanitizeCssClass(className) : undefined;

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      reportViolation({
        type: 'image_load_error',
        src: safeSrc,
        originalSrc: src,
        timestamp: Date.now(),
      });

      if (onError) {
        onError(event);
      }
    },
    [src, safeSrc, onError, reportViolation]
  );

  // Validar URL de imagen
  if (!validateUrl(src)) {
    return (
      <div className={safeClassName} {...props}>
        <span>🚫 Imagen bloqueada por seguridad</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={safeSrc}
      alt={safeAlt}
      className={safeClassName}
      onError={handleError}
    />
  );
}

/**
 * Componente para formularios seguros
 */
interface SafeFormProps {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  action?: string;
  method?: string;
  className?: string;
  sanitizeData?: boolean;
  [key: string]: any;
}

export function SafeForm({
  children,
  onSubmit,
  action,
  method = 'POST',
  className,
  sanitizeData = true,
  ...props
}: SafeFormProps) {
  const { validateUrl, reportViolation } = useSecurity();

  const safeAction = action ? sanitizeUrl(action) : undefined;
  const safeClassName = className ? sanitizeCssClass(className) : undefined;

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (sanitizeData) {
        const formData = new FormData(event.currentTarget);
        const data: { [key: string]: any } = {};

        formData.forEach((value, key) => {
          data[key] = value;
        });

        const sanitizedData = sanitizeFormData(data);

        // Actualizar campos del formulario con datos sanitizados
        Object.entries(sanitizedData).forEach(([key, value]) => {
          const input = event.currentTarget.querySelector(
            `[name="${key}"]`
          ) as HTMLInputElement;
          if (input) {
            input.value = value;
          }
        });
      }

      if (onSubmit) {
        onSubmit(event);
      }
    },
    [onSubmit, sanitizeData]
  );

  // Validar action si está presente
  if (action && !validateUrl(action)) {
    reportViolation({
      type: 'unsafe_form_action',
      action: action,
      timestamp: Date.now(),
    });

    return (
      <div className={safeClassName}>
        <p>🚫 Formulario bloqueado por seguridad</p>
        {children}
      </div>
    );
  }

  return (
    <form
      {...props}
      action={safeAction}
      method={method}
      className={safeClassName}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}

/**
 * Componente para inputs seguros
 */
interface SafeInputProps {
  name: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  [key: string]: any;
}

export function SafeInput({
  name,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  className,
  onChange,
  autoComplete,
  ...props
}: SafeInputProps) {
  const safeName = escapeHtmlAttribute(name);
  const safeValue = value ? escapeHtmlAttribute(value) : undefined;
  const safeDefaultValue = defaultValue
    ? escapeHtmlAttribute(defaultValue)
    : undefined;
  const safePlaceholder = placeholder
    ? escapeHtmlAttribute(placeholder)
    : undefined;
  const safeClassName = className ? sanitizeCssClass(className) : undefined;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Sanitizar valor en tiempo real
      const sanitizedValue = escapeHtml(event.target.value);
      event.target.value = sanitizedValue;

      if (onChange) {
        onChange(event);
      }
    },
    [onChange]
  );

  return (
    <input
      {...props}
      name={safeName}
      type={type}
      value={safeValue}
      defaultValue={safeDefaultValue}
      placeholder={safePlaceholder}
      className={safeClassName}
      onChange={handleChange}
      autoComplete={autoComplete}
    />
  );
}

/**
 * Componente para scripts inline seguros
 */
interface SafeScriptProps {
  children: string;
  defer?: boolean;
  async?: boolean;
}

export function SafeScript({ children, defer, async }: SafeScriptProps) {
  const { nonce } = useSecurity();

  return (
    <script
      nonce={nonce}
      defer={defer}
      async={async}
      dangerouslySetInnerHTML={{ __html: children }}
    />
  );
}

/**
 * Componente para estilos inline seguros
 */
interface SafeStyleProps {
  children: string;
}

export function SafeStyle({ children }: SafeStyleProps) {
  const { nonce } = useSecurity();

  return <style nonce={nonce} dangerouslySetInnerHTML={{ __html: children }} />;
}

/**
 * Hook para validación de entrada en tiempo real
 */
export function useInputValidation(
  type: 'email' | 'url' | 'text' | 'number' = 'text'
) {
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const validateAndSet = useCallback(
    (inputValue: string) => {
      let sanitized = escapeHtml(inputValue.trim());
      let valid = true;
      let validationErrors: string[] = [];

      switch (type) {
        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(sanitized)) {
            validationErrors.push('Formato de email inválido');
            valid = false;
          }
          break;
        }
        case 'url':
          sanitized = sanitizeUrl(inputValue);
          if (sanitized === '#') {
            validationErrors.push('URL no segura o inválida');
            valid = false;
          }
          break;
        case 'number': {
          const numValue = parseFloat(inputValue);
          if (isNaN(numValue)) {
            validationErrors.push('Debe ser un número válido');
            valid = false;
          } else {
            sanitized = String(numValue);
          }
          break;
        }
      }

      setValue(sanitized);
      setIsValid(valid);
      setErrors(validationErrors);

      return { isValid: valid, sanitized, errors: validationErrors };
    },
    [type]
  );

  return {
    value,
    isValid,
    errors,
    setValue: validateAndSet,
    reset: () => {
      setValue('');
      setIsValid(true);
      setErrors([]);
    },
  };
}

/**
 * Componente de debug para seguridad (solo desarrollo)
 */
export function SecurityDebugInfo() {
  const { nonce, isCSPEnabled } = useSecurity();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      <h4>🛡️ Security Debug</h4>
      <p>CSP: {isCSPEnabled ? '✅' : '❌'}</p>
      <p>Nonce: {nonce.substring(0, 8)}...</p>
      <p>Env: {process.env.NODE_ENV}</p>
    </div>
  );
}

export default {
  SecurityProvider,
  useSecurity,
  SafeText,
  SafeLink,
  SafeImage,
  SafeForm,
  SafeInput,
  SafeScript,
  SafeStyle,
  useInputValidation,
  SecurityDebugInfo,
};
