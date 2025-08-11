import { FormEvent, useEffect, useState } from "react"

export const Switcher = ()=>{
    const [theme , setTheme] = useState('dark')
    useEffect(()=>{
        const local_theme = localStorage.getItem("theme")

        setTheme(local_theme || 'dark')
    } , [localStorage])
    const handleChange = (e:FormEvent<HTMLInputElement>)=>{
        if(e.currentTarget.checked){
            setTheme('light')
            localStorage.setItem("theme" , 'light')
            const htmlContainer  = document.getElementsByTagName('html')[0]
            htmlContainer.setAttribute('data-theme' , "light")
        }
        else{
            localStorage.setItem("theme" , 'dark')
            setTheme("dark")
            const htmlContainer  = document.getElementsByTagName('html')[0]
            htmlContainer.setAttribute('data-theme' , "dark")
        }
    }
    return(
        <input type="checkbox" onChange={handleChange} checked={theme === 'light'} value="light" className="toggle theme-controller absolute right-3 rounded-full" />

    )
}