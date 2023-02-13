import '../StyleSheets/Upcoming.css';
import '../StyleSheets/ReactCalendar.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set} from "firebase/database";
import { getAuth } from "firebase/auth";
import { Navigate } from 'react-router-dom';
import Calendar from 'react-calendar';

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

const Upcoming = props => {
  const [calendarDateHeader, SetCalendarDateHeader] = useState();
  const [calendarDate, SetCalendarDate] = useState(new Date());
  const [eventElements, SetEventElements] = useState();
  const [navigateToModifyEvent, SetNavigateToModifyEvent] = useState(false);
  const [navigateToEvent, SetNavigateToEvent] = useState(false);
  const [selectedEventID, SetSelectedEventID] = useState('');
  const [selectedModifyEventID, SetSelectedModifyEventID] = useState('');

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  // useEffect(() => {
  //   get(child(dbRef, '/Events/')).then((snapshot) => {
  //     const eventData = snapshot.val();
  //     if(eventData){
  //       Object.entries(eventData).forEach(([key, value]) => {

  //       });
  //     }
  //   });
  // }, [])

  useEffect(() => {
    // console.log(calendarDate);
    var calendarDateElement = React.createElement('h3', {id : 'selectedDateHeader'}, calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2}) + '/' + (calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}) + '/' + calendarDate.getFullYear());
    SetCalendarDateHeader(calendarDateElement);

    SetEventDetails();
  }, [calendarDate, props.authUser]);

  useEffect(() => {
    if(selectedEventID !== ''){
      // SetNavigateToEvent(true);
    }
  }, [selectedEventID])

  useEffect(() => {
    if(selectedModifyEventID !== ''){
      SetNavigateToModifyEvent(true);
    }
  }, [selectedModifyEventID])

  function SetEventDetails(){
    get(child(dbRef, '/Events/')).then((snapshot) => {
      const eventData = snapshot.val();
      var newEventElements = [];
      if(eventData){
        var eventDate = `${calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${calendarDate.getFullYear()}`;
        var eventsOnDate = [];
        Object.entries(eventData).forEach(([key, value]) => {
          if(value.EventDate === eventDate && (value.Visible ||
            (auth.currentUser &&
            (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' ||
            auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')))){
              eventsOnDate.push({key : key, value : value});
          }
        });

        for(var i = 0; i < eventsOnDate.length; i++){
          var lastEvent = false;
          if(i === eventsOnDate.length-1)
            lastEvent = true;
          var newEventElement =
            React.createElement('div', {className : 'eventInfoDiv' + (lastEvent ? '' : ' eventBottomBorder'), key : 'eventInfoDiv' + eventsOnDate[i].key, 'data-eventkey' : eventsOnDate[i].key},
              (eventsOnDate[i].value.Cancelled ? 
              React.createElement('div', {className : 'cancelledOverlay'}, 
                React.createElement('h2', {className : 'cancelledHeader'}, 'CANCELLED')
              )
              :
              null),
              ((auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')) ?
              React.createElement('div', {className : 'skeeterUpcomingButtonsDiv'},
                React.createElement('div', {},
                  React.createElement('button', {className : 'skeeterUpcomingButton modifyUpcomingEventButton', 'data-eventid' : eventsOnDate[i].key, onClick : (e) => ModifyEvent(e.target)}, 'Modify Event')
                ),
                React.createElement('div', {},
                  !eventsOnDate[i].value.Cancelled ? 
                  React.createElement('button', {className : 'skeeterUpcomingButton cancelUpcomingEventButton', 'data-eventid' : eventsOnDate[i].key, onClick : (e) => CancelEvent(e.target)}, 'Cancel Event')
                  :
                  React.createElement('button', {className : 'skeeterUpcomingButton reactivateUpcomingEventButton', 'data-eventid' : eventsOnDate[i].key, onClick : (e) => ReactivateEvent(e.target)}, 'Reactivate Event')
                ),
                React.createElement('div', {},
                  eventsOnDate[i].value.Visible ? 
                  React.createElement('button', {className : 'skeeterUpcomingButton hideUpcomingEventButton', 'data-eventid' : eventsOnDate[i].key, onClick : (e) => HideEvent(e.target)}, '\u29BBHide Event')
                  :
                  React.createElement('button', {className : 'skeeterUpcomingButton showUpcomingEventButton', 'data-eventid' : eventsOnDate[i].key, onClick : (e) => ShowEvent(e.target)}, '\uD83D\uDC41Show Event')
                )
              )
              :
              null),
              React.createElement('div', {className : 'eventDetailsDiv'},
                React.createElement('div', {className : 'eventVenueDiv'}, 
                  React.createElement('span', {className : 'eventVenue'}, eventsOnDate[i].value.EventVenue)
                ),
                React.createElement('div', {className : 'eventStartTimeDiv'}, 
                    React.createElement('label', {className : 'eventInfoLabel'}, 'Start Time: '),
                    React.createElement('span', {className : 'eventStartTimeContent'}, eventsOnDate[i].value.EventStartTime)
                ),
                React.createElement('div', {className : 'eventDescriptionDiv'}, 
                    React.createElement('span', {className : 'eventDescription'}, eventsOnDate[i].value.EventDescription),
                )
              ),
              React.createElement('div', {className : 'eventImageDiv'},
                React.createElement('img', {className : 'eventImage', src : eventsOnDate[i].value.EventImageURL, alt : 'An image representing the event'})
              )
            );
          newEventElements.push(newEventElement);
        }
      }

      if(newEventElements.length <= 0)
        SetEventElements(React.createElement('span', {}, `Sorry I'm not live that day!`));
      else
        SetEventElements(newEventElements);
    });
  }

  // function OpenUpcomingEvent(element){
  //   SetSelectedEventID(element.dataset.eventkey);
  // }
  function ModifyEvent(element){
    SetSelectedModifyEventID(element.dataset.eventid);
  }

  function CancelEvent(element){
    set(ref(db, `Events/${element.dataset.eventid}/Cancelled`), true);
    SetEventDetails();
  }

  function ReactivateEvent(element){
    set(ref(db, `Events/${element.dataset.eventid}/Cancelled`), false);
    SetEventDetails();
  }

  function HideEvent(element){
    set(ref(db, `Events/${element.dataset.eventid}/Visible`), false);
    SetEventDetails();
  }

  function ShowEvent(element){
    set(ref(db, `Events/${element.dataset.eventid}/Visible`), true);
    SetEventDetails();
  }

  if(navigateToModifyEvent === true){
    return <Navigate to={`/ModifyEvent/${selectedModifyEventID}`}/>;
  }
  // if(navigateToEvent === true){
  //   return <Navigate to={`/Upcoming/${selectedEventID}`}/>;
  // }
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