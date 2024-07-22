import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../controllers/userController";
import { prismaClient } from "../db.config";
export type User = {
    id:string,
    first_name :string ,
    last_name : string , 
    email :string ,
    verified :boolean, 
    created_at :Date , 
    email_token :string | null, 
    username :string , 
    role :string, 
}
export interface authRequest extends Request{
    user?:User | null
}
export const isAuth = async(req:authRequest , res:Response , next:NextFunction)=>{
    try{
        const token =req.cookies.token 
        if(!token ){
            throw new Error("You should login first")
        }
        const user_id = verifyToken(token)
        if(!user_id){
            throw new Error("you should login first")
        }
        const user = await prismaClient.users.findFirst({where:{id:user_id}}).catch(err=>{
            throw new Error("error occured while finding your account, try again later")
        })
        if(!user){
            throw new Error("cannot find your account")
        }
        req.user  = user
        next()
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
}