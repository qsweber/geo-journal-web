"use client";

import { ReactNode } from "react";
import styled from "@emotion/styled";
import { NavBar } from "../components/NavBar";
import { AuthProvider } from "../../lib/auth/AuthContext";

const Container = styled.div(() => ({
  maxWidth: 1000,
  margin: "0 auto",
  fontFamily: "Work Sans",
}));

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Container>
        <NavBar />
        {children}
      </Container>
    </AuthProvider>
  );
}
