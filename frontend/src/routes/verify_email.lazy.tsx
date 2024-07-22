import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { setUser } from '../features/user/userSlice';

export const Route = createLazyFileRoute('/verify_email')({
  component: Component,
});

function Component() {
  const user = useSelector((state:RootState)=>state.user.user)
  const { emailToken }: any = Route.useSearch();
  const [counter, setCounter] = useState<number>(6);
  const dispatch = useDispatch()
  const { isLoading, isError } = useQuery({
    queryKey: ['verify'],
    queryFn: async () => {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(`http://localhost:3000/api/verify_email`, { emailToken:emailToken.toString() });
      dispatch(setUser({...user! , verified:true}))
      return data;
    },
    retry: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if(!isLoading){
      const timer = setTimeout(() => {
        navigate({ to: '/' });
      }, 7000);
      return () => clearTimeout(timer);
    }
    console.log(emailToken)
  }, [navigate , isLoading]);

  useEffect(() => {
    if(!isLoading){
      const counterTimer = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);

      return () => clearInterval(counterTimer);
    }

  }, [isLoading]);

  if (isLoading ) {
    return (
      <span className="loading loading-spinner loading-lg absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2"></span>
    );
  }

  if (isError ) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="card bg-error w-1/2 h-72 text-black p-4 flex flex-col items-center justify-center">
          <h1 className="text-3xl card-title text-error-content text-md flex">Error</h1>
          <p className="text-success-content card-body">Error in verifying your email</p>
          <span>
            You will be redirected automatically to home page after...
            <span className="countdown">
              {/* @ts-ignore */}
              <span style={{ "--value": counter }}></span>
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="card bg-success w-1/2 h-72 text-black p-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl card-title text-success-content text-md flex">Verified</h1>
        <p className="text-success-content card-body">Your email verified successfully</p>
        <span>
            You will be redirected automatically to home page after...
            <span className="countdown">
              {/* @ts-ignore */}
              <span style={{ "--value": counter }}></span>
            </span>
          </span>
      </div>
    </div>
  );
}

export default Component;
