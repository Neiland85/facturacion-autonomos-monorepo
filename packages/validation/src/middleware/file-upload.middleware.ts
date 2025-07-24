import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// Tipos básicos para evitar dependencias de Express
interface RequestLike {
  ip?: string;
  get?(name: string): string | undefined;
  file?: any;
  files?: any[];
  [key: string]: any;
}

interface ResponseLike {
  status(code: number): ResponseLike;
  json(obj: any): ResponseLike;
  send?(body: any): ResponseLike;
  [key: string]: any;
}

type NextFunctionLike = (error?: any) => void;

/**
 * Configuración de validación de archivos para OCR
 */
export interface FileValidationConfig {
  maxFileSize: number; // Tamaño máximo en bytes
  allowedMimeTypes: string[]; // Tipos MIME permitidos
  allowedExtensions: string[]; // Extensiones permitidas
  tempDir: string; // Directorio temporal para procesamiento
  virusScanEnabled: boolean; // Habilitar escaneo de virus (futuro)
}

/**
 * Configuración por defecto para validación de archivos OCR
 */
export const DEFAULT_FILE_CONFIG: FileValidationConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
  tempDir: '/tmp/ocr-processing',
  virusScanEnabled: false
};

/**
 * Errores específicos de validación de archivos
 */
export class FileValidationError extends Error {
  constructor(
    message: string, 
    public code: string, 
    public details?: any
  ) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Información de archivo validado
 */
export interface ValidatedFile {
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  tempPath: string;
  hash: string;
  isSecure: boolean;
}

/**
 * Valida la extensión del archivo
 */
function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Valida el tipo MIME del archivo
 */
function validateMimeType(mimeType: string, allowedMimeTypes: string[]): boolean {
  return allowedMimeTypes.includes(mimeType.toLowerCase());
}

/**
 * Valida el tamaño del archivo
 */
function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Genera un hash SHA-256 del archivo para verificación de integridad
 */
async function generateFileHash(buffer: Buffer): Promise<string> {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Verifica que el tipo MIME coincide con el contenido real del archivo
 */
function verifyMimeTypeConsistency(buffer: Buffer, declaredMimeType: string): boolean {
  const signatures: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
  };

  const signature = signatures[declaredMimeType.toLowerCase()];
  if (!signature) return true; // Si no tenemos firma, asumimos válido

  return signature.some(sig => 
    sig.every((byte, index) => buffer[index] === byte)
  );
}

/**
 * Detecta contenido potencialmente malicioso en archivos
 */
function detectMaliciousContent(buffer: Buffer, filename: string): string[] {
  const warnings: string[] = [];
  const content = buffer.toString('ascii', 0, Math.min(buffer.length, 1024));

  // Detectar scripts embebidos
  const scriptPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /document\./i
  ];

  scriptPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      warnings.push('Posible código JavaScript embebido detectado');
    }
  });

  // Detectar extensión doble (archivo.pdf.exe)
  const doubleExtension = /\.[a-z]{2,4}\.[a-z]{2,4}$/i;
  if (doubleExtension.test(filename)) {
    warnings.push('Extensión doble detectada - posible archivo malicioso');
  }

  // Detectar nombres de archivo sospechosos
  const suspiciousNames = [
    /autorun/i,
    /setup\.exe/i,
    /install\.exe/i,
    /cmd\.exe/i,
    /powershell/i
  ];

  suspiciousNames.forEach(pattern => {
    if (pattern.test(filename)) {
      warnings.push('Nombre de archivo sospechoso detectado');
    }
  });

  return warnings;
}

/**
 * Crea el directorio temporal de forma segura
 */
async function ensureTempDirectory(tempDir: string): Promise<void> {
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true, mode: 0o700 });
  }
}

/**
 * Limpia archivos temporales antiguos
 */
async function cleanupOldTempFiles(tempDir: string, maxAge: number = 3600000): Promise<void> {
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Archivo temporal eliminado: ${filePath}`);
      }
    }
  } catch (error) {
    console.error('Error limpiando archivos temporales:', error);
  }
}

/**
 * Middleware principal de validación de archivos para OCR
 */
export function createFileValidationMiddleware(config: Partial<FileValidationConfig> = {}) {
  const finalConfig: FileValidationConfig = { ...DEFAULT_FILE_CONFIG, ...config };

  return async (req: RequestLike, res: ResponseLike, next: NextFunctionLike) => {
    try {
      // Obtener archivo del request (multer o similar)
      const file = req.file || req.files?.[0];
      
      if (!file) {
        throw new FileValidationError(
          'No se proporcionó ningún archivo',
          'NO_FILE_PROVIDED'
        );
      }

      // Validaciones básicas
      if (!validateFileSize(file.size, finalConfig.maxFileSize)) {
        throw new FileValidationError(
          `Archivo demasiado grande. Máximo permitido: ${(finalConfig.maxFileSize / 1024 / 1024).toFixed(1)}MB`,
          'FILE_TOO_LARGE',
          { maxSize: finalConfig.maxFileSize, receivedSize: file.size }
        );
      }

      if (!validateMimeType(file.mimetype, finalConfig.allowedMimeTypes)) {
        throw new FileValidationError(
          `Tipo de archivo no permitido: ${file.mimetype}`,
          'INVALID_MIME_TYPE',
          { allowedTypes: finalConfig.allowedMimeTypes, receivedType: file.mimetype }
        );
      }

      if (!validateFileExtension(file.originalname, finalConfig.allowedExtensions)) {
        throw new FileValidationError(
          `Extensión de archivo no permitida: ${path.extname(file.originalname)}`,
          'INVALID_EXTENSION',
          { allowedExtensions: finalConfig.allowedExtensions }
        );
      }

      // Leer buffer del archivo para validaciones avanzadas
      const buffer = file.buffer || await fs.readFile(file.path);

      // Verificar consistencia del tipo MIME
      if (!verifyMimeTypeConsistency(buffer, file.mimetype)) {
        throw new FileValidationError(
          'El contenido del archivo no coincide con el tipo MIME declarado',
          'MIME_CONTENT_MISMATCH',
          { declaredType: file.mimetype }
        );
      }

      // Detectar contenido malicioso
      const securityWarnings = detectMaliciousContent(buffer, file.originalname);
      if (securityWarnings.length > 0) {
        throw new FileValidationError(
          'Contenido potencialmente malicioso detectado',
          'MALICIOUS_CONTENT',
          { warnings: securityWarnings }
        );
      }

      // Generar hash para integridad
      const fileHash = await generateFileHash(buffer);

      // Crear directorio temporal
      await ensureTempDirectory(finalConfig.tempDir);

      // Crear archivo temporal seguro
      const tempFileName = `${Date.now()}_${crypto.randomUUID()}_${path.basename(file.originalname)}`;
      const tempPath = path.join(finalConfig.tempDir, tempFileName);
      
      await fs.writeFile(tempPath, buffer, { mode: 0o600 });

      // Limpiar archivos temporales antiguos en background
      setImmediate(() => cleanupOldTempFiles(finalConfig.tempDir));

      // Crear objeto de archivo validado
      const validatedFile: ValidatedFile = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extension: path.extname(file.originalname).toLowerCase(),
        tempPath,
        hash: fileHash,
        isSecure: securityWarnings.length === 0
      };

      // Adjuntar información al request
      req.validatedFile = validatedFile;
      req.securityWarnings = securityWarnings;

      next();

    } catch (error) {
      if (error instanceof FileValidationError) {
        const response = res.status(400);
        if (response.json) {
          return response.json({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
          });
        }
      }

      console.error('Error en validación de archivo:', error);
      const response = res.status(500);
      if (response.json) {
        return response.json({
          success: false,
          error: 'Error interno en validación de archivo'
        });
      }
    }
  };
}

/**
 * Middleware para limpiar archivo temporal después del procesamiento
 */
export function createFileCleanupMiddleware() {
  return async (req: RequestLike, res: ResponseLike, next: NextFunctionLike) => {
    const originalSend = res.send;
    
    if (originalSend) {
      res.send = function(body: any) {
        const validatedFile = req.validatedFile as ValidatedFile;
        
        if (validatedFile?.tempPath) {
          // Limpiar archivo temporal de forma asíncrona
          setImmediate(async () => {
            try {
              await fs.unlink(validatedFile.tempPath);
              console.log(`Archivo temporal limpiado: ${validatedFile.tempPath}`);
            } catch (error) {
              console.error('Error limpiando archivo temporal:', error);
            }
          });
        }
        
        return originalSend.call(this, body);
      };
    }

    next();
  };
}

/**
 * Middleware de logging de seguridad para archivos
 */
export function createFileSecurityLogMiddleware() {
  return (req: RequestLike, res: ResponseLike, next: NextFunctionLike) => {
    const validatedFile = req.validatedFile as ValidatedFile;
    const securityWarnings = req.securityWarnings as string[];

    if (validatedFile) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: 'FILE_UPLOAD_VALIDATION',
        ip: req.ip || 'unknown',
        userAgent: req.get?.('User-Agent') || 'unknown',
        file: {
          originalName: validatedFile.originalName,
          mimeType: validatedFile.mimeType,
          size: validatedFile.size,
          hash: validatedFile.hash,
          isSecure: validatedFile.isSecure
        },
        securityWarnings,
        severity: securityWarnings.length > 0 ? 'HIGH' : 'INFO'
      };

      console.log('FILE_SECURITY_LOG:', JSON.stringify(logEntry));

      // Aquí podrías enviar a un sistema de logging externo
      // como Winston, Datadog, etc.
    }

    next();
  };
}

/**
 * Utilidades para validación de archivos
 */
export const FileValidationUtils = {
  /**
   * Valida un archivo sin middleware (uso directo)
   */
  async validateFile(
    buffer: Buffer, 
    filename: string, 
    mimeType: string, 
    config: Partial<FileValidationConfig> = {}
  ): Promise<ValidatedFile> {
    const finalConfig = { ...DEFAULT_FILE_CONFIG, ...config };

    if (!validateFileSize(buffer.length, finalConfig.maxFileSize)) {
      throw new FileValidationError('Archivo demasiado grande', 'FILE_TOO_LARGE');
    }

    if (!validateMimeType(mimeType, finalConfig.allowedMimeTypes)) {
      throw new FileValidationError('Tipo MIME no permitido', 'INVALID_MIME_TYPE');
    }

    if (!validateFileExtension(filename, finalConfig.allowedExtensions)) {
      throw new FileValidationError('Extensión no permitida', 'INVALID_EXTENSION');
    }

    if (!verifyMimeTypeConsistency(buffer, mimeType)) {
      throw new FileValidationError('Inconsistencia de tipo MIME', 'MIME_CONTENT_MISMATCH');
    }

    const securityWarnings = detectMaliciousContent(buffer, filename);
    if (securityWarnings.length > 0) {
      throw new FileValidationError('Contenido malicioso detectado', 'MALICIOUS_CONTENT');
    }

    return {
      originalName: filename,
      mimeType,
      size: buffer.length,
      extension: path.extname(filename).toLowerCase(),
      tempPath: '',
      hash: await generateFileHash(buffer),
      isSecure: true
    };
  },

  /**
   * Limpia directorios temporales
   */
  async cleanupTempDirectory(tempDir: string): Promise<number> {
    let cleaned = 0;
    try {
      const files = await fs.readdir(tempDir);
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        await fs.unlink(filePath);
        cleaned++;
      }
    } catch (error) {
      console.error('Error limpiando directorio:', error);
    }
    return cleaned;
  },

  /**
   * Obtiene información de archivos temporales
   */
  async getTempDirectoryInfo(tempDir: string): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: Date | null;
  }> {
    try {
      const files = await fs.readdir(tempDir);
      let totalSize = 0;
      let oldestFile: Date | null = null;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        
        if (!oldestFile || stats.mtime < oldestFile) {
          oldestFile = stats.mtime;
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile
      };
    } catch {
      return { totalFiles: 0, totalSize: 0, oldestFile: null };
    }
  }
};
