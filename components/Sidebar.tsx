"use client";

import { useUserLogIn } from "hooks/context/UserLogInContext";
import {
  ChartBar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type MenuItem = {
  name: string;
  url: string;
  icon: React.ReactElement;
};

interface MenuRoleMap {
  [key: string]: MenuItem[];
}

const menusBasedRole: MenuRoleMap = {
  admin: [
    { name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard /> },
    {
      name: "Manage Users",
      url: "/manage-user",
      icon: <Users />,
    },
    {
      name: "Statistic",
      url: "/statistic",
      icon: <ChartBar />,
    },
  ],
  "team lead": [
    { name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard /> },
    { name: "My Ticket", url: "/ticket", icon: <Ticket /> },
    {
      name: "Manage Users",
      url: "/manage-user",
      icon: <Users />,
    },
  ],
  consultant: [
    { name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard /> },
    { name: "My Ticket", url: "/ticket", icon: <Ticket /> },
  ],
  "project coordinator": [
    { name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard /> },
    { name: "My Ticket", url: "/ticket", icon: <Ticket /> },
  ],
};

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { userLogIn } = useUserLogIn();

  return (
    <aside
      className={[
        "h-screen fixed top-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300 overflow-y-auto",
        isOpen ? "w-64" : "w-16",
      ].join(" ")}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-400 dark:border-gray-700">
        {isOpen && <span className="text-lg font-semibold">Menu</span>}
        <button
          onClick={toggleSidebar}
          aria-controls="app-sidebar"
          aria-expanded={isOpen}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {menusBasedRole[userLogIn?.role?.name ?? ""]?.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            className={[
              "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.url
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700",
              !isOpen && "justify-center",
            ].join(" ")}
          >
            <span>{item.icon || "📁"}</span>
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
