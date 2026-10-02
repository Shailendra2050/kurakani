import console from "console";
import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB =async () => {
    mongoose.connection.on('connected', async () => console.log("MongoDB connected successfully"));
    if (!process.env.MONGODB_URI) 
        throw new Error("MONGODB_URI is not defined in the environment variables");
    await mongoose.connect(process.env.MONGODB_URI);
}
export default connectDB;
