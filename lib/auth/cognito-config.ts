/**
 * AWS Cognito Configuration
 *
 * To set up AWS Cognito for this application:
 * 1. Deploy the infrastructure using Pulumi: `cd infrastructure && pulumi up`
 * 2. Get the User Pool ID and Client ID from the outputs
 * 3. Set them as environment variables:
 *    - NEXT_PUBLIC_COGNITO_USER_POOL_ID
 *    - NEXT_PUBLIC_COGNITO_CLIENT_ID
 *    - NEXT_PUBLIC_COGNITO_REGION
 */

export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || "us-west-2",
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
};

export const isCognitoConfigured = () => {
  return !!(cognitoConfig.userPoolId && cognitoConfig.clientId);
};
