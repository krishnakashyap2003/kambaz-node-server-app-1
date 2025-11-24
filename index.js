import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

const app = express();

// Support multiple client URLs from environment variables
// CLIENT_URLS should be comma-separated: "url1,url2,url3"
const envClientUrls = process.env.CLIENT_URLS 
  ? process.env.CLIENT_URLS.split(',').map(url => url.trim())
  : [];

const allowedOrigins = [
  process.env.CLIENT_URL, // Single URL (backward compatibility)
  process.env.CLIENT_URL1, // Additional client URL
  ...envClientUrls, // Multiple URLs from CLIENT_URLS
  "https://kambaz-next-js-bjvf-nz01e6dxo.vercel.app",
  "https://kambaz-next-js-bjvf-git-main-krishna-kashyaps-projects-80a2e86c.vercel.app",
  "http://localhost:3000", 
].filter(Boolean);

// Normalize origins (remove trailing slashes and convert to lowercase for comparison)
const normalizedOrigins = allowedOrigins.map(url => url.replace(/\/$/, '').toLowerCase());

console.log("=== CORS Configuration ===");
console.log("Allowed origins:", normalizedOrigins);
console.log("========================");

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) {
        console.log("Request with no origin - allowing");
        return callback(null, true);
      }
      
      // Normalize the incoming origin
      const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
      
      // Check if origin is allowed
      if (normalizedOrigins.includes(normalizedOrigin)) {
        console.log(`✅ CORS allowed: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked origin: ${origin}`);
        console.warn(`   Normalized: ${normalizedOrigin}`);
        console.warn(`   Allowed origins:`, normalizedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  name: "kambaz.session",
};

if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Don't set domain - let browser handle it for cross-origin
  };
} else {
  sessionOptions.cookie = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
}

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