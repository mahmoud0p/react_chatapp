import type { Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { prismaClient } from "../db.config";
import nodemailer from "nodemailer"
import { htmlContentProvider } from "../emailTemplate";
import type { authRequest, User } from "../middlewares/auth";
import _ from "lodash"
import path from "path"
import validator from "validator";
import { password } from "bun";
export const createToken = (id: string) => {
    const token = jwt.sign({ id }, process.env.secret_key || '', { expiresIn: '1d' });
    return token;
};
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user:process.env.email,
      pass:process.env.password,
    },
  });
async function sendEmail(email: string, url: string) {
    try {
      const info = await transporter.sendMail({
        from: 'Mahmoud Samir',
        to: email,
        subject: "Email verification",
        text: "your email verification link",
        html: htmlContentProvider(url)
      });
    } catch (error:any) {
      throw new Error("Error sending email");
    }
  }
export const verifyToken = (token: string) => {
    const verifyToken = jwt.verify(token, process.env.secret_key || '') as JwtPayload;
    return verifyToken.id;
};

export const post_user = async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, password  , username} = await req.body;
        if (!first_name || !last_name || !email || !password || !username) {
            throw new Error("Cannot create new user while some information is missing");
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prismaClient.users.create({
            data: {
                username,
                first_name,
                last_name,
                email,
                password: hashedPassword , 
                email_token : (crypto.randomUUID()).toString()
            }
        }).catch(err => {
            throw new Error(err.message);
        });
        const url = `http://localhost:5173/verify_email?emailToken=${user.email_token}`
        sendEmail(user.email , url)
        const token = createToken(user.id || '');
        if (!token) {
            throw new Error("An error occurred while signing you up");
        }
        const maxAge = 24 * 60 * 60 * 1000;
        res.cookie("token", token, { maxAge, httpOnly: true });
        const formatted = {
            id:user.id , 
            first_name :user.first_name , 
            last_name : user.last_name ,
            email :user.email ,
            verified : false ,
            username :user.username
        }
        return res.json({ message: "User created successfully", user:formatted });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    } finally {
        await prismaClient.$disconnect();
    }
};
export const login_user = async (req: Request, res: Response) => {
    try {
        const { input, password } = await req.body;
        if ( !input || !password) {
            throw new Error("Cannot log you in while some informations is missing");
        }
        const user = await prismaClient.users.findFirst({
            where:{
                OR:[
                    {email:input},
                    {username : input}
                ]
            }
        }).catch(err => {
            throw new Error(err.message);
        });
        if(!user){
            throw new Error("cannot find this email on our system")
        }
        const validPassword = bcrypt.compareSync(password , user?.password)
        if(!validPassword){
            throw new Error("invalid password")
        }
        const token = createToken(user?.id || '');
        if (!token) {
            throw new Error("An error occurred while signing you up");
        }
        const maxAge = 24 * 60 * 60 * 1000;
        res.cookie("token", token, { maxAge, httpOnly: true });
        return res.json({ message: "User logged in successfully", user });
    } catch (err: any) {
        console.log(err.message)
        return res.status(500).json({ error: err.message });
    } finally {
        await prismaClient.$disconnect();
    }
};


type UpInfo = {
    first_name? :string , 
    last_name? : string ,
    email? :string, 
    password? :string ,
    verified? :boolean , 
    username? :string
}
export const update_user  = async(req:authRequest , res:Response)=>{
    try{
        let updateInfo : UpInfo = {}
        const user = req.user!
        const user_ = await prismaClient.users.findFirst({where:{id:user.id} ,select:{password:true} })
        const {first_name , last_name, email ,new_password ,current_password , username}  =req.body
        if(!first_name && !last_name && !email && !new_password && !current_password && !username){
            return res.json({message : "Nothing updated"})
        }
        if(first_name && first_name !== user.first_name){
            updateInfo.first_name = first_name 
        }
        if(last_name && last_name !== user.last_name){
            updateInfo.last_name = last_name
        }
        if(email && email !== user.email){
            if(validator.isEmail(email)){
                updateInfo.email = email 
                updateInfo.verified =false
            }
        }
        if(username && username !== user.username)
        if(current_password && new_password){
            const validPassword = bcrypt.compareSync(current_password ,user_?.password || '')
            if(validPassword){
                if(validator.isStrongPassword(new_password)){
                    updateInfo.password = bcrypt.hashSync(new_password , 10)
                }
            }
        }
        await prismaClient
        .users
        .update({where:{id:user.id} , data:updateInfo})
        .catch(err=>{
            throw new Error(err.message)
        })
        const image  = req.file
        if(image){
            await prismaClient.user_image.delete({where:{user_id:user.id}})
            await prismaClient.user_image.create({data:{url : `http://localhost:3000/uploads/${path.basename(image.filename)}` , user_id:user.id}})
        }
        return res.json({message:"user info updated successfuly"})
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }finally {
        await prismaClient.$disconnect();
    }
}

