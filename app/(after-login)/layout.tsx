"use client";

import { usePathname } from "next/navigation";
import { UserLogInProvider } from "hooks/context/UserLogInContext";
import BaseDashboardLayout from "components/layouts/BaseDashboardLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <UserLogInProvider>
      {pathname === "/profile" ? (
        children
      ) : (
        <BaseDashboardLayout>{children}</BaseDashboardLayout>
      )}
    </UserLogInProvider>
  );
}
