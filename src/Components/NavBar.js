import logo from '../skeeterB-Logo.png';
import '../StyleSheets/NavBar.css';
import '../StyleSheets/NotificationSystem.css'
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { getDatabase, ref, onValue, get, child, set, update } from 'firebase/database';

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
  const [userNotifications, SetUserNotifications] = useState([]);
  const [userNotificationElements, SetUserNotificationElements] = useState([]);
  
  const isMenuPanelOpenRef = useRef(false);
  isMenuPanelOpenRef.current = isMenuPanelOpen;

  const isNotificationMenuOpenRef = useRef(false);
  const notificationElements = useRef([]);

  // DOM Refs
  const menuButtonDivRef = useRef();
  const menuBackgroundFadeRef = useRef();
  const songRequestsLinkRef = useRef();
  const upcomingLinkRef = useRef();
  const newEventLinkRef = useRef();
  const historyLinkRef = useRef();
  const settingsLinkRef = useRef();
  const notificationBellRef = useRef();
  const notificationBackgroundOverlayDivRef = useRef();
  
  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    SetNavBar();

    notificationBellRef.current.addEventListener('animationend', function(event){
      notificationBellRef.current.classList.remove('notify');
    });
  }, []);

  const unsubNotifications = useEffect(() => {
    SetNavBar();
    
    if(props.authUser != null){
      if((auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')){
        var skeeterLinks = 
          [React.createElement('li', {key : 'newEventLink', className : 'navBarLink'}, 
            React.createElement(NavLink, {ref : newEventLinkRef, to : '/NewEvent', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'New Event')
          ),
          React.createElement('li', {key : 'historyLink', className : 'navBarLink'}, 
            React.createElement(NavLink, {ref : historyLinkRef, to : '/History', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'History')
          ),
          React.createElement('li', {key : 'settingsLink', className : 'navBarLink'}, 
            React.createElement(NavLink, {ref : settingsLinkRef, to : '/Settings', className : (({isActive}) => isActive ? 'activeLink' : ''), onClick : (e) => ToggleMenuPanel(e.target)}, 'Settings')
          )];
          SkeeterSpecificLinksLink(skeeterLinks);
      }
      const dbCurrUserRef = ref(db, `Users/${props.authUser.uid}/`);
      return onValue(dbCurrUserRef, (snapshot) => {
        // console.log(props.authUser.uid)
        UpdateNotifications(snapshot.val());
      });
    }
    else{
      SkeeterSpecificLinksLink(null);
      UpdateNotifications(null);
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

  function ToggleNotificationMenu(element){
    if(element.id != 'notificationBell' && element.id != 'notificationBackgroundOverlayDiv')
      return;
    if(isNotificationMenuOpenRef.current == true){
      notificationBellRef.current.classList.remove('openMenu');
      notificationBackgroundOverlayDivRef.current.classList.remove('openMenu');
      notificationBellRef.current.setAttribute('data-count', 0);
      notificationBellRef.current.classList.remove('showCount')
      if(auth.currentUser != null){
        for(var i = 0; i < userNotifications.length; i++){
          if(!userNotifications[i].NotificationRead){
            update(ref(db, `Users/${auth.currentUser.uid}/Requests/${userNotifications[i].LiveRequest ? 'LiveRequests' : 'History'}/${userNotifications[i].RequestKey}/`), {
              NotificationRead: true
            });
          }
        }
      }
    }
    else{
      notificationBellRef.current.classList.add('openMenu');
      notificationBackgroundOverlayDivRef.current.classList.add('openMenu');
    }
    isNotificationMenuOpenRef.current = !isNotificationMenuOpenRef.current;
  }

  function UpdateNotifications(data){
    // console.log(data)
    var unreadNotificationCount = 0;
    var newUserNotifications = [];
    if(data != null && data.Requests != null){
      // History Check
      if(data.Requests.History != null){
        Object.entries(data.Requests.History).forEach(([key, value]) => {
          // console.log(value);
          if(!value.NotificationRead){
            unreadNotificationCount++;
          }
          var notification = {
            RequestKey: key,
            LiveRequest: false,
            SongName: value.SongName,
            ArtistName: value.ArtistName,
            SpotifyImageURL: value.SpotifyImageURL,
            Approved: value.Approved,
            DateTime: value.DateTime,
            NotificationRead: value.NotificationRead,
            SkeeterResponse: value.SkeeterResponse ? value.SkeeterResponse : ''
          }
          newUserNotifications.unshift(notification);
        });
      }
      // Live Requests Check
      if(data.Requests.LiveRequests != null){
        Object.entries(data.Requests.LiveRequests).forEach(([key, value]) => {
          if(!value.NotificationRead){
            unreadNotificationCount++;
          }
          var notification = {
            RequestKey: key,
            LiveRequest: true,
            SongName: value.SongName,
            ArtistName: value.ArtistName,
            SpotifyImageURL: value.SpotifyImageURL,
            Approved: value.Approved,
            DateTime: value.DateTime,
            NotificationRead: value.NotificationRead ? value.NotificationRead : false,
            SkeeterResponse: value.SkeeterResponse ? value.SkeeterResponse : '',
          }
          newUserNotifications.unshift(notification);
        });
      }
    }
    SetUserNotifications(newUserNotifications);

    // Create Notification Elements
    var newUserNotificationsElements = [];
    if(newUserNotifications.length > 0){
      for(var i = 0; i < newUserNotifications.length; i++){
        var dateTime = new Date(newUserNotifications[i].DateTime)
        var notificationElement =
          React.createElement('div', {key : `requestNotification${newUserNotifications[i].RequestKey}`, className : 'notificationSectionDiv' + (!newUserNotifications[i].NotificationRead ? ' newNotificationDiv' : '')},
            React.createElement('div', {className : 'notificationImageDiv'},
              React.createElement('img', {className : 'notificationImage', src : newUserNotifications[i].SpotifyImageURL})
            ),
            (newUserNotifications[i].LiveRequest ? 
              React.createElement('div', {className : 'notificationText'}, 
                'Your request for ',
                React.createElement('b', {}, newUserNotifications[i].SongName),
                ' by ',
                React.createElement('b', {}, newUserNotifications[i].ArtistName),
                (newUserNotifications[i].Approved ?
                ' has recently been approved!'
                :
                ' is waiting for approval...')
              )
            :
              React.createElement('div', {className : 'notificationText'}, 
                'Your request for ',
                React.createElement('b', {}, newUserNotifications[i].SongName),
                ' by ',
                React.createElement('b', {}, newUserNotifications[i].ArtistName),
                (newUserNotifications[i].Approved ?
                ' was approved!'
                :
                ' was denied.')
              )
            ),
            React.createElement('div', {className : 'notificationText notificationSubtext'}, `${dateTime.getFullYear()}/${dateTime.getMonth() + 1}/${dateTime.getDate()} - ${dateTime.toLocaleTimeString()}`)
          );
        newUserNotificationsElements.push(notificationElement);
      }
    }
    else{
      newUserNotificationsElements.push(
        React.createElement('h3', {key : 'caughtUpNotificationsHeader', className : 'caughtUpNotificationsHeader'}, `Looks like you're all caught up!`)
      );
    }
    SetUserNotificationElements(newUserNotificationsElements);

    if(notificationBellRef.current != null){
      var previousUnreadNotificationCount = notificationBellRef.current.getAttribute('data-count');
      notificationBellRef.current.setAttribute('data-count', unreadNotificationCount >= 10 ? '9+' : unreadNotificationCount);
      if(unreadNotificationCount > 0){
        notificationBellRef.current.classList.add('showCount');
        if(unreadNotificationCount > previousUnreadNotificationCount)
          notificationBellRef.current.classList.add('notify');
      }
      else{
        notificationBellRef.current.classList.remove('showCount');
      }
    }
  }

  return (
    <div>
      <nav id='navBar'>
        <div id='logoTitleDiv'>
          <div id='navBarLogoDiv'>
            <img id='navBarLogo' src={logo} alt='Skeeters logo.'></img>
          </div>
          <NavLink id='navLinkPageHeader' to='/' onClick={e => SetNavBar(e.target)}>
            <h2 id='pageHeader'>DJSkeeterB</h2>
          </NavLink>
            {/* <h4 id='liveStatus'>Live at: Kai Brady's Fancy Dive Bar</h4> */}
        </div>
        <div className={auth.currentUser != null ? 'notificationDiv' : 'notificationDiv noAuthentication'}>
          <div id='notificationBell' ref={notificationBellRef} className={auth.currentUser !== null ? 'notificationBell' : 'notificationBell noAuthentication'} onClick={(e) => ToggleNotificationMenu(e.target)}>
            <div id='notificationBackgroundOverlayDiv' className='notificationBackgroundOverlayDiv' ref={notificationBackgroundOverlayDivRef}/>
            <div className='notificationPopupDiv'>
              <div className='notificationsContainerDiv'>
                {userNotificationElements}
              </div>
            </div>
          </div>
        </div>
        <div id='menuButtonContainer'>
          <div id='menuButtonDiv' ref={menuButtonDivRef} className={isMenuPanelOpenRef.current ? 'openMenuPanel' : 'closedMenuPanel'} onClick={(e) => ToggleMenuPanel(e.target)}>
            <div className='bar1'></div>
            <div className='bar2'></div>
            <div className='bar3'></div>
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