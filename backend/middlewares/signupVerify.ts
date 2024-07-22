import type { NextFunction, Request, Response } from "express";
import validator from "validator";
import { prismaClient } from "../db.config";

export const CheckInputs = async(req:Request , res:Response , next:NextFunction)=>{
    const {email , password , username} = req.body ; 
    if(!email  || !username){
        return res.json({message:"fuck you"})
    }
    if(password){
        if(!validator.isStrongPassword(password)){
            return res.status(500).json({error:"password is not strong enough"})
        }
    }
    if(!validator.isEmail(email)){
        return res.status(500).json({error:"Email is not valid"})
    }
    
    const user = await prismaClient.users.findFirst({where:{
        OR:[
            {email } ,
            {username}
        ]
        }})
    if(user){
        return res.status(500).json({error:"Email already registered.."})
    }
    if(user){
        
    }
    next()
}
