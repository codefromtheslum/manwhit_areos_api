import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import env from "dotenv";
import { PrismaClient } from "@prisma/client";
env.config();

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile: any, done: any) => {
    try {

        let user = await prisma.user.findUnique({
            where: { googleId: profile.id }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: profile.emails?.[0].value,
                    firstName: profile.name?.givenName || "",
                    lastName: profile.name?.familyName || "",
                    avatarUrl: profile.photos?.[0].value
                }
            })
        }

        return done(null, user)
    } catch (error: any) {
        return done(error, null)
    }
}))


export default passport