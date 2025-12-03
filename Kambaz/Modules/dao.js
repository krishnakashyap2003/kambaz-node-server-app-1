import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findModulesForCourse(courseId) {
  return model.find({ course: courseId });
}

export function createModule(module) {
  const newModule = { ...module, _id: uuidv4() };
  return model.create(newModule);
}

export function deleteModule(moduleId) {
  return model.deleteOne({ _id: moduleId });
}

export async function updateModule(moduleId, moduleUpdates) {
  await model.updateOne({ _id: moduleId }, { $set: moduleUpdates });
  return model.findById(moduleId); // Return the updated document
}