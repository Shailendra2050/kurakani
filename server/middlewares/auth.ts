import { NextFunction, Request, Response } from 'express';
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'
import User from "../models/User.js";


export interface AuthRequest extends Request {
    user?: {
        id: string, name: string, email: string,
    }
}
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' })
            return;

        }
        
        //check if user exits in mongoDB
        let localUser = await User.findById(userId);
        if (!localUser) {

            //lazy sync user from clerk to mongoDB
            const clerUser = await clerkClient.users.getUser(userId)
            const email = clerUser.emailAddresses[0].emailAddress;
            const name = [clerUser.firstName, clerUser.lastName].filter(Boolean).join(" ") || clerUser.username || "Anonymous";
            
            // create fallback handle if username is not available
            const handle = clerUser.username || clerUser.emailAddresses[0]?.emailAddress.split("@")[0] || userId;

            //Ensure handle is unique in mongoDB
            let finalHandle = handle.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
            let handleExists = await User.findOne({ handle: finalHandle });
            let counter = 1;
            while (handleExists) {
                const testHandle = `${finalHandle}${counter}`;
                handleExists = await User.findOne({ handle: testHandle })
                if (!handleExists) {
                    finalHandle = testHandle;
                    break;
                }
                counter++;
            }
            localUser = await User.create({
                _id: userId,
                name,
                email: email.toLocaleLowerCase(),
                handle: finalHandle,
                avatar: clerUser.imageUrl || "",
                bio: " Hey there! I am using Kurakani.",
                isOnline: true,
                lastSeen: new Date(),
            });



        }
            // Attch user info to request compatibility
            req.user = {
                id: localUser._id,
                name: localUser.name,
                email: localUser.email,
            }
            next();

    } catch (error) {
        console.error("Error in authMiddleware:", error);
        res.status(401).json({ sucecess : false, message: 'Internal Server Error' });
        return;
    }
}

// import { NextFunction, Request, Response } from "express";
// import { clerkClient, getAuth } from "@clerk/express";
// import User from "../models/User.js";

// export interface AuthRequest extends Request {
//   user?: {
//     id: string;
//     name: string;
//     email: string;
//   };
// }

// export const authMiddleware = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     console.log("🔐 AUTH HEADER:", req.headers.authorization);

//     const { userId } = getAuth(req);

//     console.log("🔐 CLERK USER ID:", userId);

//     if (!userId) {
//       console.log("❌ Unauthorized: no Clerk user ID");
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     let localUser = await User.findById(userId);

//     if (!localUser) {
//       console.log("👤 User not found in MongoDB. Syncing from Clerk...");

//       const clerkUser = await clerkClient.users.getUser(userId);

//       const email =
//         clerkUser.emailAddresses[0]?.emailAddress || "";

//       const name =
//         [clerkUser.firstName, clerkUser.lastName]
//           .filter(Boolean)
//           .join(" ") ||
//         clerkUser.username ||
//         "Anonymous";

//       const handle =
//         clerkUser.username ||
//         email.split("@")[0] ||
//         userId;

//       let finalHandle = handle
//         .toLowerCase()
//         .replace(/[^a-z0-9]/g, "");

//       let handleExists = await User.findOne({
//         handle: finalHandle,
//       });

//       let counter = 1;

//       while (handleExists) {
//         const testHandle = `${finalHandle}${counter}`;

//         handleExists = await User.findOne({
//           handle: testHandle,
//         });

//         if (!handleExists) {
//           finalHandle = testHandle;
//           break;
//         }

//         counter++;
//       }

//       localUser = await User.create({
//         _id: userId,
//         name,
//         email: email.toLowerCase(),
//         handle: finalHandle,
//         avatar: clerkUser.imageUrl || "",
//         bio: "Hey there! I am using Kurakani.",
//         isOnline: true,
//         lastSeen: new Date(),
//       });

//       console.log("✅ User synced to MongoDB:", userId);
//     }

//     req.user = {
//       id: localUser._id.toString(),
//       name: localUser.name,
//       email: localUser.email,
//     };

//     console.log("✅ AUTH SUCCESS:", req.user.id);

//     next();
//   } catch (error) {
//     console.error("❌ Error in authMiddleware:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };