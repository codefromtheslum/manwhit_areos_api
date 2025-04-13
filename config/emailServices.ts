import nodemailer from "nodemailer";
import { google } from "googleapis";
import env from "dotenv";
env.config();

const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REFRESH: string = process.env.GOOGLE_REFRESH!;
const GOOGLE_REDIRECT: string = process.env.GOOGLE_REDIRECT!;

const OAuth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT
);

OAuth.setCredentials({ refresh_token: GOOGLE_REFRESH }); // ✅ use refresh_token here

export const sendVerification = async (user: any) => {
  try {
    const accessTokenResponse = await OAuth.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kossyuzoigwe@gmail.com",
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH,
        accessToken: accessToken!,
      },
    });

    const htmlContent = `<div>Hello World ${user?.email} <a href="http://localhost:5770/${user.id}" target="_blank">Here</a></div>`;

    const mailer = {
      from: `Francis <kossyuzoigwe@gmail.com>`,
      to: user?.email,
      subject: `Account activation`,
      html: htmlContent,
    };

    await transport.sendMail(mailer);

    console.log(`Sent!!`);
  } catch (error: any) {
    console.log(`This is error:`, error?.message);
    throw new Error(error?.response?.data?.message || error.message);
  }
};
