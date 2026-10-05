
import multer from "multer";

// Use memory storage for uploaded files until they are processed.
const storage = multer.memoryStorage();
const upload = multer({ storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
 });





// export const upload = multer({ storage });
 export default upload;