import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import axios from 'axios'
import { FieldApi, useForm } from '@tanstack/react-form'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../features/user/userSlice'
import { setErrorMessage, setSuccMessage } from '../features/message/messageSlice'
import { RootState } from '../app/store'
import { useEffect } from 'react'
export const Route = createLazyFileRoute('/login')({
  component: Login
})
function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <div className='mt-1 text-sm max-w-1/2'>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className=' text-error'>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? <em className=' text-success text-sm'>Validating...</em>  : null}
    </div>
  )
}
function Login(){
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state:RootState)=>state.user.user)
  const mutation = useMutation({
    mutationFn:async(value:any)=>{
      axios.defaults.withCredentials =true
      const {data} = await axios.post(`http://localhost:3000/api/login` , value)
      return data
    } , 
    onSuccess:(data)=>{
      dispatch(setUser(data.user))
      dispatch(setSuccMessage('User logged in successfuly'))
      queryClient.invalidateQueries({queryKey:['user']})
      navigate({to : "/"})
    } , 
    onError:(err:any)=>{
      dispatch(setErrorMessage(err.response.data.error || "Invalid email or password!"))
      console.log(err.message)
    }
  })
  const form = useForm({
    defaultValues :{
      input : '' , 
      password :''
    } , 
    onSubmit:async({value})=>{
      mutation.mutateAsync(value)
    }
  })
  useEffect(()=>{
    if(user && !mutation.isSuccess){
      router.history.back()
    }
  }  , [user , mutation.isSuccess])
  if(user) return <span>Not allowed</span>
  if(!user) return(
    <div className='w-full h-screen'>
        <div className="hero bg-base-200 min-h-screen">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold">Login now!</h1>
              <p className="py-6">
                Welcome to my Real time chat app are you ready to start chatting with different people from different countries
              </p>
            </div>
            <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
              <form onSubmit={(e)=>{
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }} className="card-body">
                <div className="form-control">
                  <form.Field
                    name="input"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'email or username is required'
                          : undefined,
                      onChangeAsyncDebounceMs: 500,
                      onChangeAsync: async ({ value }) => {
                        await new Promise((resolve) => setTimeout(resolve, 1000))
                        return (
                          value.includes('error') &&
                          'No "error" allowed in first name'
                        )
                      },
                    }}
                    children={(field) => {
                      return (
                        <>
                          <label className="label">
                            <span className="label-text">Email or Username</span>
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="text" 
                            placeholder="email or username" 
                            className="input input-bordered"
                          />
                          <FieldInfo field={field} />
                        </>
                    )
                  }}
                />
                </div>
                <div className="form-control">
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'password is required'
                          : undefined,
                      onChangeAsyncDebounceMs: 500,
                      onChangeAsync: async ({ value }) => {
                        await new Promise((resolve) => setTimeout(resolve, 1000))
                        return (
                          value.includes('error') &&
                          'No "error" allowed in first name'
                        )
                      },
                    }}
                    children={(field) => {
                      return (
                        <>
                          <label className="label">
                            <span className="label-text">Password</span>
                          </label>
                  
                          <input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="password" 
                            placeholder="password" 
                            className="input input-bordered"
                          />
                          <FieldInfo field={field} />
                          <label className="label">
                            <Link hash="#" className="label-text-alt link link-hover">Forgot password?</Link>
                          </label>
                        </>
                    )
                  }}
                />
                </div>
                <div className="form-control">
                  
                  
                </div>
                <div className="form-control mt-6">
                  <form.Subscribe
                      selector={(state) => [state.canSubmit, state.isSubmitting]}
                      children={([canSubmit, isSubmitting]) => (
                        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                          {isSubmitting ? <span className="loading loading-spinner loading-sm"></span>: 'Submit'}
                        </button>
                      )}
                    />
                    <Link to='/signup' className="label-text-alt link link-hover mx-auto mt-1">You don't have an account yet!</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
    </div>
  )
}