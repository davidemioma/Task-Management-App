"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useParams } from "next/navigation";
import { SettingsIcon, UsersIcon } from "lucide-react";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

const Navigations = () => {
  const params = useParams();

  const pathname = usePathname();

  const routes = [
    {
      label: "Home",
      href: `/workspaces/${params.workspaceId}`,
      icon: GoHome,
      activeIcon: GoHomeFill,
    },
    {
      label: "My Tasks",
      href: `/workspaces/${params.workspaceId}/tasks`,
      icon: GoCheckCircle,
      activeIcon: GoCheckCircleFill,
    },
    {
      label: "Settings",
      href: `/workspaces/${params.workspaceId}/settings`,
      icon: SettingsIcon,
      activeIcon: SettingsIcon,
    },
    {
      label: "Members",
      href: `/workspaces/${params.workspaceId}/members`,
      icon: UsersIcon,
      activeIcon: UsersIcon,
    },
  ];

  return (
    <ul className="flex flex-col">
      {routes.map((route) => {
        const isActive = pathname === route.href;

        const Icon = isActive ? route.activeIcon : route.icon;

        return (
          <li key={route.href} className="cursor-pointer">
            <Link href={route.href}>
              <div
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-md text-neutral-500 font-medium hover:text-primary transition",
                  isActive &&
                    "bg-white text-primary shadow-sm hover:opacity-100"
                )}
              >
                <Icon className="text-neutral-500 size-5" />

                {route.label}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default Navigations;
