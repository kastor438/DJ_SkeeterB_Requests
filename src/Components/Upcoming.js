import '../StyleSheets/Upcoming.css';
import '../StyleSheets/ReactCalendar.css';

import React, { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, child, get } from "firebase/database";
import { Navigate } from 'react-router-dom';
import Calendar from 'react-calendar';

const Upcoming = props => {
  const [calendarDateHeader, SetCalendarDateHeader] = useState();
  const [calendarDate, SetCalendarDate] = useState(new Date());
  const [eventElements, SetEventElements] = useState();
  const [navigateToEvent, SetNavigateToEvent] = useState(false);
  const [selectedEventID, SetSelectedEventID] = useState('');

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
    // console.log(calendarDate);
    var calendarDateElement = React.createElement('h3', {id : 'selectedDateHeader'}, calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2}) + '/' + (calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}) + '/' + calendarDate.getFullYear());
    SetCalendarDateHeader(calendarDateElement);

    SetEventDetails();
  }, [calendarDate]);

  useEffect(() => {
    if(selectedEventID !== ''){
      SetNavigateToEvent(true);
    }
  }, [selectedEventID])

  function SetEventDetails(){
    get(child(dbRef, '/Events/')).then((snapshot) => {
      const eventData = snapshot.val();
      const newEventElements = [];
      if(eventData){
        var eventDate = `${calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${calendarDate.getFullYear()}`;
        Object.entries(eventData).forEach(([key, value]) => {
          console.log(eventDate);
          console.log(value.EventDate);
          if(value.EventDate === eventDate){
            var lastEvent = false;
            if(newEventElements.length === Object.keys(snapshot.val()).length-1)
              lastEvent = true;
            var newEventElement =
              React.createElement('div', {className : 'eventInfoDiv' + (lastEvent ? '' : ' eventBottomBorder'), key : 'eventInfoDiv' + key, 'data-eventkey' : key, onClick : (e) => OpenUpcomingEvent(e.target)},
                React.createElement('div', {className : 'eventDetailsDiv'},
                  React.createElement('div', {className : 'eventVenueDiv'}, 
                    React.createElement('span', {className : 'eventVenue'}, value.EventVenue)
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
                  React.createElement('img', {className : 'eventImage', src : value.EventImageURL, alt : 'An image representing the event'})
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

  function OpenUpcomingEvent(element){
    console.log("made it. Key: " + element.dataset.eventkey);
    props.upcomingEventHandler(element.dataset.eventkey);
    SetSelectedEventID(element.dataset.eventkey);
  }

  if(navigateToEvent === true){
    return <Navigate to={'/Upcoming/' + selectedEventID}/>;
  }
  return (
    <div id='upcomingDiv'>
      <div id='calendarDiv'>
        <Calendar id='upcomingCalendar' minDate={new Date()} maxDate={new Date("2035, 9, 19")} onChange={SetCalendarDate} value={calendarDate} />
      </div>
      <div id='selectedDateEventInfoDiv'>
        {calendarDateHeader}
        <div id='eventsDiv'>
          {eventElements}
        </div>
      </div>
    </div>
  );
}

export default Upcoming;