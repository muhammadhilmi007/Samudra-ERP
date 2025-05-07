# Railway Deployment Setup Guide for Samudra Paket ERP

This guide provides step-by-step instructions for setting up the Samudra Paket ERP project on Railway.app, including database, caching, and other required services.

## Prerequisites

1. A Railway.app account
2. GitHub account with access to the Samudra Paket ERP repository
3. Node.js 18+ installed locally

## Step 1: Create a Railway Project

1. Log in to [Railway.app](https://railway.app/)
2. Click "New Project" and select "Empty Project"
3. Name your project "Samudra-Paket-ERP"

## Step 2: Set Up MongoDB Database

1. In your Railway project, click "New" and select "Database"
2. Choose "MongoDB"
3. Once provisioned, click on the MongoDB service to view connection details
4. Save the connection string for later use in environment variables

## Step 3: Set Up Redis for Caching

1. In your Railway project, click "New" and select "Database"
2. Choose "Redis"
3. Once provisioned, click on the Redis service to view connection details
4. Save the connection string for later use in environment variables

## Step 4: Set Up Object Storage

### Option 1: Railway Plugin (Recommended)
1. In your Railway project, click "New" and select "Plugin"
2. Search for and select an object storage plugin (e.g., "Bucket" or similar)
3. Configure the plugin according to your storage needs
4. Save the access credentials for later use

### Option 2: AWS S3 Integration
1. Create an AWS S3 bucket for the project
2. Create an IAM user with appropriate permissions for the S3 bucket
3. Generate access keys for the IAM user
4. Save the access keys for later use in environment variables

## Step 5: GitHub Integration for CI/CD

1. In your Railway project, go to "Settings"
2. Under "Deployments", click "Connect to GitHub"
3. Select the Samudra Paket ERP repository
4. Configure the deployment settings:
   - Branch to deploy: `main` (or your preferred branch)
   - Root directory: `/` (since we're using a monorepo)
   - Build command: `yarn build:railway`
   - Start command: `yarn start`

## Step 6: Configure Environment Variables

1. In your Railway project, go to "Variables"
2. Add the following environment variables:
   ```
   # Database
   MONGODB_URI=<Your MongoDB Connection String>
   
   # Redis
   REDIS_URL=<Your Redis Connection String>
   
   # Object Storage (if using AWS S3)
   AWS_ACCESS_KEY_ID=<Your AWS Access Key>
   AWS_SECRET_ACCESS_KEY=<Your AWS Secret Key>
   AWS_REGION=<Your AWS Region>
   AWS_S3_BUCKET=<Your S3 Bucket Name>
   
   # JWT
   JWT_SECRET=<Your JWT Secret Key>
   JWT_EXPIRATION=86400
   
   # App
   NODE_ENV=production
   PORT=3000
   API_PREFIX=/api/v1
   FRONTEND_URL=<Your Frontend URL>
   ```

## Step 7: Domain and HTTPS Configuration

1. In your Railway project, go to "Settings"
2. Under "Domains", click "Generate Domain" or "Custom Domain"
3. If using a custom domain:
   - Enter your domain name
   - Update your DNS settings as instructed by Railway
   - Wait for DNS propagation and SSL certificate issuance

## Step 8: Set Up Multiple Environments

1. Create separate Railway projects for each environment:
   - Development
   - Staging
   - Production
2. Configure each environment with appropriate variables
3. Set up GitHub integration for each environment, connecting to different branches if needed

## Step 9: Configure Logging and Monitoring

1. In your Railway project, go to "Metrics" to view built-in monitoring
2. Set up logging by configuring your application to use Railway's logging system
3. Consider adding additional monitoring tools if needed

## Step 10: Set Up Automatic Backups

1. In your Railway project, go to the MongoDB service
2. Under "Settings", enable automatic backups
3. Configure backup frequency and retention policy

## Verification

After completing the setup, verify that:
1. The application builds and deploys successfully
2. Database connections are working
3. Redis caching is functioning
4. Object storage is accessible
5. HTTPS is properly configured
6. Logging and monitoring are capturing data

## Troubleshooting

If you encounter issues:
1. Check the deployment logs in Railway
2. Verify environment variables are correctly set
3. Ensure the build and start commands are working locally
4. Check that all required services are running

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
