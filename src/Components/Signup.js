import '../StyleSheets/Singup.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, Navigate } from 'react-router-dom';

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

const Signup = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);
  const [userDisplayName, SetUserDisplayName] = useState('');
  const [userEmail, SetUserEmail] = useState('');
  const [userPassword, SetUserPassword] = useState('');

  const userDisplayNameRef = useRef('');
  userDisplayNameRef.current = userDisplayName;

  const userEmailRef = useRef('');
  userEmailRef.current = userEmail;

  const userPasswordRef = useRef('');
  userPasswordRef.current = userPassword;

  const SignupToFirebase = async () => {
    if(userDisplayNameRef.current.length < 6 || userDisplayNameRef.current.length > 24){
      document.getElementById('signupDisplayInfo').innerHTML = "Display name must have 6-24 characters.";
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, userEmailRef.current, userPasswordRef.current)
        .then(function(result) {
          updateProfile(result.user, {
            displayName: userDisplayNameRef.current
          });
        }).then((userCredential) => {
          console.log(auth.currentUser);
        
          SetUserEmail('');
          SetUserPassword('');
    
          SetNavigateToHome(true);
        });
    } catch (err) {
      console.error(err.code);
      if(err.code == "auth/invalid-email"){
        document.getElementById('signupDisplayInfo').innerHTML = "Invalid email address!"
      }
      else if(err.code == "auth/email-already-in-use"){
        document.getElementById('signupDisplayInfo').innerHTML = "Email already in use!"
      }
    }
  };

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
      <div id='signupDiv'>
        <div>
          <h2>Signup</h2>
        </div>
        <div>
          <label>Display Name: </label>
          <input id='displayNameInput' type='text' value={userDisplayName} placeholder='example123' autoComplete='off' onChange={e => SetUserDisplayName(e.target.value)}/>
        </div>
        <div>
          <label>Email: </label>
          <input id='emailInput' type='email' value={userEmail} placeholder='example@gmail.com' autoComplete='off' onChange={e => SetUserEmail(e.target.value)}/>
        </div>
        <div>
          <label>Password: </label>
          <input id='passwordInput' type='password' value={userPassword} placeholder='Password' autoComplete='new-password' onChange={e => SetUserPassword(e.target.value)}/>
        </div>
        <button id='signupButton' onClick={e => SignupToFirebase()}>Signup</button>
        <div>
          <span id='alreadySignedUpSpan'>
            <Link to='/login'>Already have an account?</Link>
          </span>
        </div>
        <div id='signupDisplayDiv'>
          <h4 id='signupDisplayInfo'></h4>
        </div>
      </div>
  );
}

export default Signup;