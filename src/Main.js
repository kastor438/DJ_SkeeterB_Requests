import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SongRequests from './Components/SongRequests';
import History from './Components/History';
import Settings from './Components/Settings';
import Upcoming from './Components/Upcoming';
import Signup from './Components/Signup';
import Login from './Components/Login';
import ForgotPassword from './Components/ForgotPassword';
import UpcomingEvent from './Components/UpcomingEvent';
import NewEvent from './Components/NewEvent';
import ModifyEvent from './Components/ModifyEvent';

// Feature Imports
import FoundFridays from './Components/FoundFridays';
import BarbieNight from './Components/BarbieNight';
import BarbieWin from './Components/BigBarbieWin';
import BigBarbieWin from './Components/BigBarbieWin';

const Main = props => {
  return (
    <div id='mainDiv'>
      <Routes>
        <Route index element={<SongRequests authUser={props.authUser} activeThemeData={props.activeThemeData}/>}/>
        <Route path='/History' element={<History authUser={props.authUser}/>}/>
        <Route path='/Settings' element={<Settings authUser={props.authUser}/>}/>
        <Route path='/Upcoming' element={<Upcoming authUser={props.authUser} upcomingEventHandler={(eventID) => props.upcomingEventHandler(eventID)}/>}/>
        <Route path='/NewEvent' element={<NewEvent authUser={props.authUser}/>}/>
        <Route path='/ModifyEvent/:eventID' element={<ModifyEvent authUser={props.authUser}/>}/>
        {/* <Route path='/Upcoming/:eventID' element={<UpcomingEvent authUser={props.authUser} eventID={props.eventID}/>}/> */}
        <Route path='/Signup' element={<Signup signupHandler={(authUser) => props.signinHandler(authUser)}/>}/>
        <Route path='/Login' element={<Login signinHandler={(authUser) => props.signinHandler(authUser)}/>}/>
        <Route path='/Login/ForgotPassword' element={<ForgotPassword signinHandler={(authUser) => props.signinHandler(authUser)}/>}/>
        {/* <Route path='/Feature/FoundFridays' element={<FoundFridays/>}/>         */}
        <Route path='/Feature/BarbieNight' element={<BarbieNight/>}/>
        <Route path='/Feature/BarbieWin' element={<BarbieNight/>}/>
        <Route path='/Feature/BigBarbieWin' element={<BigBarbieWin/>}/>
        <Route path='*' element={<Navigate to="/" replace />}/>
      </Routes>
    </div>
  );
}

export default Main;