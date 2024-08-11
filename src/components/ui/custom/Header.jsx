import React, { useEffect, useState } from 'react'
import { Button } from '../button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useNavigation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';


function Header() {

  const user = JSON.parse(localStorage.getItem('user'));
  const [openDailog, setOpenDailog] = useState(false);
  useEffect(() => {
    console.log(user)
  }, [])

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.log(error)
  })
  
  const GetUserProfile = (tokenInfo) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenInfo.access_token}`,
          Accept: 'application/json',
        },
      })
      .then((resp) => {
        console.log(resp.data); // Log the user data
        // Store user data in localStorage or update state
        localStorage.setItem('user', JSON.stringify(resp.data)); // Example of storing user data
        setOpenDailog(false); // Close dialog after successful login
        window.location.reload()
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
      <img src='/logo.svg' />
      <div>
        {user ?
          <div className='flex items-center gap-3'>
            <a href='/create-trip'>
            <Button variant="outline" className="rounded-full">+ Create Trips</Button>
            </a>
            <a href='/my-trips'>
            <Button variant="outline" className="rounded-full">My Trips</Button>
            </a>
            <Popover>
            <PopoverTrigger>
            <img src={user?.picture} className='h-[35px] w-[35px] rounded-full'/>
            </PopoverTrigger>
            <PopoverContent>
              <h2 className='cursor-pointer' onClick={()=>{
                googleLogout();
                localStorage.clear();
                window.location.reload();
              }}>Logout</h2>
            </PopoverContent>
          </Popover>
          </div>
          :
          <Button onClick={()=>setOpenDailog(true)}>Sign In</Button>
        }
      </div>
      <Dialog open={openDailog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              <img src="logo.svg" alt="Logo" />
              <h2 className='font-bold text-lg mt-7'>Sign In With Google</h2>
              <p>Sign in to the app with Google Authentication securely.</p>
              <Button
                onClick={login}
                className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className='h-7 w-7' />Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Header