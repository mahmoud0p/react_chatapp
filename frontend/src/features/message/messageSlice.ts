import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Message = {
    successMessage : string,
    errorMessage : string, 
}

const initialState : Message = {
    successMessage : '' , 
    errorMessage :''
}

export const messageSlice = createSlice({
    name:'message' , 
    initialState , 
    reducers:{
        setSuccMessage : (state , action:PayloadAction<string>)=>{
            state.successMessage = action.payload
        } , 
        setErrorMessage : (state , action:PayloadAction<string>)=>{
            state.errorMessage = action.payload
        } , 
    }
})

export const {setSuccMessage , setErrorMessage} = messageSlice.actions

export default messageSlice.reducer