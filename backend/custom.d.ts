export type User = {
    first_name :string ,
    last_name : string , 
    email :string ,
    verified :string, 
    created_at :string , 
    email_token :string, 
}

import { Request } from "express"

declare module "express-serve-static-core" {
    type Request ={
        user ? : User
    }
}