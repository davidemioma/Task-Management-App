import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin" />
    </div>
  );
};

export default LoadingScreen;
