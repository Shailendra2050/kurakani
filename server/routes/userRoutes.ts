import {Router} from "express";
import { getUsers, searchUsers, getProfile, updateProfile} from "../controllers/userController.js";
import upload  from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";


const userRouter = Router();

userRouter.use(authMiddleware) 

userRouter.get("/",  getUsers);
userRouter.get("/search",searchUsers);
userRouter.get("/profile", getProfile);
userRouter.put("/profile", upload.single("avatar"),updateProfile);

export default userRouter;