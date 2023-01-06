import '../StyleSheets/Upcoming.css';
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, child, get, onValue } from "firebase/database";
import Calendar from 'react-calendar';

const Upcoming = () => {
  const [calendarDate, SetCalendarDate] = useState(new Date());

  return (
    <div id='upcomingDiv'>
      <div id='calendarDiv'>
        <Calendar id='upcomingCalendar' onChange={SetCalendarDate} value={calendarDate} />
      </div>
      <div id='eventDiv'>
        <span>p</span>
      </div>
    </div>
  );
}

export default Upcoming;