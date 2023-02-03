import '../StyleSheets/UpcomingEvent.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";
import { useParams } from 'react-router-dom';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const UpcomingEvent = props => {
  // States
  const [upcomingEventElement, SetUpcomingEventElement] = useState(null);

  const { eventID } = useParams();

  // DOM Refs
  const eventVenueRef = useRef();
  const eventStartTimeRef = useRef();
  const eventDescriptionRef = useRef();

  // DB Refs
  const dbref = ref(getDatabase());

  useEffect(() => {
    get(child(dbref, `Events/${eventID}/`)).then((snapshot) => {
      if(snapshot.val()){
        var newUpcomingEventElement =
          React.createElement('div', {id : 'upcomingEventDiv'},
            React.createElement('div', {id : 'upcomingEventInfo'},
              React.createElement('div', {id : 'upcomingEventLocation'},
                React.createElement('p', {}, snapshot.val().EventVenue)
              ),
              React.createElement('div', {id : 'upcomingEventStartTime'},
                React.createElement('p', {}, snapshot.val().EventStartTime)
              ),
              React.createElement('div', {id : 'upcomingEventDescription'},
                React.createElement('p', {}, snapshot.val().EventDescription)
              ),
              React.createElement('div', {id : 'upcomingEventImageDiv'},
                React.createElement('img', {id : 'upcomingEventImage', src : snapshot.val().EventImageURL, alt : 'Image Representing Event Location'})
              ),
            ),
            React.createElement('div', {id : 'requestSongContainer'},
              
            )
          );

        SetUpcomingEventElement(newUpcomingEventElement);
      }
      else{
        var newUpcomingEventElement =
          React.createElement('p', {}, 'No event with ID: ' + eventID);

        SetUpcomingEventElement(newUpcomingEventElement);
      }
    });
  }, [eventID])

  return (
    <div>
      {upcomingEventElement}
    </div>
  );
}

export default UpcomingEvent;