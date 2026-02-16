"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { useAuth } from "../../lib/auth/useAuth";

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

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <SidebarWrapper>
      <Logo>Geo Journal</Logo>
      
      <NavSection>
        <Link href="/" passHref legacyBehavior>
          <NavItem $isActive={pathname === "/"}>United States</NavItem>
        </Link>
        <Link href="/another" passHref legacyBehavior>
          <NavItem $isActive={pathname === "/another"}>Another</NavItem>
        </Link>
        {isAuthenticated && (
          <Link href="/protected" passHref legacyBehavior>
            <NavItem $isActive={pathname === "/protected"}>Protected</NavItem>
          </Link>
        )}
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
