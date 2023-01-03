import React from 'react';
import { Routes, Route } from 'react-router-dom'

import SongRequests from './Components/SongRequests'
import Upcoming from './Components/Upcoming'
import Signup from './Components/Signup'
import Login from './Components/Login'

const Main = props => {
  return (
    <div id='main'>
      <Routes>
        <Route exact path='/' element={<SongRequests authUser={props.authUser}/>}/>
        <Route exact path='/upcoming' element={<Upcoming/>}/>
        <Route exact path='/signup' element={<Signup/>}/>
        <Route exact path='/login' element={<Login signinHandler={(authUser) => props.signinHandler(authUser)}/>}/>
      </Routes>
    </div>
  );
}

export default Main;