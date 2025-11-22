# Deployment Scripts

## Deploy using AWS SAM (Recommended)

```bash
# Build and deploy the entire stack
sam build
sam deploy --guided

# After first deployment, you can use
sam deploy
```

## Deploy using GitHub Actions

Push to the main branch to trigger automatic deployment.

## Manual Deployment

### Backend (Lambda)
```bash
cd backend
dotnet publish -c Release -o ./publish
cd publish
zip -r ../lambda-deployment.zip .
cd ..

aws lambda update-function-code \
  --function-name message-board-api \
  --zip-file fileb://lambda-deployment.zip
```

### Frontend (S3)
```bash
cd frontend
npm install
npm run build

aws s3 sync build/ s3://message-board-frontend-YOUR_ACCOUNT_ID/ --delete
```
