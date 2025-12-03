import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
  // Get assignment by ID
  app.get("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await assignmentsDao.findAssignmentById(assignmentId);
      
      if (!assignment) {
        res.status(404).json({ message: `Assignment with ID ${assignmentId} not found` });
        return;
      }
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update assignment
  app.put("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const assignmentUpdates = req.body;
      const updatedAssignment = await assignmentsDao.updateAssignment(assignmentId, assignmentUpdates);
      if (!updatedAssignment) {
        res.status(404).json({ message: "Assignment not found" });
        return;
      }
      // Convert Mongoose document to plain object
      const assignmentObj = updatedAssignment.toObject ? updatedAssignment.toObject() : updatedAssignment;
      res.json(assignmentObj);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

  // Delete assignment
  app.delete("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const status = await assignmentsDao.deleteAssignment(assignmentId);
      res.send(status);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
}