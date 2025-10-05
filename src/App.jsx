import { useState, useEffect, useRef } from 'react';
import { analyzeBanknote } from './services/banknoteAnalyzer';
import './App.css';

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
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

    // Reproducir sonido de captura
    speak("Foto capturada, analizando billete");

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    
    // Analizar la imagen
    setAnalyzing(true);
    setError(null);
    setResult(null);

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
      // Limpiar después de 5 segundos y permitir nueva captura
      setTimeout(() => {
        setCapturedImage(null);
        setResult(null);
        setError(null);
        speak("Listo para capturar otro billete. Toque el botón del centro");
      }, 5000);
    }
  };

  const handleButtonClick = () => {
    if (analyzing) return;
    
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
    <div className="app-accessible">
      {/* Video de cámara siempre activo (oculto visualmente) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="video-hidden"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Botón grande central */}
      <div className="main-container">
        <h1 className="app-title-accessible">
          💵 Identificador de Billetes Colombianos
        </h1>

        <button
          className={`capture-button-large ${analyzing ? 'analyzing' : ''}`}
          onClick={handleButtonClick}
          disabled={analyzing}
          aria-label="Capturar y analizar billete"
        >
          {analyzing ? (
            <>
              <div className="spinner-large"></div>
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <span className="camera-icon-large">📸</span>
              <span className="button-text">CAPTURAR BILLETE</span>
            </>
          )}
        </button>

        {/* Resultado visual (también se lee en voz) */}
        {result && !analyzing && result.esBillete && (
          <div 
            className="result-display"
            style={{ backgroundColor: getBanknoteColor(result.denominacion) }}
          >
            <div className="denomination-large">
              {formatDenomination(result.denominacion)}
            </div>
            <div className="currency-text">Pesos Colombianos</div>
            <div className="color-indicator">Color: {result.color}</div>
          </div>
        )}

        {result && !analyzing && !result.esBillete && (
          <div className="instructions-display">
            <div className="warning-icon">⚠️</div>
            <p className="instructions-text">{result.instrucciones}</p>
          </div>
        )}

        {error && (
          <div className="error-display">
            <div className="error-icon">❌</div>
            <p>{error}</p>
          </div>
        )}

        {/* Indicador de estado de voz */}
        <div className="voice-indicator">
          <span className="speaker-icon">🔊</span>
          <span>Asistente de voz activo</span>
        </div>
      </div>
    </div>
  );
}

export default App;
