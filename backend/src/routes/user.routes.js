import {Router} from "express"
import { loginUser, registerUser } from "../controllers/user.contoler.js";

export const userRouter = Router();


userRouter.route("/login").post(loginUser);
userRouter.route("/register").post(registerUser)
/* userRouter.route("/logout").post(verifyJWT,  logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser) */