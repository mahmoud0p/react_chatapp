import { useMutation, useQuery } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { FormEvent, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setErrorMessage, setSuccMessage } from '../../features/message/messageSlice';
import { Image } from "@unpic/react";
import _ from "lodash";
import { BiArrowBack } from 'react-icons/bi';

export const Route = createLazyFileRoute('/settings/edit')({
  component: Edit
});

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
};

type Errors = {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
};

function Edit() {
  const dispatch = useDispatch();
  const imageRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [formState, setFormState] = useState<Form>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const handleUploadingImage = (e: FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      setImage(files[0]);
    }
  };

  const { isLoading, isError } = useQuery({
    queryKey: ['user_to_update'],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:3000/api/auth");
      setFormState({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.username,
      });
      return data;
    },

  });
  const router = useRouter()
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log(formData.get('first_name'))
      const { data } = await axios.put("http://localhost:3000/api/user-update", formData, {
        headers: {
          'Content-Type': "multipart/form-data"
        }
      });
      return data;
    },
    onSuccess: () => {
      dispatch(setSuccMessage('Your information was updated successfully.'));
    },
    onError: (err: any) => {
      dispatch(setErrorMessage(err?.response?.data?.error || 'An error occurred while updating your information.'));
    }
  });

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget;
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { first_name, last_name, email, username } = formState;
    const newErrors: Errors = {};

    if (!first_name) newErrors.first_name = "First name is required";
    if (!last_name) newErrors.last_name = "Last name is required";
    if (!email) newErrors.email = "Email is required";
    if (!username) newErrors.username = "Username is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      dispatch(setErrorMessage('First name, last name, email, or username cannot be empty'));
      return;
    }

    const formData = new FormData();
    _.each(formState, (value, key) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    if (image) {
      formData.append('image', image);
    }

    mutation.mutate(formData);
  };

  if (isLoading) return <span className="loading loading-spinner loading-lg"></span>;
  if (isError) return <span className='text-error'>Oops, our mistake</span>;

  return (
    <div className='w-full h-screen p-4'>
      <div className='flex w-full justify-center gap-2'>
        <button onClick={()=>{router.history.back()}} className='btn '><BiArrowBack/></button>
        <h1 className='md:text-5xl sm:text-2xl text-xl mx-auto w-max'>Update Your Information</h1>
      </div>
      <form encType={'multipart/form-data'} onSubmit={onSubmit} className='w-full mt-5 bg-base-300 flex flex-col gap-9 p-4 rounded-box'>
        {image && (
          <div className="avatar">
            <div className="w-32 rounded-full">
              <Image height={32 * 16 * 0.25} width={32 * 16 * 0.25} src={URL.createObjectURL(image)} />
            </div>
            <button onClick={() => {
              setImage(null);
              if (imageRef.current) {
                imageRef.current.value = '';
              }
            }} className='btn btn-error btn-sm my-auto ml-5'>Delete</button>
          </div>
        )}
        <label className='font-bold text-lg'>
          Upload your image
          <input accept='image/*' ref={imageRef} onChange={handleUploadingImage} type="file" className='file-input-bordered file-input text-lg font-normal w-full' />
        </label>
        <label className='w-full font-bold text-lg'>
          Username
          <input onChange={handleChange} name='username' value={formState.username} type="text" placeholder='username...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
          {errors.username && <p className='text-error text-sm mt-2'>{errors.username}</p>}
        </label>
        <label className='w-full font-bold text-lg'>
          First Name
          <input onChange={handleChange} name='first_name' value={formState.first_name} type="text" placeholder='first name...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
          {errors.first_name && <p className='text-error text-sm mt-2'>{errors.first_name}</p>}
        </label>
        <label className='w-full font-bold text-lg'>
          Last Name
          <input onChange={handleChange} name='last_name' value={formState.last_name} type="text" placeholder='last name...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
          {errors.last_name && <p className='text-error text-sm mt-2'>{errors.last_name}</p>}
        </label>
        <label className='w-full font-bold text-lg'>
          Email
          <input onChange={handleChange} name="email" value={formState.email} type="email" placeholder='email...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
          {errors.email && <p className='text-error text-sm mt-2'>{errors.email}</p>}
        </label>
        <h3 className='text-3xl mt-5'>Change Your Password</h3>
        <label className='w-full font-bold text-lg'>
          Current Password
          <input type="password" placeholder='current password...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
        </label>
        <label className='w-full font-bold text-lg'>
          New Password
          <input type="password" placeholder='new password...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
        </label>
        <label className='w-full font-bold text-lg'>
          Confirm Password
          <input type="password" placeholder='new password confirmations...' className='input w-full input-bordered sm:text-lg text-md font-normal' />
        </label>
        <button type='submit' className='btn w-full btn-primary'>Save</button>
      </form>
    </div>
  );
}

export default Edit;
