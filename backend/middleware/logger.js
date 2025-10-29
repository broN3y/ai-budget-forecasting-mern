const logger = (req, res, next) => {
  const start = Date.now();
  
  // Override res.end to log response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    // Log request details
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    
    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const sanitizedBody = { ...req.body };
      // Remove sensitive fields
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      delete sanitizedBody.refreshToken;
      
      if (Object.keys(sanitizedBody).length > 0) {
        console.log(`Request Body: ${JSON.stringify(sanitizedBody)}`);
      }
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = logger;