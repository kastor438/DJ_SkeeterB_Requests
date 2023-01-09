import '../StyleSheets/Upcoming.css';
import 'react-calendar/dist/Calendar.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, child, get, onValue } from "firebase/database";
import Calendar from 'react-calendar';

const Upcoming = () => {
  const [calendarDateHeader, SetCalendarDateHeader] = useState();
  const [calendarDate, SetCalendarDate] = useState(new Date());
  const [eventInfoElement, SetEventInfoElement] = useState();
  
  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    console.log(calendarDate);
    var calendarDateElement = React.createElement('h3', {id : 'selectedDateHeader'}, calendarDate.getDate() + '/' + (calendarDate.getMonth() + 1) + '/' + calendarDate.getFullYear());
    SetCalendarDateHeader(calendarDateElement);
  }, [calendarDate]);

  function SetEventDetails(){
    get(child(dbRef, '/Events/')).then((snapshot) => {
      const eventData = snapshot.val();
      if(eventData){
        var eventDate = calendarDate.getFullYear() + '-' + (calendarDate.getMonth() + 1) + "-" + calendarDate.getDate();
        Object.entries(eventData).forEach(([key, value]) => {
          if(value.EventDate === eventDate){
            var newEventInfoElement =
              React.createElement('div', {id : 'eventInfoDiv'},
                React.createElement('div', {id : 'eventDetailsDiv'},
                  React.createElement('div', {id : 'eventLiveAtDiv'}, 
                     React.createElement('label', {id : 'eventLiveAtLabel', className : 'eventInfoLabel'}, 'Live at: '),
                     React.createElement('span', {}, '')
                  ),
                  React.createElement('div', {id : 'eventStartTimeDiv'}, 
                     React.createElement('label', {id : 'eventStartTimeLabel', className : 'eventInfoLabel'}, 'Start Time: '),
                     React.createElement('span', {}, '')
                  ),
                  React.createElement('div', {id : 'eventDescriptionDiv'}, 
                     React.createElement('label', {id : 'eventDescription'}, 'Description: '),
                     React.createElement('span', {}, '')
                  ),
                )
              );
          }
        });
      }
    });
  }

  return (
    <div id='upcomingDiv'>
      <div id='calendarDiv'>
        <Calendar id='upcomingCalendar' onChange={SetCalendarDate} value={calendarDate} />
      </div>
      <div id='eventDiv'>
        {calendarDateHeader}
        <div id='eventInfoDiv'>
          <div id='eventDetailsDiv'>
            <div id='eventLiveAtDiv'>
              <label id='eventLiveAtLabel' className='eventInfoLabel'>Live at: </label>
              <span>Kai Brady's</span>
            </div>
            <div id='eventStartTimeDiv'>
              <label id='eventStartTimeLabel' className='eventInfoLabel'>Start Time: </label>
              <span>9pm</span>
            </div>
            <div id='eventDescriptionDiv'>
              <span id='eventDescription'>Wing Night!!!!!!!!!!!</span>
            </div>
          </div>
          <div id='eventImageDiv'>
            <img src='https://picsum.photos/200' alt='An image representing the event'/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upcoming;