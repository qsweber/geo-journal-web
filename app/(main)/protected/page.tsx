"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { useAuth } from "../../../lib/auth/useAuth";

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

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

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
    </div>
  );
}
