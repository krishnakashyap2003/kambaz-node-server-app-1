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

app.use(express.json());

// CORS — ONE BLOCK ONLY
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://kambaz-next-js-md72.vercel.app"
    ],
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS"
  })
);

// SESSION — FIXED
app.use(
  session({
    secret: "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.SERVER_ENV === "production",  
      sameSite: process.env.SERVER_ENV === "production" ? "none" : "lax"
    }
  })
);

// ROUTES
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
Lab5(app);

app.listen(4000, () => console.log("Server running on 4000"));
