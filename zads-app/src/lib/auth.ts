import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

declare module "next-auth" {
  interface User {
    apiToken: string;
    userType: string;
    phone?: string;
  }
  interface Session {
    apiToken: string;
    userType: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string;
      userType: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken: string;
    userType: string;
    phone?: string;
  }
}

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: credentials?.phone,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.data?.token) {
            return null;
          }

          const { token, user } = data.data;

          return {
            id: user.id,
            name: user.name,
            email: user.email ?? null,
            image: user.avatarUrl ?? null,
            phone: user.phone,
            apiToken: token,
            userType: user.userType,
          } satisfies User;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.apiToken = user.apiToken;
        token.userType = user.userType;
        token.phone = user.phone;
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.apiToken = token.apiToken;
      session.userType = token.userType;
      session.user.id = token.sub ?? "";
      session.user.phone = token.phone;
      session.user.userType = token.userType;
      return session;
    },
  },

  pages: {
    signIn: "/en/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
