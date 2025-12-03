import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
  const deleteModule = async (req, res) => {
    try {
      const { moduleId } = req.params;
      const status = await modulesDao.deleteModule(moduleId);
      res.send(status);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  const updateModule = async (req, res) => {
    try {
      const { moduleId } = req.params;
      const moduleUpdates = req.body;
      const updatedModule = await modulesDao.updateModule(moduleId, moduleUpdates);
      if (!updatedModule) {
        res.status(404).json({ message: "Module not found" });
        return;
      }
      // Convert Mongoose document to plain object
      const moduleObj = updatedModule.toObject ? updatedModule.toObject() : updatedModule;
      res.json(moduleObj);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  app.delete("/api/modules/:moduleId", deleteModule);
  app.put("/api/modules/:moduleId", updateModule);
}