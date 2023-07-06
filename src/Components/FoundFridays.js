import '../StyleSheets/FoundFridays.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { NavLink, Navigate, Link, useLocation } from 'react-router-dom';

const firebaseConfig = {
  apiKey: "AIzaSyAXh2tjWcUeOvEhUIyeZVNBRBwtn7BebgI",
  authDomain: "dj-skeeterb.firebaseapp.com",
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com",
  projectId: "dj-skeeterb",
  storageBucket: "dj-skeeterb.appspot.com",
  messagingSenderId: "222672756825",
  appId: "1:222672756825:web:974f65737776a233265148",
  measurementId: "G-E5J0711GSP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const FoundFridays = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);

  const userEmailRef = useRef();
  const location = useLocation();

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='foundFridaysDiv'>
      <div className='featureHeaderDiv'>
        <h1>FOUND ME!!!</h1>
      </div>
      <div className='featureInfoDiv'>
        <p>Congratulations on discovering your secret ticket to Found Fridays at Hide&Seek! Immerse yourself in our red-themed haven and prepare for an unforgettable experience.</p>
        <p><b>If you've found a physical QR Code, bring it to the DJ Booth for a free Drink Ticket and guarantee your first song request.</b></p>
        <p>Didn't find a QR Code? No worries! Click the link below to make song requests and get your friends to vote so you have enough votes for an approved request! Ask your DJ about how many you need! OR mention it to another seeker at the bar!  Let's create an unforgettable night of music, drinks, and new friendships.</p>
        <span>You Found Music, You Found Drinks, You Found Friends, You Found Fridays.</span>
      </div>
      <div className='featureImageDiv'>
        <img className='featureImage' src='/FoundFridaysPromoImage_2.jpg' alt='Feature promotional image.'></img>
      </div>
      <div className='featureToHomeLinkDiv'>
        <NavLink className='featureToHomeLink' to='/'><h4>Request Songs</h4></NavLink>
      </div>
    </div>
  );
}

export default FoundFridays;