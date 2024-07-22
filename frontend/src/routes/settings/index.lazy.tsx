import {  useQuery } from '@tanstack/react-query'
import { createLazyFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import axios from 'axios'
import { useState } from 'react'
import { BiArrowBack } from 'react-icons/bi'

export const Route = createLazyFileRoute('/settings/')({
  component: Settings
})
export type User={
  first_name : string , 
  last_name :string ,
  email :string , 
  username:string, 
  role  :string, 
  verified :boolean , 
  image:string | null ,
}
function Settings(){
  const [user , setUser] = useState<User | null>(null)
  const {isLoading , isError} = useQuery({
    queryKey:['user_info'] , 
    queryFn:async()=>{
      const {data} = await axios.get('http://localhost:3000/api/auth')
      setUser(data)
      return data
    }
  })
  const router = useRouter()
  if(isLoading){
    return (
      <div className="flex w-full flex-col h-screen gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="skeleton h-32 w-32 shrink-0 rounded-full"></div>
          <div className="flex flex-col gap-4 sm:w-auto flex-1">
            <div className="skeleton h-4 sm:w-52 w-3/4"></div>
            <div className="skeleton h-4 sm:w-72 w-full"></div>
          </div>
        </div>
        <div className="skeleton flex-1 w-full"></div>
      </div>
    )
  }
  if(isError){
    return (
      <div className='text-error'>
        Oops, Our mistake we are working on fixing this error try again later.
      </div>
    )
  }
  
  return (
    <>
      <div className='flex flex-col gap-4 p-4 min-h-screen overflow-auto items-center'>
        <div className='flex gap-5 flex-1 flex-wrap w-full sm:items-start justify-center items-center'>
        <button onClick={()=>{router.history.back()}} className='btn '><BiArrowBack/></button>
          <div className="avatar placeholder h-52">
            <div className="w-52 bg-neutral text-neutral-content rounded-full ring-offset-2 ring-offset-base-100 ring-4 ring-primary">
              {user?.image ? <Image width={52*0.25*16} height={52*0.25*16} src={user.image} alt='user image'/>:<span className='text-7xl  uppercase '>{user?.first_name[0]}{user?.last_name[0]}</span>}
            </div>
            
          </div>
            <div className='flex flex-col gap-5 flex-1 items-center'>
              <div  className='flex gap-5 w-full sm:justify-start justify-center flex-wrap'>
                  <div>
                    <strong className='text-xl'>
                      First Name
                    </strong>
                    <p className=' text-lg text-primary capitalize text-pretty'>{user?.first_name}</p>
                  </div>
                  <div>
                    <strong className='text-xl '>
                      Last Name
                    </strong>
                    <p className=' text-lg text-primary capitalize text-pretty'>{user?.last_name}</p>
                  </div>
                  <div className='w-full flex flex-col items-center sm:items-start'>
                    <strong className='text-xl'>
                      Email
                    </strong>
                    <p className='text-primary text-lg'>{user?.email}</p>
                    <div className={`badge ${!user?.verified ? "badge-error" : " badge-success"}`}>{user?.verified ? "Verified" : "Not Verified"}</div>
                  </div>
                </div>
                {user?.role === "Admin" &&<div className=' flex flex-col'>
                  <strong>Role</strong>
                  <p className=' badge badge-secondary text-xl badge-lg'>{user?.role}</p>
                </div>}
            </div>
            <Link to={'/settings/edit'} className=' btn btn-wide '>Edit Your Informations</Link>
            <button className='btn btn-wide btn-secondary'>Logout</button>
          </div>
          <button className='btn w-full btn-error'>Delete Account</button>
        </div>
    </>
  )
}