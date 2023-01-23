import '../StyleSheets/Upcoming.css';
import '../StyleSheets/ReactCalendar.css';

import React, { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, child, get } from "firebase/database";
import Calendar from 'react-calendar';
import { NavLink } from 'react-router-dom';

const Upcoming = props => {
  const [calendarDateHeader, SetCalendarDateHeader] = useState();
  const [calendarDate, SetCalendarDate] = useState(new Date());
  const [eventElements, SetEventElements] = useState();
  
  const dbRef = ref(getDatabase());

  useEffect(() => {
    get(child(dbRef, '/Events/')).then((snapshot) => {
      const eventData = snapshot.val();
      if(eventData){
        Object.entries(eventData).forEach(([key, value]) => {

        });
      }
    });
  }, [])

  useEffect(() => {
    console.log(calendarDate);
    var calendarDateElement = React.createElement('h3', {id : 'selectedDateHeader'}, calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2}) + '/' + (calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}) + '/' + calendarDate.getFullYear());
    SetCalendarDateHeader(calendarDateElement);

    SetEventDetails();
  }, [calendarDate]);

  function SetEventDetails(){
    get(child(dbRef, '/Events/')).then((snapshot) => {
      const eventData = snapshot.val();
      const newEventElements = [];
      if(eventData){
        var eventDate = calendarDate.getFullYear() + '-' + (calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}) + "-" + calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2});
        Object.entries(eventData).forEach(([key, value]) => {
          if(value.EventDate === eventDate){
            var newEventElement =
              React.createElement('div', {className : 'eventInfoDiv', key : 'eventInfoDiv' + key},
                React.createElement('div', {className : 'eventDetailsDiv'},
                  React.createElement('div', {className : 'eventLiveAtDiv'}, 
                     React.createElement('label', {className : 'eventInfoLabel'}, 'Live at: '),
                     React.createElement('span', {className : 'eventLiveAtContent'}, value.EventVenue)
                  ),
                  React.createElement('div', {className : 'eventStartTimeDiv'}, 
                     React.createElement('label', {className : 'eventInfoLabel'}, 'Start Time: '),
                     React.createElement('span', {className : 'eventStartTimeContent'}, value.EventStartTime)
                  ),
                  React.createElement('div', {className : 'eventDescriptionDiv'}, 
                     React.createElement('span', {className : 'eventDescription'}, value.EventDescription),
                  )
                ),
                React.createElement('div', {className : 'eventImageDiv'},
                  React.createElement('img', {className : 'eventImage', src : './BuckLogo.jpg', alt : 'An image representing the event'})
                )
              );
            newEventElements.push(newEventElement);
          }
        });
      }
      if(newEventElements.length <= 0)
        SetEventElements(React.createElement('span', {}, 'No events on selected date'));
      else
        SetEventElements(newEventElements);
    });
  }

  return (
    (props.authUser && (props.authUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || props.authUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')) ?
    <div id='upcomingDiv'>
      <div id='calendarDiv'>
        <Calendar id='upcomingCalendar' maxDate={new Date("2035, 9, 19")} onChange={SetCalendarDate} value={calendarDate} />
      </div>
      <div id='selectedDateEventInfoDiv'>
        {calendarDateHeader}
        <div id='eventsDiv'>
          {eventElements}
        </div>
      </div>
    </div>
    :
    <div></div>
  );
}

export default Upcoming;