import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
import * as assignmentsDao from "../Assignments/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app) {
  // Find all courses
  const findAllCourses = async (req, res) => {
    const courses = await dao.findAllCourses();
    res.json(courses);
  };

  // Create course
  const createCourse = async (req, res) => {
    const course = await dao.createCourse(req.body);
    const currentUser = req.session["currentUser"];
    if (currentUser) {
      await enrollmentsDao.enrollUserInCourse(currentUser._id, course._id);
    }
    res.json(course);
  };

  // Delete course
  const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    const status = await dao.deleteCourse(courseId);
    res.send(status);
  };

  // Update course
  const updateCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseUpdates = req.body;
      const updatedCourse = await dao.updateCourse(courseId, courseUpdates);
      if (!updatedCourse) {
        res.status(404).json({ message: "Course not found" });
        return;
      }
      // Convert Mongoose document to plain object
      const courseObj = updatedCourse.toObject ? updatedCourse.toObject() : updatedCourse;
      res.json(courseObj);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  // Find modules for course
  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await modulesDao.findModulesForCourse(courseId);
    res.json(modules);
  };

  // Create module for course
  const createModuleForCourse = async (req, res) => {
    const { courseId } = req.params;
    const module = {
      ...req.body,
      course: courseId,
    };
    const newModule = await modulesDao.createModule(module);
    res.json(newModule);
  };

  // Find assignments for course
  const findAssignmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
    res.json(assignments);
  };

  // Create assignment for course
  const createAssignmentForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignment = {
      ...req.body,
      course: courseId,
    };
    const newAssignment = await assignmentsDao.createAssignment(assignment);
    res.json(newAssignment);
  };

  // Find users for course
  const findUsersForCourse = async (req, res) => {
    try {
      const { cid } = req.params;
      const users = await enrollmentsDao.findUsersForCourse(cid);
      const usersArray = users.map((user) => {
        const userObj = user.toObject ? user.toObject() : user;
        return userObj;
      });
      res.json(usersArray);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Routes
  app.get("/api/courses", findAllCourses);
  app.post("/api/courses", createCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModuleForCourse);
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.get("/api/courses/:cid/users", findUsersForCourse);
}