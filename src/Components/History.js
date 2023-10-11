import '../StyleSheets/History.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes, listAll } from "firebase/storage";
import { Navigate, Link } from 'react-router-dom';

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
const storage = getStorage(app);

const History = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);

  // Value Refs
  const filteredVotersCountValueRef = useRef(0);
  const filteredMinVoteRatingValueRef = useRef(0);
  const filteredMaxVoteRatingValueRef = useRef(0);
  const historyData = useRef([]);
  const historyDataElements = useRef([]);

  // DOM Refs
  const filteredSongNameInputRef = useRef();
  const filteredArtistNameInputRef = useRef();
  const filteredVotersCountElementRef = useRef();
  const filteredMinVoteRatingInputRef = useRef();
  const filteredMaxVoteRatingInputRef = useRef();
  const filteredStartDateInputRef = useRef();
  const filteredEndDateInputRef = useRef();

  // DB Refs
  const db = getDatabase();
  const dbRef = ref(getDatabase());
  
  useEffect(() => {
    if(!auth.currentUser || (auth.currentUser.uid !== 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' && auth.currentUser.uid !== 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      SetNavigateToHome(true);
    }
    else{
      GetHistory();
    }
  }, [props.authUser])

  function AdjustVoteCount(adjustmentValue){
    filteredVotersCountElementRef.current += adjustmentValue;
  }

  function GetHistory(){
    get(ref(db, '/History/')).then((snapshot) => {
      if(snapshot.exists()){
        console.log(snapshot.val());
        const historyDateData = [];
        Object.entries(snapshot.val()).forEach(([key, value]) => {
          var splitDate = key.split('-');
          var historyDate = {
            day: parseInt(splitDate[0]),
            month: parseInt(splitDate[1]),
            year: parseInt(splitDate[2]),
            historyRequests: value
          }
          historyDateData.push(historyDate);
        });
        
        var historyDateSectionElements = [];
        for(var i = 0; i < historyDateData.length; i++){
          var historyRequestsElements = [];
          for(var j = 0; j < historyDateData[i].historyRequests.length; j++){
            var historyRequestElement = React.createElement('div', {}, 
              React.createElement('p', {}, historyDateData[i].historyRequests[j].SongName)
            )
            historyRequestsElements.push(historyRequestElement);
          }
          var dateSectionElement = React.createElement('div', {}, historyRequestsElements.map())
          historyDateSectionElements.push(dateSectionElement);
        }
        historyDataElements.current = historyDateSectionElements;
        console.log(historyDateData);
      }
    });
  }

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='historyDiv'>
      <div id='searchAndFilterSectionDiv'>
        <div id='requestFilterDiv'>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='songNameFilterInput' className='songRequestInfoFilterLabel'>Song Name</label>
            <input type='text' id='songNameFilterInput' className='songRequestInfoFilterInput' ref={filteredSongNameInputRef}/>
          </div>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='artistNameFilterInput' className='songRequestInfoFilterLabel'>Artist Name</label>
            <input type='text' id='artistNameFilterInput' className='songRequestInfoFilterInput' ref={filteredArtistNameInputRef}/>
          </div>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='votersCountFilterInput' className='songRequestInfoFilterLabel'>Voters Count</label>
            <div>
              <button onClick={() => AdjustVoteCount(-10)}>down 10</button>
              <button onClick={() => AdjustVoteCount(-1)}>down 1</button>
              <p id='voteCountFilterValue' ref={filteredVotersCountElementRef} value={filteredVotersCountValueRef.current}/>
              <button onClick={() => AdjustVoteCount(1)}>up 1</button>
              <button onClick={() => AdjustVoteCount(10)}>up 10</button>
            </div>
          </div>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='FilterInput' className='songRequestInfoFilterLabel'>VoteRating</label>
            <input type='text' id='minimumVoteRatingFilterInput' className='songRequestInfoFilterInput' ref={filteredMinVoteRatingInputRef}/>
            <input type='text' id='maximumVoteRatingFilterInput' className='songRequestInfoFilterInput' ref={filteredMaxVoteRatingInputRef}/>
          </div>
        </div>
        <div id='dateFilterDiv'>
          <div className='dateInfoFilterDiv'>
            <label htmlFor='startDateFilterInput' className='dateInfoFilterLabel'>Start Date</label>
            <input type='date' id='startDateFilterInput' className='dateFilterInput' ref={filteredStartDateInputRef}/>
          </div>
          <div className='dateInfoFilterDiv'>
            <label htmlFor='endDateFilterInput' className='dateInfoFilterLabel'>End Date</label>
            <input type='date' id='endDateFilterInput' className='dateInfoFilterInput' ref={filteredEndDateInputRef}/>
          </div>
        </div>
        <div id='sortDiv'>

        </div>
      </div>
      <div id='requestHistorySectionDiv'>
        {historyDataElements}
      </div>
    </div>
  );
}

export default History;