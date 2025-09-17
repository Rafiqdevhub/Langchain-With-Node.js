import multer from "multer";
import path from "path";
const SUPPORTED_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".cs",
    ".php",
    ".rb",
    ".go",
    ".rs",
    ".swift",
    ".kt",
    ".scala",
    ".r",
    ".m",
    ".sh",
    ".ps1",
    ".sql",
    ".html",
    ".css",
    ".scss",
    ".less",
    ".json",
    ".xml",
    ".yaml",
    ".yml",
    ".md",
    ".dockerfile",
    ".tf",
    ".hcl",
];
// Configure storage
const storage = multer.memoryStorage();
// File filter function
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Unsupported file type: ${ext}. Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}`));
    }
};
// Configure multer
export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10, // Maximum 10 files at once
    },
});
export { SUPPORTED_EXTENSIONS };
