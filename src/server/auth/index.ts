import { getServerSession } from "next-auth/next";

import { authOptions } from "@/server/auth/options";

export function auth() {
  return getServerSession(authOptions);
}
