const express = require('express');
const {
  generateForecast,
  getForecast,
  getForecasts,
  updateForecast,
  deleteForecast,
  validateForecast,
  getForecastAccuracy,
  getAnomalies
} = require('../controllers/forecasts');
const { protect, checkProjectAccess } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Forecast generation and management
router.post('/generate/:projectId', checkProjectAccess, generateForecast);
router.get('/project/:projectId', checkProjectAccess, getForecasts);

router
  .route('/:id')
  .get(getForecast)
  .put(updateForecast)
  .delete(deleteForecast);

// Forecast validation and accuracy
router.post('/:id/validate', validateForecast);
router.get('/:id/accuracy', getForecastAccuracy);

// Anomaly detection
router.get('/project/:projectId/anomalies', checkProjectAccess, getAnomalies);

module.exports = router;