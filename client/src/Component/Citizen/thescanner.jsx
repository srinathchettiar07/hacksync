import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [location, setLocation] = useState({
    latitude: "",
    longitude: ""
  });

  const [issue, setIssue] = useState("");
  const [images, setImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- GET USER LOCATION ---------------- //
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        });
      },
      () => {
        setError("Location access denied. Enter manually.");
      }
    );
  }, []);

  // ---------------- IMAGE HANDLERS ---------------- //
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }

    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // ---------------- SUBMIT HANDLER ---------------- //
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!issue || !location.latitude || !location.longitude || images.length === 0) {
      setError("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", images[0]); // send first image for now
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("photo_description", issue);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/audit-from-photo", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      navigate("/result", { state: data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ---------------- //
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4"
        initial={{ y: 30 }}
        animate={{ y: 0 }}
      >
        <h2 className="text-xl font-bold text-gray-800">
          Report Civic Issue
        </h2>

        {/* LOCATION */}
        <div>
          <label className="text-sm font-medium">Latitude</label>
          <input
            type="text"
            value={location.latitude}
            onChange={(e) =>
              setLocation({ ...location, latitude: e.target.value })
            }
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Longitude</label>
          <input
            type="text"
            value={location.longitude}
            onChange={(e) =>
              setLocation({ ...location, longitude: e.target.value })
            }
            className="w-full border rounded p-2"
          />
        </div>

        {/* ISSUE */}
        <div>
          <label className="text-sm font-medium">Issue Description</label>
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Road has deep potholes despite recent resurfacing"
            className="w-full border rounded p-2"
            rows={3}
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload images (up to 5)
          </label>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
              ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            `}
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

            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-600 mt-2">
              Drag & drop images or click to browse
            </p>
          </div>

          {/* PREVIEWS */}
          {images.length > 0 && (
            <motion.div className="mt-4 grid grid-cols-2 gap-4">
              <AnimatePresence>
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          {loading ? "Auditing..." : "Submit & Verify"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}
