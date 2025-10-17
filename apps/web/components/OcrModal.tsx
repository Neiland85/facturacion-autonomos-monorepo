import React, { useState, useEffect, useRef, useCallback } from 'react';
import { processInvoiceImage } from '../services/geminiService';
import { XIcon, SparklesIcon, ExclamationTriangleIcon, CameraIcon, DocumentTextIcon, SwitchHorizontalIcon } from './icons';
import { useSound } from '../hooks/useSound';

// Define a robust structure for the extracted data state
interface ExtractedInvoiceData {
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD format for input
  dueDate: string; // YYYY-MM-DD format for input
  clientName: string;
  baseAmount: string; // Keep as string for flexible input
  taxRate: string; // Keep as string for flexible input
}

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOcrComplete: (data: any) => void;
}

const OcrModal: React.FC<OcrModalProps> = ({ isOpen, onClose, onOcrComplete }) => {
  const [modalState, setModalState] = useState<'uploading' | 'reviewing'>('uploading');
  const [view, setView] = useState<'picker' | 'camera'>('picker');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [originalData, setOriginalData] = useState<ExtractedInvoiceData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando proceso...');
  const { playSound } = useSound();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);

  // --- Barcode/QR Scanning State ---
  const [isScanning, setIsScanning] = useState(false);
  const [detectedData, setDetectedData] = useState<string | null>(null);
  const [barcodeScannerSupported, setBarcodeScannerSupported] = useState(true);
  const barcodeDetectorRef = useRef<any>(null); // Use 'any' for BarcodeDetector API
  const requestRef = useRef<number>();

  // Manage camera stream and barcode scanning
  const scanCode = useCallback(async () => {
    if (view === 'camera' && videoRef.current && videoRef.current.readyState >= 3 && barcodeDetectorRef.current && isScanning) {
        try {
            const detectedBarcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (detectedBarcodes.length > 0) {
                playSound('notify');
                setIsScanning(false);
                setDetectedData(detectedBarcodes[0].rawValue);
            } else {
                requestRef.current = requestAnimationFrame(scanCode);
            }
        } catch (e) {
            console.error("Barcode detection failed: ", e);
            // Continue scanning even if one frame fails
            requestRef.current = requestAnimationFrame(scanCode);
        }
    }
  }, [isScanning, view, playSound]);

  useEffect(() => {
    const stopCameraAndScan = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setIsScanning(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
      
    const setupCamera = async () => {
        // Check for BarcodeDetector support
        if (!('BarcodeDetector' in window)) {
            setBarcodeScannerSupported(false);
        } else if (!barcodeDetectorRef.current){
             barcodeDetectorRef.current = new (window as any).BarcodeDetector({
                formats: ['qr_code', 'ean_13', 'code_128']
            });
        }
        
        stopCameraAndScan(); // Ensure previous streams are stopped

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            if (videoDevices.length === 0) throw new Error("No se encontraron cámaras.");
            setCameraDevices(videoDevices);
            
            let deviceIdToUse = selectedDeviceId;
            if (!deviceIdToUse) {
                const rearCamera = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('trasera'));
                deviceIdToUse = rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId;
                setSelectedDeviceId(deviceIdToUse);
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceIdToUse } } });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                videoRef.current.oncanplay = () => {
                    setIsScanning(true);
                };
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setError("No se pudo acceder a la cámara. Revisa los permisos en tu navegador.");
            setView('picker');
        }
    };

    if (isOpen && view === 'camera') {
        setupCamera();
    } else {
        stopCameraAndScan();
    }
    
    return stopCameraAndScan;
  }, [isOpen, view, selectedDeviceId]);

  useEffect(() => {
      if (isScanning) {
          requestRef.current = requestAnimationFrame(scanCode);
      } else {
          if (requestRef.current) {
              cancelAnimationFrame(requestRef.current);
          }
      }
      return () => {
          if (requestRef.current) {
              cancelAnimationFrame(requestRef.current);
          }
      }
  }, [isScanning, scanCode]);
  
  useEffect(() => {
    if (isOpen) {
      playSound('open');
    } else {
      handleReset();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      const messages = ['Analizando imagen...', 'Identificando texto...', 'Extrayendo campos clave...', 'Estructurando datos...'];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);
      interval = window.setInterval(() => {
        messageIndex++;
        if (messageIndex < messages.length) setLoadingMessage(messages[messageIndex]);
        else clearInterval(interval);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file || !preview) return;

    playSound('click');
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = preview.split(',')[1];
      const result = await processInvoiceImage(base64Image, file.type);
      
      if (result.error) {
          setError(result.error);
          playSound('error');
      } else {
          playSound('success');
          const formattedResult: ExtractedInvoiceData = {
              clientName: result.clientName || '',
              invoiceNumber: result.invoiceNumber || '',
              issueDate: result.issueDate ? result.issueDate.split('/').reverse().join('-') : '',
              dueDate: result.dueDate ? result.dueDate.split('/').reverse().join('-') : '',
              baseAmount: result.baseAmount != null ? String(result.baseAmount) : '',
              taxRate: result.taxRate != null ? String(result.taxRate) : '',
          };
          setExtractedData(formattedResult);
          setOriginalData(formattedResult);
          setModalState('reviewing');
      }
    } catch (err) {
      setError("Error inesperado al procesar la imagen.");
      playSound('error');
    } finally {
        setIsLoading(false);
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        playSound('click');
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const capturedFile = new File([dataURItoBlob(dataUrl)], "factura-capturada.jpg", { type: "image/jpeg" });
        setFile(capturedFile);
        setPreview(dataUrl);
        setView('picker');
    }
  };

  const dataURItoBlob = (dataURI: string) => {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
  }

  const handleSwitchCamera = () => {
    if (cameraDevices.length < 2) return;
    playSound('click');
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    setSelectedDeviceId(cameraDevices[nextIndex].deviceId);
  }

  const handleDataChange = (field: keyof ExtractedInvoiceData, value: string) => {
    setExtractedData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleConfirm = () => {
    if (!extractedData) return;
    playSound('success');
    const dataToSend = {
      ...extractedData,
      issueDate: extractedData.issueDate ? extractedData.issueDate.split('-').reverse().join('/') : null,
      dueDate: extractedData.dueDate ? extractedData.dueDate.split('-').reverse().join('/') : null,
    };
    onOcrComplete(dataToSend);
    handleClose();
  };
  
  const handleClose = () => {
      onClose();
  };

  const handleReset = () => {
    playSound('click');
    setFile(null);
    setPreview(null);
    setError(null);
    setIsLoading(false);
    setExtractedData(null);
    setOriginalData(null);
    setModalState('uploading');
    setView('picker');
    setSelectedDeviceId(undefined);
    setDetectedData(null);
    setIsScanning(false);
  };

  // --- Handlers for Barcode/QR Data ---
  const handleRescan = () => {
      playSound('click');
      setDetectedData(null);
      setError(null);
      setIsScanning(true);
  };

  const handleUseDetectedData = () => {
      if (!detectedData) return;
      playSound('click');
      try {
          const parsed = JSON.parse(detectedData);
          if (parsed.invoiceNumber || parsed.clientName || parsed.baseAmount) {
              const formattedResult: ExtractedInvoiceData = {
                  clientName: parsed.clientName || '',
                  invoiceNumber: parsed.invoiceNumber || '',
                  issueDate: parsed.issueDate ? parsed.issueDate.split('/').reverse().join('-') : '',
                  dueDate: parsed.dueDate ? parsed.dueDate.split('/').reverse().join('-') : '',
                  baseAmount: parsed.baseAmount != null ? String(parsed.baseAmount) : '',
                  taxRate: parsed.taxRate != null ? String(parsed.taxRate) : '21',
              };
              setExtractedData(formattedResult);
              setOriginalData(formattedResult);
              setPreview(null);
              setFile(null);
              setModalState('reviewing');
              setView('picker');
          } else {
              throw new Error("El JSON no contiene campos de factura reconocibles.");
          }
      } catch (e) {
          setError('El código QR no contiene datos de factura válidos en formato JSON.');
          handleRescan();
      }
  };

  if (!isOpen) return null;

  const isFieldEdited = (field: keyof ExtractedInvoiceData) => {
    if (!originalData || !extractedData) return false;
    return originalData[field] !== extractedData[field];
  };

  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const inputClasses = "w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors";
  const editedFieldClasses = "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500";

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-4xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh]">
        <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {modalState === 'uploading' ? 'OCR - Extraer Datos' : 'Verificar Datos Extraídos'}
          </h2>
          <button onClick={handleClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {modalState === 'uploading' && (
          <main className="p-6 flex-grow flex flex-col justify-center min-h-[300px]">
            {isLoading ? (
                <div className="text-center"><div className="relative w-24 h-24 mx-auto"><SparklesIcon className="w-24 h-24 text-slate-300 dark:text-slate-600" /><div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div></div><h3 className="text-xl font-bold mt-6 text-slate-800 dark:text-white">Procesando con IA...</h3><p className="text-slate-500 dark:text-slate-400 mt-2 h-6">{loadingMessage}</p></div>
            ) : view === 'picker' ? (
              <>
                {!preview ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label htmlFor="invoice-upload" className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-2"><DocumentTextIcon className="w-10 h-10 text-slate-400" /><p className="font-semibold text-slate-600 dark:text-slate-300">Subir Archivo</p><p className="text-sm text-slate-400 dark:text-slate-500">PNG, JPG hasta 5MB</p><input id="invoice-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileChange} /></label><button onClick={() => setView('camera')} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-2"><CameraIcon className="w-10 h-10 text-slate-400" /><p className="font-semibold text-slate-600 dark:text-slate-300">Usar Cámara</p><p className="text-sm text-slate-400 dark:text-slate-500">Captura o escanea un código</p></button></div>
                ) : (<div><img src={preview} alt="Vista previa de la factura" className="max-h-64 w-full object-contain rounded-lg mb-4" /></div>)}
                {error && (<div className="text-red-800 dark:text-red-400 bg-red-500/10 p-4 rounded-lg mt-4 text-left flex items-start gap-3"><ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" /><div><h4 className="font-bold">Error</h4><p className="text-sm">{error}</p></div></div>)}
              </>
            ) : (
                <div className="relative overflow-hidden rounded-lg bg-slate-900 aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>

                    {/* Viewfinder and overlays */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-1/2 border-4 border-white/50 rounded-lg shadow-2xl" style={{boxShadow: '0 0 0 999px rgba(0,0,0,0.5)'}}></div>
                    </div>
                    
                    {!barcodeScannerSupported && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded">Escaneo de códigos no soportado</div>
                    )}

                    {detectedData && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20 text-white text-center">
                            <h3 className="text-xl font-bold">¡Código Detectado!</h3>
                            <p className="font-mono bg-slate-700 p-3 rounded-lg my-4 max-w-full overflow-x-auto text-sm">{detectedData}</p>
                            <div className="flex gap-4">
                                <button onClick={handleRescan} className="bg-white/20 hover:bg-white/30 font-bold py-2 px-4 rounded-lg">Escanear de Nuevo</button>
                                <button onClick={handleUseDetectedData} className="bg-orange-500 hover:bg-orange-600 font-bold py-2 px-4 rounded-lg">Usar estos Datos</button>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 z-10">
                        {cameraDevices.length > 1 && (<button onClick={handleSwitchCamera} className="bg-black/40 backdrop-blur-sm text-white font-bold p-3 rounded-full hover:bg-black/60 transition-colors" aria-label="Cambiar cámara"><SwitchHorizontalIcon className="w-6 h-6" /></button>)}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                        <button onClick={() => setView('picker')} className="bg-white/20 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors">Cancelar</button>
                        <button onClick={capturePhoto} className="bg-orange-500 text-white rounded-full h-16 w-16 flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform" aria-label="Capturar foto"><CameraIcon className="w-8 h-8"/></button>
                    </div>
                </div>
            )}
          </main>
        )}

        {modalState === 'reviewing' && extractedData && (
           <main className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Imagen Original</p>
                  {preview ? (
                    <img src={preview} alt="Vista previa de la factura" className="w-full object-contain rounded-md" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md py-8">
                        <SparklesIcon className="w-12 h-12" />
                        <p className="font-semibold mt-2">Datos extraídos desde un código QR</p>
                        <p className="text-sm">No hay imagen para previsualizar.</p>
                    </div>
                  )}
              </div>
              <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 pb-2">Verifica y corrige los datos. Los campos modificados se resaltarán.</p>
                  <div><label htmlFor="ocrClientName" className={labelClasses}>Nombre del Cliente</label><input id="ocrClientName" type="text" value={extractedData.clientName} onChange={(e) => handleDataChange('clientName', e.target.value)} className={`${inputClasses} ${isFieldEdited('clientName') ? editedFieldClasses : ''}`} /></div>
                  <div><label htmlFor="ocrInvoiceNumber" className={labelClasses}>Número de Factura</label><input id="ocrInvoiceNumber" type="text" value={extractedData.invoiceNumber} onChange={(e) => handleDataChange('invoiceNumber', e.target.value)} className={`${inputClasses} ${isFieldEdited('invoiceNumber') ? editedFieldClasses : ''}`} /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label htmlFor="ocrIssueDate" className={labelClasses}>Fecha de Emisión</label><input id="ocrIssueDate" type="date" value={extractedData.issueDate} onChange={(e) => handleDataChange('issueDate', e.target.value)} className={`${inputClasses} ${isFieldEdited('issueDate') ? editedFieldClasses : ''}`} /></div>
                       <div><label htmlFor="ocrDueDate" className={labelClasses}>Fecha de Vencimiento</label><input id="ocrDueDate" type="date" value={extractedData.dueDate} onChange={(e) => handleDataChange('dueDate', e.target.value)} className={`${inputClasses} ${isFieldEdited('dueDate') ? editedFieldClasses : ''}`} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label htmlFor="ocrBaseAmount" className={labelClasses}>Importe Base (€)</label><input id="ocrBaseAmount" type="number" value={extractedData.baseAmount} onChange={(e) => handleDataChange('baseAmount', e.target.value)} className={`${inputClasses} ${isFieldEdited('baseAmount') ? editedFieldClasses : ''}`} /></div>
                    <div><label htmlFor="ocrTaxRate" className={labelClasses}>IVA (%)</label><input id="ocrTaxRate" type="number" value={extractedData.taxRate} onChange={(e) => handleDataChange('taxRate', e.target.value)} className={`${inputClasses} ${isFieldEdited('taxRate') ? editedFieldClasses : ''}`} /></div>
                  </div>
              </div>
            </div>
          </main>
        )}

        {modalState === 'uploading' && view === 'picker' && (
            <footer className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex-shrink-0">
                <button onClick={handleProcess} disabled={!file || isLoading} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors">
                    {isLoading ? 'Procesando...' : (file ? 'Extraer Datos de la Imagen' : 'Selecciona una imagen')}
                </button>
            </footer>
        )}
        {modalState === 'reviewing' && (
            <footer className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex-shrink-0">
                <div className="flex gap-4">
                    <button onClick={handleReset} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors">Escanear Otra</button>
                    <button onClick={handleConfirm} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Confirmar y Crear Factura</button>
                </div>
            </footer>
        )}
      </div>
    </div>
  );
};

export default OcrModal;