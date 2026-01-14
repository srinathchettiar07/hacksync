import { useState, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function VoiceComplaint({ text, setText }) {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    setError("");
    
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech Recognition not supported. Please use Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setError("");
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setText((prev) => (prev ? prev + " " : "") + finalTranscript);
        }

        console.log("Final transcript:", finalTranscript);
        console.log("Interim transcript:", interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        let errorMessage = "Speech recognition error: ";

        switch (event.error) {
          case "no-speech":
            errorMessage += "No speech was detected. Please try again.";
            break;
          case "audio-capture":
            errorMessage += "No microphone found. Please check your microphone.";
            break;
          case "not-allowed":
            errorMessage += "Microphone access denied. Please allow microphone access.";
            break;
          case "network":
            errorMessage += "Network error occurred. Please check your internet connection.";
            break;
          default:
            errorMessage += event.error;
        }

        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
      
    } catch (err) {
      console.error("Error starting recognition:", err);
      setError("Failed to start speech recognition. Please try again.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearText = () => {
    setText("");
    setError("");
  };

  return (
    <div className="p-6 max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Voice Input</h1>

      <label className="block mb-2 font-medium">Select Language:</label>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
        disabled={isListening}
      >
        <option value="en-IN">English (India)</option>
        <option value="hi-IN">Hindi (India)</option>
        <option value="en-US">English (US)</option>
        <option value="en-GB">English (UK)</option>
      </select>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4"
        placeholder="Your spoken text appears here..."
        className="w-full p-2 border rounded mb-4"
      />

      <div className="flex gap-4 mb-4">
        {!isListening ? (
          <button
            type="button"
            onClick={startListening}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            🎤 Start Speaking
          </button>
        ) : (
          <button
            type="button"
            onClick={stopListening}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            ⏹ Stop
          </button>
        )}
        
        <button
          type="button"
          onClick={clearText}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          disabled={isListening}
        >
          Clear
        </button>
      </div>

      {isListening && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-600 font-medium flex items-center">
            <span className="animate-pulse mr-2">🔴</span>
            Listening... Please speak clearly into your microphone.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}
