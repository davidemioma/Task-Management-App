import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex h-screen w-full items-center justify-center",
        className
      )}
    >
      <Loader2 className="w-7 h-7 animate-spin" />
    </div>
  );
};

export default LoadingScreen;