export const delete_user = async (req: authRequest, res: Response) => {
    try {
        const user = req.user
        await prismaClient.users.delete({where:{id:user?.id}})
        return res.json({message:"user deleted successfuly"}); 
    } catch (err: any) {
        console.log(err.message)
        return res.status(500).json({ error: err.message });
    } finally {
        await prismaClient.$disconnect();
    }
};
export const user = async (req: authRequest, res: Response) => {
    try {
        const user = req.user!
        const image = await prismaClient.user_image.findFirst({where:{
            user_id:user.id
        }})
        const formatted ={
            id:user.id , 
            first_name : user.first_name , 
            last_name :user.last_name , 
            email :user.email , 
            username:user.username , 
            role :user.role ,
            verified:user.verified , 
            image:image?.url || null
        }
        return res.json(formatted); 
    } catch (err: any) {
        console.log(err.message)
        return res.status(500).json({ error: err.message });
    } finally {
        await prismaClient.$disconnect();
    }
};
export const logout = async (req: Request, res: Response) => {
    try {
        res.cookie('token' , '' , {maxAge:1})
        return res.json({message:'logout successfuly'}); 
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    } finally {
        await prismaClient.$disconnect();
    }
};

export const verifyEmail = async(req:authRequest , res:Response)=>{
    try{
        const user_ = req.user!
        const user_id = user_.id
        const {emailToken} = req.body
        if(!emailToken ){
            throw new Error("cannot fing email token")
        }
        const user = await prismaClient.users.findFirst({where:{email_token:emailToken ,id:user_id}}).catch(err=>{
            throw new Error("loggin your email first before verifying")
        })
        if(!emailToken || !user){
            throw new Error ("cannot verify you email")
        }
        await prismaClient.users.update({where:{id:user.id} , data:{verified:true}})
        .catch(err=>{
            throw new Error(err.message)
        }) 
        return res.json({message:'your email verified successfuly'})
    
    }catch(err:any){
        console.log(err.message)

        return res.status(500).json({error:err.message})
    }
    finally{
        await prismaClient.$disconnect()
    }
}

export const sendEmailVerification = async(req:authRequest , res:Response)=>{
    try{
        const user = req.user!
        sendEmail(user.email , `http://localhost:5173/verify_email?emailToken=${user.email_token}`)
        return res.json({message:"Email verification have been sent successfuly"})
    }catch(err:any){
        return res.json({error:err.message})
    }
    finally{
        await prismaClient.$disconnect()
    }
}


export const findUser = async(req:Request , res:Response)=>{
    try{
        const {query} = req.query
        if(!query){
            throw new Error("You should write user email or name to find him")
        }
        const user:User[]  = await prismaClient.$queryRaw`
        SELECT * FROM users
        WHERE to_tsvector('english', username || ' ' || email) @@ plainto_tsquery('english', ${query});
        `;
        if(!user){
            throw new Error("cannot find users")
        }
        const image  = await prismaClient.user_image.findFirst({where:{
            user_id:user[0].id
        }})
        const formatted ={
            id:user[0].id , 
            first_name : user[0].first_name , 
            last_name : user[0].last_name , 
            email :user[0].email ,
            image:image?.url || null
        }
        return res.status(201).json(formatted)
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
    finally{
        await prismaClient.$disconnect()
    }

}

export const find_all_usernames = async(req:Request , res:Response)=>{
    try{

        const users = await prismaClient.users.findMany({select:{username:true}}) 
        const usernames :string[] = _.map(users , (u)=>(u.username))

        return res.status(201).json(usernames )
    }catch(err:any){
        return res.status(500).json({error:err.message})
    }
    finally{
        await prismaClient.$disconnect()
    }
}