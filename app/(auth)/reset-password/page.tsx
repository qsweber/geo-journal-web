"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/useAuth";
import { validatePassword } from "../../../lib/auth/password-validation";
import { PasswordRequirementsList } from "../../../lib/auth/PasswordRequirementsList";
import {
  Container,
  Title,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  SuccessMessage,
  LinkText,
  WarningMessage,
  HelpText,
} from "../components/AuthFormComponents";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isConfigured } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, code, newPassword });
      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <Container>
        <WarningMessage>
          AWS Cognito is not configured. Please set up your Cognito User Pool
          and Client ID to enable authentication.
        </WarningMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Reset Password</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && (
        <SuccessMessage>
          Password reset successful! Redirecting to login...
        </SuccessMessage>
      )}
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || success}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={isLoading || success}
            placeholder="Enter code from email"
          />
          <HelpText>Check your email for the verification code</HelpText>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading || success}
            minLength={8}
          />
          <PasswordRequirementsList />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading || success}
          />
        </FormGroup>
        <Button type="submit" disabled={isLoading || success}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </Form>
      <LinkText>
        Remember your password? <Link href="/login">Sign In</Link>
      </LinkText>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Container>Loading...</Container>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
