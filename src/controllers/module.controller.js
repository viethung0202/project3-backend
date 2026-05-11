import moduleService from '../services/module.service.js';

const getModulesByCourseId = async (req, res) => {
  try {
    const result = await moduleService.getModulesByCourseId(req.params.courseId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get modules',
    });
  }
};

const createModule = async (req, res) => {
  try {
    const module = await moduleService.createModule(req.params.courseId, req.body);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create module',
    });
  }
};

const getModuleById = async (req, res) => {
  try {
    const module = await moduleService.getModuleById(req.params.id);

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get module',
    });
  }
};

const updateModule = async (req, res) => {
  try {
    const module = await moduleService.updateModule(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: module,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update module',
    });
  }
};

const deleteModule = async (req, res) => {
  try {
    const result = await moduleService.deleteModule(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete module',
    });
  }
};

const reorderModules = async (req, res) => {
  try {
    const modules = await moduleService.reorderModules(req.body.modules);

    res.status(200).json({
      success: true,
      message: 'Modules reordered successfully',
      data: modules,
    });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to reorder modules',
    });
  }
};

export default {
  getModulesByCourseId,
  createModule,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules,
};
