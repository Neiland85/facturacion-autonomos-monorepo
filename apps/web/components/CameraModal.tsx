import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XIcon, CameraIcon, SwitchHorizontalIcon } from './icons';
import { useSound } from '../hooks/useSound';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const { playSound } = useSound();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    const setupCamera = async () => {
      stopCameraStream(); // Ensure previous streams are stopped
      setError(null);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length === 0) throw new Error("No se encontraron cámaras.");
        setCameraDevices(videoDevices);
        
        let deviceIdToUse = selectedDeviceId;
        if (!deviceIdToUse) {
            // Prioritize front-facing camera for selfies
            const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('delantera'));
            deviceIdToUse = frontCamera ? frontCamera.deviceId : videoDevices[0].deviceId;
            setSelectedDeviceId(deviceIdToUse);
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceIdToUse } } });
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("No se pudo acceder a la cámara. Revisa los permisos en tu navegador.");
      }
    };

    if (isOpen) {
      playSound('open');
      setupCamera();
    } else {
      stopCameraStream();
    }
    
    return stopCameraStream;
  }, [isOpen, selectedDeviceId, playSound, stopCameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        playSound('click');
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
    }
  };
  
  const handleSwitchCamera = () => {
    if (cameraDevices.length < 2) return;
    playSound('click');
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    setSelectedDeviceId(cameraDevices[nextIndex].deviceId);
  };
  
  const handleClose = () => {
      playSound('close');
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-700 overflow-hidden">
        <header className="p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Hacer Foto</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-2">
            {error ? (
                 <div className="aspect-video bg-black flex flex-col items-center justify-center text-center p-4 text-red-400 rounded-lg">
                    <p className="font-bold">Error de Cámara</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Circular overlay to help frame the face */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3/4 h-3/4 max-w-[300px] max-h-[300px] rounded-full" style={{boxShadow: '0 0 0 999px rgba(0,0,0,0.5)'}}></div>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                        {cameraDevices.length > 1 && (
                            <button onClick={handleSwitchCamera} className="bg-black/40 backdrop-blur-sm text-white font-bold p-3 rounded-full hover:bg-black/60 transition-colors" aria-label="Cambiar cámara">
                                <SwitchHorizontalIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                        <button onClick={capturePhoto} className="bg-orange-500 text-white rounded-full h-16 w-16 flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform" aria-label="Capturar foto">
                            <CameraIcon className="w-8 h-8"/>
                        </button>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default CameraModal;