import { verifyToken } from "@clerk/express";
import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws"
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";


// map userId -> Websocket
const onlineUsers = new Map<string, WebSocket>()

// Initialize socket server
export function initSocketServer(server: any) {
    const wss = new WebSocketServer({ server, path: "/ws" })
    wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
        console.log("client connected");
        // Extract token fron query string: /ws?token = ....
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");
        if (!token) {
            ws.close(1008, "no token");
            return
        }
        let userId: string;
        try {
            const decoded = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY
            });
            userId = decoded.sub;
        } catch (error) {
            console.error("ws verification error", error);
            ws.close(1008, "no token");
            return
        }
        // Register user as online
        onlineUsers.set(userId, ws);
        await User.findByIdAndUpdate(userId, { isOnline: true })

        // broadcast user is online
        broadcastOnlineStatus(userId, true)


        ws.on("message", (data: Buffer) => {
            try {
                const msg = JSON.parse(data.toString());

                // Forward message to receiver(s)
                if (msg.type === "message") {
                    const { conversationId } = msg;

                    if (!conversationId) return;

                    handleConversationEvent(userId, conversationId, msg);
                }
                //Forward typing imdicators
                if (msg.type === "typing") {
                    const { conversationId, isTyping } = msg;

                    if (!conversationId) return;

                    handleConversationEvent(
                        userId,
                        conversationId,
                        {
                            type: "typing",
                            isTyping: Boolean(isTyping)
                        }
                    );
                }
            } catch (error: any) {
                console.error("Error processing mmessage:", error);
            }

        })
        ws.on("close", async () => {
            onlineUsers.delete(userId);
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
            //broadcast user become offline
            broadcastOnlineStatus(userId, false);
        });
    })
    return wss;
}
function broadcastOnlineStatus(userId: string, isOnline: boolean) {
    const payload = JSON.stringify({ type: "online_status", userId, isOnline });
    onlineUsers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
        }
    })
}

export async function handleConversationEvent(
    senderId: string,
    conversationId: string,
    event: any
) {
    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return;
        }

        // Make sure the authenticated sender belongs to this conversation


        const isParticipant = conversation.participants.some(
            (participantId) => String(participantId) === String(senderId)
        );

        if (!isParticipant) {
            console.warn(
                `Unauthorized socket event: ${senderId} tried to access conversation ${conversationId}`
            );
            return;
        }

        // Never trust senderId supplied by the client
        const safeEvent = {
            ...event,
            senderId,
            conversationId,
        };

        const payload = JSON.stringify(safeEvent);

        conversation.participants.forEach((participantId) => {
            const participant = String(participantId);

            // Don't send back to sender
            if (participant === String(senderId)) {
                return;
            }

            const ws = onlineUsers.get(participant);

            if (ws?.readyState === WebSocket.OPEN) {
                ws.send(payload);
            }
        });
    } catch (error) {
        console.error("Conversation event error:", error);
    }
}

export function broadcastUserUpdate(user: any) {
    const payload = JSON.stringify({ type: "user_update", user });
    onlineUsers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
        }
    })
}

export { onlineUsers }