import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type userToChatType = {
    id: string;
    first_name: string;
    last_name: string;
    user_name: string;
    username: string;
    email: string;
    image : {url:string}
};

type Message = {
    messageId: string;
    sender_id: string;
    content: string;
    status: 'Delivered' | 'Seen';
};

type Request = {
    id: string;
    first_name: string;
    last_name: string;
};

type Chat = {
    userToChat: userToChatType | null;
    messages: Message[];
    requests: Request[];
};

const initialState: Chat = {
    userToChat: null,
    messages: [],
    requests: [],
};

const ChatSlice = createSlice({
    name: 'chatRoom',
    initialState,
    reducers: {
        setUserToChat: (state, action: PayloadAction<userToChatType>) => {
            state.userToChat = action.payload;
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        setRequests: (state, action: PayloadAction<Request[]>) => {
            state.requests = action.payload;
        }
    }
});

export const { setUserToChat, setMessages, setRequests } = ChatSlice.actions;
export default ChatSlice.reducer;
