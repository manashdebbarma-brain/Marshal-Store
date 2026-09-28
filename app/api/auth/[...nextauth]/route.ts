import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  // ═══════════════════════════════════════════════════════════
  // 📧 WELCOME EMAIL TRIGGER
  // ═══════════════════════════════════════════════════════════
  // ⚠️ NOTE: `isNewUser` only works if you're using a database
  // adapter. Since you're using pure JWT (no DB), this will
  // always be `undefined`, so no email sends from here.
  //
  // We use a localStorage check in the Navbar instead — see
  // the navbar code for the actual email trigger.
  //
  // If you later add a database, uncomment the block below.
  // ═══════════════════════════════════════════════════════════
  events: {
    async signIn({ user, isNewUser }) {
      // Uncomment this if you add a database adapter later
      /*
      if (!isNewUser) return;
      if (!user.email || !user.name) return;

      try {
        const baseUrl =
          process.env.NEXTAUTH_URL || "http://localhost:3000";

        await fetch(`${baseUrl}/api/send-welcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
          }),
        });

        console.log(`✅ Welcome email sent to ${user.email}`);
      } catch (err) {
        console.error("❌ Failed to send welcome email:", err);
      }
      */
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };