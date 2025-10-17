export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  // Helper methods
  isAuthError(): boolean {
    return this.statusCode === 401;
  }
  isForbiddenError(): boolean {
    return this.statusCode === 403;
  }
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }
  isServerError(): boolean {
    return this.statusCode >= 500;
  }
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Error de conexión') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
