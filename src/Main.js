import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SongRequests from './Components/SongRequests';
import Upcoming from './Components/Upcoming';
import Signup from './Components/Signup';
import Login from './Components/Login';
import UpcomingEvent from './Components/UpcomingEvent';
import NewEvent from './Components/NewEvent';
import ModifyEvent from './Components/ModifyEvent';

const Main = props => {
  return (
    <div id='mainDiv'>
      <Routes>
        <Route index element={<SongRequests authUser={props.authUser}/>}/>
        <Route path='/Upcoming' element={<Upcoming authUser={props.authUser} upcomingEventHandler={(eventID) => props.upcomingEventHandler(eventID)}/>}/>
        <Route path='/NewEvent' element={<NewEvent authUser={props.authUser}/>}/>
        <Route path='/ModifyEvent/:eventID' element={<ModifyEvent authUser={props.authUser}/>}/>
        {/* <Route path='/Upcoming/:eventID' element={<UpcomingEvent authUser={props.authUser} eventID={props.eventID}/>}/> */}
        <Route path='/Signup' element={<Signup signupHandler={(authUser) => props.signinHandler(authUser)}/>}/>
        <Route path='/Login' element={<Login signinHandler={(authUser) => props.signinHandler(authUser)}/>}/>
        <Route path='*' element={<Navigate to="/" replace />}/>
      </Routes>
    </div>
  );
}

export default Main;