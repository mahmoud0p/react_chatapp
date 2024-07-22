import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type User = {
  first_name: string;
  last_name: string;
  email: string;
  id: string;
  role: string;
  verified : boolean ; 
  image : string  | null ;
} | null;

export type UserState = {
  user: User;

}

const initialState: UserState = {
  user: null,
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => ({url:'/auth' , credentials:'include'}),

    }), 
  }),
});

export const useGetUserQuery: typeof userApi.useGetUserQuery = userApi.useGetUserQuery;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    deleteUser: (state) => {
      state.user = null;
    },
    editUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setUser, deleteUser, editUser } = userSlice.actions;

export default userSlice.reducer;
