import {useRef , useEffect} from "react"
export const OutsideClick = (callback:()=>void)=>{
    const ref = useRef<HTMLDivElement>(null)
    useEffect(()=>{
        const handleClickOutside = (event:MouseEvent | TouchEvent)=>{
            if(ref.current && !ref.current.contains(event.target as Node)){
                callback()
            }
        }
        window.addEventListener('mouseup' , handleClickOutside)
        window.addEventListener('touchend' , handleClickOutside)
        return()=>{
            window.removeEventListener("mouseup" , handleClickOutside)
            window.removeEventListener("touchend" , handleClickOutside)
        }
    })
    return ref
}