import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import env from "dotenv";
import { sendToken } from "../config/emailServices";
env.config();

const ADMIN_SECRET = process.env.JWT! || "code";
const prisma = new PrismaClient();

export async function createAdminAccount(
  req: Request,
  res: Response
): Promise<any> {
  const { email, firstName, lastName } = req.body;

  if (!email) {
    return res.status(400).json({
      error: `Email is required !`,
    });
  }

  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        error: `Admin with email ${email} already exists`,
      });
    }

    const adminToken = crypto.randomBytes(32).toString("hex");

    const adminUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: "ADMIN",
        adminToken,
        verified: true,
      },
    });

    return res.status(201).json({
      message: `Admin created`,
      user: adminUser,
      token: adminToken,
    });
  } catch (error) {
    console.error(`Admin account creation error ${error}`);

    return res.status(500).json({
      message: `Internal server error`,
    });
  }
}

export async function adminLogin(req: Request, res: Response): Promise<any> {
  const { email, adminToken } = req.body;

  if (!email || !adminToken) {
    return res.status(400).json({
      message: `Email and adminToken are required!`,
    });
  }

  try {
    const admin = await prisma.user.findUnique({ where: { email } });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(401).json({
        error: `Unauthorized: Not an admin`,
      });
    }

    if (admin.adminToken !== adminToken) {
      return res.status(401).json({
        message: `Invalid admin token`,
      });
    }

    const token = jwt.sign(
      {
        userId: admin.id,
        role: admin.role,
      },
      ADMIN_SECRET,
      { expiresIn: "4h" }
    );

    return res.json({
      token,
      message: `Admin logged in successfully`,
      data: admin,
    });
  } catch (error) {
    console.error(`Admin login error ${error}`);
    return res.status(500).json({ error: `Internal server error` });
  }
}

export async function createAgent(req: Request, res: Response): Promise<any> {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: `Agent email is required`,
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: `User with this email address already exists` });
    }

    // create agent user with role AGENT and unverified
    const agent = await prisma.user.create({
      data: {
        email,
        role: "AGENT",
        verified: false,
      },
    });

    // send password setup email to agent

    return res.status(201).json({
      message: `Agent account created successfully`,
      data: agent,
    });
  } catch (error) {
    console.error(`Agent creation error: ${error}`);
    return res.status(500).json({
      error: `Internal server error`,
    });
  }
}

export async function verifyAgent(req: Request, res: Response): Promise<any> {
  const { agentId } = req.params;

  try {
    const agent = await prisma.user.findUnique({ where: { id: agentId } });

    if (!agent || agent.role !== "AGENT") {
      return res.status(404).json({ error: `Agent not found` });
    }

    if (agent.verified) {
      return res.status(400).json({ error: `Agent already verified` });
    }

    // Generate one-time-token for password setup
    const oneTimeToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const updatedAgent = await prisma.user.update({
      where: { id: agentId },
      data: {
        verified: true,
        oneTimeAccessToken: oneTimeToken,
        oneTimeAccessTokenExpires: tokenExpiry,
      },
    });

    await sendToken(updatedAgent);

    return res.status(200).json({
      message: `Agent verified, notification sent to agent's inbox`,
      token: oneTimeToken,
      expires: tokenExpiry,
    });
  } catch (error) {
    console.error(`Agent verification error: ${error}`);
    return res.status(500).json({
      error: `Internal server error`,
    });
  }
}

export async function agentSetupProfile(
  req: Request,
  res: Response
): Promise<any> {
  const { token, firstName, lastName, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      error: `Token and password parameters are required`,
    });
  }

  try {
    const agent = await prisma.user.findFirst({
      where: {
        oneTimeAccessToken: token,
        oneTimeAccessTokenExpires: {
          gt: new Date(),
        },
        role: "AGENT",
      },
    });

    if (!agent) {
      return res.status(400).json({ error: `Invalid or expired token` });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await prisma.user.update({
      where: { id: agent.id },
      data: {
        firstName,
        lastName,
        password: hashedPassword,
        oneTimeAccessToken: null,
        oneTimeAccessTokenExpires: null,
        verified: true,
      },
    });

    return res.json({
      message: `Profile setup complete. Proceed to login`,
      agent,
    });
  } catch (error) {
    console.error(`Agent profile setup error ${error}`);

    return res.status(500).json({ error: `Internal server error` });
  }
}

export async function loginAgent(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: `Email and password are required`,
      });
    }

    const agent = await prisma.user.findUnique({ where: { email } });

    if (!agent || agent.role !== "AGENT") {
      return res.status(401).json({
        error: `Unauthorized: Not an agent`,
      });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      agent?.password || ""
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        error: `Invalid password`,
      });
    }

    const token = jwt.sign(
      { userId: agent.id, role: agent.role },
      ADMIN_SECRET || "code",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: `Login successful`,
      token,
      data: agent,
    });
  } catch (error: any) {
    console.error(`Error logging in agent`, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
}

export async function getAgentAccountById(
  req: Request,
  res: Response
): Promise<any> {
  const { agentId } = req.params;

  try {
    const agent = await prisma.user.findMany({ where: { id: agentId } });

    if (!agent) {
      return res.status(404).json({ error: `Agent account not found` });
    }

    return res.status(200).json({
      message: `Details fetched successfully`,
      data: agent,
    });
  } catch (error: any) {
    console.error(`Error getting agent account by id ${error}`);
    return res.status(500).json({
      error: `Internal server error`,
    });
  }
}

export async function getAllAgentAccounts(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const agents = await prisma.user.findMany({ where: { role: "AGENT" } });

    if (!agents) {
      return res.status(404).json({ error: `No agent records found` });
    }

    return res.status(200).json({
      message: `All agent accounts fetched successfully`,
      data: agents,
    });
  } catch (error: any) {
    console.error(`Error getting all agent account:`, error);

    return res.status(500).json({
      error: `Internal server error`,
    });
  }
}

export async function deleteAgentAccount(
  req: Request,
  res: Response
): Promise<any> {
  const { agentId } = req.params;

  try {
    const agent = await prisma.user.findUnique({ where: { id: agentId } });

    if (!agent) {
      return res.status(404).json({ error: `Agent account not found` });
    }

    await prisma.user.delete({ where: { id: agentId } });

    return res.status(200).json({
      message: `Agent account deleted successfully`,
    });
  } catch (error: any) {
    console.error(`Error deleting agent account:`, error);

    return res.status(500).json({
      error: `Internal server error`,
    });
  }
}
