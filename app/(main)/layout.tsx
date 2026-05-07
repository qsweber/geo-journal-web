"use client";

import { ReactNode } from "react";
import styled from "@emotion/styled";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../../lib/auth/AuthContext";
import { MapStateProvider } from "../components/MapStateContext";

const LayoutWrapper = styled.div(() => ({
  width: "100%",
  height: "100vh",
  fontFamily: "Work Sans",
}));

const MainContent = styled.main(() => ({
  width: "100%",
  height: "100vh",
  overflow: "auto",
  paddingTop: "56px",
  boxSizing: "border-box",
}));

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MapStateProvider>
        <LayoutWrapper>
          <Sidebar />
          <MainContent>{children}</MainContent>
        </LayoutWrapper>
      </MapStateProvider>
    </AuthProvider>
  );
}
