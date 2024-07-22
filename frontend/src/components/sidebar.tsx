import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../app/store"
import { HiDotsVertical } from "react-icons/hi";
import { Switcher } from "./themeSwitcher";
import { deleteUser, User } from "../features/user/userSlice";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";
import { CiSearch } from "react-icons/ci";
import { Dispatch, FormEvent,  SetStateAction,  useEffect,  useState } from "react";
import { socket } from "../routes/index.lazy";
import { setSuccMessage } from "../features/message/messageSlice";
import { OutsideClick } from "../clickOutside";
import { FriendRequests } from "./friendRequests";
import {Chats} from "./friends";
import { Image } from "@unpic/react";
export default function Sidebar({setClick , click}:{setClick:Dispatch<SetStateAction<boolean>> , click:boolean}){
    const user = useSelector((state:RootState)=>state.user.user)
    const [query , setQuery] = useState('')
    const [inputFocus , setInputFocus] = useState(false)
    const [searchResult ,setSearchResult] = useState<{id:string ,first_name :string, last_name:string, email:string , image:string} | null>(null)
    const [activeTab , setActiveTab] = useState('chats')
    const searchMutation= useMutation({
        mutationFn:async()=>{
            const {data} = await axios.get(`http://localhost:3000/api/find-user?query=${query}`)
            setOpenSearch(true)
            return data
        } , 
        onSuccess:(data)=>{
            setSearchResult(data)
        }
        
    })
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const logoutMutation = useMutation<User>({
        mutationFn:async()=>{
          axios.defaults.withCredentials = true
          const {data} = await axios.post('http://localhost:3000/api/logout')
          return data
        }
        ,onSuccess:()=>{
          navigate({to:'/login'})
        }
      })
      const handleLogout=()=>{
        dispatch(deleteUser())
        logoutMutation.mutateAsync()
      }
      const settingQuery = (e:FormEvent<HTMLInputElement>)=>{
        const value= e.currentTarget.value ; 
        setQuery(value)
      }
      const handleSendingFriendReq = (id:string)=>{
        if(!user?.id){
            return console.log(user?.id)
        }
        console.log(user?.id)
        socket.emit('send_friend_request'  ,({from :user?.id ,to:id }))
      }
      useEffect(() => {
        if (user?.id) {
          socket.emit('user_register', user.id);
        }
      
        socket.on('recieve_friend_request', () => {
          dispatch(setSuccMessage(`You received a new friend request`));
        });

      }, [user, dispatch , socket]);
      const [openSearch , setOpenSearch] = useState(false)
      const ref = OutsideClick(()=>{
        if(!inputFocus){
            setOpenSearch(false)
        }
      })
      const handleSettingTabs = (value:string)=>{
        setActiveTab(value)
      }
      
    return (
        <div className="lg:w-96 w-full h-screen overflow-x-hidden overflow-visible overflow-y-auto flex flex-col bg-base-200 border-base-200 border-r">
            <div className="h-16 w-full bg-base-300 gap-1 relative flex items-center px-3">
                <div className="avatar online placeholder">
                    <div className="bg-neutral text-neutral-content w-12 h-12 rounded-full">
                        {user?.image ? <Image width={12*0.25*16} height={12*0.25*16} src={user.image}/>:<span >{user?.first_name[0]}{user?.last_name[0]}</span>}
                    </div>
                </div>
                <p className="text-sm capitalize">{user?.first_name} {user?.last_name}</p>
                <div className="dropdown overflow-visible dropdown-end absolute right-3">
                    <button tabIndex={0} className=" btn-sm btn btn-circle btn-ghost  box-border"><HiDotsVertical className="w-full h-full p-1" /></button>
                    <ul tabIndex={0} className="dropdown-content overflow-visible menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        <li className="flex relative px-3 py-2">Theme <Switcher/></li>
                        <li onClick={()=>{navigate({to:'/settings'})}} className="w-full px-3 py-2 cursor-pointer hover:bg-primary hover:text-primary-content rounded-lg">Settings</li>
                        <li className="text-error cursor-pointer px-3 hover:bg-error hover:text-error-content py-2 rounded-lg" onClick={handleLogout}>logout</li>
                    </ul>
                </div>
            </div>
            
            <form className="flex w-full px-5 items-center justify-center my-3 relative" onSubmit={(e)=>{
                e.preventDefault()
                e.isPropagationStopped()
                searchMutation.mutateAsync()
            }}>
                <input onFocus={()=>{
                    setInputFocus(true)
                    if(query.length>0){
                        setOpenSearch(true)
                    }
                }} 
                onBlur={()=>{
                    setInputFocus(false)
                }}
                 type="text" value={query} onChange={settingQuery}  placeholder="search using username or email.. " className="h-7  rounded-lg outline-none pl-3 text-sm w-full pr-9"/> 
                <CiSearch  onClick={()=>{
                    searchMutation.mutateAsync()
                }} className=" cursor-pointer btn-sm btn-ghost btn-circle absolute right-5"/>
                {openSearch && <div ref={ref} className="w-full z-[1600] flex flex-col mt-1 absolute top-full left-0">
                {searchResult  ?<div ref={ref} className="flex  gap-1 items-center w-full px-5  ">
                    <div className="w-full bg-base-300 flex items-center gap-5 p-3 rounded-box shadow-md">
                        <div className="avatar  placeholder items-center flex gap-1">
                            <div className="bg-neutral text-neutral-content w-9 h-9 rounded-full">
                                {searchResult?.image ? <Image src={searchResult.image} width={9*16*0.25} height={9*16*0.25}/>:<span >{searchResult?.first_name[0]}{searchResult?.last_name[0]}</span>}
                            </div>

                            <p className="text-sm capitalize">{searchResult?.first_name} {searchResult?.last_name}</p>
                        </div>
                            {searchResult?.id !== user?.id ? <button onClick={()=>{handleSendingFriendReq(searchResult?.id || '')}} className="btn text-sm btn-primary btn-sm">Add friend</button>:<p className="bg-base-100 px-3 py-1 rounded-box">You.</p>}

                    </div>
                </div> : 
                <div className="px-5 bg-base-300 p-4 rounded-box">
                    No Results
                </div>
                }
            </div>}
            </form>
            <div role="tablist" className="tabs tabs-lifted mt-1 w-full">
                <button role="tab" onClick={()=>handleSettingTabs('chats')} className={`tab ${activeTab==="chats" && 'tab-active'}`}>Chats</button>
                <button role="tab" onClick={()=>handleSettingTabs("request")}  className={`tab ${activeTab==="request" && 'tab-active'}`}>Requests</button>
            </div>
            {activeTab==='request'&& <FriendRequests/>}
            {activeTab==='chats' && <Chats click={click} setClick={setClick}/>}
        </div>
    )
}