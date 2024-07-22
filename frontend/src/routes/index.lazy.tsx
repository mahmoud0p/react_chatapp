import { createLazyFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useSelector,  } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { RootState } from '../app/store'
import { useEffect, useState } from 'react'
import Sidebar from '../components/sidebar'
import Chat from '../components/chat'
import io from "socket.io-client"
import NoChat from '../components/NoChat'
import { useMediaQuery } from 'react-responsive'
import {motion , AnimatePresence} from "framer-motion"
export const Route = createLazyFileRoute('/')({
  
  component: Main
})

export const socket = io("http://localhost:3000")
function Main(){
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' })
  const [emailSent , setEmailSent] = useState(false)
  const user = useSelector((state:RootState)=>state.user.user)
  const [click ,setClick] = useState(false)
  const emailMutation  = useMutation({
    mutationFn:async()=>{
      axios.defaults.withCredentials = true
      const {data} = await axios.post('http://localhost:3000/api/send-email')
      return data
    }
  })
  const handleOnClick = ()=>{
    setEmailSent(true)
    emailMutation.mutateAsync()
  }
  useEffect(()=>{
    socket.connect()
    return ()=>{
      socket.disconnect()
    }
  } , [socket])
 
  if(user) return (
    <div className='w-full h-screen overflow-hidden'>
          {user?.id && !user.verified &&<div className='w-full  text-warning-content ' >
            {emailSent ? <p className='w-full bg-success px-3'>Email have been sent</p> : <p className=' px-3 bg-warning w-full'>your Email is not verified yet! <span role='button' onClick={handleOnClick}  className=' label-text-alt link link-neutral  link-hover'>Send Email verification link</span></p> }
         
      </div>}
      {isTabletOrMobile && 
          <>
              <AnimatePresence>
                {!click &&     
                <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:"just"}}>
                  <Sidebar setClick={setClick} click={click}/>
                </motion.div> }
              </AnimatePresence>
              <AnimatePresence>
                {click &&
                    <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:"just"}}>
                      <Chat  setClick={setClick}/>
                    </motion.div>
                  }
              </AnimatePresence>
          </>
      }
      {!isTabletOrMobile && <div className='flex'>
        <Sidebar setClick={setClick} click={click}/>
        {click ? <Chat  setClick={setClick}/>:<NoChat/>}
      </div>}
    </div>
  )
}