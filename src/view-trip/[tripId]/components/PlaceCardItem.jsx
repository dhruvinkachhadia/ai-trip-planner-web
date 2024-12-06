import { Button } from '@/components/ui/button';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react';
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from 'react-router-dom';

// Utility function to handle case-insensitive property access
const getPlaceProperty = (place, propName) => {
  return place?.[propName] || place?.[propName.charAt(0).toUpperCase() + propName.slice(1)];
};

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
    if (place) {
      GetPlacePhoto();
    }
  }, [place]);

  const GetPlacePhoto = async () => {
    const data = {
      textQuery: getPlaceProperty(place, "placeName")
    };
    const result = await GetPlaceDetails(data).then(resp => {
      const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name);
      setPhotoUrl(PhotoUrl);
    });
  };

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${getPlaceProperty(place, "placeName")}`}
      target="_blank"
    >
      <div className='border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 transition-all hover:shadow-md cursor-pointer'>
        <img
          src={photoUrl ? photoUrl : '/placeholder.jpg'}
          className='w-[130px] h-[130px] rounded-xl object-cover'
        />
        <div>
          <h2 className='font-bold text-lg'>{getPlaceProperty(place, "placeName")}</h2>
          <p className='text-sm text-gray-400'>{place["Place Details"]}</p>
          <h2 className='mt-2'>💵 {place["ticket Pricing"]}</h2>
          {/* Uncomment if needed */}
          {/* <Button size="sm"><FaMapLocationDot /></Button> */}
        </div>
      </div>
    </Link>
  );
}

export default PlaceCardItem;