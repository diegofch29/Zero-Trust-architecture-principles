# AWS Deployment Setup Guide

## Prerequisites Checklist

Before deploying to AWS, ensure you have:

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured
- [ ] .NET 8 SDK installed
- [ ] Node.js 18+ installed
- [ ] GitHub repository (for CI/CD)

## Quick Start: GitHub Actions Deployment

### 1. Create AWS IAM User for Deployment

```bash
# Create IAM user for GitHub Actions
aws iam create-user --user-name github-actions-deploy

# Create access key
aws iam create-access-key --user-name github-actions-deploy
# Save the AccessKeyId and SecretAccessKey

# Attach necessary policies
aws iam attach-user-policy \
  --user-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AWSLambda_FullAccess

aws iam attach-user-policy \
  --user-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

aws iam attach-user-policy \
  --user-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator
```

### 2. Create Lambda Execution Role

```bash
# Create the role
aws iam create-role \
  --role-name lambda-message-board-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name lambda-message-board-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Get the role ARN (save this for GitHub Secrets)
aws iam get-role --role-name lambda-message-board-role --query 'Role.Arn' --output text
```

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `AWS_ACCESS_KEY_ID` | Access key from step 1 | From IAM user creation |
| `AWS_SECRET_ACCESS_KEY` | Secret key from step 1 | From IAM user creation |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID | Run: `aws sts get-caller-identity --query Account --output text` |
| `AWS_LAMBDA_ROLE_ARN` | Lambda role ARN from step 2 | From role creation output |
| `JWT_SECRET` | Strong random string (min 32 chars) | Generate: `openssl rand -base64 32` |

### 4. Deploy

```bash
git add .
git commit -m "Initial AWS deployment"
git push origin main
```

Watch the deployment progress in GitHub Actions tab.

---

## Alternative: AWS SAM Deployment

### 1. Install AWS SAM CLI

**Windows (PowerShell):**
```powershell
# Using Chocolatey
choco install aws-sam-cli

# Or download installer from:
# https://github.com/aws/aws-sam-cli/releases/latest
```

**macOS:**
```bash
brew install aws-sam-cli
```

**Linux:**
```bash
pip install aws-sam-cli
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
# Enter default output format (json)
```

### 3. Build and Deploy

```bash
# Navigate to project root
cd "Workshop 5"

# Build the application
sam build

# Deploy with guided prompts (first time)
sam deploy --guided

# Follow the prompts:
# Stack Name: message-board-app
# AWS Region: us-east-1
# Parameter JwtSecret: [enter a strong secret]
# Confirm changes before deploy: Y
# Allow SAM CLI IAM role creation: Y
# Save arguments to configuration file: Y
```

### 4. Get Deployment Outputs

```bash
# View stack outputs
sam list stack-outputs --stack-name message-board-app

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name message-board-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text

# Get CloudFront URL
aws cloudformation describe-stacks \
  --stack-name message-board-app \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
  --output text
```

---

## Post-Deployment Configuration

### Update Frontend to Use Production API

If deploying frontend separately, update the API URL:

**Option 1: Environment Variable**
```bash
# Set before build
export REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com

# Build
cd frontend
npm run build
```

**Option 2: In Code**
Edit `frontend/src/App.tsx`:
```typescript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
```

### Test Deployment

```bash
# Test backend API
curl https://YOUR_API_ENDPOINT/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test frontend
# Open CloudFront URL in browser
```

---

## Monitoring and Maintenance

### View Lambda Logs

```bash
# Real-time logs
aws logs tail /aws/lambda/message-board-api --follow

# Recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/message-board-api \
  --filter-pattern "ERROR"
```

### Update Lambda Function

```bash
# After code changes
cd backend
dotnet publish -c Release -o ./publish
cd publish
zip -r ../lambda-deployment.zip .
cd ..

aws lambda update-function-code \
  --function-name message-board-api \
  --zip-file fileb://lambda-deployment.zip
```

