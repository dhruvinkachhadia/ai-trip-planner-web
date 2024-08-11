import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AI_PROMPT, SelectBudgetOptions, SelectTravelsList } from '@/constants/options';
import { chatSession } from '@/service/AIModal';
import React, { useEffect, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { toast } from 'sonner';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [place, setPlace] = useState();
  const [openDailog, setOpenDailog] = useState(false);
  const [formData, setFormData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

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
        OnGenerateTrip(); // Proceed to generate the trip
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log(codeResp); // Log token details
      GetUserProfile(codeResp); // Fetch user profile data
    },
    onError: (error) => console.log(error),
  });

  const OnGenerateTrip = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      setOpenDailog(true);
      return;
    }

    if (!formData?.noOfDays || !formData?.location || !formData?.budget || !formData?.traveler) {
      toast("Please fill all the details");
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData?.location?.label)
      .replace('{totalDays}', formData?.noOfDays)
      .replace('{traveler}', formData?.traveler)
      .replace('{budget}', formData?.budget)
      .replace('{totalDays}', formData?.noOfDays);

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripData = await result?.response?.text();
      console.log("--", tripData);

      const docId = Date.now().toString(); // Define docId here
      await SaveAiTrip(tripData, user, docId); // Pass docId as an argument
    } catch (error) {
      console.error("Error generating trip:", error);
      toast.error("Failed to generate the trip.");
    } finally {
      setLoading(false);
    }
  };

  const SaveAiTrip = async (TripData, user, docId) => { // Receive docId as a parameter
    try {
      setLoading(true);
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: JSON.parse(TripData),
        userEmail: user?.email,
        id: docId
      });
      toast.success("Trip saved successfully!");
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error("Failed to save the trip.");
    } finally {
      setLoading(false);
      navigate('/view-trip/' + docId); // Use docId here
    }
  }

  return (
    <div className='sm:px-10 md:px-32 xl:px-32 px-5 mt-10 space-y-16'>
      <div className='text-center'>
        <h2 className='font-bold text-3xl mb-4'>Tell us your travel preferences 🏕️🌴</h2>
        <p className='text-gray-500 text-xl'>Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.</p>
      </div>

      <div className='space-y-10'>
        <div className='space-y-4'>
          <h2 className='text-xl font-medium'>What is your destination of choice?</h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              place,
              onChange: (v) => {
                setPlace(v);
                handleInputChange('location', v);
              },
            }}
          />
        </div>

        <div className='space-y-4'>
          <h2 className='text-xl font-medium'>How many days are you planning your trip?</h2>
          <Input
            placeholder={'Ex. 3'}
            type="number"
            onChange={(e) => handleInputChange('noOfDays', e.target.value)}
          />
        </div>
      </div>

      <div className='space-y-10'>
        <div className='space-y-4'>
          <h2 className='text-xl font-medium'>What is your Budget?</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange('budget', item.title)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg text-center
                ${formData?.budget === item.title && 'shadow-lg border-black'}
              `}>
                <h2 className='text-4xl mb-2'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-xl font-medium'>Who do you plan on travelling with on your next adventure?</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {SelectTravelsList.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange('traveler', item.people)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg text-center
                ${formData?.traveler === item.people && 'shadow-lg border-black'}
              `}>
                <h2 className='text-4xl mb-2'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='text-center mt-10'>
        <Button
          disabled={loading}
          className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300'
          onClick={OnGenerateTrip}>
          {loading ?
            <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : 'Generate Trip'
          }
        </Button>
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
  );
}

export default CreateTrip;
