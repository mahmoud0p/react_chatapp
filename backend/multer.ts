import multer from "multer"
import crypto from "crypto"
import path from "path"
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null , path.join(process.cwd(), 'uploads') )
    } , 
    filename:(req, file ,cb)=>{
        const filename = `${Date.now()}_${crypto.randomUUID()}_${file.originalname}`
        cb(null , filename)
    }
})

export const upload = multer({storage})