import express from "express";
import cors from "cors";
import session from "express-session";

// ROUTES
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

console.log("Starting server...");

const app = express();
console.log("Express app created");

// ---------------- CORS CONFIG -----------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://kambaz-next-js-md72.vercel.app",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true); // allow Postman, tools
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
  })
);

console.log("CORS configured");

// ---------------- SESSIONS --------------------
app.use(
  session({
    secret: "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // For local; set true on https
      sameSite: "lax",
    },
  })
);

console.log("Session configured");

app.use(express.json());

// ---------------- ROUTES ----------------------
console.log("Setting up routes...");

UserRoutes(app);
console.log("UserRoutes loaded");

CourseRoutes(app);
console.log("CourseRoutes loaded");

ModuleRoutes(app);
console.log("ModuleRoutes loaded");

AssignmentRoutes(app);
console.log("AssignmentRoutes loaded");

EnrollmentRoutes(app);
console.log("EnrollmentRoutes loaded");

Lab5(app);
console.log("Lab5 loaded");

// ---------------- START SERVER -----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
