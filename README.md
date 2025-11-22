# Secure Message Board Application

A full-stack web application demonstrating Zero Trust security principles with JWT authentication, built using React and .NET.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Zero Trust Security Implementation](#zero-trust-security-implementation)
- [Security Principles Discussion](#security-principles-discussion)
- [Demo Credentials](#demo-credentials)
- [Deployment to AWS](#deployment-to-aws)
- [CI/CD Pipeline](#cicd-pipeline)

---

## 🏗️ Architecture Overview

This application follows a modern client-server architecture with strict security boundaries:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React SPA (http://localhost:3000)                        │  │
│  │  - Login Form                                             │  │
│  │  - Message Input                                          │  │
│  │  - Message Display                                        │  │
│  │  - JWT Token Storage (localStorage)                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/HTTP
                    (JWT Token in Authorization Header)
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  CORS Policy Enforcement                                  │  │
│  │  - Only allows http://localhost:3000                      │  │
│  │  - Validates origin, headers, and methods                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  JWT Validation Middleware                                │  │
│  │  - Validates token signature                              │  │
│  │  - Checks expiration (2-hour lifetime)                    │  │
│  │  - Validates issuer and audience                          │  │
│  │  - Rejects invalid/expired tokens (401 Unauthorized)      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  .NET Web API Controllers (http://localhost:5000)         │  │
│  │                                                            │  │
│  │  [PUBLIC]                                                 │  │
│  │  POST /api/auth/login → AuthController                    │  │
│  │    - Validates credentials                                │  │
│  │    - Generates JWT token                                  │  │
│  │                                                            │  │
│  │  [PROTECTED - Requires [Authorize]]                       │  │
│  │  POST /api/messages → MessagesController                  │  │
│  │    - Validates JWT                                        │  │
│  │    - Captures client IP                                   │  │
│  │    - Stores message with timestamp                        │  │
│  │                                                            │  │
│  │  GET /api/messages → MessagesController                   │  │
│  │    - Validates JWT                                        │  │
│  │    - Returns last 10 messages                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  In-Memory Storage (ConcurrentDictionary)                 │  │
│  │                                                            │  │
│  │  Message Structure:                                       │  │
│  │  {                                                        │  │
│  │    "messageText": "string",                               │  │
│  │    "clientIp": "string",                                  │  │
│  │    "timestamp": "DateTime (UTC)"                          │  │
│  │  }                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow:**
   ```
   User → Login Form → POST /api/auth/login → Credential Validation → JWT Generation → Token Storage
   ```

2. **Message Submission Flow:**
   ```
   User → Message Form → POST /api/messages (+ JWT) → Token Validation → IP Capture → Message Storage → Success Response → Refresh Display
   ```

3. **Message Retrieval Flow:**
   ```
   Component Mount → GET /api/messages (+ JWT) → Token Validation → Fetch Last 10 → Display in UI
   ```

---

## ✨ Features

### Phase 1: Unsecured System
- ✅ React frontend with message input form
- ✅ Asynchronous message submission to backend
- ✅ .NET backend API with in-memory storage
- ✅ Message structure with text, client IP, and server timestamp
- ✅ Display last 10 messages in chronological order
- ✅ CORS configuration for frontend-backend communication

### Phase 2: Zero Trust Security
- ✅ JWT-based authentication system
- ✅ Login screen with credential validation
- ✅ Token generation with 2-hour expiration
- ✅ Authorization middleware protecting all message endpoints
- ✅ Automatic token validation on every request
- ✅ Session management with logout functionality
- ✅ Token persistence in localStorage
- ✅ Automatic session expiration handling

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **CSS3** - Custom styling with gradients and animations
- **Fetch API** - HTTP client for API communication
- **localStorage** - Client-side token persistence

### Backend
- **.NET 8** - High-performance web API framework
- **ASP.NET Core Web API** - RESTful API development
- **JWT Bearer Authentication** - Industry-standard token-based auth
- **ConcurrentDictionary** - Thread-safe in-memory storage
- **CORS Middleware** - Cross-origin resource sharing control

### Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **HMAC-SHA256** - Token signing algorithm
- **Bearer Token Scheme** - Authorization header pattern
- **Token Expiration** - Time-bound access control

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 8 SDK
- PowerShell or Command Prompt

### Installation

1. **Clone or navigate to the project directory:**
   ```powershell
   cd "c:\Users\diego\OneDrive\Documents\Projects_Masters\AYGO\Workshop 5"
   ```

2. **Start the Backend:**
   ```powershell
   cd backend
   dotnet run
   ```
   The API will be available at `http://localhost:5000`

3. **Start the Frontend (in a new terminal):**
   ```powershell
   cd frontend
   npm start
   ```
   The React app will open at `http://localhost:3000`

### First-Time Setup
1. Open the application in your browser (`http://localhost:3000`)
2. You'll see the login screen
3. Use any of the demo credentials (see below)
4. After login, you can post and view messages
5. Token is automatically included in all API requests

---

## 📡 API Endpoints

### Public Endpoints

#### **POST** `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Protected Endpoints (Require JWT)

#### **POST** `/api/messages`
Submit a new message.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Hello, World!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Message received"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized - Invalid or expired token"
}
```

---

#### **GET** `/api/messages`
Retrieve the last 10 messages.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
[
  {
    "messageText": "Hello, World!",
    "clientIp": "::1",
    "timestamp": "2025-11-21T15:30:45.123Z"
  },
  {
    "messageText": "Second message",
    "clientIp": "192.168.1.100",
    "timestamp": "2025-11-21T15:32:10.456Z"
  }
]
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized - Invalid or expired token"
}
```

---

## 🔐 Zero Trust Security Implementation

### Core Principles Applied

#### 1. **Never Trust, Always Verify**

**Implementation:**
- Every API request to protected endpoints requires a valid JWT token
- No implicit trust based on network location or previous authentication
- Token validation occurs on **every single request** through middleware
- Even if a user was authenticated 5 minutes ago, their current token is validated

**Code Evidence:**
```csharp
[Authorize]  // Forces authentication check on EVERY request
public class MessagesController : ControllerBase
{
    // All endpoints require valid JWT
}
```

#### 2. **Least Privilege Access**

**Implementation:**
- Users only receive access after explicit authentication
- Tokens have limited lifetime (2 hours) to minimize exposure window
- No guest access or anonymous endpoints for message operations
- Separation of public (login) and private (messages) endpoints

**Token Configuration:**
```csharp
var token = new JwtSecurityToken(
    issuer: _configuration["Jwt:Issuer"],
    audience: _configuration["Jwt:Audience"],
    claims: claims,
    expires: DateTime.UtcNow.AddHours(2),  // Limited lifetime
    signingCredentials: credentials
);
```

#### 3. **Explicit Authentication Per Request**

**Implementation:**
- Client must include JWT in Authorization header for each API call
- Backend validates token signature, expiration, issuer, and audience
- Expired or invalid tokens result in immediate 401 rejection
- No session cookies or server-side session state

**Frontend Implementation:**
```javascript
const response = await fetch(`${API_URL}/messages`, {
  headers: {
    'Authorization': `Bearer ${token}`  // Explicit auth on every call
  }
});
```

#### 4. **Minimal Attack Surface**

**Implementation:**
- CORS policy restricts API access to known frontend origin only
- JWT tokens signed with strong HMAC-SHA256 algorithm
- 256-bit secret key for token signing
- Clear separation between authentication and business logic

**CORS Configuration:**
```csharp
policy.WithOrigins("http://localhost:3000")  // Only allow known client
      .AllowAnyHeader()
      .AllowAnyMethod();
```

#### 5. **Assume Breach**

**Implementation:**
- Tokens expire automatically after 2 hours
- No long-lived credentials stored on server
- Client-side tokens can be cleared on logout
- Failed authentication provides no information about valid usernames

**Security Measures:**
```csharp
if (!_authService.ValidateCredentials(username, password))
{
    return Unauthorized(new { error = "Invalid credentials" });
    // Generic error - doesn't reveal which part failed
}
```

#### 6. **Micro-Segmentation**

**Implementation:**
- Clear separation between authentication service and message service
- Each controller has single responsibility
- Authentication logic isolated from business logic
- Middleware layers provide security boundaries

**Service Architecture:**
```csharp
builder.Services.AddSingleton<IMessageService, MessageService>();
builder.Services.AddSingleton<IAuthService, AuthService>();
// Separate services with distinct responsibilities
```

### Zero Trust vs Traditional Security

| Aspect | Traditional Approach | Zero Trust Implementation |
|--------|---------------------|---------------------------|
| **Trust Model** | Trust once, access forever (sessions) | Verify on every request |
| **Network Location** | Internal network = trusted | Location doesn't matter |
| **Authentication** | Login once, cookie-based session | JWT token on every request |
| **Token Lifetime** | Session until browser close | Explicit 2-hour expiration |
| **Authorization** | Implicit after login | Explicit [Authorize] attribute |
| **Breach Assumption** | Prevent breach at perimeter | Assume breach, limit blast radius |

---

## 💭 Security Principles Discussion

### How This Architecture Aligns with Class Principles

#### **Defense in Depth**
Our implementation uses multiple security layers:
1. **CORS Policy** - First line of defense at the network level
2. **JWT Validation** - Authentication middleware layer
3. **Authorization Attributes** - Controller-level protection
4. **Token Expiration** - Time-based access control

If one layer fails (e.g., token stolen), the limited lifetime prevents indefinite access.

#### **Separation of Concerns**
- **AuthService** handles only authentication and token generation
- **MessageService** manages only message storage and retrieval
- **Controllers** act as thin orchestration layers
- Each component has a single, well-defined responsibility

This aligns with SOLID principles, particularly Single Responsibility Principle (SRP).

#### **Fail Securely**
- Invalid credentials return generic error messages (no information leakage)
- Expired tokens immediately result in 401 status
- Frontend automatically handles 401 by logging out user
- No partial access states - either fully authenticated or denied

#### **Stateless Authentication**
JWT enables horizontal scalability:
- No server-side session storage required
- Any backend instance can validate any token
- Enables load balancing and cloud deployment
- Backend can be restarted without losing "sessions"

#### **Principle of Least Privilege**
- Public endpoint: `/api/auth/login` only
- All other endpoints require authentication
- Users receive minimal claims in JWT (username, issued time)
- No administrative privileges exposed in this demo

#### **Secure by Default**
- Default behavior: all endpoints denied without [Authorize]
- CORS restricts all origins except explicitly allowed
- Tokens expire automatically (not infinite by default)
- HTTPS redirection configured (production-ready)

### Real-World Applicability

This architecture translates directly to production scenarios:

1. **Microservices**: JWT tokens work across service boundaries
2. **Mobile Apps**: Same JWT can authenticate mobile clients
3. **Third-Party APIs**: Token-based auth is industry standard (OAuth 2.0)
4. **Cloud Deployment**: Stateless design enables auto-scaling
5. **Audit Trails**: JWT claims can include user context for logging

### Potential Enhancements

For production deployment, consider:
- **Token Refresh Mechanism**: Short-lived access tokens + long-lived refresh tokens
- **Role-Based Access Control (RBAC)**: Add roles/permissions to JWT claims
- **Rate Limiting**: Prevent brute-force attacks on login endpoint
- **HTTPS Only**: Enforce TLS for all communications
- **Token Revocation**: Maintain blacklist for compromised tokens
- **Password Hashing**: Use bcrypt/Argon2 instead of plain-text comparison
- **Multi-Factor Authentication (MFA)**: Add second factor for sensitive operations
- **Audit Logging**: Track all authentication and authorization events

---

## 🔑 Demo Credentials

The application includes three demo users for testing:

| Username | Password | Description |
|----------|----------|-------------|
| `admin` | `admin123` | Administrative user |
| `user1` | `password1` | Regular user 1 |
| `user2` | `password2` | Regular user 2 |

**Note:** In production, these would be stored as hashed passwords in a secure database.

---

## ☁️ Deployment to AWS

This application includes full AWS deployment configuration using AWS Lambda for the backend and S3/CloudFront for the frontend.

### Architecture on AWS

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront CDN                            │
│                (Global Content Delivery)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  S3 Static Website Hosting                   │
│                  (React Frontend Build)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              API Gateway HTTP API                            │
│           (Managed API with CORS support)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              AWS Lambda Function                             │
│         (.NET 8 Runtime - Serverless Backend)                │
│         - JWT Authentication                                 │
│         - Message API Endpoints                              │
│         - In-Memory Storage (per instance)                   │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Methods

#### **Option 1: GitHub Actions (Automated CI/CD)**

The project includes a GitHub Actions workflow that automatically deploys on push to main branch.

**Setup Steps:**

1. **Configure AWS Credentials in GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `AWS_ACCOUNT_ID`: Your 12-digit AWS account ID
     - `AWS_LAMBDA_ROLE_ARN`: ARN of Lambda execution role (see below)
     - `JWT_SECRET`: Secret key for JWT signing (min 32 characters)

2. **Create Lambda Execution Role:**
   ```bash
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
   
   aws iam attach-role-policy \
     --role-name lambda-message-board-role \
     --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   ```

3. **Push to Main Branch:**
   ```bash
   git add .
   git commit -m "Deploy to AWS"
   git push origin main
   ```

4. **Monitor Deployment:**
   - Go to Actions tab in GitHub
   - Watch the deployment progress
   - Check deployment summary for endpoints

#### **Option 2: AWS SAM (Serverless Application Model)**

Deploy the entire stack with one command using AWS SAM.

**Prerequisites:**
```bash
# Install AWS SAM CLI
pip install aws-sam-cli

# Verify installation
sam --version
```

**Deployment Steps:**

1. **Build the application:**
   ```bash
   sam build
   ```

2. **Deploy (first time):**
   ```bash
   sam deploy --guided
   ```
   
   You'll be prompted for:
   - Stack name (e.g., `message-board-app`)
   - AWS Region (e.g., `us-east-1`)
   - JWT Secret (provide a strong secret)
   - Confirm changes and IAM role creation

3. **Subsequent deployments:**
   ```bash
   sam deploy
   ```

4. **Get deployment outputs:**
   ```bash
   sam list stack-outputs --stack-name message-board-app
   ```

#### **Option 3: Manual Deployment**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed manual deployment instructions.

### AWS Resources Created

The deployment creates the following AWS resources:

| Resource | Purpose | Cost Impact |
|----------|---------|-------------|
| **Lambda Function** | Serverless .NET backend | Free tier: 1M requests/month |
| **API Gateway HTTP API** | RESTful API endpoint | Free tier: 1M requests/month |
| **S3 Bucket** | Static website hosting | ~$0.023/GB storage |
| **CloudFront Distribution** | Global CDN for frontend | Free tier: 1TB transfer/month |
| **CloudWatch Logs** | Application logging | Free tier: 5GB logs/month |

**Estimated Monthly Cost:** Free tier eligible, ~$0-5/month for low traffic

### Environment Variables on Lambda

The Lambda function requires these environment variables:

```bash
JWT_SECRET=your-super-secret-key-here
JWT_ISSUER=MessageBoardAPI
JWT_AUDIENCE=MessageBoardClient
JWT_EXPIRY_MINUTES=60
```

These are automatically configured by the deployment scripts.

### Monitoring and Logs

**View Lambda Logs:**
```bash
aws logs tail /aws/lambda/message-board-api --follow
```

**View CloudFront Logs:**
```bash
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

**Lambda Metrics:**
- Go to AWS Console → Lambda → message-board-api
- Check Monitoring tab for invocations, errors, duration

### Scaling and Performance

**Lambda Auto-Scaling:**
- Automatically scales from 0 to 1000+ concurrent executions
- Cold start: ~1-3 seconds (first request after idle)
- Warm execution: <100ms response time

**CloudFront Caching:**
- Static assets cached globally at 200+ edge locations
- Default TTL: 24 hours for most files
- index.html: No cache (always fresh)

### Security on AWS

**Additional Security Layers:**

1. **IAM Roles**: Lambda function has minimal permissions
2. **API Gateway**: Managed SSL/TLS termination
3. **CloudFront**: DDoS protection via AWS Shield Standard
4. **S3 Bucket Policy**: Read-only public access
5. **Environment Variables**: Sensitive config encrypted at rest

**Production Recommendations:**
- Enable AWS WAF for API Gateway (blocks common attacks)
- Use AWS Secrets Manager for JWT secret
- Enable CloudTrail for audit logging
- Set up CloudWatch Alarms for error rates
- Use Route 53 for custom domain with SSL certificate

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The automated deployment pipeline consists of two main jobs:

#### **Job 1: Deploy Backend**

```yaml
1. Checkout code
2. Setup .NET 8 SDK
3. Configure AWS credentials
4. Restore and build backend
5. Publish to ./publish folder
6. Create deployment ZIP
7. Deploy to Lambda (create or update)
8. Configure environment variables
9. Setup API Gateway integration
10. Output API endpoint URL
```

#### **Job 2: Deploy Frontend**

```yaml
1. Checkout code
2. Setup Node.js 18
3. Configure AWS credentials
4. Get backend API endpoint
5. Install npm dependencies
6. Build React app (with API URL)
7. Create/configure S3 bucket
8. Upload build to S3
9. Create/update CloudFront distribution
10. Output CloudFront URL
```

### Pipeline Triggers

- **Automatic**: Push to `main` branch
- **Manual**: `workflow_dispatch` event in GitHub Actions

### Deployment Flow

```
Code Push → GitHub Actions
            ↓
    Build Backend (.NET)
            ↓
    Deploy to Lambda
            ↓
    Configure API Gateway
            ↓
    Build Frontend (React)
            ↓
    Upload to S3
            ↓
    Update CloudFront
            ↓
    🎉 Deployment Complete
```

### Rollback Strategy

If deployment fails:

1. **Lambda**: Previous version remains active
2. **S3**: Use versioning to restore previous build
3. **CloudFront**: Invalidate cache and redeploy

**Manual Rollback:**
```bash
# Restore previous Lambda version
aws lambda publish-version --function-name message-board-api

# Rollback S3 to previous version
aws s3api list-object-versions --bucket message-board-frontend-ACCOUNT_ID
aws s3api copy-object --copy-source bucket/key?versionId=VERSION
```

### Continuous Integration Benefits

✅ **Automated Testing**: Run tests before deployment
✅ **Zero Downtime**: Lambda versioning ensures smooth updates
✅ **Environment Parity**: Same build process for all environments
✅ **Audit Trail**: Git history + CloudWatch logs
✅ **Fast Feedback**: Deployment status in GitHub UI
✅ **Repeatable**: Infrastructure as Code approach

---

## 📝 Testing the Application

### Test Scenario 1: Successful Authentication Flow
1. Open `http://localhost:3000`
2. Enter username: `admin`, password: `admin123`
3. Click "Login"
4. Verify you see the message board with your username displayed
5. Submit a test message
6. Verify message appears in the list with IP and timestamp

### Test Scenario 2: Invalid Credentials
1. Try logging in with wrong credentials
2. Verify error message appears: "Login error: Invalid credentials"
3. Confirm you remain on login screen

### Test Scenario 3: Protected Endpoint Without Token
1. Open browser DevTools → Network tab
2. Try accessing `http://localhost:5000/api/messages` directly
3. Verify you receive `401 Unauthorized` response

### Test Scenario 4: Token Expiration
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Copy your token
4. Wait 2 hours (or manually modify token expiration in backend code for testing)
5. Try to post a message
6. Verify you're automatically logged out with "Session expired" message

### Test Scenario 5: Logout and Token Clearing
1. Login successfully
2. Post a message
3. Click "Logout" button
4. Verify you return to login screen
5. Check Local Storage - token should be removed
6. Try accessing messages - should fail without authentication

---

## 🏛️ Architecture Patterns Used

### **Repository Pattern**
- `IMessageService` / `MessageService` abstracts data access
- Controllers depend on interfaces, not implementations
- Easy to swap in-memory storage for database later

### **Dependency Injection**
```csharp
builder.Services.AddSingleton<IMessageService, MessageService>();
builder.Services.AddSingleton<IAuthService, AuthService>();
```
- Services registered in DI container
- Promotes testability and loose coupling

### **Middleware Pipeline**
```csharp
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```
- Request processing through ordered middleware
- Each middleware has specific responsibility
- Clear separation of concerns

### **RESTful API Design**
- Proper HTTP verbs (GET, POST)
- Resource-based URLs (`/api/messages`)
- Standard status codes (200, 401, 400)
- JSON request/response format

---

## 📚 Learning Outcomes

This project demonstrates:

1. ✅ Full-stack web application development
2. ✅ JWT-based authentication implementation
3. ✅ Zero Trust security principles in practice
4. ✅ RESTful API design with .NET
5. ✅ Modern React development with hooks
6. ✅ CORS configuration and security
7. ✅ Token lifecycle management
8. ✅ Stateless authentication architecture
9. ✅ Separation of concerns and clean architecture
10. ✅ Security-first development mindset

---

## 🔍 Code Structure

```
Workshop 5/
├── backend/
│   ├── Controllers/
│   │   ├── AuthController.cs      # JWT login endpoint
│   │   └── MessagesController.cs  # Protected message endpoints
│   ├── Models/
│   │   ├── Auth.cs                # Login request/response DTOs
│   │   └── Message.cs             # Message entity and request DTO
│   ├── Services/
│   │   ├── AuthService.cs         # JWT generation and validation
│   │   └── MessageService.cs      # In-memory message storage
│   ├── Program.cs                 # App configuration and middleware
│   ├── appsettings.json           # JWT configuration
│   └── MessageBackend.csproj      # Project dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main React component with auth
│   │   ├── App.css                # Styling
│   │   └── index.js               # React entry point
│   └── package.json               # NPM dependencies
└── README.md                       # This file
```

---

## 🎯 Conclusion

This application successfully implements a Zero Trust architecture using modern web technologies. Every request is authenticated, no implicit trust is granted, and security is enforced at multiple layers. The stateless JWT approach enables scalability while maintaining strong security boundaries.

The architecture demonstrates that security doesn't have to compromise user experience - the authentication layer is transparent to users after initial login, while providing robust protection against unauthorized access.

**Key Takeaway:** Security should be built-in from the start, not added as an afterthought. By following Zero Trust principles, we create applications that are secure by default and resistant to common attack vectors.

---

## 📄 License

This project is created for educational purposes as part of the AYGO Masters course.

## 👨‍💻 Author

Diego - AYGO Workshop 5

---

**Last Updated:** November 21, 2025
