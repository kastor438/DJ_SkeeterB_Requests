import logo from '../skeeterB-Logo.png';
import '../StyleSheets/NavBar.css';
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import React, { Component, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

const NavBar = props => {
  const [userInfo, SetUserInfo] = useState();

  useEffect(() => {
    SetNavBar(null);
  }, []);

  useEffect(() => {
    SetNavBar(null)
  }, [props.authUser]);

  function SetNavBar(element){
    var user = auth.currentUser;
    if (user){
      var userInfo = 
        React.createElement('div', {id : 'userDiv'},
          React.createElement('span', {id : 'userDisplayName'}, user.displayName ? user.displayName : user.email),
          React.createElement('span', {id : 'signoutSpan'}, 
            React.createElement('button', {id : 'signoutButton', onClick : (e) => SignOutUser(e.target)}, 'Signout')
          )
        );
      SetUserInfo(userInfo);
    }
    else if(element != null && element.nodeName === 'A'){
      var urlTO = element.href;
        
      if(!urlTO.includes("login") && !urlTO.includes("signup")){
        var userLoginSignupElement = 
          React.createElement('div', {id : 'loginSignupDiv'}, 
            React.createElement('span', {id : 'loginSignupOptions'}, 
              React.createElement(Link, {to : '/login', onClick : (e) => SetNavBar(e.target)}, 'Login'), 
              '/',
              React.createElement(Link, {to : '/signup', onClick : (e) => SetNavBar(e.target)}, 'Signup')
            )
          );
      }
      else{
        var userLoginSignupElement = null;
      }
      SetUserInfo(userLoginSignupElement);
    }
    else{
      var userLoginSignupElement = 
        React.createElement('div', {id : 'loginSignupDiv'},
          React.createElement('span', {id : 'loginSignupOptions'}, 
            React.createElement(Link, {to : '/login', onClick : (e) => SetNavBar(e.target)}, 'Login'), 
            '/',
            React.createElement(Link, {to : '/signup', onClick : (e) => SetNavBar(e.target)}, 'Signup')
          )
        );
      SetUserInfo(userLoginSignupElement);
    }
  }

  async function SignOutUser(element){
    try{
      await signOut(auth);
      // props.signoutHandler();
      // SetNavBar(null)
    }
    catch(err){
      console.log(err);
    }
  }

  return (
    <div>
      <nav id='navBar'>
        <div id='logoTitleDiv'>
          <img id='navBarLogo' src={logo} alt='Skeeters logo.'></img>
          <Link to='/' onClick={e => SetNavBar(e.target)}>
            <h2 id='pageHeader'>DJSkeeterB</h2>
          </Link>
            {/* <h4 id='liveStatus'>Live at: Kai Brady's Fancy Dive Bar</h4> */}
        </div>
        {userInfo}
        {/* <span id='loginSignupOptions'><Link to='/login'>Login</Link> / <Link to='/signup'>Signup</Link></span> */}
      </nav>
    </div>
  );
}

export default NavBar;