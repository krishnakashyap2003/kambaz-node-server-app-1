import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findAssignmentsForCourse(courseId) {
  return model.find({ course: courseId });
}

export function createAssignment(assignment) {
  const newAssignment = { ...assignment, _id: uuidv4() };
  return model.create(newAssignment);
}

export function deleteAssignment(assignmentId) {
  return model.deleteOne({ _id: assignmentId });
}

export async function updateAssignment(assignmentId, assignmentUpdates) {
  await model.updateOne({ _id: assignmentId }, { $set: assignmentUpdates });
  return model.findById(assignmentId); // Return the updated document
}

export function findAssignmentById(assignmentId) {
  return model.findById(assignmentId);
}