import { useEffect } from "react"
import {motion , AnimatePresence} from "framer-motion"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { setErrorMessage } from "../features/message/messageSlice";
export default function ErrorMessage(){
    const message = useSelector((state:RootState)=>state.message.errorMessage)
    const dispatch = useDispatch()
    useEffect(()=>{
        if(message){
            setTimeout(() => {
                dispatch(setErrorMessage(''))
            }, 4500);
        }
    } , [message])
    return (
        <div className="toast toast-start toast-bottom ">
            <AnimatePresence>
                    {message&&<motion.div initial={{translateY:30 , opacity:0}} animate={{translateY:0 , opacity:1}} exit={{translateY:30 , opacity:0}}  className="alert alert-error">
                        <span>{message}</span>
                    </motion.div>}
            </AnimatePresence>
        </div>
    )   
}