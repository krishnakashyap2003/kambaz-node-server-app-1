import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      const userObj = user.toObject ? user.toObject() : user;
      res.json(userObj);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deleteUser = async (req, res) => {
    let { userId } = req.params;
    console.log("DELETE /api/users/:userId - Received request");
    console.log("   userId param:", userId);
    console.log("   Request path:", req.path);
    
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    
    // Ensure userId is a string
    userId = String(userId);
    
    try {
      const status = await dao.deleteUser(userId);
      console.log("   ✅ User deleted successfully:", userId);
      res.json(status);
    } catch (error) {
      console.error("   ❌ Error deleting user:", error);
      res.status(500).json({ message: error.message });
    }
  };

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    const users = await dao.findAllUsers();
    res.json(users);
  };

  const findUserById = async (req, res) => {
    const { userId } = req.params;
    const user = await dao.findUserById(userId);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    try {
      // Express automatically decodes URL-encoded parameters
      let { userId } = req.params;
      console.log("PUT /api/users/:userId - Received request");
      console.log("   Raw userId param:", userId);
      console.log("   Request path:", req.path);
      console.log("   Request originalUrl:", req.originalUrl);
      console.log("   Request method:", req.method);
      console.log("   Request body:", req.body);
      
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      
      // Ensure userId is a string (in case it was parsed incorrectly)
      userId = String(userId);
      
      const userUpdates = req.body;
      console.log("   Attempting to update user with ID:", userId);
      const updateResult = await dao.updateUser(userId, userUpdates);
      console.log("   Update result:", updateResult);
      
      const updatedUser = await dao.findUserById(userId);
      if (!updatedUser) {
        console.log("   ❌ User not found after update:", userId);
        res.status(404).json({ message: "User not found" });
        return;
      }
      const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        req.session["currentUser"] = userObj;
      }
      console.log("   ✅ User updated successfully:", userId);
      res.json(userObj);
    } catch (error) {
      console.error("   ❌ Error updating user:", error);
      console.error("   Error stack:", error.stack);
      res.status(500).json({ message: error.message });
    }
  };

  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    // Convert Mongoose document to plain object for session storage
    const userObj = currentUser.toObject ? currentUser.toObject() : currentUser;
    req.session["currentUser"] = userObj;
    res.json(userObj);
  };

  const signin = async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      // Convert Mongoose document to plain object for session storage
      const userObj = currentUser.toObject ? currentUser.toObject() : currentUser;
      req.session["currentUser"] = userObj;
      console.log("Session created for user:", userObj.username);
      console.log("Session ID:", req.sessionID);
      res.json(userObj);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = (req, res) => {
    console.log("Profile request - Session ID:", req.sessionID);
    console.log("Session data:", req.session);
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      console.log("No currentUser in session");
      res.status(401).json({ message: "Not authenticated. Please sign in." });
      return;
    }
    console.log("Profile found for user:", currentUser.username);
    res.json(currentUser);
  };

  const findCoursesForUser = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    if (currentUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      res.json(courses);
      return;
    }
    let { uid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }
    const courses = await enrollmentsDao.findCoursesForUser(uid);
    res.json(courses);
  };

  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };

  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };

  const createCourse = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.status(401).json({ message: "You must be signed in to create a course" });
      return;
    }
    try {
      console.log("📚 Step 1: Creating course with body:", JSON.stringify(req.body));
      const newCourse = await courseDao.createCourse(req.body);
      console.log("📚 Step 2: Course created, _id:", newCourse._id);
      
      // Convert Mongoose document to plain object
      const courseObj = newCourse.toObject ? newCourse.toObject() : newCourse;
      console.log("📚 Step 3: Course converted to object, _id:", courseObj._id);
      
      // Ensure both IDs are strings
      const userId = String(currentUser._id);
      const courseId = String(courseObj._id);
      console.log("📚 Step 4: IDs prepared - userId:", userId, "courseId:", courseId);
      
      if (!userId || userId === "undefined" || !courseId || courseId === "undefined") {
        throw new Error(`Invalid IDs: userId=${userId}, courseId=${courseId}`);
      }
      
      console.log("📚 Step 5: Attempting enrollment...");
      await enrollmentsDao.enrollUserInCourse(userId, courseId);
      console.log("📚 Step 6: Enrollment successful, returning course");
      
      res.json(courseObj);
    } catch (error) {
      console.error("❌ Error creating course - Full details:");
      console.error("   Error message:", error.message);
      console.error("   Error name:", error.name);
      console.error("   Error stack:", error.stack);
      if (error.errors) {
        console.error("   Mongoose validation errors:", JSON.stringify(error.errors, null, 2));
      }
      res.status(500).json({ 
        message: "Error creating course", 
        error: error.message,
        step: error.step || "unknown"
      });
    }
  };

  // Routes - Order matters! More specific routes must come before parameterized ones
  // Authentication routes (exact paths)
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  
  // Collection routes (no parameters)
  app.get("/api/users", findAllUsers);
  app.post("/api/users", createUser);
  
  // Specific nested routes (must come before single parameter routes)
  app.post("/api/users/current/courses", createCourse);
  
  // PUT route for updating users - MUST come before other :userId/:uid routes
  app.put("/api/users/:userId", (req, res, next) => {
    console.log("🔵 PUT /api/users/:userId route matched!");
    console.log("   userId param:", req.params.userId);
    console.log("   Request path:", req.path);
    console.log("   Request method:", req.method);
    next();
  }, updateUser);
  
  // Other single parameter routes
  app.get("/api/users/:userId", findUserById);
  app.delete("/api/users/:userId", deleteUser);
  
  // Nested routes with two parameters (must come last)
  app.get("/api/users/:uid/courses", findCoursesForUser);
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  
  console.log("✅ User routes registered successfully");
  console.log("   PUT /api/users/:userId route is registered");
  console.log("   All registered routes:");
  console.log("     POST /api/users/signup");
  console.log("     POST /api/users/signin");
  console.log("     POST /api/users/signout");
  console.log("     POST /api/users/profile");
  console.log("     POST /api/users/current/courses");
  console.log("     GET  /api/users/:uid/courses");
  console.log("     POST /api/users/:uid/courses/:cid");
  console.log("     DELETE /api/users/:uid/courses/:cid");
  console.log("     GET  /api/users");
  console.log("     POST /api/users");
  console.log("     PUT  /api/users/:userId");
  console.log("     GET  /api/users/:userId");
  console.log("     DELETE /api/users/:userId");
}