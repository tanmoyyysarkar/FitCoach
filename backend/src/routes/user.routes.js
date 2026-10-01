import {Router} from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const userRouter = Router();


userRouter.route("/login").post(loginUser);
userRouter.route("/register").post(registerUser)
userRouter.route("/logout").post(verifyJWT,  logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
/*userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser) */