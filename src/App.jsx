import { useState, useEffect, useRef } from 'react';
import { analyzeBanknote } from './services/banknoteAnalyzer';
import { AiOutlineCamera } from 'react-icons/ai';
import { BsSoundwave } from 'react-icons/bs';
import { MdWarning, MdError } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './App.css';

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const speechSynthRef = useRef(window.speechSynthesis);

  // Función para hablar en voz alta
  const speak = (text, rate = 0.9) => {
    // Cancelar cualquier speech anterior
    speechSynthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO'; // Español de Colombia
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    speechSynthRef.current.speak(utterance);
  };

  // Iniciar cámara automáticamente al cargar
  useEffect(() => {
    speak("Bienvenido al identificador de billetes colombianos. Toque el botón grande del centro para capturar una foto del billete");
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      speechSynthRef.current.cancel();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      const errorMsg = 'No se pudo acceder a la cámara. Por favor, permite el acceso en tu navegador.';
      setError(errorMsg);
      speak(errorMsg);
    }
  };

  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      speak("Error: cámara no disponible");
      return;
    }

    // Mostrar mensaje de foto tomada
    setPhotoTaken(true);
    speak("Foto capturada, analizando billete");

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    
    setError(null);
    setResult(null);

    // Pequeña pausa para mostrar el mensaje de foto tomada, luego analizar
    setTimeout(async () => {
      setPhotoTaken(false);
      setAnalyzing(true);

      try {
        const analysisResult = await analyzeBanknote(imageDataUrl);

        if (analysisResult.success) {
          const data = analysisResult.data;
          setResult(data);

          // Leer el resultado en voz alta
          if (data.esBillete) {
            speak(data.mensajeVoz, 0.85);
          } else {
            // Si no es un billete, leer las instrucciones
            speak(data.mensajeVoz + ". " + data.instrucciones, 0.85);
          }
        } else {
          const errorMsg = analysisResult.error || 'Error al procesar la imagen';
          setError(errorMsg);
          speak(errorMsg);
        }
      } catch (err) {
        const errorMsg = 'Error al procesar la imagen. Por favor, intenta de nuevo.';
        setError(errorMsg);
        speak(errorMsg);
        console.error(err);
      } finally {
        setAnalyzing(false);
        // Limpiar después de 10 segundos y permitir nueva captura
        setTimeout(() => {
          setCapturedImage(null);
          setResult(null);
          setError(null);
          speak("Listo para capturar otro billete. Toque la tarjeta del centro");
        }, 10000);
      }
    }, 1000);
  };

  const handleButtonClick = () => {
    if (analyzing || photoTaken) return;
    
    // Vibración táctil si está disponible
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    captureAndAnalyze();
  };

  const formatDenomination = (denomination) => {
    if (denomination === "desconocido") return "Desconocido";
    // Formatear con separador de miles
    return `$${parseInt(denomination).toLocaleString('es-CO')}`;
  };

  const getBanknoteColor = (denomination) => {
    const colors = {
      "100000": "#2D5F3F", // Verde
      "50000": "#7B2D7F",  // Morado
      "20000": "#D35400",  // Naranja
      "10000": "#C0392B",  // Rojo
      "5000": "#7B4B2A",   // Café
      "2000": "#3498DB"    // Azul
    };
    return colors[denomination] || "#444";
  };

  return (
    <div className="app-modern">
      {/* Video de cámara siempre activo (oculto visualmente) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="video-hidden"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <main className="main-content">
        <div className="content-container">
          <h2 className="main-title">
            Identifica tu billete colombiano
          </h2>
          <p className="main-subtitle">
            Toma una foto para identificar la denominación de tu billete al instante.
          </p>
          
          <div className="identification-section">
            <div 
              className={`identification-card clickable-card ${analyzing ? 'analyzing' : ''} ${photoTaken ? 'photo-taken' : ''}`}
              onClick={handleButtonClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleButtonClick();
                }
              }}
              aria-label="Capturar y analizar billete"
              style={{
                cursor: (analyzing || photoTaken) ? 'not-allowed' : 'pointer',
                opacity: (analyzing || photoTaken) ? 0.7 : 1
              }}
            >
              <h3 className="card-title">
                    <AiOutlineCamera className="camera-icon" />
                <br />
                Toca para Identificar
              </h3>
              <p className="card-description">
                Usa tu cámara para identificar el billete o selecciona una imagen de tu galería.
              </p>
              
              <div className="card-status">
                {photoTaken ? (
                  <>
                    <span className="photo-taken-icon">✓</span>
                    <span>¡Foto tomada!</span>
                  </>
                ) : analyzing ? (
                  <>
                    <AiOutlineLoading3Quarters className="loading-icon" />
                    <span>Analizando...</span>
                  </>
                ) : (<span>Listo para capturar</span>
                )}
              </div>
            </div>
          </div>

          {/* Resultado visual */}
          {result && !analyzing && result.esBillete && (
            <div className="result-container">
              <div 
                className="banknote-result"
                style={{ backgroundColor: getBanknoteColor(result.denominacion) }}
              >
                <div className="modern-denomination-value">
                  {formatDenomination(result.denominacion)}
                </div>
                <div className="currency-label">Pesos Colombianos</div>
                <div className="color-info">Color: {result.color}</div>
              </div>
            </div>
          )}

          {result && !analyzing && !result.esBillete && (
            <div className="warning-container">
              <MdWarning className="modern-warning-icon" />
              <p className="warning-text">{result.instrucciones}</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <MdError className="modern-error-icon" />
              <p className="error-text">{error}</p>
            </div>
          )}

          {/* Indicador de estado de voz */}
          <div className="voice-status">
            <BsSoundwave className="voice-icon" />
            <span>Asistente de voz activo</span>
          </div>
        </div>

        <p className="disclaimer">
          Esta aplicación es solo para fines informativos y no debe usarse como única fuente de verificación. 
          Consulte siempre fuentes oficiales para una identificación precisa de la moneda.
        </p>
      </main>
    </div>
  );
}

export default App;
