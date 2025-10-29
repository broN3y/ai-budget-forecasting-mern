# Deployment Guide

## Overview

This guide covers deployment options for the AI Budget Forecasting Tool, including development setup, production deployment, and cloud hosting options.

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/broN3y/ai-budget-forecasting-mern.git
   cd ai-budget-forecasting-mern
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   # If using local MongoDB
   mongod
   
   # Create database and seed data (optional)
   cd backend
   npm run seed
   ```

## Production Deployment

### Environment Configuration

Create production environment files:

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
```

**Frontend (.env.production)**
```env
REACT_APP_API_URL=https://api.your-domain.com/api
```

### Build Process

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Prepare Backend**
   ```bash
   cd backend
   npm install --production
   ```

### Server Setup (Ubuntu/Linux)

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

2. **Configure PM2**
   ```bash
   # Create PM2 configuration
   cd backend
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

   **ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'ai-budget-backend',
       script: './server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

3. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/ai-budget-app
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       # Frontend
       location / {
           root /path/to/frontend/build;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable Site and Restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/ai-budget-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

## Cloud Deployment Options

### 1. Heroku Deployment

**Backend Deployment**

1. **Prepare for Heroku**
   ```bash
   cd backend
   
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Install Heroku CLI and login
   heroku login
   
   # Create app
   heroku create your-app-name-backend
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set MONGODB_URI=your-mongodb-uri
   
   # Deploy
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

**Frontend Deployment**

1. **Deploy to Netlify/Vercel**
   ```bash
   cd frontend
   
   # For Netlify
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod --dir=build
   
   # For Vercel
   npm install -g vercel
   vercel --prod
   ```

### 2. AWS Deployment

**Using AWS Elastic Beanstalk**

1. **Backend on Elastic Beanstalk**
   ```bash
   cd backend
   
   # Install EB CLI
   pip install awsebcli
   
   # Initialize and deploy
   eb init
   eb create production
   eb deploy
   ```

2. **Frontend on S3 + CloudFront**
   ```bash
   cd frontend
   npm run build
   
   # Upload to S3 bucket
   aws s3 sync build/ s3://your-bucket-name --delete
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

### 3. Docker Deployment

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["node", "server.js"]
```

**Frontend Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ai-budget-forecasting
    depends_on:
      - mongo
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

**Deploy with Docker**
```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Configure network access
4. Create database user
5. Get connection string

### Local MongoDB

```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
use ai-budget-forecasting
```

## Monitoring & Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all
```

### Log Management

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/ai-budget-app
```

```
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 node node
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use authentication
   - Enable SSL/TLS
   - Restrict network access

3. **Server Security**
   - Keep system updated
   - Use firewall
   - Enable fail2ban
   - Regular security audits

4. **Application Security**
   - Input validation
   - Rate limiting
   - CORS configuration
   - Security headers

## Performance Optimization

1. **Frontend**
   - Code splitting
   - Image optimization
   - CDN usage
   - Caching strategies

2. **Backend**
   - Database indexing
   - Caching (Redis)
   - Connection pooling
   - Load balancing

3. **Infrastructure**
   - Auto-scaling
   - Health checks
   - Monitoring alerts
   - Backup strategies

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs
   
   # Check port availability
   sudo lsof -i :5000
   ```

2. **Database connection issues**
   ```bash
   # Test MongoDB connection
   mongo your-connection-string
   
   # Check network connectivity
   telnet your-db-host 27017
   ```

3. **Frontend build issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Health Checks

```bash
# Backend health check
curl http://localhost:5000/health

# Check application status
pm2 status

# Monitor system resources
htop
df -h
```

## Backup & Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/ai-budget-forecasting" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb/$DATE"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR
tar -czf "$BACKUP_DIR.tar.gz" -C /backup/mongodb $DATE
rm -rf $BACKUP_DIR

# Keep only last 7 days of backups
find /backup/mongodb -name "*.tar.gz" -mtime +7 -delete
```

### Application Backup

```bash
# Backup application code
tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/app

# Backup uploads and logs
tar -czf data-backup-$(date +%Y%m%d).tar.gz /path/to/uploads /path/to/logs
```

This deployment guide covers various scenarios from development to production. Choose the deployment method that best fits your requirements and infrastructure.