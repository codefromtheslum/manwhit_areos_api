import bcryptjs from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import {
  sendLoginEmail,
  sendResetPassword,
  sendVerification,
} from "../config/emailServices";

const prisma = new PrismaClient();

export const createAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  const generateAuthenticationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      return res.status(400).json({
        message: `Account with email address already exists`,
      });
    }

    const verificationCodeExpiresIn = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    const newUser = await prisma.user.create({
      data: {
        email: email,
        verficationCode: generateAuthenticationCode(),
        verificationCodeExpiresIn,
        verified: true,
      },
    });

    await sendVerification(newUser);

    const { password: _, ...hidePassword } = newUser;

    return res.status(201).json({
      message: `Account created successfully`,
      data: hidePassword,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured during account creation: ${error?.message}`,
      data: error,
    });
  }
};

export const createPassword: any = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        message: `Account does not exist`,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        password: hashedPassword,
      },
    });

    const { password: _, ...hidePassword } = newUser;

    return res.status(200).json({
      message: `Password created successfully`,
      data: hidePassword,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured while creating password`,
      data: error?.message,
    });
  }
};

export const loginAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: `Account does not exist`,
      });
    }

    // await sendLoginEmail(user)

    return res.status(200).json({
      message: `Almost there...`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured during login`,
      data: error?.message,
    });
  }
};

export const checkPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.params;

    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: `Account does not exist`,
      });
    }

    if (user) {
      const check = await bcryptjs.compare(password, user?.password || "");

      if (check) {
        return res.status(200).json({
          message: `Logged in successfully`,
          data: user,
        });
      } else {
        return res.status(400).json({
          message: `Incorrect password`,
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured validating password`,
      data: error?.message,
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: `Account does not exist`,
      });
    }

    await sendResetPassword(user);

    return res.status(200).json({
      message: `Resetting password...`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured while resetting password`,
      data: error?.message,
    });
  }
};

export const createNewPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        message: `Account not found`,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    const { password: _, ...hidePassword } = newUser;

    return res.status(200).json({
      message: `Password updated successfully`,
      data: hidePassword,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured while creating new password`,
      data: error?.message,
    });
  }
};

export const getSingleUserAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(400).json({
        message: `Account does not exist`,
      });
    }

    const { password: _, ...hidePassword } = user;

    return res.status(200).json({
      message: `Details gotten successfully`,
      data: hidePassword,
    });
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getAllAccounts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const users = await prisma.user.findMany();

    return res.status(200).json({
      message: `${users?.length} Accounts(s) gotten successfully`,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured while getting all accounts`,
      data: error?.message,
    });
  }
};

export const updateuserAccountDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      nationality,
      lastName,
      dob,
      passportNo,
      passportExpiry,
      gender,
      phone,
    } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        message: `Account does not exist`,
      });
    }

    if (user) {
      const newUser = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          nationality,
          lastName,
          dob,
          passportNo,
          passportExpiry,
          gender,
          phone,
        },
      });

      const { password: _, ...hidePassword } = newUser;

      return res.status(200).json({
        message: `Account updated successfully`,
        data: hidePassword,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      message: `Error occured while updating account`,
      data: error?.message,
    });
  }
};
