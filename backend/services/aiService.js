const tf = require('@tensorflow/tfjs-node');
const { LinearRegression } = require('ml-regression');
const ss = require('simple-statistics');

class AIService {
  constructor() {
    this.models = new Map();
    this.initializeModels();
  }

  async initializeModels() {
    try {
      // Load pre-trained models if they exist
      console.log('Initializing AI models...');
      // In production, load models from file system or cloud storage
    } catch (error) {
      console.error('Error initializing AI models:', error);
    }
  }

  /**
   * Generate budget forecast using time series analysis
   * @param {Array} historicalData - Array of historical budget data
   * @param {Number} periods - Number of periods to forecast
   * @returns {Object} Forecast results
   */
  async generateBudgetForecast(historicalData, periods = 12) {
    try {
      if (!historicalData || historicalData.length < 3) {
        throw new Error('Insufficient historical data for forecasting');
      }

      // Prepare data for time series analysis
      const timePoints = historicalData.map((_, index) => index);
      const values = historicalData.map(item => item.amount || item.value);

      // Simple linear regression for trend analysis
      const regression = new LinearRegression(timePoints, values);
      
      // Generate forecasts
      const forecasts = [];
      const lastTimePoint = timePoints[timePoints.length - 1];
      
      for (let i = 1; i <= periods; i++) {
        const futureTimePoint = lastTimePoint + i;
        const predictedValue = regression.predict(futureTimePoint);
        
        // Add some uncertainty/confidence intervals
        const historicalVariance = ss.variance(values);
        const standardError = Math.sqrt(historicalVariance);
        const confidenceInterval = 1.96 * standardError; // 95% confidence
        
        forecasts.push({
          period: i,
          predictedValue: Math.max(0, predictedValue), // Ensure non-negative
          lowerBound: Math.max(0, predictedValue - confidenceInterval),
          upperBound: predictedValue + confidenceInterval,
          confidence: this.calculateConfidence(historicalData.length, i)
        });
      }

      // Calculate trend and seasonality
      const trend = this.calculateTrend(values);
      const seasonality = this.detectSeasonality(values);
      
      return {
        success: true,
        forecasts,
        metadata: {
          algorithm: 'Linear Regression with Time Series Analysis',
          dataPoints: historicalData.length,
          trend: trend,
          seasonality: seasonality,
          accuracy: this.estimateAccuracy(historicalData),
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error generating budget forecast:', error);
      return {
        success: false,
        error: error.message,
        forecasts: []
      };
    }
  }

  /**
   * Detect spending anomalies using statistical methods
   * @param {Array} expenses - Array of expense data
   * @returns {Array} Detected anomalies
   */
  detectAnomalies(expenses) {
    try {
      if (!expenses || expenses.length < 10) {
        return [];
      }

      const amounts = expenses.map(expense => expense.amount);
      const mean = ss.mean(amounts);
      const standardDeviation = ss.standardDeviation(amounts);
      const threshold = process.env.ANOMALY_DETECTION_SENSITIVITY || 2; // Z-score threshold

      const anomalies = [];
      
      expenses.forEach((expense, index) => {
        const zScore = Math.abs((expense.amount - mean) / standardDeviation);
        
        if (zScore > threshold) {
          anomalies.push({
            id: expense._id || expense.id,
            date: expense.date,
            amount: expense.amount,
            category: expense.category,
            description: expense.description,
            zScore: zScore,
            severity: zScore > 3 ? 'high' : 'medium',
            type: expense.amount > mean ? 'overspending' : 'underspending',
            recommendation: this.getAnomalyRecommendation(expense, zScore)
          });
        }
      });

      return anomalies;

    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  /**
   * Calculate risk score for a project based on various factors
   * @param {Object} project - Project data
   * @returns {Object} Risk assessment
   */
  calculateRiskScore(project) {
    try {
      let riskScore = 0;
      const factors = [];

      // Budget utilization risk
      const budgetUtilization = (project.budget.spent / project.budget.allocated) * 100;
      if (budgetUtilization > 90) {
        riskScore += 30;
        factors.push('High budget utilization (>90%)');
      } else if (budgetUtilization > 75) {
        riskScore += 15;
        factors.push('Medium budget utilization (75-90%)');
      }

      // Timeline risk
      const now = new Date();
      const endDate = new Date(project.timeline.endDate);
      const startDate = new Date(project.timeline.startDate);
      const totalDuration = endDate - startDate;
      const elapsed = now - startDate;
      const timeProgress = (elapsed / totalDuration) * 100;
      
      if (timeProgress > budgetUtilization + 10) {
        riskScore += 25;
        factors.push('Behind schedule');
      }

      // Team size risk
      if (project.team && project.team.length < 3) {
        riskScore += 10;
        factors.push('Small team size');
      }

      // Priority and complexity
      if (project.priority === 'critical') {
        riskScore += 15;
        factors.push('Critical priority project');
      }

      // Historical risk factors
      if (project.risks && project.risks.length > 5) {
        riskScore += 20;
        factors.push('High number of identified risks');
      }

      // Normalize score to 0-100
      riskScore = Math.min(100, riskScore);
      
      let riskLevel = 'low';
      if (riskScore > 70) riskLevel = 'high';
      else if (riskScore > 40) riskLevel = 'medium';

      return {
        score: riskScore,
        level: riskLevel,
        factors: factors,
        recommendations: this.getRiskRecommendations(riskScore, factors),
        calculatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating risk score:', error);
      return {
        score: 0,
        level: 'unknown',
        factors: [],
        recommendations: [],
        error: error.message
      };
    }
  }

  // Helper methods
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = ss.mean(firstHalf);
    const secondAvg = ss.mean(secondHalf);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  detectSeasonality(values) {
    // Simple seasonality detection (would be more complex in production)
    if (values.length < 12) return false;
    
    // Check for quarterly patterns
    const quarters = [];
    for (let i = 0; i < values.length; i += 3) {
      const quarter = values.slice(i, i + 3);
      if (quarter.length === 3) {
        quarters.push(ss.mean(quarter));
      }
    }
    
    if (quarters.length < 4) return false;
    
    const quarterlyVariance = ss.variance(quarters);
    const overallVariance = ss.variance(values);
    
    return quarterlyVariance > overallVariance * 0.5;
  }

  calculateConfidence(dataPoints, forecastPeriod) {
    // Confidence decreases with forecast distance and increases with data points
    const baseConfidence = Math.min(95, 60 + (dataPoints * 2));
    const distancePenalty = forecastPeriod * 2;
    return Math.max(50, baseConfidence - distancePenalty);
  }

  estimateAccuracy(historicalData) {
    // Simple accuracy estimation based on data quality and quantity
    const dataQuality = historicalData.length >= 12 ? 0.9 : historicalData.length / 12 * 0.9;
    return Math.round(dataQuality * 100);
  }

  getAnomalyRecommendation(expense, zScore) {
    if (zScore > 3) {
      return 'Investigate immediately - significant deviation from normal spending pattern';
    } else if (zScore > 2) {
      return 'Review expense for accuracy and business justification';
    }
    return 'Monitor for recurring patterns';
  }

  getRiskRecommendations(riskScore, factors) {
    const recommendations = [];
    
    if (riskScore > 70) {
      recommendations.push('Immediate attention required');
      recommendations.push('Consider risk mitigation strategies');
      recommendations.push('Increase monitoring frequency');
    } else if (riskScore > 40) {
      recommendations.push('Monitor closely');
      recommendations.push('Review project timeline and budget');
    } else {
      recommendations.push('Continue normal monitoring');
    }
    
    return recommendations;
  }
}

module.exports = new AIService();