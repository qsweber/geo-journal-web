"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { useAuth } from "../../lib/auth/useAuth";
import { useMapState } from "./MapStateContext";

const SidebarWrapper = styled.div(() => ({
  width: "250px",
  height: "100vh",
  backgroundColor: "#f8f9fa",
  borderRight: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
}));

const Logo = styled.div(() => ({
  padding: "24px 20px",
  fontWeight: "700",
  fontSize: "24px",
  borderBottom: "1px solid #ddd",
}));

const NavSection = styled.nav(() => ({
  flex: 1,
  overflowY: "auto",
  padding: "16px 0",
}));

const NavItemWrapper = styled.div(() => ({
  position: "relative",
}));

const NavItem = styled.a<{ $isActive: boolean }>(({ $isActive }) => ({
  display: "block",
  padding: "12px 20px",
  textDecoration: "none",
  color: "inherit",
  fontWeight: $isActive ? "700" : "600",
  backgroundColor: $isActive ? "#e9ecef" : "transparent",
  borderLeft: $isActive ? "3px solid #627BC1" : "3px solid transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#e9ecef",
  },
}));

const ProgressBarContainer = styled.div(() => ({
  padding: "8px 20px 12px 20px",
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
  padding: "16px 20px",
  borderTop: "1px solid #ddd",
  fontSize: "14px",
}));

const UserEmail = styled.div(() => ({
  fontWeight: "600",
  color: "#666",
  marginBottom: "12px",
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
