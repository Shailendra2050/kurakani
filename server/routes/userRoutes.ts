import {Router} from "express";
import { getUsers, searchUsers, getProfile, updateProfile} from "../controllers/userController.js";
import upload  from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";


const userRouter = Router();


userRouter.get("/", authMiddleware, getUsers);
userRouter.get("/search",authMiddleware, searchUsers);
userRouter.get("/profile",authMiddleware, getProfile);
userRouter.put("/profile",authMiddleware, upload.single("avatar"), authMiddleware, updateProfile);

export default userRouter;