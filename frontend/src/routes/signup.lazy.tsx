import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import axios from 'axios'
import { FieldApi, useForm } from '@tanstack/react-form'
import validator from 'validator'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../features/user/userSlice'
import { setErrorMessage, setSuccMessage } from '../features/message/messageSlice'
import { RootState } from '../app/store'
import { useEffect } from 'react'
export const Route = createLazyFileRoute('/signup')({
  component: Signup
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
function Signup(){
  const navigate = useNavigate({from : "/login"})
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state:RootState)=>state.user.user)
  const {data:usernames , isLoading:loadingUsernames}= useQuery({
    queryKey:['usernames'] , 
    queryFn:async()=>{
      const {data} = await axios.get('http://localhost:3000/api/get-usernames')
      return data
    } , 
    retry:false
  }) 
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn:async(value:any)=>{
      axios.defaults.withCredentials =true
      const {data} = await axios.post(`http://localhost:3000/api/user` , value)
      dispatch(setUser(data.user))
      return data
    } , 
    onSuccess:()=>{
      dispatch(setSuccMessage('User signed up successfuly'))
      queryClient.invalidateQueries({queryKey:['user']})
      navigate({to : "/"})
    } , 
    onError:(err:any)=>{
      dispatch(setErrorMessage(err.response.data.error || "An error occured while signing you up"))
      console.log(err.message)
    }
  })
  const form = useForm({
    defaultValues :{
      email : '' , 
      password :'' , 
      first_name :'' , 
      last_name : '' ,
      username : '' , 
      passwordConfirmation:'' ,
    } , 
    onSubmit:async({value})=>{
      mutation.mutateAsync(value)
    }
  })
  useEffect(()=>{
    if(user && !mutation.isSuccess){
      router.history.push('/')
    }
  }  , [user , mutation.isSuccess])
  if (loadingUsernames) {
    return (
      <span className="loading loading-spinner loading-lg absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2"></span>
    )
  } 
  if(user) return <span>Not allowed</span>
  if(!user) return(
    <div className='w-full h-screen'>
        <div className="hero bg-base-200 min-h-screen">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold">Signup now!</h1>
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
                {/* first name field */}
                <div className="form-control">
                  <form.Field
                    name="first_name"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'first name is required'
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
                            <span className="label-text">First Name</span>
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="text" 
                            placeholder="first name" 
                            className="input input-bordered"
                          />
                          <FieldInfo field={field} />
                        </>
                    )
                  }}
                />
                  {/* last name field */}
                    <form.Field
                      name="last_name"
                      validators={{
                        onChange: ({ value }) =>
                          !value
                            ? 'last name is required'

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
                              <span className="label-text">Last Name</span>
                            </label>
                            <input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              type="text" 
                              placeholder="last name" 
                              className="input input-bordered"
                            />
                            <FieldInfo field={field} />
                          </>
                      )
                    }}
                  />
                </div>
                {/* username field */}
                <div className="form-control">
                  <form.Field
                    name="username"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'username is required' :
                            usernames.includes(value) ?
                            "username is already taken!"
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
                            <span className="label-text">username</span>
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="text" 
                            placeholder="username" 
                            className="input input-bordered"
                          />
                          <FieldInfo field={field} />
                        </>
                    )
                  }}
                />
                </div>
                {/* email field */}
                <div className="form-control">
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'email is required'
                          :  !validator.isEmail(value)
                            ? 'Invalid email form'
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
                            <span className="label-text">Email</span>
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="email" 
                            placeholder="email" 
                            className="input input-bordered"
                          />
                          <FieldInfo field={field} />
                        </>
                    )
                  }}
                />
                </div>
                {/* password field */}
                <div className="form-control">
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'password is required':
                          !validator.isStrongPassword(value) ? 
                          'Your password is Not strong enough'
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
                        </>
                    )
                  }}
                />
                </div>
                <div className="form-control">
                  <form.Field
                    name="passwordConfirmation"
                    validators={{
                      onChange: ({ value}) =>
                        !value
                          ? 'password confirmations is required':
                          value !==  form.getFieldValue('password')?
                          'password confirmation does not match password'
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
                            <span className="label-text">Password Confirmation</span>
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
                        </>
                    )
                  }}
                />
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
                    <Link to='/login' className="label-text-alt link link-hover mx-auto mt-1">already have account!</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
    </div>
  )
}