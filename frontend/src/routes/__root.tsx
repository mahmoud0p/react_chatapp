import { createRootRoute, Outlet, useLocation, useRouter } from '@tanstack/react-router'
import SuccessMessage from '../components/succMessage'
import ErrorMessage from '../components/errorMessage'
import { setUser } from '../features/user/userSlice'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'


export const Route = createRootRoute({
  component: Layout
})


function Layout(){
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = useLocation().pathname
  useEffect(()=>{
    const theme = localStorage.getItem('theme')
    if(theme){
      const htmlContainer  = document.getElementsByTagName('html')[0]
      htmlContainer.setAttribute('data-theme' , theme)
    }
  } , [])
  const {isLoading } = useQuery({
    queryKey:['user'] , 
    queryFn:async()=>{
      try{
        axios.defaults.withCredentials = true
        const {data} = await axios.get('http://localhost:3000/api/auth')
        dispatch(setUser(data))
        return data
      }catch(err:any){
        if(!pathname.includes('/signup')){
          router.history.push("/login")
        }
        return err.message
      }
    }
  })
  
  if(isLoading){
    return <span className="loading loading-spinner loading-lg absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2"></span>

  }
  
   return (
    <>
      <Outlet/> 
      <SuccessMessage/>
      <ErrorMessage/>
    </>
  )
  
}
