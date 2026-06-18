import testService from '../services/test.service.js';

const mapStatus = (error) => {
  const msg = error.message || '';
  if (
    msg === 'Test not found' ||
    msg === 'Test part not found' ||
    msg === 'Test passage not found' ||
    msg === 'Test question not found' ||
    msg === 'Test answer not found'
  ) {
    return 404;
  }
  return 400;
};

const createTest = async (req, res) => {
  try {
    const test = await testService.createTest(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to create test',
    });
  }
};

const getAllTests = async (req, res) => {
  try {
    const tests = await testService.getAllTests(req.query);

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tests',
    });
  }
};

const getTestById = async (req, res) => {
  try {
    const test = await testService.getTestById(req.params.id);

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to get test',
    });
  }
};

const getTestPreviewById = async (req, res) => {
  try {
    const test = await testService.getTestPreviewById(req.params.id);

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to get test preview',
    });
  }
};

const updateTest = async (req, res) => {
  try {
    const test = await testService.updateTest(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: test,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to update test',
    });
  }
};

const deleteTest = async (req, res) => {
  try {
    const result = await testService.deleteTest(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to delete test',
    });
  }
};

const publishTest = async (req, res) => {
  try {
    const test = await testService.publishTest(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Test published successfully',
      data: test,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to publish test',
    });
  }
};

const createPart = async (req, res) => {
  try {
    const part = await testService.createPart(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Test part created successfully',
      data: part,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to create test part',
    });
  }
};

export default {
  createTest,
  getAllTests,
  getTestById,
  getTestPreviewById,
  updateTest,
  deleteTest,
  publishTest,
  createPart,
};
