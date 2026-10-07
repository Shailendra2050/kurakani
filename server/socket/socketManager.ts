import { verifyToken } from "@clerk/express";
import { IncomingMessage } from "http";
import { WebSocketServer,WebSocket } from "ws"
import User from "../models/User.js";
import { matchesGlob } from "path";
import Conversation from "../models/Conversation.js";


// map userId -> Websocket
const onlineUsers = new Map<string, WebSocket>()

// Initialize socket server
export function initSocketServer(server: any){
    const wss = new WebSocketServer({server, path: "/ws"})
    wss.on("connection",async(ws: WebSocket, req: IncomingMessage)=>{
        console.log("client connected");
        // Extract token fron query string: /ws?token = ....
        const url = new URL(req.url!,`http://${req.headers.host}`);
        const token = url.searchParams.get("token");
        if(!token){
            ws.close(1008,"no token");
            return
        }
        let userId: string;
        try {
            const decoded = await verifyToken(token,{
                secretKey: process.env.CLERK_SECRET_KEY
            });
            userId = decoded.sub;
        } catch (error) {
            console.error("ws verification error", error);
            ws.close(1008,"no token");
            return
        }
        // Register user as online
        onlineUsers.set(userId,ws);
        await User.findByIdAndUpdate(userId, {isOnline: true})

        // broadcast user is online
        broadcastOnlineStatus(userId,true)


        ws.on("message",(data: Buffer)=>{
            try {
                const msg = JSON.parse(data.toString());

                // Forward message to receiver(s)
                if(msg.type ==="message"){
                    const {receiverId, conversationId, payload} =msg;
                    if (conversationId){
                    //direct message with conversationId
                    handleConversationEvent(userId,conversationId,{type: "message",payload})

                }else if(receiverId){
                    //legany direct message 
                    const receiverWs =onlineUsers.get(receiverId);
                    if (receiverWs?.readyState === WebSocket.OPEN){
                        receiverWs.send(JSON.stringify({type: "message", payload}))
                    }
                }
            } 
            //Forward typing imdicators
             if(msg.type ==="typing"){
                    const {receiverId, conversationId, isTyping} =msg;
                    if (conversationId){
                    //update Typing status in convertation
                    handleConversationEvent(userId,conversationId,{type: "typing",senderId: userId, isTyping})
                }else if(receiverId){
                    //legany direct message 
                    const receiverWs =onlineUsers.get(receiverId);
                    if (receiverWs?.readyState === WebSocket.OPEN){
                        receiverWs.send(JSON.stringify({type: "typing", senderId: userId,isTyping}))
                    }
                }
            } 
        }catch (error:any) {
            console.error("Error processing mmessage:",error); 
            }

        })
        ws.on("close",async()=>{
            onlineUsers.delete(userId);
            await User.findByIdAndUpdate(userId, {isonline: false, lastseen: new Date()})
            //broadcast user become offline
            broadcastOnlineStatus(userId,false)
        })
    })
    return wss;
}
function broadcastOnlineStatus(userId: string, isOnline: boolean){
    const payload = JSON.stringify({type: "online_status", userId,isOnline});
    onlineUsers.forEach((ws)=>{
        if (ws.readyState === WebSocket.OPEN){
            ws.send(payload);
        }
    })
}
// i had added the async function it is not in youtube (9:10 min something)
export async function handleConversationEvent(senderId: string, conversationId: string, event:any){
    try{
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) return;
        const payload = JSON.stringify(event);
        conversation.participants.forEach((pId)=>{
            const participantId = String(pId);
            if (participantId === senderId) return;
            //Don't  send back to sender
        const ws = onlineUsers.get(participantId);
        if (ws?.readyState === WebSocket.OPEN){
            ws.send(payload)
        }
    })
} catch (error){
    console.error("Conversation event error:",error);
}
}

 export function broadcastUserUpdate(user: any){
    const payload = JSON.stringify({type: "user_update", user});
    onlineUsers.forEach((ws)=>{
        if (ws.readyState === WebSocket.OPEN){
            ws.send(payload);
        }
    })
}

export { onlineUsers}