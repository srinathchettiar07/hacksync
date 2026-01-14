import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  MapPin, 
  Navigation,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Locate,
  MapPinOff,
  Mic,
  MicOff,
  Trash2
} from "lucide-react";

const FileAComplaint = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({ lat: null, long: null });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (images.length + imageFiles.length > 5) {
      setMessage("You can only upload up to 5 images");
      return;
    }
    
    setImages(prev => [...prev, ...imageFiles]);
    setMessage("");
  };

  // Remove an image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude
        });
        setUseCurrentLocation(true);
        setMessage("Location obtained successfully!");
        setLoading(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      },
      (error) => {
        console.error("Error getting location:", error);
        setMessage("Failed to get location. Please try again or enter address manually.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Clear location
  const clearLocation = () => {
    setLocation({ lat: null, long: null });
    setUseCurrentLocation(false);
    setAddress("");
  };

  // Voice input functions
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startVoiceListening = () => {
    setVoiceError("");
    
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Speech Recognition not supported. Please use Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setVoiceError("");
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
          setDescription((prev) => (prev ? prev + " " : "") + finalTranscript);
        }
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

        setVoiceError(errorMessage);
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
      setVoiceError("Failed to start speech recognition. Please try again.");
      setIsListening(false);
    }
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearDescription = () => {
    setDescription("");
    setVoiceError("");
  };

  // Submit complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate form
    if (!description.trim()) {
      setMessage("Please provide a description of the issue");
      setLoading(false);
      return;
    }

    if (!useCurrentLocation && !address.trim()) {
      setMessage("Please provide either your current location or an address");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("description", description);
      
      if (useCurrentLocation) {
        formData.append("locationLat", location.lat);
        formData.append("locationLong", location.long);
      } else {
        formData.append("address", address);
      }
      
      images.forEach((img) => {
        formData.append("images", img);
      });

      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        "http://localhost:3000/citizen/send-complain", 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setMessage("success");
        setDescription("");
        setAddress("");
        setLocation({ lat: null, long: null });
        setUseCurrentLocation(false);
        setImages([]);
        alert("Complaint submitted successfully!");
        navigate("/citizen/portal/dashboard");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setMessage("error");
      alert("Failed to submit complaint. Please try again.");
      
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Report an Issue</h2>
          <p className="text-blue-100">Help us improve your community by reporting issues you encounter</p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <AnimatePresence>
            {message === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-green-700">Complaint submitted successfully! We'll review it shortly.</p>
              </motion.div>
            )}
            
            {message === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center"
              >
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-red-700">Failed to submit complaint. Please try again.</p>
              </motion.div>
            )}

            {message && message !== "success" && message !== "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center"
              >
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                <p className="text-blue-700">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe the issue *
              </label>
              
              {/* Voice Input Controls */}
              <div className="mb-3 flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-gray-600">Language:</label>
                    <select
                      value={voiceLang}
                      onChange={(e) => setVoiceLang(e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#1E3A8A] focus:border-transparent"
                      disabled={isListening}
                    >
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (India)</option>
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isListening ? (
                    <button
                      type="button"
                      onClick={startVoiceListening}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      <Mic className="h-4 w-4 mr-1" />
                      Start Voice
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceListening}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      <MicOff className="h-4 w-4 mr-1" />
                      Stop Voice
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={clearDescription}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                    disabled={isListening}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Voice Status Messages */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <p className="text-blue-700 font-medium flex items-center text-sm">
                      <span className="animate-pulse mr-2">🔴</span>
                      Listening... Please speak clearly into your microphone.
                    </p>
                  </motion.div>
                )}
                
                {voiceError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-700 font-medium flex items-center text-sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {voiceError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                rows="4"
                placeholder="Please provide a detailed description of the issue you're reporting... You can also use voice input above."
              ></textarea>
            </div>

            {/* Location Options */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Location Information *
              </label>

              {/* Current Location Option */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loading || useCurrentLocation}
                  className={`flex items-center px-4 py-2 rounded-xl ${
                    useCurrentLocation
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : loading
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  } transition`}
                >
                  <Locate className="h-4 w-4 mr-2" />
                  {useCurrentLocation ? 'Location Captured' : 'Use Current Location'}
                </button>

                {useCurrentLocation && (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition"
                  >
                    <MapPinOff className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>

              {useCurrentLocation && location.lat && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm">
                    <strong>Coordinates captured:</strong> Lat: {location.lat.toFixed(6)}, Long: {location.long.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Manual Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter address manually
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={useCurrentLocation}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Enter the address where the issue is located..."
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload images (up to 5)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                  ${isDragOver 
                    ? 'border-[#3B82F6] bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">
                    Drag & drop images here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, WEBP (max 5 images)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  <AnimatePresence>
                    {images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={loading || !description || (!useCurrentLocation && !address)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl text-white font-medium text-lg flex items-center justify-center
                  ${loading || !description || (!useCurrentLocation && !address)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-[#233876] hover:to-[#2563EB]'
                  } transition`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5 mr-2" />
                    Submit Report
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium mb-1">Tips for better reports:</p>
                <ul className="text-blue-700 text-sm list-disc pl-5 space-y-1">
                  <li>Use voice input for faster, more detailed descriptions</li>
                  <li>Include clear, well-lit photos showing the issue</li>
                  <li>Using your current location helps us respond faster</li>
                  <li>Describe the location and severity of the problem</li>
                  <li>Reports with images are resolved 60% faster</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileAComplaint;