// import dotenv from 'dotenv';
// dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';



cloudinary.config({
  cloud_name: "dnbm8mudh",
  api_key: "798531331584739",
  api_secret: "9AccGAO8XeRYX9uRPE5567FJu94",
});

// Upload to Cloudinary from local storage
export const uploadToCloudinary = async (localPath) => {
    try {
        if (!localPath) return null;

        // In serverless environments, ensure files are placed in /tmp
        const tempFilePath = path.join('/tmp', path.basename(localPath));

        // Copy the file to the /tmp directory
        fs.copyFileSync(localPath, tempFilePath);

        // Upload the file to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localPath, { resource_type: "auto" });

        // Cleanup: Remove the temporary file after upload
        fs.unlinkSync(localPath);

        if (!uploadResult) {
            return null;
        }
        

        return uploadResult; // Return the result from Cloudinary
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Delete file from Cloudinary by public ID
export const deleteFromCloudinary = async (publicID) => {
    try {
        const response = await cloudinary.uploader.destroy(publicID);
       
        return response;
    } catch (error) {
        console.log(error);
        return false;
    }
}