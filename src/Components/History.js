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
  const [historyDataElements, SetHistoryDataElements] = useState([]);

  const historyDataElementsRef = useRef([]);
  historyDataElementsRef.current = historyDataElements;

  // DOM Refs
  const filteredSongNameInputRef = useRef();
  const filteredArtistNameInputRef = useRef();
  const filteredRequestedByInputRef = useRef();
  const filteredVotersCountInputRef = useRef();
  const filteredMinVoteRatingInputRef = useRef();
  const filteredMaxVoteRatingInputRef = useRef();
  const filteredStartDateInputRef = useRef();
  const filteredEndDateInputRef = useRef();

  // DB Refs
  const db = getDatabase();
  const dbRef = ref(getDatabase());
  
  var initialEndDate = new Date();
  var intialEndDateString = initialEndDate.toISOString().substring(0, 10);

  var intialStartDate = new Date();
  intialStartDate.setMonth(initialEndDate.getMonth() - 1);
  var intialStartDateString = intialStartDate.toISOString().substring(0,10);

  useEffect(() => {
    if(!auth.currentUser || (auth.currentUser.uid !== 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' && auth.currentUser.uid !== 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      SetNavigateToHome(true);
    }
    else{
      GetHistory();
    }
  }, [props.authUser])

  function GetHistory(){
    get(ref(db, '/')).then((snapshot) => {
      if(snapshot.exists()){
        // console.log(snapshot.val());
        const historyDateData = [];
        Object.entries(snapshot.val().History).forEach(([key, value]) => {
          var historySplitDate = key.split('-');
          var splitFilteredStartDate = filteredStartDateInputRef.current.value.split('-');
          var splitFilteredEndDate = filteredEndDateInputRef.current.value.split('-');
          var filterMatch = false;
          const filteredHistoryRequestKeys = [];
          if((parseInt(historySplitDate[2]) > parseInt(splitFilteredStartDate[0]) ||
          (parseInt(historySplitDate[2]) == parseInt(splitFilteredStartDate[0]) && (parseInt(historySplitDate[1]) > parseInt(splitFilteredStartDate[1]) ||
          (parseInt(historySplitDate[1]) == parseInt(splitFilteredStartDate[1]) && parseInt(historySplitDate[0]) >= parseInt(splitFilteredStartDate[2])))))
          &&
          (parseInt(historySplitDate[2]) < parseInt(splitFilteredEndDate[0]) ||
          (parseInt(historySplitDate[2]) == parseInt(splitFilteredEndDate[0]) && (parseInt(historySplitDate[1]) < parseInt(splitFilteredEndDate[1]) ||
          (parseInt(historySplitDate[1]) == parseInt(splitFilteredEndDate[1]) && parseInt(historySplitDate[0]) <= parseInt(splitFilteredEndDate[2])))))){
            Object.entries(value).forEach(([historyRequestKey, historyRequestValue]) => {
              if(filteredSongNameInputRef.current.value != '' || filteredArtistNameInputRef.current.value != '' ||
              filteredRequestedByInputRef.current.value != '' || filteredVotersCountInputRef.current.value != '' ||
              filteredMinVoteRatingInputRef.current.value != '' || filteredMaxVoteRatingInputRef.current.value != ''){
                var requestedByDisplayName = historyRequestValue.RequestedBy == '' ? 'Non-User' : snapshot.val().Users[historyRequestValue.RequestedBy].DisplayName ? snapshot.val().Users[historyRequestValue.RequestedBy].DisplayName : historyRequestValue.RequestedBy;

                if(historyRequestValue.SongName.toLowerCase().includes(filteredSongNameInputRef.current.value.toLowerCase()) &&
                historyRequestValue.ArtistName.toLowerCase().includes(filteredArtistNameInputRef.current.value.toLowerCase()) &&
                requestedByDisplayName.toLowerCase().includes(filteredRequestedByInputRef.current.value.toLowerCase()) &&
                (filteredVotersCountInputRef.current.value == '' || parseInt(historyRequestValue.Upvotes) + parseInt(historyRequestValue.Downvotes) >= parseInt(filteredVotersCountInputRef.current.value)) &&
                (filteredMinVoteRatingInputRef.current.value == '' || parseInt(historyRequestValue.Upvotes) - parseInt(historyRequestValue.Downvotes) >= filteredMinVoteRatingInputRef.current.value) &&
                (filteredMaxVoteRatingInputRef.current.value == '' || parseInt(historyRequestValue.Upvotes) - parseInt(historyRequestValue.Downvotes) <= filteredMaxVoteRatingInputRef.current.value)){
                  filterMatch = true;
                  filteredHistoryRequestKeys.push(historyRequestKey)  
                }
              }
              else{
                filterMatch = true;
                filteredHistoryRequestKeys.push(historyRequestKey)
              }
            });
          }
          
          // console.log(filteredHistoryRequestKeys);
          if(filterMatch == true){
            var filteredHistoryRequests = [];
            Object.entries(value).forEach(([historyRequestkey, historyRequestValue]) => {
              if(filteredHistoryRequestKeys.includes(historyRequestkey)){
                filteredHistoryRequests.push(([historyRequestkey, historyRequestValue]));
              }
            });
            // console.log(filteredHistoryRequests);
            var historyDate = {
              day: parseInt(historySplitDate[0]),
              month: parseInt(historySplitDate[1]),
              year: parseInt(historySplitDate[2]),
              historyRequests: filteredHistoryRequests
            }
            historyDateData.push(historyDate);
            historyDateData.sort((a, b) => b.year != a.year ? parseInt(b.year) - parseInt(a.year) : b.month != a.month ? parseInt(b.month) - parseInt(a.month) : parseInt(b.day) - parseInt(a.day));
          }
        });
        
        var historyDateSectionElements = [];
        for(var i = 0; i < historyDateData.length; i++){
          var historyRequestsElements = [];
          var historyRequestKeys = [];
          var historyRequestValues = [];
          Object.values(historyDateData[i].historyRequests).forEach(historyRequest => {
            historyRequestKeys.push(historyRequest[0]);
            historyRequestValues.push(historyRequest[1]);
          });
          for(var j = 0; j < historyRequestKeys.length; j++){
            // console.log(historyRequest);
            var historyRequestKey = historyRequestKeys[j];
            var historyRequestValue = historyRequestValues[j];
            var historyRequestElement = 
              React.createElement('div', {className : 'historyRequestDiv', key : `historyRequest${historyRequestKey}`}, 
                React.createElement('div', {className : 'historyRequestDataTextDiv historyRequestSongNameDiv'}, 
                  React.createElement('p', {className : 'historyRequestDataText historyRequestSongName'}, historyRequestValue.SongName),
                ),
                React.createElement('div', {className : `${j == historyRequestKeys.length-1 ? 'historyRequestDataTextDiv historyRequestArtistNameDiv dateFinalRequest' : 'historyRequestDataTextDiv historyRequestArtistNameDiv'}`}, 
                  React.createElement('p', {className : 'historyRequestDataText historyRequestArtistName'}, historyRequestValue.ArtistName),
                ),
                React.createElement('div', {className : 'historyRequestDataTextDiv historyRequestVoterCountDiv'}, 
                  React.createElement('p', {className : 'historyRequestDataText historyRequestVotersHeader'}, 'Voters'),
                  React.createElement('p', {className : 'historyRequestDataText historyRequestVoterCount'}, parseInt(historyRequestValue.Upvotes) + parseInt(historyRequestValue.Downvotes))
                ),
                React.createElement('div', {className : 'historyRequestDataTextDiv historyRequestVoterRatingDiv'}, 
                  React.createElement('p', {className : 'historyRequestDataText historyRequestVoterRatingHeader'}, 'Rating'),
                  React.createElement('p', {className : 'historyRequestDataText historyRequestVoterRating'}, parseInt(historyRequestValue.Upvotes) - parseInt(historyRequestValue.Downvotes))
                ),
                React.createElement('div', {className : `${j == historyRequestKeys.length-1 ? 'historyRequestDataTextDiv historyRequestRequestedByNameDiv dateFinalRequest' : 'historyRequestDataTextDiv historyRequestRequestedByNameDiv'}`}, 
                  React.createElement('p', {className : 'historyRequestDataText historyRequestRequestedByNameHeader'}, 'Requested By'),
                  React.createElement('p', {className : 'historyRequestDataText historyRequestRequestedByName'}, historyRequestValue.RequestedBy == '' ? 'Non-User' : snapshot.val().Users[historyRequestValue.RequestedBy].DisplayName ? snapshot.val().Users[historyRequestValue.RequestedBy].DisplayName : historyRequestValue.RequestedBy)
                )
              );
            historyRequestsElements.push(historyRequestElement);
          }
          var dateSectionElement =
            React.createElement('div', {className : 'historyRequestSection', key : `historyRequestSection${historyDateData[i].day}-${historyDateData[i].month}-${historyDateData[i].year}`},
              React.createElement('div', {className : 'historyRequestSectionHeaderDiv', },
                React.createElement('h3', {className : 'historyRequestSectionHeader'}, `${historyDateData[i].day}-${historyDateData[i].month}-${historyDateData[i].year}`),
                React.createElement('div', {className : 'requestDropDownDiv', onClick : (e) => ToggleDateSectionDropDown(e.target)},
                  React.createElement('div', {className : 'requestDropDownBar1'}),
                  React.createElement('div', {className : 'requestDropDownBar2'}),
                  React.createElement('div', {className : 'requestDropDownBar3'}),
                  React.createElement('div', {className : 'requestDropDownBar4'}),
                  React.createElement('div', {className : 'requestDropDownBar5'}),
                  React.createElement('div', {className : 'requestDropDownBar6'})
                )              
              ),
              React.createElement('div', {className : 'historyRequestsElementsContainer'},
                React.createElement('div', {className : 'historyRequestsElementsClosedDiv'}, 
                  React.createElement('p', {className : ''}, `[${historyRequestsElements.length} ${historyRequestsElements.length > 1 ? 'Requests' : 'Request'}]`)
                ),
                historyRequestsElements
              )
            );
          historyDateSectionElements.push(dateSectionElement);
        }
        SetHistoryDataElements(historyDateSectionElements);
        // console.log(historyDateData);
      }
    });
  }

  function ToggleDateSectionDropDown(element){
    element.classList.toggle('openRequestSectionDropDown');
    element.parentNode.parentNode.children[1].classList.toggle('openHistoryDateSection');
    // console.log(element.parentNode.parentNode.children[1].classList);
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
            <input type='text' id='songNameFilterInput' className='songRequestInfoFilterInput' ref={filteredSongNameInputRef} onChange={GetHistory}/>
          </div>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='artistNameFilterInput' className='songRequestInfoFilterLabel'>Artist Name</label>
            <input type='text' id='artistNameFilterInput' className='songRequestInfoFilterInput' ref={filteredArtistNameInputRef} onChange={GetHistory}/>
          </div>
          <div className='requestedByInfoFilterDiv'>
            <label htmlFor='requestedByFilterInput' className='songRequestInfoFilterLabel'>Requested By</label>
            <input type='text' id='requestedByFilterInput' className='songRequestInfoFilterInput' ref={filteredRequestedByInputRef} onChange={GetHistory}/>
          </div>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='minimumVotersCountFilterInput' className='songRequestInfoFilterLabel'>Voters Count</label>
            <input type='number' id='minimumVotersCountFilterInput' className='songRequestInfoFilterInput' ref={filteredVotersCountInputRef} onChange={GetHistory}/>
          </div>
          <div className='requestInfoFilterDiv'>
            <label htmlFor='minimumVoteRatingFilterInput' className='songRequestInfoFilterLabel'>VoteRating</label>
            <input type='number' id='minimumVoteRatingFilterInput' className='songRequestInfoFilterInput' ref={filteredMinVoteRatingInputRef} onChange={GetHistory}/>
            <input type='number' id='maximumVoteRatingFilterInput' className='songRequestInfoFilterInput' ref={filteredMaxVoteRatingInputRef} onChange={GetHistory}/>
          </div>
        </div>
        <div id='dateFilterDiv'>
          <div className='dateInfoFilterDiv'>
            <label htmlFor='startDateFilterInput' className='dateInfoFilterLabel'>Start Date</label>
            <input type='date' id='startDateFilterInput' className='dateFilterInput' ref={filteredStartDateInputRef} defaultValue={intialStartDateString} onChange={GetHistory}/>
          </div>
          <div className='dateInfoFilterDiv'>
            <label htmlFor='endDateFilterInput' className='dateInfoFilterLabel'>End Date</label>
            <input type='date' id='endDateFilterInput' className='dateInfoFilterInput' ref={filteredEndDateInputRef} defaultValue={intialEndDateString} onChange={GetHistory}/>
          </div>
        </div>
        <div id='sortDiv'>

        </div>
      </div>
      <div id='requestHistoryContainerDiv'>
        {historyDataElementsRef.current}
      </div>
    </div>
  );
}

export default History;