import { Router } from "express";
import { createMessage, listMessageContacts, listMessages } from "../controllers/message.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const messageRouter = Router();

messageRouter.use(verifyJWT);
messageRouter.get("/contacts", listMessageContacts);
messageRouter.get("/:partnerId", listMessages);
messageRouter.post("/:partnerId", createMessage);
