import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Skeleton,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  Warning,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useSelector } from 'react-redux';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setDashboardData({
          metrics: {
            totalBudget: 2450000,
            totalSpent: 1876500,
            projectsActive: 12,
            projectsCompleted: 8,
            forecastAccuracy: 87.5,
            riskProjects: 3,
          },
          trends: {
            budgetUtilization: [65, 72, 68, 81, 76, 85],
            monthlySpending: [245000, 198000, 267000, 189000, 234000, 298000],
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          },
          recentProjects: [
            { id: 1, name: 'AI Chat Implementation', status: 'active', budget: 450000, spent: 387000 },
            { id: 2, name: 'Data Pipeline Migration', status: 'completed', budget: 320000, spent: 315000 },
            { id: 3, name: 'Mobile App Redesign', status: 'planning', budget: 280000, spent: 45000 },
          ],
          alerts: [
            { id: 1, type: 'warning', message: 'Project "AI Chat Implementation" is 15% over budget' },
            { id: 2, type: 'info', message: 'Q2 budget forecast updated with 89% accuracy' },
            { id: 3, type: 'error', message: 'Risk threshold exceeded for "Legacy System Migration"' },
          ],
        });
        setLoading(false);
      }, 1500);
    };

    loadDashboardData();
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
    handleMenuClose();
  };

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Budget Utilization Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Spending',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Project Status Distribution',
      },
    },
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="30%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const lineChartData = {
    labels: dashboardData?.trends.labels || [],
    datasets: [
      {
        label: 'Budget Utilization %',
        data: dashboardData?.trends.budgetUtilization || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main + '20',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: dashboardData?.trends.labels || [],
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: dashboardData?.trends.monthlySpending || [],
        backgroundColor: theme.palette.secondary.main + '80',
        borderColor: theme.palette.secondary.main,
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Active', 'Completed', 'Planning'],
    datasets: [
      {
        data: [12, 8, 5],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.primary.main,
          theme.palette.warning.main,
        ],
        borderWidth: 2,
        borderColor: theme.palette.background.paper,
      },
    ],
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <IconButton onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRefresh}>
            <Refresh sx={{ mr: 2 }} />
            Refresh Data
          </MenuItem>
        </Menu>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h5">
                    ₹{(dashboardData?.metrics.totalBudget / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> +12.5%
                  </Typography>
                </Box>
                <AccountBalance color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h5">
                    ₹{(dashboardData?.metrics.totalSpent / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {((dashboardData?.metrics.totalSpent / dashboardData?.metrics.totalBudget) * 100).toFixed(1)}% utilized
                  </Typography>
                </Box>
                <Assessment color="secondary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Projects
                  </Typography>
                  <Typography variant="h5">
                    {dashboardData?.metrics.projectsActive}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {dashboardData?.metrics.projectsCompleted} completed
                  </Typography>
                </Box>
                <TrendingUp color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Forecast Accuracy
                  </Typography>
                  <Typography variant="h5">
                    {dashboardData?.metrics.forecastAccuracy}%
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    <Warning fontSize="small" /> {dashboardData?.metrics.riskProjects} at risk
                  </Typography>
                </Box>
                <Assessment color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Line data={lineChartData} options={lineChartOptions} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Bar data={barChartData} options={barChartOptions} />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Projects & Alerts */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Projects
              </Typography>
              {dashboardData?.recentProjects.map((project) => (
                <Box key={project.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={500}>
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.status} 
                      size="small"
                      color={project.status === 'active' ? 'success' : project.status === 'completed' ? 'primary' : 'default'}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(project.spent / project.budget) * 100}
                    sx={{ mt: 1, mb: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    ₹{(project.spent / 100000).toFixed(1)}L / ₹{(project.budget / 100000).toFixed(1)}L
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Alerts
              </Typography>
              {dashboardData?.alerts.map((alert) => (
                <Alert 
                  key={alert.id}
                  severity={alert.type}
                  sx={{ mb: 1 }}
                >
                  {alert.message}
                </Alert>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;