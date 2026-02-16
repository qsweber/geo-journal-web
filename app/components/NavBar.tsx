"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { useAuth } from "../../lib/auth/useAuth";

const NavBarWrapper = styled.div(() => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "20px 0",
  position: "relative",
}));

const Initials = styled.div(() => ({
  textAlign: "left",
  fontWeight: "600",
  fontSize: 36,
}));

const HamburgerButton = styled.button(() => ({
  margin: "auto 0",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 28,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const Menu = styled.nav<{ $isOpen: boolean }>(({ $isOpen }) => ({
  position: "absolute",
  top: "100%",
  right: 0,
  backgroundColor: "white",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  minWidth: "200px",
  display: $isOpen ? "flex" : "none",
  flexDirection: "column",
  padding: "8px 0",
  zIndex: 1000,
}));

const MenuItem = styled.a<{ $isActive: boolean }>(({ $isActive }) => ({
  padding: "12px 20px",
  textDecoration: "none",
  color: "inherit",
  fontWeight: $isActive ? "700" : "600",
  cursor: "pointer",
  backgroundColor: $isActive ? "#f5f5f5" : "transparent",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
}));

const MenuButton = styled.button(() => ({
  padding: "12px 20px",
  textAlign: "left",
  textDecoration: "none",
  color: "inherit",
  fontWeight: "600",
  cursor: "pointer",
  background: "none",
  border: "none",
  fontSize: "inherit",
  fontFamily: "inherit",
  width: "100%",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
}));

const MenuDivider = styled.hr(() => ({
  margin: "8px 0",
  border: "none",
  borderTop: "1px solid #ddd",
}));

const UserEmail = styled.div(() => ({
  padding: "12px 20px",
  fontWeight: "600",
  fontSize: "14px",
  color: "#666",
  borderBottom: "1px solid #ddd",
}));

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, signOut, isLoading } = useAuth();

  const handleLogout = () => {
    signOut();
    router.push("/");
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <NavBarWrapper>
      <Initials>Title</Initials>
      <HamburgerButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
        ☰
      </HamburgerButton>
      <Menu $isOpen={isMenuOpen}>
        {isAuthenticated && user && <UserEmail>{user.email}</UserEmail>}
        <Link href="/" passHref legacyBehavior>
          <MenuItem $isActive={pathname === "/"} onClick={handleMenuItemClick}>
            Home
          </MenuItem>
        </Link>
        <Link href="/another" passHref legacyBehavior>
          <MenuItem
            $isActive={pathname === "/another/"}
            onClick={handleMenuItemClick}
          >
            Another
          </MenuItem>
        </Link>
        {isAuthenticated && (
          <Link href="/protected" passHref legacyBehavior>
            <MenuItem
              $isActive={pathname === "/protected/"}
              onClick={handleMenuItemClick}
            >
              Protected
            </MenuItem>
          </Link>
        )}
        {!isLoading && (
          <>
            <MenuDivider />
            {isAuthenticated ? (
              <MenuButton onClick={handleLogout}>Logout</MenuButton>
            ) : (
              <Link href="/login" passHref legacyBehavior>
                <MenuItem
                  $isActive={pathname === "/login/"}
                  onClick={handleMenuItemClick}
                >
                  Login
                </MenuItem>
              </Link>
            )}
          </>
        )}
      </Menu>
    </NavBarWrapper>
  );
}