### Update Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name message-board-api \
  --environment "Variables={
    JWT_SECRET=new-secret,
    JWT_ISSUER=MessageBoardAPI,
    JWT_AUDIENCE=MessageBoardClient,
    JWT_EXPIRY_MINUTES=60
  }"
```

### Invalidate CloudFront Cache

```bash
# Get distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='message-board-app'].Id" \
  --output text)

# Invalidate all files
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

---

## Troubleshooting

### Lambda Function Errors

**Problem:** Function times out
```bash
# Increase timeout (max 900 seconds)
aws lambda update-function-configuration \
  --function-name message-board-api \
  --timeout 60
```

**Problem:** Out of memory
```bash
# Increase memory (also increases CPU)
aws lambda update-function-configuration \
  --function-name message-board-api \
  --memory-size 1024
```

### CORS Issues

**Problem:** Frontend can't reach API

Check API Gateway CORS settings:
```bash
aws apigatewayv2 get-api --api-id YOUR_API_ID
```

Update CORS (if needed):
```bash
aws apigatewayv2 update-api \
  --api-id YOUR_API_ID \
  --cors-configuration AllowOrigins="*",AllowMethods="*",AllowHeaders="*"
```

### S3 Deployment Issues

**Problem:** Files not accessible

Check bucket policy:
```bash
aws s3api get-bucket-policy \
  --bucket message-board-frontend-YOUR_ACCOUNT_ID
```

Ensure public read access is allowed.

---

## Cost Optimization

### Free Tier Limits (First 12 months)

- **Lambda**: 1M requests/month + 400,000 GB-seconds compute
- **API Gateway**: 1M API calls/month
- **S3**: 5GB storage + 20,000 GET requests + 2,000 PUT requests
- **CloudFront**: 1TB data transfer out + 10M requests

### Beyond Free Tier

Approximate costs for 10,000 requests/day:

- Lambda: ~$0.20/month
- API Gateway: ~$0.35/month
- S3: ~$0.10/month
- CloudFront: ~$0.85/month

**Total: ~$1.50/month**

### Cost Reduction Tips

1. Enable CloudFront compression
2. Set appropriate S3 lifecycle policies
3. Use Lambda reserved concurrency limits
4. Enable API Gateway caching (if high traffic)
5. Monitor with AWS Cost Explorer

---

## Cleanup (Delete All Resources)

### Option 1: Delete SAM Stack
```bash
sam delete --stack-name message-board-app
```

### Option 2: Manual Cleanup
```bash
# Delete Lambda function
aws lambda delete-function --function-name message-board-api

# Delete API Gateway
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='message-board-api'].ApiId" --output text)
aws apigatewayv2 delete-api --api-id $API_ID

# Delete S3 bucket (must be empty first)
aws s3 rm s3://message-board-frontend-YOUR_ACCOUNT_ID --recursive
aws s3 rb s3://message-board-frontend-YOUR_ACCOUNT_ID

# Delete CloudFront distribution (must be disabled first)
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='message-board-app'].Id" --output text)
# Disable then delete (requires ETag)
aws cloudfront get-distribution-config --id $DIST_ID > dist-config.json
# Edit config to set Enabled=false, then update and delete
```

---

## Security Best Practices

### Production Checklist

- [ ] Use AWS Secrets Manager for JWT secret
- [ ] Enable AWS WAF on API Gateway
- [ ] Set up CloudWatch Alarms for errors
- [ ] Enable CloudTrail for audit logs
- [ ] Use custom domain with SSL certificate
- [ ] Implement rate limiting on API endpoints
- [ ] Add password hashing (bcrypt/Argon2)
- [ ] Enable Lambda VPC if accessing private resources
- [ ] Set up automated backups (if using RDS later)
- [ ] Implement token refresh mechanism
- [ ] Add comprehensive logging
- [ ] Set up security monitoring/alerts

---

## Support

For issues or questions:
- Check CloudWatch Logs for error details
- Review GitHub Actions workflow logs
- Consult AWS Lambda/API Gateway documentation
- Open an issue in the repository

**Happy Deploying! 🚀**
