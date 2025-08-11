import { PrismaClient } from "@prisma/client"
import { prismaClient } from "../db.config"
const prisma = new PrismaClient()
export const addFriend = async(to:string , from:string)=>{
    try{
        const friendExist = await prismaClient.friend_requests.findFirst({where:{to ,from }})
        if(friendExist) {
            throw new Error ('cannot already friend request already added ')
        }
        const friends = await prisma.friend_requests.create({
            data:{
                to ,
                from
            }
        })
        return friends
    }catch(err:any){
        console.log(err.message)
        return err.message
    }
}

export const addMessage  = async(from:string , chat_id:string, content:string ,to:string , status:"Delivered" | "Seen")=>{
    try{
        if(!from || !content){
            throw new Error('cannot send empty message')
        }
        const isBlocked = await prismaClient.blocks.findFirst({where:{
            OR:[
                {user_id:from,
                blocked_id:to
                } ,
                {
                    user_id:to ,
                    blocked_id:from
                } 

            ]
        }})
        if(isBlocked){
            throw new Error("You're blocked or blocked the user..")
        }
        const createMessage = await prismaClient.messages.create({
            data:{
                sender_id:from , 
                chat_room_id:chat_id ,
                content , 
                status
            }
        })
        .catch(err=>{
            throw new Error(err.message)
        })
        if(!createMessage){
            throw new Error("an error occured while sending message")
        }
        return createMessage
    }catch(err:any){
        return console.log(err.message)
    }
}
export const getUser  = async(userid:string)=>{
    try{
        if(!userid){
            throw new Error('cannot send empty message')
        }
        const user = await prismaClient.users.findFirst({where:{
            id:userid
        } , 
        select:{
            first_name :true ,
            last_name :true, 
            id:true
            }
        })
        .catch(err=>{
            throw new Error(err.message)
        })
        if(!user){
            throw new Error("an error occured while finding user")
        }
        return user
    }catch(err:any){
        return console.log(err.message)
    }
}

export  const seeMessage = async(chat_id:string , user_id:string)=>{
        const messages  = await prismaClient.messages.findMany({where:{chat_room_id:chat_id , NOT:{sender_id : user_id} , status:"Delivered"}})
         await prismaClient.messages.updateMany({where:{chat_room_id:chat_id , NOT:{sender_id : user_id}} , data:{status:"Seen"}})
        return messages || null
}