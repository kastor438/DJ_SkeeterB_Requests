import logo from '../skeeterB-Logo.png';
import '../StyleSheets/NavBar.css';
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';

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

const NavBar = props => {
  const [isMenuPanelOpen, SetIsMenuPanelOpen] = useState(false);
  const [userInfo, SetUserInfo] = useState();
  const [skeeterSpecificLinks, SkeeterSpecificLinksLink] = useState([]);

  const isMenuPanelOpenRef = useRef(false);
  isMenuPanelOpenRef.current = isMenuPanelOpen;

  const menuButtonDivRef = useRef();
  const menuBackgroundFadeRef = useRef();
  const songRequestsLinkRef = useRef();
  const upcomingLinkRef = useRef();
  const newEventLinkRef = useRef();
  const settingsLinkRef = useRef();

  useEffect(() => {
    SetNavBar();
  }, []);

  useEffect(() => {
    SetNavBar();
    if(auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      var skeeterLinks = 
        [React.createElement('li', {key : 'newEventLink', className : 'navBarLink'}, 
          React.createElement(NavLink, {ref : newEventLinkRef, to : '/NewEvent', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'New Event')
        ),
        React.createElement('li', {key : 'settingsLink', className : 'navBarLink'}, 
          React.createElement(NavLink, {ref : settingsLinkRef, to : '/Settings', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'Settings')
        )];
        SkeeterSpecificLinksLink(skeeterLinks);
    }
    else{
      SkeeterSpecificLinksLink(null);
    }
  }, [props.authUser]);

  useEffect(() => {
    if(isMenuPanelOpen){
      menuBackgroundFadeRef.current.classList.add('menuOpen');
    }
    else{
      menuBackgroundFadeRef.current.classList.remove('menuOpen');
    }
  }, [isMenuPanelOpen])

  function SetNavBar(){
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
    else{
      var userLoginSignupElement = 
        React.createElement('div', {id : 'loginSignupDiv'},
          React.createElement('span', {id : 'loginSignupOptions'}, 
            React.createElement(NavLink, {to : '/Login', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'Login'), 
            ' / ',
            React.createElement(NavLink, {to : '/Signup', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'Signup')
          )
        );
      SetUserInfo(userLoginSignupElement);
    }
  }

  async function SignOutUser(element){
    try{
      await signOut(auth);
    }
    catch(err){
      console.log(err);
    }
  }

  function ToggleMenuPanel(element){
    if(element.classList.toString().includes('activeLink')){
      return;
    }
    menuButtonDivRef.current.classList.toggle('change');
    SetIsMenuPanelOpen(!isMenuPanelOpenRef.current);
  }

  return (
    <div>
      <nav id='navBar'>
        <div id='logoTitleDiv'>
          <img id='navBarLogo' src={logo} alt='Skeeters logo.'></img>
          <NavLink to='/' onClick={e => SetNavBar(e.target)}>
            <h2 id='pageHeader'>DJSkeeterB</h2>
          </NavLink>
            {/* <h4 id='liveStatus'>Live at: Kai Brady's Fancy Dive Bar</h4> */}
        </div>
        <div id='menuButtonContainer'>
          <div id='menuButtonDiv' ref={menuButtonDivRef} className={isMenuPanelOpenRef.current ? 'openMenuPanel' : 'closedMenuPanel'} onClick={(e) => ToggleMenuPanel(e.target)}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
        </div>
        <div id='menuBackgroundFade' ref={menuBackgroundFadeRef}></div>
        <div id='slidingMenuPanel' className={isMenuPanelOpenRef.current ? 'openMenuPanel' : 'closedMenuPanel'}>
          {userInfo}
          <ul id='navBarLinks'>
            <li className='navBarLink'><NavLink ref={songRequestsLinkRef} to='/' className={({isActive}) => isActive ? 'activeLink' : ''} onClick={(e) => ToggleMenuPanel(e.target)}>Song Requests</NavLink></li>
            <li className='navBarLink'><NavLink ref={upcomingLinkRef} to='/Upcoming' className={({isActive}) => isActive ? 'activeLink' : ''} onClick={(e) => ToggleMenuPanel(e.target)}>Upcoming</NavLink></li>
            {skeeterSpecificLinks}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;