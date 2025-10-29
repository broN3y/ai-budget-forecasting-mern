const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  code: {
    type: String,
    required: [true, 'Project code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9-_]{3,20}$/, 'Project code must be 3-20 characters, alphanumeric with hyphens/underscores']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  team: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'member', 'stakeholder'],
      default: 'member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: ['AI/ML', 'Infrastructure', 'Business Intelligence', 'Web Development', 'Mobile', 'Data Analytics', 'Other']
  },
  timeline: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    milestones: [{
      name: { type: String, required: true },
      date: { type: Date, required: true },
      status: {
        type: String,
        enum: ['upcoming', 'in-progress', 'completed', 'delayed'],
        default: 'upcoming'
      },
      description: String
    }]
  },
  budget: {
    allocated: {
      type: Number,
      required: [true, 'Allocated budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    breakdown: [{
      category: {
        type: String,
        required: true,
        enum: ['Personnel', 'Technology', 'Infrastructure', 'Training', 'Travel', 'Contingency', 'Other']
      },
      allocated: { type: Number, required: true, min: 0 },
      spent: { type: Number, default: 0, min: 0 }
    }]
  },
  risks: [{
    title: { type: String, required: true },
    description: String,
    probability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    mitigation: String,
    status: {
      type: String,
      enum: ['identified', 'mitigated', 'occurred', 'closed'],
      default: 'identified'
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['charter', 'plan', 'report', 'specification', 'other'],
      default: 'other'
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ code: 1 }, { unique: true });
projectSchema.index({ 'timeline.startDate': 1, 'timeline.endDate': 1 });
projectSchema.index({ category: 1, priority: 1 });

// Virtual for budget utilization percentage
projectSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.allocated || this.budget.allocated === 0) return 0;
  return Math.round((this.budget.spent / this.budget.allocated) * 100);
});

// Virtual for project duration in days
projectSchema.virtual('duration').get(function() {
  if (!this.timeline.startDate || !this.timeline.endDate) return 0;
  const diffTime = Math.abs(this.timeline.endDate - this.timeline.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for remaining budget
projectSchema.virtual('remainingBudget').get(function() {
  return this.budget.allocated - this.budget.spent;
});

// Pre-save middleware to validate dates
projectSchema.pre('save', function(next) {
  if (this.timeline.startDate && this.timeline.endDate) {
    if (this.timeline.startDate >= this.timeline.endDate) {
      next(new Error('End date must be after start date'));
    }
  }
  
  // Validate budget breakdown doesn't exceed allocated budget
  if (this.budget.breakdown && this.budget.breakdown.length > 0) {
    const totalBreakdown = this.budget.breakdown.reduce((sum, item) => sum + item.allocated, 0);
    if (totalBreakdown > this.budget.allocated) {
      next(new Error('Budget breakdown total cannot exceed allocated budget'));
    }
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);