import { Request, Response } from 'express';
import User from "../models/User.js";
import { AuthRequest } from '../middlewares/auth.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import { broadcastUserUpdate } from '../socket/socketManager.js';




// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
    const users = await User.find({ _id: req.user!.id }).select("name email handle avatar bio isOnline lastSeen")
    res.json({ success: true, users })

}

// search users by name,email  or handle
export const searchUsers = async (req: AuthRequest, res: Response) => {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        res.json({ success: true, users: [] })
        return;
    }
    const regex = new RegExp(query, "i");
    const users = await User.find({
        _id: { $ne: req.user!.id },
        $or: [
            { name: regex },
            { email: regex },
            { handle: regex }]

    }).select("name email handle avatar bio isOnline lastSeen").limit(20);

    res.json({ success: true, users });

}

//get current user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!.id);
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    res.json({ success: true, user });
}

//update profile (name, handle, bio, avatar)
export const updateProfile = async (req: AuthRequest, res: Response) => {
    const { name, handle, bio, avatar } = req.body;

    // Access the uploaded file from multer
    const file = req.file;
    if (handle) {
        // Check if the handle is already taken by another user
        const handleExists = await User.findOne({ handle, _id: { $ne: req.user!.id } });
        if (handleExists) {
            res.status(400).json({ success: false, message: "Handle is already taken" });
            return;
        }
    }


    let avatarUrl = "";
    if (file) {
        try {
            const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "kurakani_avatars" }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result as any);
                    }


                });
                const readableStream = new Readable();
                readableStream.push(file.buffer);
                readableStream.push(null);
                readableStream.pipe(uploadStream);



            });
            const result = await uploadPromise;
            avatarUrl = result.secure_url;
        }
        catch (err) {
            console.error("Avatar uploading error:", err);
            res.status(500).json({ success: false, message: "Failed to upload avatar" });
            return;
        }
    }
    const updateData: any = {
        ...(name && { name }),
        ...(handle && { handle: handle.toLowerCase().trim() }),
        ...(bio !== undefined && { bio }),

    };
    if (avatarUrl) {
        updateData.avatar = avatarUrl;
    }
    if(avatarUrl){
        updateData.avatar = avatarUrl;

    }
    const updated = await User.findByIdAndUpdate(req.user!.id, updateData, { returnDocument: "after" })

    if(updated){
        broadcastUserUpdate(updated)
    }
    res.json({ success: true, user: updated });

}