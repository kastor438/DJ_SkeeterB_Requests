import '../StyleSheets/ForgotPassword.css';

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

const ForgotPassword = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);

  const userEmailRef = useRef();

  const location = useLocation();
  const { userEmail } = location.state;

  useEffect(() => {
    userEmailRef.current.value = userEmail
  }, []);

  const TriggerResetEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, userEmailRef.current.value);
      console.log("Password reset email sent!")
      SetNavigateToHome(true);
    } catch (err) {
      console.error(err);
    }
  };

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='forgotPasswordDiv'>
      <div id='toLoginDiv'>
        <span id='toLoginSpan'>
          <Link to={`/Login`}>&#8592; Return To Login</Link>
        </span>
      </div>
      <div>
        <h2>Reset Password</h2>
      </div>
      <div className='forgotPasswordInfoDiv'>
        <label>Email: </label>
        <input id='emailInput' type='email' ref={userEmailRef} placeholder='example@gmail.com'/>
      </div>
      <div id='forgotPasswordButtonDiv'>
        <button id='forgotPasswordButton' onClick={e => TriggerResetEmail()}>Reset</button>
      </div>
    </div>
  );
}

export default ForgotPassword;