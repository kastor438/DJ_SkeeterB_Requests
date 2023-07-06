import '../StyleSheets/FoundFridays.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Navigate, Link, useLocation } from 'react-router-dom';

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
  const { userEmail } = location.state;

  useEffect(() => {
    userEmailRef.current.value = userEmail
  }, []);


  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='foundFridaysDiv'>

    </div>
  );
}

export default FoundFridays;