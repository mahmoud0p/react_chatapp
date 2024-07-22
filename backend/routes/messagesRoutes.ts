import Router from "express"
import { isAuth } from "../middlewares/auth"
import { get_Messages } from "../controllers/messagesController"
const router = Router()

router.get("/get-messages" ,isAuth , get_Messages)




export {router}