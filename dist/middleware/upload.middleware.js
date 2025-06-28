"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_EXTENSIONS = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Supported file extensions for code review
const SUPPORTED_EXTENSIONS = [
    ".js", ".jsx", ".ts", ".tsx",
    ".py", ".java", ".c", ".cpp", ".h", ".hpp",
    ".cs", ".php", ".rb", ".go", ".rs", ".swift",
    ".kt", ".scala", ".r", ".m", ".sh", ".ps1",
    ".sql", ".html", ".css", ".scss", ".less",
    ".json", ".xml", ".yaml", ".yml", ".md",
    ".dockerfile", ".tf", ".hcl"
];
exports.SUPPORTED_EXTENSIONS = SUPPORTED_EXTENSIONS;
// Configure storage
const storage = multer_1.default.memoryStorage();
// File filter function
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Unsupported file type: ${ext}. Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}`));
    }
};
// Configure multer
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10, // Maximum 10 files at once
    },
});
