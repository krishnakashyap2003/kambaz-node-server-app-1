import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findAllCourses() {
  return model.find();
}

export function createCourse(course) {
  const courseId = uuidv4();
  const newCourse = { 
    ...course, 
    _id: courseId,
    // If number is not provided, generate one from the course ID to avoid unique constraint violation
    number: course.number || `COURSE-${courseId.substring(0, 8).toUpperCase()}`
  };
  return model.create(newCourse);
}

export function deleteCourse(courseId) {
  return model.deleteOne({ _id: courseId });
}

export async function updateCourse(courseId, courseUpdates) {
  await model.updateOne({ _id: courseId }, { $set: courseUpdates });
  return model.findById(courseId); // Return the updated document
}