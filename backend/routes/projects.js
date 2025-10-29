const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  updateProjectStatus,
  getProjectAnalytics,
  archiveProject
} = require('../controllers/projects');
const { protect, authorize, checkProjectAccess } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router
  .route('/')
  .get(getProjects)
  .post(validateProject, createProject);

router
  .route('/:id')
  .get(checkProjectAccess, getProject)
  .put(checkProjectAccess, authorize('admin', 'manager'), updateProject)
  .delete(checkProjectAccess, authorize('admin', 'manager'), deleteProject);

// Team management
router.put('/:id/team/add', checkProjectAccess, authorize('admin', 'manager'), addTeamMember);
router.put('/:id/team/remove', checkProjectAccess, authorize('admin', 'manager'), removeTeamMember);

// Status management
router.put('/:id/status', checkProjectAccess, authorize('admin', 'manager'), updateProjectStatus);

// Analytics
router.get('/:id/analytics', checkProjectAccess, getProjectAnalytics);

// Archive
router.put('/:id/archive', checkProjectAccess, authorize('admin', 'manager'), archiveProject);

module.exports = router;