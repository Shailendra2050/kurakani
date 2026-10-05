import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import Conversation from "../models/Conversation.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import { UploadStream } from "cloudinary";
import Message from "../models/Message.js";
//helper: find convo between two users
async function findConversation(userId: string, otherId: string){
    return Conversation.findOne({
        $and: [
            {
                participants:{ $elemMatch:{ $eq:userId}}
            },
            {
                participants:{$eleMatch:{$eq: otherId}}
            },
            {$expr: {$eq: [{$size:"$participants"},2]}}
        ]
    } as any)
}
// Start or get a conversation with a user
export const getorCreateConversation = async (req: AuthRequest, res: Response)=>{
    const userId = req.user!.id;
    const targetUserId= String(req.params.targetUserId)
    let conversation : any = await findConversation(userId, targetUserId);
    if(conversation){
        await conversation.populate("participants","name email handl avtar isOnline lastSeen");
        await conversation.populate("lastMessage")
    }else{
        conversation = await Conversation.create({participats:[userId,String(targetUserId)]})
        await conversation.populate("participants","name email handle avtar isOnline lastSeen");
    }
    const other = (conversation.participants as any[]).find((p:any)=> String(p._id !==userId));
    res.json({
        success:true,
        conversation:{ _id: conversation._id, participant: other, lastMessage:conversation.lastMessage},
    })

}

// get all conversation for the current user
export const getConversation = async (req: AuthRequest, res: Response)=>{
    const userId =req.user!.id;
    const conversations = await Conversation.find({participants:{$in:[userId]}}).populate("participants", "name email handle avtar isOnline lastSeen").populate('lastMessage').sort({updatedAt: -1})

    const shaped = conversations.map((c)=>{
        const other = (c.participats as any[]).find((p: any)=> String(p._id) !== userId);
        return { _id: c._id, isGroup: false, participat:other, lastMessage: c.lastMessage, updateAt: c.updateAt}
        res.json({success: true, conversations: shaped})


    })
    
}

// send message 
export const sendMessage = async (req: AuthRequest, res: Response)=>{
    const senderId = req.user!.id;
    const {recieverId, conversationId, text} = req.body;
    const file = req.file;
    if((!recieverId && !conversationId) || (!text?.trim() && !file)){
        res.status(400).json({success: false, message:"receiverId/conversationId and (text or file) are required"});
        return;
    }
    let mediaUrl = "";
    let mediaType: "image" | "video" | undefined;
    if(file){
                try {
                    const resorceType = file.mimetype.startsWith("video")?"video": "image";
                    mediaType = resorceType;

            const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "kurakani" },(error, result) => {
                            if (error) reject(error)
                            else resolve(result as any)
                        }
                    )
                        const readableStream = new Readable();
                        readableStream.push(file.buffer);
                        readableStream.push(null);
                        readableStream.pipe(uploadStream);
        
        
        
                    });
            const result = await uploadPromise;
            mediaUrl = result.secure_url;
                }
                catch (err) {
                    console.error("Cloudinary uploading error:", err);
                    res.status(500).json({ success: false, message: "Failed to upload media" });
                    return;
                }
            }

            let conversation;
            if(conversationId){
                conversation = await Conversation.findOne({_id:conversationId,participats: {$in:[senderId]}})
            }else{
                conversation = await findConversation(senderId, recieverId)
                if (!conversation){
                    conversation = await Conversation.create({
                        participats: [senderId,recieverId]
                    })
                }
            }if(!conversation){
                res.status(404).json({ success: false, message:"Conversation not found"})
                return
            }
            const message = await Message.create({
                sender: senderId,
                receiver: recieverId || conversation.participats.find((p)=> String(p) !== senderId),
                conversationId: conversation._id,
                text: text?.trim(),
                mediaUrl: mediaUrl || undefined,
                mediaType,

            })
            conversation.lastMessage = message._id as any ;
            conversation.updateAt = new Date();
            await conversation.save();
            res.status(201).json({success: true, message});

    }
    


// Get all message in conversation
export const getMessage = async (req: AuthRequest, res: Response)=>{
     const userId = req.user!.id;
    const {conversationId} = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId, participats: {$in:[userId]}
    })
    if(!conversation){
        res.status(404).json({success: false, message : "Conversation not found"});
        return
    }
    const message = await Message.find({conversationId}).sort({createAt: 1});
    await Message.updateMany({conversationId,receiver: userId, read: false},{read:true})
    res.json({success: true, message});

}

// delete a conversation
export const deleteConversation = async (req: AuthRequest, res: Response)=>{
      const userId = req.user!.id;
    const {conversationId} = req.params;
    try{
        const conversation = await Conversation.findById(conversationId);
        if(!conversation){
            res.status(404).json({ success : false, message: "Conversation not found"});
            return;

        }
        // check if user is part of the conversation 
        const isparticipant = conversation.participats.some((p)=> String(p) === userId)
        if(!isparticipant){
            res.status(403).json({ success: false, message: "Not authorized to delete this conversation"});
            return;
        }

        // Notify other participants before deleting

        // Delete the conversition itself
        await Conversation.findByIdAndDelete(conversationId);
       res.json({ success: true, message: "Chat deleted successfully"});
    }catch(error){
        res.status(500).json({ success: false, message: "Server error"});
    }
}