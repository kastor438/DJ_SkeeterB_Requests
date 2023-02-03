import '../StyleSheets/Login.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Navigate, Link } from 'react-router-dom';

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

const Login = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);

  const userEmailRef = useRef();
  const userPasswordRef = useRef();

  const LoginToFirebase = async () => {
    try {
      await signInWithEmailAndPassword(auth, userEmailRef.current.value, userPasswordRef.current.value);
      SetNavigateToHome(true);
    } catch (err) {
      console.error(err);
    }
  };

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='loginDiv'>
      <div>
        <h2>Login</h2>
      </div>
      <div>
        <label>Email: </label>
        <input id='emailInput' type='email' ref={userEmailRef} placeholder='example@gmail.com'/>
      </div>
      <div>
        <label>Password: </label>
        <input id='passwordInput' type='password' ref={userPasswordRef} placeholder='Password'/>
      </div>
      <button id='loginButton' onClick={e => LoginToFirebase()}>Login</button>
      <div>
        <span id='alreadySignedUpSpan'>
          <Link to='/signup'>Not registered? Signup here</Link>
        </span>
      </div>
    </div>
  );
}

export default Login;