import { Router } from "express";
import {
  createAdminAccount,
  adminLogin,
  createAgent,
  verifyAgent,
  agentSetupProfile,
  loginAgent,
  getAgentAccountById,
  getAllAgentAccounts,
  deleteAgentAccount,
} from "../controllers/adminController";

const router = Router();

router.post("/create", createAdminAccount); // Tested and working perfectly
router.post("/login", adminLogin); // Tested and working perfectly
router.post("/create-agent", createAgent); // Tested and working perfectly
router.patch("/verify-agent/:agentId", verifyAgent); // Tested and working perfectly
router.patch("/setup-profile", agentSetupProfile); // Tested and working perfectly
router.post("/agent-login", loginAgent); // Tested and working perfectly
router.get("/agent/:agentId", getAgentAccountById); // Tested and working perfectly
router.route("/agents").get(getAllAgentAccounts); // Tested and working perfectly
router.delete("/delete-agent/:agentId", deleteAgentAccount); // Tested and working perfectly

export default router;
