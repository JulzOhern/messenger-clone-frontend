import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUserContext } from "@/providers/userProvider"
import { noProfile } from "@/utils/noProfile";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { axiosClient } from "@/lib/axiosClient";
import { toast } from "sonner";
import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
})

export function EditProfile() {
  const { user } = useUserContext();
  const { handleSubmit, register, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });
  const queryClient = useQueryClient();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await axiosClient.put("/edit-profile", {
        username: data.username,
        email: data.email
      });
      toast.success("Edited profile successfully");
      queryClient.invalidateQueries();
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async function handleLogout() {
    try {
      const resp = await axiosClient.post(`/auth/logout`);
      toast.success(resp.data.success);
      window.location.href = '/auth/login';
    } catch (error: any) {
      console.log(error.message)
    }
  }

  return (
    <>
      <DialogContent className="py-8">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            View and update your profile information, including your name, email, and profile picture.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-3">
          <div className="flex items-center justify-center">
            <img
              src={user?.profile || noProfile()}
              alt="Profile"
              className="rounded-full w-28 h-28 object-cover"
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 flex-1">
            <div className="space-y-1">
              <UploadButton
                endpoint="imageUploader"
                appearance={{
                  button: {
                    backgroundColor: 'transparent',
                    border: "1px solid #a3a3a3",
                    borderStyle: "dashed",
                    fontSize: "small",
                    color: "var(--text-primary)",
                  }
                }}
                onClientUploadComplete={async (res) => {
                  await axiosClient.put("/change-profile", {
                    url: res?.[0]?.url
                  });
                  queryClient.invalidateQueries();
                  toast.success("Change profile successfully");
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input type="text" {...register("username")} defaultValue={user?.username} id="username" />
              {errors.username?.message && <small className="text-red-500">{errors.username?.message}</small>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input type="email" {...register("email")} defaultValue={user?.email} id="email" />
              {errors.email?.message && <small className="text-red-500">{errors.email?.message}</small>}
            </div>

            <div className="space-y-3">
              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-600/70 text-white"
              >
                Save changes
              </Button>
              <Button
                onClick={handleLogout}
                type="button"
                variant="destructive"
                className="text-white w-full"
              >
                Logout
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </>
  )
}
