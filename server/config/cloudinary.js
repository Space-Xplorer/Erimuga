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

// Function to upload image to cloudinary
export const uploadToCloudinary = async (imagePath, options = {}) => {
    try {
        const sanitizedFilename = sanitizePublicId(path.basename(imagePath, path.extname(imagePath)));
        
        // Create the full public_id including folder
        const folder = options.folder || 'erimuga';
        const public_id = `${folder}/${sanitizedFilename}`;
        
        // Check if image already exists
        const exists = await checkAssetExists(public_id);
        if (exists) {
            console.log(`Image ${public_id} already exists in Cloudinary, skipping...`);
            const asset = await cloudinary.api.resource(public_id);
            return {
                public_id: asset.public_id,
                url: asset.secure_url
            };
        }

        const uploadOptions = {
            public_id: sanitizedFilename,
            use_filename: false,
            unique_filename: false,
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

// Function to handle multiple image uploads
export const uploadMultipleImages = async (files) => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinary(file.path));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Multiple upload error:', error);
        throw new Error('Failed to upload multiple images');
    }
};

export default cloudinary;
   