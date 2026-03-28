"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/shared/ui/button";

export function LogoutButton() {
  return (
    <Button
      className="w-full"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      variant="secondary"
    >
      退出登录
    </Button>
  );
}
