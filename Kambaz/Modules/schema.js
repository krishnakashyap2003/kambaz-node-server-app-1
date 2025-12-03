import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    description: String,
    course: { type: String, ref: "CourseModel" },
    lessons: [mongoose.Schema.Types.Mixed],
  },
  { collection: "modules" }
);

export default schema;

