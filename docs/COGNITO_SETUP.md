# AWS Cognito Authentication Setup

This application uses AWS Cognito for user authentication. Follow these steps to set up and configure Cognito for your deployment.

## Prerequisites

- AWS Account
- Pulumi CLI installed
- AWS credentials configured
- Node.js and npm installed

## Infrastructure Setup

### 1. Deploy AWS Cognito Resources

The infrastructure code in `infrastructure/index.ts` includes AWS Cognito User Pool and Client configuration. Deploy using Pulumi:

```bash
cd infrastructure
pulumi up --stack dev  # or production
```

### 2. Get Cognito Configuration Values

After deployment, Pulumi will output the following values:

- `userPoolId`: The Cognito User Pool ID
- `userPoolClientId`: The Cognito User Pool Client ID

You can retrieve these values at any time with:

```bash
cd infrastructure
pulumi stack output userPoolId
pulumi stack output userPoolClientId
```

## Application Configuration

### Local Development

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_COGNITO_REGION=us-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<your-user-pool-id>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<your-client-id>
```

### Production Deployment

For production deployments, set the environment variables in your CI/CD system or hosting provider:

- `NEXT_PUBLIC_COGNITO_REGION`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`

**Note**: These variables are prefixed with `NEXT_PUBLIC_` because they need to be available in the browser for client-side authentication.

## Testing the Authentication Flow

### 1. Sign Up

1. Navigate to `/signup`
2. Enter your name (optional), email, and password
3. Password requirements:
   - At least 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
4. Click "Sign Up"
5. You'll receive a verification code via email

### 2. Confirm Email

1. Navigate to `/confirm` (or you'll be redirected automatically)
2. Enter your email and the verification code from your email
3. Click "Confirm"
4. You'll be redirected to the login page

### 3. Login

1. Navigate to `/login`
2. Enter your email and password
3. Click "Login"
4. Upon successful login, you'll be redirected to the home page

### 4. Logout

1. Click the "Logout" button in the navigation bar
2. You'll be logged out and can log in again

## Security Considerations

### Token Storage

- JWT tokens are stored in browser localStorage by the Cognito SDK
- Tokens are automatically refreshed when they expire
- On logout, tokens are cleared from localStorage

### Password Policy

The Cognito User Pool is configured with a strong password policy:

- Minimum length: 8 characters
- Requires uppercase letters
- Requires lowercase letters
- Requires numbers
- Requires special characters

### Email Verification

- Email verification is required before users can log in
- Verification codes are sent via AWS Cognito's email service
- Users can resend verification codes if needed

## Troubleshooting

### "AWS Cognito is not configured" Warning

If you see this warning on the login/signup pages:

1. Ensure the environment variables are set correctly
2. Rebuild the application: `npm run build`
3. Restart the development server or redeploy

### Email Verification Issues

If users don't receive verification emails:

1. Check the spam/junk folder
2. Verify the email configuration in the Cognito User Pool
3. Consider configuring a custom email service (SES) for production

### Build Failures

If the build fails after adding authentication:

1. Ensure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Run the build locally: `npm run build`

## Architecture Notes

### Static Export Constraints

This application uses Next.js static export (`output: "export"`), which means:

- No server-side API routes are available
- All authentication is handled client-side
- The Cognito SDK runs entirely in the browser
- JWT tokens are managed in browser storage

### Authentication Flow

1. **Sign Up**: User registers with email and password
2. **Email Verification**: AWS Cognito sends verification code via email
3. **Confirm**: User enters verification code to activate account
4. **Login**: User authenticates and receives JWT tokens
5. **Session**: Tokens are stored and managed by Cognito SDK
6. **Logout**: Tokens are cleared from storage

## Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [amazon-cognito-identity-js SDK](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
