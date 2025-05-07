# GitHub Secrets Setup for Samudra Paket ERP

This guide explains how to set up the necessary GitHub secrets for the CI/CD pipeline to deploy the Samudra Paket ERP system to Railway.

## Railway Token

The CI/CD pipeline uses a Railway token to authenticate with Railway and deploy the application. You need to create this token in Railway and add it as a secret in your GitHub repository.

### Step 1: Generate a Railway Token

1. Log in to your [Railway account](https://railway.app)
2. Go to your account settings by clicking on your profile picture in the top-right corner and selecting "Settings"
3. Navigate to the "Tokens" section
4. Click "New Token"
5. Give your token a name (e.g., "GitHub CI/CD")
6. Set the appropriate permissions (at minimum, it needs deployment permissions)
7. Click "Create Token"
8. Copy the generated token (you won't be able to see it again after you leave this page)

### Step 2: Add the Token as a GitHub Secret

1. Go to your GitHub repository for Samudra Paket ERP
2. Click on "Settings" at the top of the repository
3. In the left sidebar, click on "Secrets and variables" and then "Actions"
4. Click on "New repository secret"
5. Enter `RAILWAY_TOKEN` as the name
6. Paste the Railway token you copied in Step 1 as the value
7. Click "Add secret"

## Additional Secrets (Optional)

If you want to use different Railway tokens for staging and production environments, you can create additional secrets:

1. Follow the same process to generate additional tokens in Railway
2. Add them as GitHub secrets with the following names:
   - `RAILWAY_TOKEN_STAGING` for the staging environment
   - `RAILWAY_TOKEN_PRODUCTION` for the production environment

Then update the CI/CD workflow file (`.github/workflows/ci-cd.yml`) to use these specific tokens instead of the general `RAILWAY_TOKEN`.

## Environment Variables

You may also need to set up environment variables for your application. These can be configured directly in Railway for each service, or you can add them as GitHub secrets if they need to be used during the build process.

### Common Environment Variables

- `NODE_ENV`: Set to `production` for production deployments
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `API_PREFIX`: Prefix for API endpoints (e.g., `/api/v1`)
- `FRONTEND_URL`: URL of the frontend application

## Verification

After setting up the secrets, you can verify that they're working correctly by:

1. Making a small change to the codebase
2. Pushing the change to the appropriate branch (develop for staging, main for production)
3. Checking the GitHub Actions tab to see if the workflow runs successfully
4. Verifying that the application is deployed to Railway

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for any error messages
2. Verify that the Railway token has the correct permissions
3. Ensure that the service names in the workflow file match the service names in Railway
4. Check that all required environment variables are set in Railway

## Security Considerations

- Never commit your Railway token or any other secrets directly to the repository
- Regularly rotate your Railway tokens for security
- Use different tokens for different environments
- Set appropriate permissions for each token
