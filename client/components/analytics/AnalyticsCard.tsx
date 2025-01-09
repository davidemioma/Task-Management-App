"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  title: string;
  value: number;
  variant: "up" | "down";
  increaseValue: number;
};

const AnalyticsCard = ({ title, value, variant, increaseValue }: Props) => {
  const Icon = variant === "up" ? FaCaretUp : FaCaretDown;

  const displayColor = variant === "up" ? "text-emerald-500" : "text-red-500";

  return (
    <Card className="w-full shadow-none border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardDescription className="flex items-center gap-2 font-medium overflow-hidden">
            <span className="truncate">{title}</span>
          </CardDescription>

          <div className="flex items-center gap-1">
            <Icon className={cn("size-4", displayColor)} />

            <span className={cn("truncate font-medium", displayColor)}>
              {increaseValue}
            </span>
          </div>
        </div>

        <CardTitle className="font-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default AnalyticsCard;
