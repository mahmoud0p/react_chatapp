import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserToChat } from "../features/chatting/ChattingSlice";
import { useNavigate } from "@tanstack/react-router";
import { RootState } from "../app/store";
import { socket } from "../routes/index.lazy";
import { Image } from "@unpic/react";

type Chats = {
    id: string;
    blocked :boolean ,
    user: {
        id: string;
        first_name: string;
        last_name: string;
        user_name: string;
        username: string;
        email: string;
        image:{url:string}
    };
    message: { content: string; id: string; sender: { id: string; first_name: string } , status:string } | null;
};

export const Chats = ({setClick }:{setClick:Dispatch<SetStateAction<boolean>> , click:boolean}) => {
    const [chats, setChats] = useState<Chats[] | null>(null);
    const [chatId , setChatId] = useState('')
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/api/get-chats');
            setChats(data);
            return data;
        }
    });
    
    useEffect(() => {    
        socket.on("receive_Notifications", () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });
    }, [socket]);

    const openChat = (data: Chats) => {
        dispatch(setUserToChat(data.user));
        navigate({ search: { chatId: data.id } });
    };
    const handleOnClick =(c:any)=>{
        setClick(true)
        setChatId(c.id)
        socket.emit('leave_room' , chatId)
        openChat(c);
    }

    if (isLoading) { 
        return <span className="animate-pulse">Loading..</span>;
    }

    if (isError) {
        return <p>Error ...</p>;
    }

    return (
        <div className="w-full grid grid-flow-row overflow-y-auto">
            {chats && chats.length > 0 && chats.map(c => (
                <div key={c.id} onClick={() => {
                    if(!c.blocked){
                        handleOnClick(c) 
                    }
                     }} role="button"  className={`w-full h-full even:border-t border-base-300 flex ${c.blocked ? "cursor-not-allowed" : "cursor-pointer"} transition-all duration-200  items-center gap-3 px-3  hover:bg-base-100  py-3 relative`}>
                    <div className="avatar placeholder  rounded-full">
                        <div className="bg-neutral text-neutral-content w-12 rounded-full">
                            {c.user.image? <Image src={c.user.image.url} alt="friend chat" width={12*16*0.25} height={12*16*0.25}/>:<span className="text-xl">{c.user.first_name[0]}{c.user.last_name[0]}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="capitalize">{c.user.first_name} {c.user.last_name}</p>
                        {c.message ?
                            <p className="opacity-50 text-sm text-nowrap text-ellipsis overflow-hidden">{c.message.sender.id === user?.id ? "You:" : c.message.sender.first_name + ":"} {c.message.content}</p>
                            :
                            <p className="text-xs text-primary">Start chatting with {c.user.first_name}</p>
                        }
                    </div>
                    {c?.message?.status === "Delivered" && c.message.sender.id!==user?.id && <div className=" badge-secondary badge absolute top-1/2 right-1 -translate-y-1/2">unread</div>}
                </div>
            ))}
        </div>
    );
}; 
