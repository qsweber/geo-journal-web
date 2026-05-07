"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { useAuth } from "../../lib/auth/useAuth";
import { useMapState } from "./MapStateContext";

const SidebarWrapper = styled.div(() => ({
  width: "100%",
  height: "56px",
  backgroundColor: "rgba(248, 249, 250, 0.98)",
  borderBottom: "1px solid #ddd",
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  position: "fixed",
  left: 0,
  top: 0,
  right: 0,
  zIndex: 100,
  backdropFilter: "blur(6px)",
}));

const Logo = styled.div(() => ({
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontWeight: "700",
  fontSize: "16px",
  borderRight: "1px solid #ddd",
  whiteSpace: "nowrap",
}));

const NavSection = styled.nav(() => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const NavItemWrapper = styled.div(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const NavItem = styled.a<{ $isActive: boolean }>(({ $isActive }) => ({
  display: "block",
  padding: "6px 12px",
  textDecoration: "none",
  color: "inherit",
  fontWeight: $isActive ? "700" : "600",
  backgroundColor: $isActive ? "#dfe6f8" : "transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  "&:hover": {
    backgroundColor: "#e9ecef",
  },
}));

const ProgressBarContainer = styled.div(() => ({
  position: "fixed",
  top: "62px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "min(360px, calc(100vw - 20px))",
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  border: "1px solid #ddd",
  borderRadius: "999px",
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  zIndex: 101,
}));

const ProgressBarBackground = styled.div(() => ({
  width: "100%",
  height: "8px",
  backgroundColor: "#e9ecef",
  borderRadius: "4px",
  overflow: "hidden",
}));

const ProgressBarFill = styled.div<{ $percentage: number }>(
  ({ $percentage }) => ({
    height: "100%",
    width: `${$percentage}%`,
    backgroundColor: "#627BC1",
    transition: "width 0.3s ease",
  }),
);

const ProgressText = styled.div(() => ({
  fontSize: "12px",
  color: "#666",
  marginTop: "4px",
  textAlign: "center",
}));

const UserSection = styled.div(() => ({
  borderLeft: "1px solid #ddd",
  padding: "0 10px",
  minWidth: "96px",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const UserEmail = styled.div(() => ({
  fontWeight: "600",
  color: "#666",
  marginBottom: "12px",
  display: "none",
}));

const LogoutButton = styled.button(() => ({
  padding: "8px 16px",
  width: "100%",
  background: "#627BC1",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
  "&:hover": {
    background: "#526aa3",
  },
  padding: "6px 10px",
  width: "auto",
  fontSize: "12px",
  whiteSpace: "nowrap",
}));

const LoginButton = styled.button(() => ({
  padding: "8px 16px",
  width: "100%",
  background: "#627BC1",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
  "&:hover": {
    background: "#526aa3",
  },
  padding: "6px 10px",
  width: "auto",
  fontSize: "12px",
  whiteSpace: "nowrap",
}));

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, signOut, isLoading } = useAuth();
  const { visitedStates } = useMapState();

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const totalStates = 50;
  const selectedCount = visitedStates.size;
  const percentage = Math.round((selectedCount / totalStates) * 100);

  return (
    <SidebarWrapper>
      <Logo>Geo Journal</Logo>

      <NavSection>
        <NavItemWrapper>
          <Link href="/" passHref legacyBehavior>
            <NavItem $isActive={pathname === "/"}>United States</NavItem>
          </Link>
          {pathname === "/" && (
            <ProgressBarContainer>
              <ProgressBarBackground>
                <ProgressBarFill $percentage={percentage} />
              </ProgressBarBackground>
              <ProgressText>
                {selectedCount} / {totalStates} states ({percentage}%)
              </ProgressText>
            </ProgressBarContainer>
          )}
        </NavItemWrapper>
      </NavSection>
      <UserSection>
        {isLoading ? (
          <div>Loading...</div>
        ) : isAuthenticated && user ? (
          <>
            <UserEmail>{user.email}</UserEmail>
            <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
          </>
        ) : (
          <LoginButton onClick={handleLogin}>Log In</LoginButton>
        )}
      </UserSection>
    </SidebarWrapper>
  );
}
