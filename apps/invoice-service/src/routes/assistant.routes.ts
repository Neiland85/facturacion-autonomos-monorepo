import { Router } from "express";
import { AssistantController } from "../controllers/assistant.controller";

const router: Router = Router();
const assistantController = new AssistantController();

router.post(
  "/assistant",
  assistantController.processVoiceCommand.bind(assistantController)
);

export default router;
