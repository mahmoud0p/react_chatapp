import { BiArrowBack, BiSolidSend } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import { setMessages } from "../features/chatting/ChattingSlice";
import { socket } from "../routes/index.lazy";
import { useSearch } from "@tanstack/react-router";
import { keepPreviousData, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import _ from "lodash"
import axios from "axios";
import { Image } from "@unpic/react";
import {  HiDotsHorizontal } from "react-icons/hi";
type Message = {
    messageId: string;
    sender_id: string;
    content: string;
    status :'Delivered' | "Seen"
};

export default function Chat({setClick} :{setClick:Dispatch<SetStateAction<boolean>>}) {
    const userToChat = useSelector((state: RootState) => state.chat.userToChat);
    const user = useSelector((state: RootState) => state.user.user);
    const messages = useSelector((state: RootState) => state.chat.messages);
    const [isBlocked , setIsBlocked] = useState(false)
    const chatId = useSearch({ from: "/", select: (search: any) => search.chatId });
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMessageIndicator, setNewMessageIndicator] = useState(false);
    const chatContainer = useRef<HTMLDivElement>(null);
    const blockMutation = useMutation({
        mutationFn:async()=>{
            const {data} = await axios.post("http://localhost:3000/api/add-block" , {user_to_block : userToChat?.id})
            return data
        }
    })
    const {isLoading ,  isError, fetchNextPage } = useInfiniteQuery({
        queryKey: ['messages', chatId],
        queryFn: async ({ pageParam }) => {
            const { data } = await axios.get(`http://localhost:3000/api/get-messages?chat_id=${chatId}&page=${pageParam}`);
            dispatch(setMessages(data.messages))
            setIsBlocked(data.blocked)
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: ( page) => page.length + 1,
        placeholderData: keepPreviousData,
        enabled:!!chatId
    });
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim() === '') return;
        setMessage('');
        if (userToChat && user) {
            socket.emit('send_message', { to: userToChat.id, from: user.id, content: message, chat_id: chatId });
        }
    };

    const changeMessage = (e: FormEvent<HTMLInputElement>) => {
        setMessage(e.currentTarget.value);
    };
    const seeMessage = ()=>{
        const updatedMessages:Message[] = _.map(messages , (m)=>({
            ...m,
            status:'Seen'
        }))
        dispatch(setMessages(updatedMessages))
    }
    useEffect(() => {
        
        const handleReceiveMessage = (data: Message) => {
                dispatch(setMessages([...messages, {content:data.content ,messageId:data.messageId , status : data.status ,sender_id:data.sender_id}]));
                if (isAtBottom) {
                    chatContainer.current?.scrollTo({ top: chatContainer.current.scrollHeight });
                } else {
                    setNewMessageIndicator(true);
                }
            
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("see_message",  seeMessage)

        return ()=>{
            socket.off("receive_message" , handleReceiveMessage)
            socket.off("see_message" , seeMessage)
        }
    }, [chatId, dispatch, messages, isAtBottom ,socket]);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        if (!isLoading && !hasScrolled) {
            chatContainer.current?.scrollTo({ top: chatContainer.current.scrollHeight });
            setHasScrolled(true);
        }
    }, [isLoading, hasScrolled]);
    
    useEffect(() => {
        if (chatId ) {
            socket.emit('join_chat', {chat_id :chatId , user_id : user?.id});
        }

    }, [chatId]);

    const handleScroll = () => {
        if (chatContainer.current) {
            const isUserAtBottom = chatContainer.current.scrollHeight - chatContainer.current.scrollTop === chatContainer.current.clientHeight;
            setIsAtBottom(isUserAtBottom);
            if (chatContainer.current.scrollTop === 0 && !isLoading) {
                fetchNextPage();
            }
        }
    };

    useEffect(() => {
        if (isAtBottom) {
            chatContainer.current?.scrollTo({ top: chatContainer.current.scrollHeight });
        }
    }, [messages, isAtBottom]);

    if (isLoading) return (
        <div className="flex-1 flex-col flex max-h-screen overflow-hidden ">
            <div className="bg-base-300 skeleton rounded-none w-full min-h-16"></div>
            <div  className=" flex-1 border-base-300  overflow-y-auto scroll-container relative w-full" >
                {Array(2).fill(null).map((_ , i )=>(
                    <div key={i} className=" chat odd:chat-start even:chat-end">
                        <div className=" chat-bubble skeleton w-52">
                        
                        </div>
                    </div>
                ))}
                
            </div>
            <form onSubmit={(e)=>e.preventDefault()} className="w-full min-h-20 bg-base-300 gap-3 flex items-center px-3 box-border justify-center relative">
                {newMessageIndicator && (
                    <div className="absolute badge badge-secondary bottom-full mb-3 cursor-pointer badge-lg right-1/2 translate-x-1/2 z-[1600]" onClick={() => chatContainer.current?.scrollTo({ top: chatContainer.current.scrollHeight })}>
                        New messages
                    </div>
                )}
                <input value={message} type="text" onChange={changeMessage} name="message" autoComplete="off" className="w-[90%] rounded-lg h-12 flex outline-none text-sm pl-3 box-border" placeholder="Message..." />
                <button type="submit" className="btn btn-circle btn-neutral flex items-center justify-center tooltip" data-tip="Click to send">
                    <BiSolidSend className="w-7 h-7 p-1" />
                </button>
            </form>
        </div>
        
    );
    if (isError) return <span>Error loading messages...</span>;

    return (
        <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
            <div className="min-h-16 w-full bg-base-300 relative flex items-center px-5 gap-1">
                <BiArrowBack className="btn btn-sm p-1  btn-ghost btn-circle text-primary" onClick={()=>{setClick(false)
                    socket.emit('leave_room' , chatId)
                }}/>
                <div className="avatar placeholder ml-3">
                    <div className="bg-neutral text-neutral-content lg:w-14 w-12 rounded-full">
                        {userToChat?.image?<Image width={14*16*0.25} height={14*16*0.25} src={userToChat.image.url} alt='user to chat image'/>:<span className="text-lg">{userToChat?.first_name[0]}{userToChat?.last_name[0]}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-1 justify-start">
                    <p className="lg:text-xl text-sm">{userToChat?.first_name} {userToChat?.last_name}</p>
                </div>
                <div className="absolute right-5 top-0 h-full flex items-center">
                    <div className="dropdown overflow-visible dropdown-end  h-max">
                        <button tabIndex={0} className=" btn-sm btn btn-circle btn-ghost p-1 m-auto box-border"><HiDotsHorizontal className="w-full h-full " /></button>
                        <ul tabIndex={0} className="dropdown-content overflow-visible menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow">
                            <li onClick={()=>{
                                setIsBlocked(true)
                                blockMutation.mutateAsync()}} className="text-error cursor-pointer px-3 hover:bg-error hover:text-error-content py-2 rounded-lg" >Block </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div ref={chatContainer} className="w-full flex-1 border-base-300 border overflow-y-auto scroll-container relative" onScroll={handleScroll}>
                {messages && messages.map((m , i) => (
                    <div key={i} className={`chat ${m.sender_id === user?.id ? "chat-end" : "chat-start"}`}>
                        <div className="chat-header opacity-50 text-xs">
                            {m.sender_id === user?.id ? "You" : userToChat?.first_name}
                        </div>
                        <div className="chat-bubble   lg:text-lg text-sm">{m.content}</div>
                        {m.sender_id ===user?.id && <div className="chat-footer opacity-50">{ m.status}</div>}
                    </div>
                ))}
            </div>
            {isBlocked ? <div className="w-full min-h-20 bg-base-300 flex items-center justify-center ">
                <p>this contact is Blocked</p>
            </div> :<form onSubmit={handleSubmit} className="w-full min-h-20 bg-base-300 gap-3 flex items-center px-3 box-border justify-center relative">
                {newMessageIndicator && (
                    <div className="absolute badge badge-secondary bottom-full mb-3 cursor-pointer badge-lg right-1/2 translate-x-1/2 z-[1600]" onClick={() => chatContainer.current?.scrollTo({ top: chatContainer.current.scrollHeight })}>
                        New messages
                    </div>
                )}
                <input value={message} type="text" onChange={changeMessage} name="message" autoComplete="off" className="w-[90%] rounded-lg h-12 flex outline-none text-sm pl-3 box-border" placeholder="Message..." />
                <button type="submit" className="btn btn-circle btn-neutral flex items-center justify-center tooltip" data-tip="Click to send">
                    <BiSolidSend className="w-7 h-7 p-1" />
                </button>
            </form>}
        </div>
    );
}
