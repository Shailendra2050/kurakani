import { Router } from "express";
import { deleteConversation, getConversation, getMessage, getorCreateConversation, sendMessage } from "../controllers/messageController.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";

const  messageRouter = Router();

messageRouter.use(authMiddleware)



messageRouter.get('/conversations',getConversation);
messageRouter.get('/conversations/:conversationId/messages',getMessage);
messageRouter.get('/conversations/with/:targetUserId',getorCreateConversation);
messageRouter.post('/send',upload.single("file"),sendMessage);
messageRouter.delete('/conversations/:conversationId',deleteConversation);


export default messageRouter;
