import { Router } from "express";
import { deleteConversation, getConversation, getMessage, getorCreateConversation, sendMessage } from "../controllers/messageController.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";

const  messageRouter = Router();

messageRouter.use(authMiddleware)



messageRouter.get('/conversations',getConversation);
messageRouter.get('/conversations/:conversation/messages',getMessage);
messageRouter.get('/conversations/with/:targetUserId',getorCreateConversation);
messageRouter.post('/send',upload.single("file"),sendMessage);
messageRouter.delete('/conversations/:conversationId',deleteConversation);


export default messageRouter;


// import { Router } from "express";

// import {
//   deleteConversation,
//   getConversation,
//   getMessage,
//   getorCreateConversation,
//   sendMessage,
// } from "../controllers/messageController.js";

// import upload from "../middlewares/upload.js";
// import { authMiddleware } from "../middlewares/auth.js";

// const messageRouter = Router();

// console.log("MESSAGE ROUTER FILE LOADED");

// messageRouter.get("/test", (_req, res) => {
//   console.log("ESSAGE TEST ROUTE HIT");

//   res.json({
//     success: true,
//     message: "MESSAGE ROUTER WORKS",
//   });
// });

// messageRouter.use(authMiddleware);

// messageRouter.get("/conversations", getConversation);

// messageRouter.get(
//   "/conversations/:conversation/messages",
//   getMessage
// );

// messageRouter.get(
//   "/conversations/with/:targetUserId",
//   getorCreateConversation
// );

// messageRouter.post(
//   "/send",
//   upload.single("file"),
//   sendMessage
// );

// messageRouter.delete(
//   "/conversations/:conversationId",
//   deleteConversation
// );

// export default messageRouter;

