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
    const { userId } = req.params;
    const status = await dao.deleteUser(userId);
    res.json(status);
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
      const { userId } = req.params;
      const userUpdates = req.body;
      await dao.updateUser(userId, userUpdates);
      const updatedUser = await dao.findUserById(userId);
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        req.session["currentUser"] = userObj;
      }
      res.json(userObj);
    } catch (error) {
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
      const newCourse = await courseDao.createCourse(req.body);
      await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      res.json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Error creating course", error: error.message });
    }
  };

  // Routes
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  app.put("/api/users/:userId", updateUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users", createUser);
  app.get("/api/users/:uid/courses", findCoursesForUser);
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  app.post("/api/users/current/courses", createCourse);
}