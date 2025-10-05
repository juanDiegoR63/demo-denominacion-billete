import { useState, useRef, useEffect } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ onCapture }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' o 'environment'
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Asegurar que el video se reproduzca cuando el stream cambie
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error al reproducir video:', err);
      });
    }
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    try {
      // Detener stream anterior si existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }

      // Primero intentar con facingMode específico
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (e) {
        // Si falla, intentar sin especificar facingMode
        console.log('Intentando sin facingMode específico...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      }

      setStream(mediaStream);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      let errorMessage = 'No se pudo acceder a la cámara. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Por favor, permite el acceso a la cámara en tu navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No se encontró ninguna cámara en tu dispositivo.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'La cámara está siendo usada por otra aplicación.';
      } else {
        errorMessage += error.message || 'Error desconocido.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (stream) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      stopCamera();
      
      if (onCapture) {
        onCapture(imageDataUrl);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  };

  // Limpiar el stream cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="camera-container">
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!stream && !capturedImage && (
        <div className="camera-placeholder">
          <div className="camera-icon">📷</div>
          <button className="btn btn-primary" onClick={startCamera}>
            Abrir Cámara
          </button>
          <p className="camera-hint">
            Asegúrate de permitir el acceso a la cámara cuando te lo solicite el navegador
          </p>
        </div>
      )}

      {stream && !capturedImage && (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-preview"
          />
          <div className="camera-controls">
            <button className="btn btn-secondary" onClick={switchCamera}>
              🔄 Voltear
            </button>
            <button className="btn btn-capture" onClick={capturePhoto}>
              📸 Capturar
            </button>
            <button className="btn btn-secondary" onClick={stopCamera}>
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="image-preview">
          <img src={capturedImage} alt="Foto capturada" className="captured-image" />
          <button className="btn btn-primary" onClick={retakePhoto}>
            🔄 Tomar otra foto
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
