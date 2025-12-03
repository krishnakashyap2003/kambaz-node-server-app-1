import model from "./model.js";

export async function findCoursesForUser(userId) {
  const enrollments = await model.find({ user: userId }).populate("course");
  return enrollments
    .map((enrollment) => enrollment.course)
    .filter((course) => course !== null && course !== undefined);
}

export async function findUsersForCourse(courseId) {
  const enrollments = await model.find({ course: courseId }).populate("user");
  return enrollments
    .map((enrollment) => enrollment.user)
    .filter((user) => user !== null && user !== undefined);
}

export async function enrollUserInCourse(user, course) {
  const enrollmentId = `${user}-${course}`;
  // Check if enrollment already exists
  const existing = await model.findById(enrollmentId);
  if (existing) {
    return existing; // Return existing enrollment if already enrolled
  }
  const newEnrollment = { user, course, _id: enrollmentId };
  return model.create(newEnrollment);
}

export function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
}