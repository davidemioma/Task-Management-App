"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { onBoardUser } from "@/lib/actions/user";
import { useMutation } from "@tanstack/react-query";

export default function Callback() {
  const router = useRouter();

  const { mutate } = useMutation({
    mutationKey: ["onboard-user"],
    mutationFn: async () => {
      const result = await onBoardUser();

      return result;
    },
    onSuccess: (result) => {
      if (result.status !== 200) {
        router.push("/auth/sign-in");
      }

      router.push("/");
    },
    onError: () => {
      router.push("/auth/sign-in");
    },
  });

  useEffect(() => {
    mutate();
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin" />
    </div>
  );
}
