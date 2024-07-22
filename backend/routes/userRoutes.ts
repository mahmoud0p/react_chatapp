import {Router} from "express"
import { delete_user, find_all_usernames, findUser, login_user, logout, post_user, sendEmailVerification, update_user, user, verifyEmail } from "../controllers/userController"
import { CheckInputs } from "../middlewares/signupVerify"
import { upload } from "../multer"
import { isAuth } from "../middlewares/auth"
import { blockUser } from "../controllers/friends"
const router =Router()

router.post("/verify_email", isAuth , verifyEmail)
router.post('/send-email' ,isAuth, sendEmailVerification)
router.route('/user')
.post(CheckInputs,post_user)
.delete(isAuth,delete_user)
router.put("/user-update" ,isAuth ,  upload.single('image') ,update_user)

router.post ('/login' , login_user)
router.post ('/logout' ,isAuth , logout)
router.get ('/auth' , isAuth , user)
router.get("/find-user" , isAuth , findUser)
router.get("/get-usernames"  , find_all_usernames)
router.post('/add-block' , isAuth , blockUser)
export  {router}