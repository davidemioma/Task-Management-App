"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  imageUrl?: string;
  fallback?: string;
  imgClassName?: string;
  fallbackClassName?: string;
};

const ProjectAvatar = ({
  imageUrl,
  fallback,
  imgClassName,
  fallbackClassName,
}: Props) => {
  return (
    <>
      {imageUrl ? (
        <div
          className={cn(
            "size-10 relative rounded-md overflow-hidden",
            imgClassName
          )}
        >
          <Image
            className="object-cover"
            src={imageUrl}
            fill
            alt="workspace-logo"
          />
        </div>
      ) : (
        <Avatar className={cn("size-10 rounded-md", fallbackClassName)}>
          <AvatarFallback className="bg-blue-600 text-white font-semibold uppercase text-lg rounded-md">
            {fallback}
          </AvatarFallback>
        </Avatar>
      )}
    </>
  );
};

export default ProjectAvatar;
