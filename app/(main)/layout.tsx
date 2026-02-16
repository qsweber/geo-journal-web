"use client";

import { ReactNode } from "react";
import styled from "@emotion/styled";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../../lib/auth/AuthContext";
import { MapStateProvider } from "../components/MapStateContext";

const LayoutWrapper = styled.div(() => ({
  display: "flex",
  width: "100%",
  height: "100vh",
  fontFamily: "Work Sans",
}));

const MainContent = styled.main(() => ({
  marginLeft: "250px",
  width: "calc(100% - 250px)",
  height: "100vh",
  overflow: "auto",
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
