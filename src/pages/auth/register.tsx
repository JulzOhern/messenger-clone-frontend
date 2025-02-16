import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    try {
      const response = await axiosClient.post(`/auth/register`, data);
      if (response.data?.error) {
        return toast.error("Oops...", {
          description: response.data.error,
        });
      }
      navigate("/auth/login");
    } catch (error: any) {
      console.log(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border shadow-md px-8 py-12 flex-1 max-w-[28rem] rounded-md bg-card dark:bg-card my-4">
      <div className="text-center mb-8">
        <h1 className="flex items-center justify-center gap-5 text-2xl font-semibold mb-3">
          <span className="flex-1 border-b mt-1" />
          Register
          <span className="flex-1 border-b mt-1" />
        </h1>
        <p className="text-sm text-zinc-500 ">Welcome to <span className="text-blue-500">Messenger</span>! Register to start connecting and chatting with people around the world.</p>
      </div>

      <div className="space-y-2 mb-3">
        <label htmlFor="username">Username</label>
        <input type="text" {...register("username")} id="username" className="w-full p-2 border rounded outline-blue-500 text-black" autoComplete='username' autoCapitalize='on' />
        <p className='text-red-500 text-sm'>{errors?.username?.message}</p>
      </div>

      <div className="space-y-2 mb-3">
        <label htmlFor="email">Email</label>
        <input type="email" {...register('email')} id="email" className="w-full p-2 border rounded outline-blue-500 text-black" autoComplete='email' />
        <p className='text-red-500 text-sm'>{errors?.email?.message}</p>
      </div>

      <div className="space-y-2 mb-3">
        <label htmlFor="password">Password</label>
        <input type="password" {...register('password')} id="password" className="w-full p-2 border rounded outline-blue-500 text-black" autoComplete='current-password' />
        <p className='text-red-500 text-sm'>{errors?.password?.message}</p>
      </div>

      <div className="mt-5">
        <button disabled={isSubmitting} className="w-full bg-blue-500 text-white p-2 rounded text-sm uppercase disabled:bg-opacity-25">
          {isSubmitting ? "Please wait..." : "Register"}
        </button>
      </div>

      <p className="text-center mt-5 text-sm">Already have an account? <Link to="/auth/login" className="text-blue-500">login</Link></p>
    </form>
  )
}
