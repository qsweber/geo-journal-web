"use client";

import React, { createContext, useEffect, useState } from "react";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  signOut as cognitoSignOut,
  confirmSignUp as cognitoConfirmSignUp,
  getCurrentSession,
  getCurrentUser,
  resendConfirmationCode as cognitoResendCode,
  forgotPassword as cognitoForgotPassword,
  resetPassword as cognitoResetPassword,
  SignInParams,
  SignUpParams,
  ConfirmSignUpParams,
  ForgotPasswordParams,
  ResetPasswordParams,
} from "./cognito-service";
import { isCognitoConfigured } from "./cognito-config";

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: CognitoUserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (params: SignInParams) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => void;
  confirmSignUp: (params: ConfirmSignUpParams) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotPassword: (params: ForgotPasswordParams) => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<void>;
  getIdToken: () => string | null;
  getAccessToken: () => string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isCognitoConfigured());

  // Load session on mount
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    loadSession();
  }, [isConfigured]);

  const loadSession = async () => {
    try {
      const currentSession = await getCurrentSession();
      if (currentSession && currentSession.isValid()) {
        setSession(currentSession);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (params: SignInParams) => {
    const newSession = await cognitoSignIn(params);
    setSession(newSession);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const signUp = async (params: SignUpParams) => {
    await cognitoSignUp(params);
    // Don't set session until email is confirmed
  };

  const signOut = () => {
    cognitoSignOut();
    setUser(null);
    setSession(null);
  };

  const confirmSignUp = async (params: ConfirmSignUpParams) => {
    await cognitoConfirmSignUp(params);
    // After confirmation, user needs to sign in
  };

  const resendConfirmationCode = async (email: string) => {
    await cognitoResendCode(email);
  };

  const forgotPassword = async (params: ForgotPasswordParams) => {
    await cognitoForgotPassword(params);
  };

  const resetPassword = async (params: ResetPasswordParams) => {
    await cognitoResetPassword(params);
  };

  const getIdToken = (): string | null => {
    return session?.getIdToken().getJwtToken() ?? null;
  };

  const getAccessToken = (): string | null => {
    return session?.getAccessToken().getJwtToken() ?? null;
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    resetPassword,
    getIdToken,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
