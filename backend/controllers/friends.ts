import type { Response } from "express"
import type {authRequest} from "../middlewares/auth"
import { prismaClient } from "../db.config"
import _, { some } from "lodash"
export const get_chats = async (req: authRequest, res: Response) => {
    try {
        const user = req.user!;
        const chats = await prismaClient.chat_rooms.findMany ({
            
            where: {
                    users:{
                        some:{
                            user_id:user.id
                        }
                    }
            },
             
            include: {
                users:{
                    where:{
                        NOT:{user_id : user.id}
                        
                    } , 
                    include:{
                        users:{
                            include:{
                                image:{select:{url:true}}
                            }
                        }
                    }
                } ,
                messages: {
                    orderBy:{created_at :"desc"},
                    take:1,
                    include:{
                        sender:{
                            select:{
                                id:true ,
                                first_name:true , 
                                
                            }
                        }
                    }
                },
    
            }
        });

        const chats_ = _.map(chats , (c)=>({
            id:c.id , 
            blacked : c.blocked ,
            user : c.users[0].users,
            message : c.messages[0] || null
        }))
        const chatsOrder = _.orderBy(chats_ , (c:any)=> c.message?.created_at,['desc'])
        return res.json(chatsOrder);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }   
};
export const get_friend_requests = async (req:authRequest, res:Response)=>{
    try{
        const user = req.user!
        const friends = await prismaClient.friend_requests.findMany({where:{to:user.id} , include:{
            from_user:{
                select:{
                    id:true , 
                    first_name:true , 
                    last_name : true ,
                    email :true  , 
                    username:true
            }}
        }})
        const friends_ = _.map(friends , (f)=>{
            return f.from_user
        })
        return res.json(friends_)
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
}
export const sendFriendRequest = async(req:authRequest , res:Response)=>{
    try{
        const user = req.user! ;
        const friendId = req.body ;
        if(!user.verified){
            throw new Error("Verify your email first")
        }
        if(!friendId){
            throw new Error("cannot find how to send friend request")
        }
        const isFriends = await prismaClient.chat_rooms.findFirst({where:{
            users:{
                some:{
                    AND:[
                        {user_id:user.id} , 
                        {user_id:friendId}
                    ]
                }
            }
        }})
        const isBlocked = await prismaClient.blocks.findFirst({where:{
            OR:[
                {user_id:user.id,
                blocked_id:friendId
                } ,
                {
                    user_id:friendId ,
                    blocked_id:user.id
                } 

            ]
        }})
        if(isBlocked){
            throw new Error("You're blocked or blocked the user..")
        }
        if(isFriends){
            throw new Error("You're already friends...")
        }
        const isFriendRequests  = await prismaClient.friend_requests.findFirst({where:{
            OR:[
                {from:user.id} , 
                {to:user.id}
            ]
        }})
        if(isFriendRequests){
            throw new Error("Your Friend request already have been sent")
        }
        await prismaClient.friend_requests.create({data:{from:user.id , to:friendId}})
        return res.json({message:"friend request have been sent"})
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
}
export const acceptFriend = async (req:authRequest, res:Response)=>{
    try{
        const user = req.user!
        const {friendId} = req.body
        if(!friendId){
            throw new Error("cannot find the friend request")
        }
        const friend_request = await prismaClient.friend_requests.findFirst({where:{
            from:friendId , 
            to:user.id
        }})
        if(!friend_request){
            throw new Error("cannot find the friend request")
        }
        const chat =await prismaClient.chat_rooms.create({data:{}})
        await prismaClient.usersOnChats.create({ data: {
            user_id:user.id ,
            chat_id:chat.id
            
        }})
        await prismaClient.usersOnChats.create({ data: {
            user_id:friendId ,
            chat_id:chat.id
            
        }})
        await prismaClient.friend_requests.delete({where:{id:friend_request.id}})
        return res.json({message:`you are now friends`})
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
}

export const deleteFriend = async (req:authRequest, res:Response)=>{
    try{
        const user = req.user!
        const {friendId} = req.query
        if(!friendId){
            throw new Error("cannot find the friend request")
        }
        const friend_requests = await prismaClient.friend_requests.findFirst({where:{
                to:user.id,from:friendId.toString()
            
        }})
        if(friend_requests){
            await prismaClient.friend_requests.delete({where:{id:friend_requests.id}})
            return res.json({message:"friend request canceled!"})
        }
        const chat = await prismaClient.chat_rooms.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                user_id: user.id,
                            },
                        },
                    },
                    {
                        users: {
                            some: {
                                user_id: friendId.toString(),
                            },
                        },
                    },
                ],
            },
        });
        if(!chat){
            throw new Error("cannot find the chat")
        }
        await prismaClient.chat_rooms.delete({where:{id:chat.id}})
        return res.json({message:`successfuly`})
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
}


export const blockUser = async(req:authRequest , res:Response)=>{
    try{
        const user = req.user! ; 
        const {user_to_block} = req.body
        if(!user_to_block){
            throw new Error("cannot find user to block")
        }
        await prismaClient.blocks.create({data:{
            user_id:user.id , 
            blocked_id :user_to_block ,
        }}).catch(err=>{throw new Error(err.message)})
        console.log(user_to_block)
        const chat_room =await prismaClient.chat_rooms.findFirst({where:{
            AND:[
                {
                    users:{
                        some:{
                            user_id:user.id
                        }
                    }
                },
                {
                    users:{
                        some:{
                            user_id:user_to_block
                        }
                    }
                }
            ]
        }})
        await prismaClient.chat_rooms.update({where:{id:chat_room?.id} , data:{blocked:true}})
        return res.json({message:"user is blocked successfuly..."})
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
}