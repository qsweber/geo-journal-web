"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@qsweber/auth-kit";
import "../../lib/auth-setup";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
