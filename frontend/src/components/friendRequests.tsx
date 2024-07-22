import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
type Friend ={
    id:string,
    first_name :string ,
    last_name :string ,
    email :string, 
}
export const FriendRequests = ()=>{
    const [friendRequests ,setFriendRequests] = useState<Friend[] | null>(null)
    const [accepted ,setAccepted] = useState(false)
    const { isLoading , isError} = useQuery({
        queryKey:['friend_request'] , 
        queryFn:async()=>{
            const {data} = await axios.get("http://localhost:3000/api/get-friend-requests")
            setFriendRequests(data)
            return data
        }
    })
    const cancelMutation = useMutation({
        mutationFn:async(id:string)=>{
            const {data}  = await axios.delete(`http://localhost:3000/api/cancel-friend-request?friendId=${id}`)
            return data
        }

    })
    const acceptMutation = useMutation({
        mutationFn:async(friendData:any)=>{
            const {data} = await axios.put(`http://localhost:3000/api/accept-friend` , {friendId:friendData.id})
            return data
        } , 

    })
    if(isLoading){
        return <span className=" animate-pulse m-auto ">Loading...</span>
    }
    if(isError){
        return <span className=" text-error">Oops, our mistake error while loading friend requests, try again later.</span>
    }
    const handleAddingFriends = (friendId:string  )=>{
        setAccepted(true)
        acceptMutation.mutateAsync({id:friendId})
    }
    return (
        <div className="w-full grid grid-flow-row overflow-y-auto mt-1">
            {friendRequests&& friendRequests.map(f=>(
                <div key={f.id} className="w-[90%] mx-auto p-2 bg-base-300 gap-1 items-center rounded-box grid grid-flow-col">
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content w-8 rounded-full">
                            <span className="text-xs">{f.first_name[0]}{f.last_name[0]}</span>
                        </div>
                    </div>
                    <p className="text-nowrap text-ellipsis overflow-hidden text-sm">{f.first_name} {f.last_name}</p>
                    {accepted ? <p className="py-1 px-2 rounded-box text-success">Accepted</p>: <><button onClick={()=>handleAddingFriends(f.id)} className="btn-sm btn-success btn">Accept</button>
                    <button onClick={()=>{cancelMutation.mutateAsync(f.id)}} className="btn-sm btn text-error btn-ghost">Cancel</button></>}
                </div>
            ))}
        </div>
    )
}