import { withAuth } from "next-auth/middleware";

import { getAuthSecret } from "@/server/env";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ req, token }) {
      if (req.nextUrl.pathname === "/admin/login") {
        return true;
      }

      return !!token;
    },
  },
  secret: getAuthSecret(),
});

export const config = {
  matcher: ["/admin/:path*"],
};
