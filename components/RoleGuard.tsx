import { useSession } from "@/../context";
import { Redirect } from "expo-router";
import React from "react";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('user' | 'admin' | 'moderator' | 'doctor')[];
  fallbackRoute?: string;
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, userRole, isLoading } = useSession();

  console.log("RoleGuard - Current user role:", userRole);
  console.log("RoleGuard - Allowed roles:", allowedRoles);
  console.log("RoleGuard - Is user authenticated:", !!user);

  if (isLoading) {
    console.log("RoleGuard - Still loading...");
    return null;
  }

  if (!user) {
    console.log("RoleGuard - No user, redirecting to login");
    return <Redirect href="/login" />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log("RoleGuard - Unauthorized role, redirecting to unauthorized page");
    return <Redirect href="/unauthorized" />;
  }

  console.log("RoleGuard - Access granted");
  return <>{children}</>;
} 