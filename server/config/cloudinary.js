import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Log successful configuration
console.log('Cloudinary configured successfully');

// Function to upload multiple images
export const uploadMultipleImages = async (images, options = {}) => {
    const uploadPromises = images.map(image => uploadToCloudinary(image, options));
    return Promise.all(uploadPromises);
};

// Function to check if an asset exists in Cloudinary
export const checkAssetExists = async (public_id) => {
    try {
        await cloudinary.api.resource(public_id);
        return true;
    } catch (error) {
        if (error.http_code === 404) {
            return false;
        }
        throw error;
    }
};

// Function to sanitize filename for Cloudinary public_id
const sanitizePublicId = (filename) => {
    return filename
        .replace(/\s+/g, '_')        // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9_-]/g, '')  // Remove special characters
        .toLowerCase();              // Convert to lowercase
};

// Function to upload image to cloudinary with optimizations
export const uploadToCloudinary = async (imagePath, options = {}) => {
    try {
        console.log('uploadToCloudinary called with:', imagePath, options);
        const sanitizedFilename = sanitizePublicId(path.basename(imagePath, path.extname(imagePath)));
        
        // Ensure folder is set (default to 'erimuga')
        const folder = options.folder || 'erimuga';
        
        // Default transformation options
        const defaultTransformation = [
            { width: 1000, crop: "scale" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
        ];
        
        const transformation = [...defaultTransformation, ...(options.transformation || [])];
        
        // Upload options (note: folder now included)
        const uploadOptions = {
            folder,
            public_id: sanitizedFilename,
            use_filename: false,
            unique_filename: false,
            transformation,
            ...options
        };
        
        const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};


export default cloudinary;
   