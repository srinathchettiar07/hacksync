import { useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { 
  Upload, 
  FileText, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  File,
  Download,
  Eye,
  FileType,
  DollarSign,
  Building2,
  Calendar,
  MapPin,
  User,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  // Handle drag and drop 
  // events

  const navigate = useNavigate();
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPG, PNG, BMP, TIFF, WEBP)");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
  };

  const saveMetadata = async () => {
    if (!analysisResult || !analysisResult.metadata) {
        toast.error("No metadata to save");
        return;
    }
    else
    {
        try {

            const token = localStorage.getItem("token");
            console.log("Saving metadata:", analysisResult.metadata);
            const response = await axios.post(
  "http://localhost:3000/admin/save-report-metadata",
  {
    project_name: analysisResult.metadata.project_name,
    budget: analysisResult.metadata.budget,
    construction_details: analysisResult.metadata.construction_details,
    department: analysisResult.metadata.department,
    timeline: analysisResult.metadata.timeline,
    location: analysisResult.metadata.location,
    contractor: analysisResult.metadata.contractor,
    status: analysisResult.metadata.status || "Active",
    gps_coordinates: analysisResult.metadata.gps_coordinates || "",
    additional_info: analysisResult.metadata.additional_info || ""
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

            if (response.data.success) {
                toast.success("Metadata saved successfully!");
                navigate("/admin/view-reports");
            } else {
                toast.error("Failed to save metadata");
            }

    }
    catch (err) {
        console.error("Error saving metadata:", err);
        toast.error(err);
    }
  }}
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a document first");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/analyze-document",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      if (response.data.success) {
        setAnalysisResult(response.data);
        toast.success("Document analyzed successfully!");
      } else {
        setError(response.data.error || "Failed to analyze document");
        toast.error(response.data.error || "Failed to analyze document");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || "Failed to analyze document";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Document analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const MetadataCard = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
      >
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-base text-gray-900">{value}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document verification</h1>
              <p className="text-gray-600">Store data in Records</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>

              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}
                  ${selectedFile ? "bg-green-50 border-green-400" : ""}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600 font-medium">Drag & drop your document here</p>
                      <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Supports PDF, JPG, PNG, BMP, TIFF, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className={`
                  w-full mt-4 py-3 px-4 rounded-lg font-medium transition-colors
                  ${!selectedFile || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Analyze Document</span>
                  </div>
                )}
              </button>

               <div className="lg:col-span-3 flex justify-end">
            {analysisResult && analysisResult.metadata && !analysisResult.metadata.error && (
                <button
                    onClick={saveMetadata}
                    className="mt-4 py-3 px-6 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                >
                    Save Metadata to Records
                </button>
            )}
          </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Success Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">File:</span> {analysisResult.filename}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {formatFileSize(analysisResult.file_size)}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {analysisResult.file_type}
                    </div>
                    <div>
                      <span className="font-medium">Text Length:</span> {analysisResult.extracted_text_length} characters
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                {analysisResult.metadata && !analysisResult.metadata.error && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-blue-600" />
                      Extracted Metadata
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MetadataCard
                        icon={FileType}
                        label="Project Name"
                        value={analysisResult.metadata.project_name}
                      />
                      <MetadataCard
                        icon={DollarSign}
                        label="Budget"
                        value={analysisResult.metadata.budget}
                      />
                      <MetadataCard
                        icon={Building2}
                        label="Construction Details"
                        value={analysisResult.metadata.construction_details}
                      />
                      <MetadataCard
                        icon={Building2}
                        label="Department"
                        value={analysisResult.metadata.department}
                      />
                      <MetadataCard
                        icon={Calendar}
                        label="Timeline"
                        value={analysisResult.metadata.timeline}
                      />
                      <MetadataCard
                        icon={MapPin}
                        label="Location"
                        value={analysisResult.metadata.location}
                      />
                      <MetadataCard
                        icon={User}
                        label="Contractor"
                        value={analysisResult.metadata.contractor}
                      />
                      <MetadataCard
                        icon={Info}
                        label="Status"
                        value={analysisResult.metadata.status}
                      />
                      <MetadataCard
                        icon={MapPin}
                        label="GPS Coordinates"
                        value={analysisResult.metadata.gps_coordinates}
                      />
                      
                      {analysisResult.metadata.additional_info && (
                        <div className="md:col-span-2">
                          <MetadataCard
                            icon={Info}
                            label="Additional Information"
                            value={analysisResult.metadata.additional_info}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Extracted Text Preview */}
                {analysisResult.extracted_text_preview && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Extracted Text Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {analysisResult.extracted_text_preview}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error in metadata extraction */}
                {analysisResult.metadata?.error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Metadata Extraction Warning</p>
                        <p className="text-sm text-yellow-700 mt-1">{analysisResult.metadata.error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-12 text-center"
              >
                <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Analysis Yet</h3>
                <p className="text-gray-500">
                  Upload a document and click "Analyze Document" to extract metadata
                </p>
              </motion.div>
            )}
          </div>

         

        </div>
      </div>
    </div>
  );
};

export default AdminReports;