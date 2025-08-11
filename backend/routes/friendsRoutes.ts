import Router from "express"
import { acceptFriend, deleteFriend, get_chats, get_friend_requests } from "../controllers/friends"
import { isAuth } from "../middlewares/auth"
const router = Router()


router.get("/get-friend-requests" , isAuth, get_friend_requests)
router.get("/get-chats" , isAuth, get_chats)
router.put("/accept-friend" , isAuth , acceptFriend)
router.delete('/cancel-friend-request' , isAuth , deleteFriend)
export {router}