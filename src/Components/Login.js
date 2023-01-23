import '../StyleSheets/Login.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NavBar from './NavBar'

const firebaseConfig = {
  apiKey: "AIzaSyAXh2tjWcUeOvEhUIyeZVNBRBwtn7BebgI",
  authDomain: "dj-skeeterb.firebaseapp.com",
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com",
  projectId: "dj-skeeterb",
  storageBucket: "dj-skeeterb.appspot.com",
  messagingSenderId: "222672756825",
  appId: "1:222672756825:web:974f65737776a233265148",
  measurementId: "G-E5J0711GSP",
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Login = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);
  const [userEmail, SetUserEmail] = useState('');
  const [userPassword, SetUserPassword] = useState('');

  const userEmailRef = useRef('');
  userEmailRef.current = userEmail;

  const userPasswordRef = useRef('');
  userPasswordRef.current = userPassword;

  const LoginToFirebase = async () => {
    try {
      await signInWithEmailAndPassword(auth, userEmailRef.current, userPasswordRef.current);
      SetUserEmail('');
      SetUserPassword('');
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
          <input id='emailInput' type='email' value={userEmail} placeholder='example@gmail.com' onChange={e => SetUserEmail(e.target.value)}/>
        </div>
        <div>
          <label>Password: </label>
          <input id='passwordInput' type='password' value={userPassword} placeholder='Password' onChange={e => SetUserPassword(e.target.value)}/>
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