import mongoose, { Document, Model, Schema } from "mongoose";


export interface IConversation extends Document{
    participats:string[];
    lastMessage?: mongoose.Types.ObjectId;
    updateAt:Date;
}

const ConversationSchema =new Schema<IConversation>({
   participats: [{ type:String , ref:"User",required:true}],
   lastMessage:{type:Schema.Types.ObjectId,ref:"Message"},
   


},{timestamps: true})
//Ensure uniqueness for a pair of participats
ConversationSchema.index({participats:1})

const Conversation: Model<IConversation> = mongoose.model<IConversation>(
    "Message",
    ConversationSchema
);

export default Conversation;