import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSequelize } from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";

const initializeDatabase = async () => {
    const sequelize = getSequelize();
    try {
        await sequelize.authenticate();
        console.log('Database connected in NextAuth');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials) {
                try {
                    await initializeDatabase();

                    console.log("Login attempt for email:", credentials?.email);

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

                    if (!isMatch) {
                        console.log("Password mismatch for:", credentials.email);
                        throw new Error("Invalid email or password");
                    }

                    console.log("Login successful for:", credentials.email);

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
        maxAge: 30 * 24 * 60 * 60, // 30 days
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
        error: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };