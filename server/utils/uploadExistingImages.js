import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Function to recursively get all image files from a directory
const getAllImageFiles = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    let results = [];
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursively search subdirectories
            results = results.concat(getAllImageFiles(fullPath));
        } else {
            // Check if file is an image
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                results.push(fullPath);
            }
        }
    }
    
    return results;
};

const uploadExistingImages = async () => {
    const publicFolderPath = path.join(process.cwd(), '..', 'client', 'public');
    
    try {
        // Get all image files recursively
        const imageFiles = getAllImageFiles(publicFolderPath);
        console.log(`Found ${imageFiles.length} images to upload`);
        
        // Upload each file to Cloudinary
        for (const filePath of imageFiles) {
            try {
                const relativePath = path.relative(publicFolderPath, filePath);
                
                // Create folder structure in Cloudinary
                const folderPath = path.dirname(relativePath) === '.' ? 'erimuga' : `erimuga/${path.dirname(relativePath).replace(/\\/g, '/')}`;
                
                const result = await uploadToCloudinary(filePath, {
                    folder: folderPath
                });
                
                console.log(`✅ Uploaded ${relativePath} to ${result.url}`);
                
                // Store the URL mapping for reference
                const urlMapping = {
                    localPath: relativePath,
                    cloudinaryUrl: result.url
                };
                fs.appendFileSync(
                    'url-mappings.json', 
                    JSON.stringify(urlMapping, null, 2) + ',\n'
                );
                
            } catch (error) {
                console.error(`❌ Failed to upload ${filePath}:`, error);
            }
        }
        
        console.log('✨ Finished uploading existing images');
    } catch (error) {
        console.error('Error processing files:', error);
    }
};

// Create fresh url-mappings file
fs.writeFileSync('url-mappings.json', '[\n');

// Run the upload
uploadExistingImages().then(() => {
    // Close the JSON array
    fs.appendFileSync('url-mappings.json', ']');
    console.log('✨ Upload process completed. Check url-mappings.json for all URLs.');
}).catch(error => {
    console.error('Failed to complete upload process:', error);
});

// Run the upload
uploadExistingImages();
