import multer from "multer";

const storage = multer.memoryStorage();

const pdfUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

export default pdfUpload;
