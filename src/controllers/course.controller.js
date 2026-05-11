import courseService from '../services/course.service.js';

const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create course',
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get courses',
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get course',
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update course',
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const result = await courseService.deleteCourse(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete course',
    });
  }
};

const publishCourse = async (req, res) => {
  try {
    const course = await courseService.publishCourse(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course published successfully',
      data: course,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to publish course',
    });
  }
};

const addTeacherToCourse = async (req, res) => {
  try {
    const teacher = await courseService.addTeacherToCourse(
      req.params.id,
      req.body.teacherId,
    );

    res.status(201).json({
      success: true,
      message: 'Teacher added to course successfully',
      data: teacher,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to add teacher to course',
    });
  }
};

const removeTeacherFromCourse = async (req, res) => {
  try {
    const result = await courseService.removeTeacherFromCourse(
      req.params.id,
      req.params.userId,
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to remove teacher from course',
    });
  }
};

const getCourseTeachers = async (req, res) => {
  try {
    const result = await courseService.getCourseTeachers(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.message === 'Course not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get course teachers',
    });
  }
};

export default {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  addTeacherToCourse,
  removeTeacherFromCourse,
  getCourseTeachers,
};
