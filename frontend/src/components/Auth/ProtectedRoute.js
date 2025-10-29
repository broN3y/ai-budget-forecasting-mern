import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getProfile } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch the profile
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [token, user, dispatch]);

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  // Show loading spinner while checking authentication or fetching user data
  if (isLoading || (token && !user)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;