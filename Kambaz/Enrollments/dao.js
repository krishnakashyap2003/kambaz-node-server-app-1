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
  try {
    // Ensure both are strings
    const userId = String(user);
    const courseId = String(course);
    
    if (!userId || !courseId || userId === "undefined" || courseId === "undefined") {
      throw new Error(`Invalid enrollment parameters: user=${user}, course=${course}`);
    }
    
    const enrollmentId = `${userId}-${courseId}`;
    console.log("   Creating enrollment with ID:", enrollmentId);
    
    // Check if enrollment already exists
    const existing = await model.findById(enrollmentId);
    if (existing) {
      console.log("   Enrollment already exists, returning existing");
      return existing; // Return existing enrollment if already enrolled
    }
    
    const newEnrollment = { 
      user: userId, 
      course: courseId, 
      _id: enrollmentId,
      status: "ENROLLED"
    };
    
    console.log("   Creating new enrollment:", newEnrollment);
    const created = await model.create(newEnrollment);
    console.log("   Enrollment created successfully");
    return created;
  } catch (error) {
    console.error("   ❌ Error in enrollUserInCourse:", error);
    console.error("   Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    if (error.errors) {
      console.error("   Mongoose validation errors:", error.errors);
    }
    throw error; // Re-throw to be caught by the route handler
  }
}

export function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
}