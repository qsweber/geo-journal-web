/**
 * AWS Cognito Authentication Service
 * Provides methods for user authentication, registration, and session management
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "./cognito-config";

// Lazy initialization of User Pool to avoid build-time errors
let userPool: CognitoUserPool | null = null;

const getUserPool = (): CognitoUserPool => {
  if (!userPool && cognitoConfig.userPoolId && cognitoConfig.clientId) {
    userPool = new CognitoUserPool({
      UserPoolId: cognitoConfig.userPoolId,
      ClientId: cognitoConfig.clientId,
    });
  }
  if (!userPool) {
    throw new Error("Cognito is not configured");
  }
  return userPool;
};

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ConfirmSignUpParams {
  email: string;
  code: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * Sign up a new user
 */
export const signUp = (params: SignUpParams): Promise<CognitoUser> => {
  return new Promise((resolve, reject) => {
    const { email, password, name } = params;

    const attributeList: CognitoUserAttribute[] = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
    ];

    if (name) {
      attributeList.push(
        new CognitoUserAttribute({ Name: "name", Value: name }),
      );
    }

    getUserPool().signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result) {
        reject(new Error("Sign up failed: no result"));
        return;
      }
      resolve(result.user);
    });
  });
};

/**
 * Confirm sign up with verification code
 */
export const confirmSignUp = (params: ConfirmSignUpParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { email, code } = params;

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Sign in a user
 */
export const signIn = (params: SignInParams): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const { email, password } = params;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * Sign out the current user
 */
export const signOut = (): void => {
  const pool = getUserPool();
  const cognitoUser = pool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

/**
 * Get the current user session
 */
export const getCurrentSession = (): Promise<CognitoUserSession | null> => {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }

        if (session && session.isValid()) {
          resolve(session);
        } else {
          resolve(null);
        }
      },
    );
  });
};

/**
 * Get current user attributes
 */
export const getCurrentUser = (): Promise<{ email: string } | null> => {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session || !session.isValid()) {
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          if (!attributes) {
            resolve(null);
            return;
          }

          const email = attributes.find((attr) => attr.Name === "email")?.Value;
          resolve(email ? { email } : null);
        });
      },
    );
  });
};

/**
 * Resend confirmation code
 */
export const resendConfirmationCode = (email: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Initiate forgot password flow
 * Sends a verification code to the user's email
 */
export const forgotPassword = (
  params: ForgotPasswordParams,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { email } = params;

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        resolve(data.CodeDeliveryDetails?.Destination || "");
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * Reset password with verification code
 */
export const resetPassword = (params: ResetPasswordParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { email, code, newPassword } = params;

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};
