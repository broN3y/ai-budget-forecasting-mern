const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetAnalytics,
  exportBudget
} = require('../controllers/budgets');
const { protect, checkProjectAccess } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Budget CRUD
router
  .route('/project/:projectId')
  .get(checkProjectAccess, getBudgets)
  .post(checkProjectAccess, validateBudget, createBudget);

router
  .route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

// Expense management
router.post('/:id/expenses', addExpense);
router.put('/:id/expenses/:expenseId', updateExpense);
router.delete('/:id/expenses/:expenseId', deleteExpense);

// Analytics and reporting
router.get('/:id/analytics', getBudgetAnalytics);
router.get('/:id/export', exportBudget);

module.exports = router;