"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { useAuth } from "../../../lib/auth/useAuth";
import { useApiClient } from "../../../lib/api/useApiClient";

const Title = styled.h1(() => ({
  marginBottom: 20,
}));

const Message = styled.p(() => ({
  fontSize: 18,
  marginBottom: 20,
}));

const LoadingMessage = styled.div(() => ({
  textAlign: "center",
  fontSize: 18,
  marginTop: 50,
}));

const Button = styled.button(() => ({
  padding: "10px 20px",
  fontSize: 16,
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  marginRight: 10,
  "&:hover": {
    backgroundColor: "#0051cc",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
}));

const ApiSection = styled.div(() => ({
  marginTop: 30,
  padding: 20,
  backgroundColor: "#f5f5f5",
  borderRadius: 8,
}));

const ResponseBox = styled.pre(() => ({
  marginTop: 10,
  padding: 15,
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: 5,
  overflow: "auto",
  fontSize: 14,
}));

const ErrorBox = styled.div(() => ({
  marginTop: 10,
  padding: 15,
  backgroundColor: "#fee",
  border: "1px solid #fcc",
  borderRadius: 5,
  color: "#c00",
}));

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const apiClient = useApiClient();

  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const callApi = async () => {
    setIsLoadingApi(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const response = await apiClient.get("/foo");
      setApiResponse(JSON.stringify(response, null, 2));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoadingApi(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <LoadingMessage>Loading...</LoadingMessage>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      <Title>Protected Page</Title>
      <Message>
        Welcome, {user?.email}! This page is only accessible to authenticated
        users.
      </Message>
      <Message>
        This demonstrates how to protect routes in your application. The page
        automatically redirects to the login page if the user is not
        authenticated.
      </Message>
      <ApiSection>
        <h2>Authenticated API Call Example</h2>
        <p>
          Click the button below to make an authenticated request to your
          backend API. Your Cognito ID token will be sent in the Authorization
          header.
        </p>
        <Button onClick={callApi} disabled={isLoadingApi}>
          {isLoadingApi ? "Loading..." : "Call API"}
        </Button>

        {apiResponse && (
          <div>
            <h3>Success Response:</h3>
            <ResponseBox>{apiResponse}</ResponseBox>
          </div>
        )}

        {apiError && (
          <div>
            <h3>Error:</h3>
            <ErrorBox>{apiError}</ErrorBox>
          </div>
        )}
      </ApiSection>
    </div>
  );
}
