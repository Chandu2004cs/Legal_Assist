import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// This part is for resolving __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env manually
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("JWT_SECRET:", process.env.JWT_SECRET);
