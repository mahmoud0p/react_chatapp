import { configureStore } from '@reduxjs/toolkit'
import userReducer from "../features/user/userSlice"
import messageReducer from "../features/message/messageSlice"
import { setupListeners } from '@reduxjs/toolkit/query'
import chatReducer from "../features/chatting/ChattingSlice"
export const store = configureStore({
  reducer: {
    user :userReducer ,
    message : messageReducer , 
    chat:chatReducer , 
  },

})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch