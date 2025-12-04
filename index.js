import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
mongoose.connect(CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

// Support multiple client URLs from environment variables
// CLIENT_URLS should be comma-separated: "url1,url2,url3"
const envClientUrls = process.env.CLIENT_URLS 
  ? process.env.CLIENT_URLS.split(',').map(url => url.trim())
  : [];

const allowedOrigins = [
  "http://localhost:3000",
  "https://kambaz-next-js-md72.vercel.app",
  "https://kambaz-next-js-md72-git-main-mohana-harshitas-projects.vercel.app",
  "https://kambaz-next-js-md72-e8s7aqkwc-mohana-harshitas-projects.vercel.app",
  "https://kambaz-next-js-weld.vercel.app",
  "https://kambaz-next-js-bjvf.vercel.app",
  "https://kambaz-next-js-bjvf-nz01e6dxo.vercel.app",
  "https://kambaz-next-js-bjvf-git-main-krishna-kashyaps-projects-80a2e86c.vercel.app"
].filter(Boolean);

const normalizedOrigins = allowedOrigins.map(url => url.replace(/\/$/, '').toLowerCase());

console.log("=== CORS Configuration ===");
console.log("Allowed origins:", normalizedOrigins);
console.log("========================");

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        console.log("Request with no origin - allowing");
        return callback(null, true);
      }
      
      // Normalize the incoming origin
      const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
      
      // Check if origin is in the allowed list
      if (normalizedOrigins.includes(normalizedOrigin)) {
        console.log(`✅ CORS allowed: ${origin}`);
        callback(null, true);
        return;
      }
      
      // Also allow any Vercel preview deployment for this project
      // This handles: *.vercel.app domains for kambaz-next-js
      if (normalizedOrigin.includes('kambaz-next-js') && normalizedOrigin.includes('.vercel.app')) {
        console.log(`✅ CORS allowed (Vercel preview): ${origin}`);
        callback(null, true);
        return;
      }
      
      // Block if not allowed
      console.warn(`❌ CORS blocked origin: ${origin}`);
      console.warn(`   Normalized: ${normalizedOrigin}`);
      console.warn(`   Allowed origins:`, normalizedOrigins);
      callback(new Error('Not allowed by CORS'));
    },
  })
);

// Session configuration
const isDevelopment = process.env.SERVER_ENV === "development" || 
                      process.env.NODE_ENV === "development" ||
                      !process.env.SERVER_ENV; // Default to development if not set

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  name: "kambaz.session",
};

if (!isDevelopment) {
  // Production mode
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Don't set domain - let browser handle it for cross-origin
  };
} else {
  // Development mode - allow cookies on localhost (HTTP)
  sessionOptions.cookie = {
    httpOnly: true,
    secure: false, // false for localhost (http)
    sameSite: "lax", // lax allows cookies to be sent on same-site requests
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
}

console.log("Session configuration:", {
  isDevelopment,
  cookie: sessionOptions.cookie
});

app.use(session(sessionOptions));
app.use(express.json());

// ROOT ROUTE - ADD THIS
app.get("/", (req, res) => {
  res.send("Welcome to Full Stack Development!");
});

// ROUTES
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
Lab5(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});