"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/useAuth";
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
} from "../components/AuthFormComponents";

const SecondaryButton = styled(Button)(() => ({
  backgroundColor: "#fff",
  color: "#000",
  border: "1px solid #000",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
}));

const InfoMessage = styled.div(() => ({
  textAlign: "center",
  marginBottom: 20,
  color: "#666",
}));

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const { confirmSignUp, resendConfirmationCode, isConfigured } = useAuth();

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      await confirmSignUp({ email, code });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to confirm code. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess(false);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      await resendConfirmationCode(email);
      setResendSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to resend code. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <Container>
        <Title>Confirm Email</Title>
        <WarningMessage>
          <strong>AWS Cognito is not configured.</strong>
          <p>
            Please set up the required environment variables
            (NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID)
            and redeploy the application.
          </p>
        </WarningMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Confirm Email</Title>
      <InfoMessage>
        Please enter the verification code sent to your email address.
      </InfoMessage>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && (
        <SuccessMessage>
          Email confirmed successfully! Redirecting to login...
        </SuccessMessage>
      )}
      {resendSuccess && (
        <SuccessMessage>Verification code resent successfully!</SuccessMessage>
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
            placeholder="Enter 6-digit code"
          />
        </FormGroup>
        <Button type="submit" disabled={isLoading || success}>
          {isLoading ? "Confirming..." : "Confirm"}
        </Button>
        <SecondaryButton
          type="button"
          onClick={handleResendCode}
          disabled={isLoading || success || !email}
        >
          Resend Code
        </SecondaryButton>
      </Form>
      <LinkText>
        Already confirmed? <Link href="/login">Login</Link>
      </LinkText>
    </Container>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
