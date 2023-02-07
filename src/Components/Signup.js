import '../StyleSheets/Singup.css';

import React, { useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, Navigate } from 'react-router-dom';
import { getDatabase, ref, set, child, get } from "firebase/database";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Signup = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);

  const userDisplayNameRef = useRef();
  const userEmailRef = useRef();
  const userPasswordRef = useRef();

  // DOM Refs
  const signupDisplayInfoRef = useRef();

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  const SignupToFirebase = async () => {
    var acceptableAccount = true;    
    if(userDisplayNameRef.current.value.length < 6 || userDisplayNameRef.current.value.length > 24){
      signupDisplayInfoRef.current.innerHTML = "Display name must have 6-24 characters.";
      return;
    }

    await get(child(dbRef, 'Users/')).then((snapshot) => {
      if(snapshot.val()){
        Object.entries(snapshot.val()).forEach(([key, value]) => {
          if(userDisplayNameRef.current.value === value.DisplayName){
            signupDisplayInfoRef.current.innerHTML = "Display name already in use.";
            acceptableAccount = false;
          }
        });
      }
    });

    if(acceptableAccount){
      try {
        await createUserWithEmailAndPassword(auth, userEmailRef.current.value, userPasswordRef.current.value)
          .then(function(result) {
            updateProfile(result.user, {
              displayName: userDisplayNameRef.current.value
            });
          }).then((userCredential) => {
            // console.log(auth.currentUser);
            set(ref(db, 'Users/' + auth.currentUser.uid + '/'), {
              DisplayName : userDisplayNameRef.current.value
            });
      
            SetNavigateToHome(true);
          });
      } catch (err) {
        console.error(err.code);
        if(err.code == "auth/invalid-email"){
          signupDisplayInfoRef.current.innerHTML = "Invalid email address!"
        }
        else if(err.code == "auth/email-already-in-use"){
          signupDisplayInfoRef.current.innerHTML = "Email already in use!"
        }
      }
    }
  }

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
        <input id='displayNameInput' type='text' ref={userDisplayNameRef} placeholder='example123' autoComplete='off'/>
      </div>
      <div>
        <label>Email: </label>
        <input id='emailInput' type='email' ref={userEmailRef} placeholder='example@gmail.com' autoComplete='off'/>
      </div>
      <div>
        <label>Password: </label>
        <input id='passwordInput' type='password' ref={userPasswordRef} placeholder='Password' autoComplete='new-password'/>
      </div>
      <button id='signupButton' onClick={e => SignupToFirebase()}>Signup</button>
      <div>
        <span id='alreadySignedUpSpan'>
          <Link to='/login'>Already have an account?</Link>
        </span>
      </div>
      <div id='signupDisplayDiv'>
        <h4 id='signupDisplayInfo' ref={signupDisplayInfoRef}></h4>
      </div>
    </div>
  );
}

export default Signup;