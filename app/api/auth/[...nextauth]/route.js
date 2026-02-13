import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";

export const runtime = "nodejs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials) {
                try {
                    console.log("Login attempt:", credentials);

                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Email and password are required");
                    }

                    const user = await User.findOne({
                        where: { email: credentials.email },
                    });

                    if (!user) {
                        console.log("User not found:", credentials.email);
                        throw new Error("Invalid email or password");
                    }

                    const isMatch = await bcrypt.compare(credentials.password, user.password);
                    console.log("Password match:", isMatch);

                    if (!isMatch) {
                        throw new Error("Invalid email or password");
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (err) {
                    console.error("Authorize error:", err.message);
                    throw new Error(err.message);
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },

        async session({ session, token }) {
            session.user = {
                id: token.id,
                name: token.name,
                email: token.email,
                role: token.role,
            };
            return session;
        },
    },


    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
