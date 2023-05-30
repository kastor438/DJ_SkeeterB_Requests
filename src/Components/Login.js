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
  const [userEmail, SetUserEmail] = useState("");
  const [navigateToHome, SetNavigateToHome] = useState(false);

  const userEmailRef = useRef();
  const userPasswordRef = useRef();

  // DOM Refs
  const loginDisplayInfoLine1Ref = useRef();
  const loginDisplayInfoLine2Ref = useRef();

  const LoginToFirebase = async () => {
    try {
      await signInWithEmailAndPassword(auth, userEmailRef.current.value, userPasswordRef.current.value);
      SetNavigateToHome(true);
    } catch (err) {
      if(err.code == 'auth/too-many-requests'){
        loginDisplayInfoLine1Ref.current.innerHTML = `Exceeded Login Attempts`;
        loginDisplayInfoLine2Ref.current.innerHTML = ``;
      }
      else if(err.code == 'auth/wrong-password'){
        loginDisplayInfoLine1Ref.current.innerHTML = `Incorrect Password`;
        loginDisplayInfoLine2Ref.current.innerHTML = ``;
      }
      else if(err.code == 'auth/user-not-found'){
        loginDisplayInfoLine1Ref.current.innerHTML = `No Account Found`
        loginDisplayInfoLine2Ref.current.innerHTML = ``;
      }
      else if(err.code == 'auth/invalid-email'){
        loginDisplayInfoLine1Ref.current.innerHTML = `Invalid Email Address`;
        loginDisplayInfoLine2Ref.current.innerHTML = ``;
      }
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
      <div className='loginInfoDiv'>
        <label>Email: </label>
        <input id='emailInput' type='email' ref={userEmailRef} placeholder='example@gmail.com' onChange={(e) => SetUserEmail(e.target.value)}/>
      </div>
      <div className='loginInfoDiv'>
        <label>Password: </label>
        <input id='passwordInput' type='password' ref={userPasswordRef} placeholder='Password'/>
      </div>
      <div id='loginButtonDiv'>
        <button id='loginButton' onClick={e => LoginToFirebase()}>Login</button>
      </div>
      <div id='notSignedUpDiv'>
        <span id='notSignedUpSpan'>
          <Link to='/Signup'>Not registered? Signup here</Link>
        </span>
      </div>
      <div id='notSignedUpDiv'>
        <span id='notSignedUpSpan'>
          <Link to={`/Login/ForgotPassword`} state={{ userEmail: userEmail }}>Forgot password?</Link>
        </span>
      </div>
      <div id='loginDisplayDiv'>
        <h4 id='loginDisplayInfoLine1' ref={loginDisplayInfoLine1Ref}></h4>
        <h4 id='loginDisplayInfoLine2' ref={loginDisplayInfoLine2Ref}></h4>
      </div>
    </div>
  );
}

export default Login;