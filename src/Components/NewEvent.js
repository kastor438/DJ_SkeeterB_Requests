import '../StyleSheets/NewEvent.css';
import '../StyleSheets/ReactCalendar.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes, listAll } from "firebase/storage";
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
const storage = getStorage(app);

const NewEvent = props => {
  // States
  const [navigateToHome, SetNavigateToHome] = useState(false);
  const [navigateToUpcoming, SetNavigateToUpcoming] = useState(false);
  const [calendarDate, SetCalendarDate] = useState(new Date());
  const [selectedEventImageURL, SetSelectedEventImageURL] = useState('');
  const [eventImageURLs, SetEventImageURLs] = useState([]);

  const eventImageElements = eventImageURLs.map((val) => (
    React.createElement('div', {key : val, className : 'newEventImageDiv', 'data-imageurl' : val, onClick : (e) => SelectEventImage(e.target)},
      React.createElement('img', {src : val, alt : '', className : 'newEventImage'})
    )
  ));

  // DOM Refs
  const calendarDateHeaderRef = useRef();
  const newEventVenueInputRef = useRef();
  const hourSelectRef = useRef();
  const minuteSelectRef = useRef();
  const dayNightSelectRef = useRef();
  const newEventDescriptionInputRef = useRef();
  const repeatsInputRef = useRef();
  const repeatTimeFrameSelectRef = useRef();
  const repeatsEndDateInputRef = useRef();
  const newUploadDivRef = useRef();
  const newUploadHeaderRef = useRef();
  const newEventImageUploadInputRef = useRef();
  const uploadImageRadioInputRef = useRef();
  const selectImageRadioInputRef = useRef();
  const previousUploadsDivRef = useRef();
  const previousUploadsHeaderRef = useRef();
  const submitNewEventButtonRef = useRef();

  // DB Refs
  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    submitNewEventButtonRef.current.disabled = true;
    uploadImageRadioInputRef.current.checked = true;
    const fetchUploadedEventImageRefs = 
      listAll(storageRef(storage, 'EventImages/')).then((res) => {
        var eventImageRefs = [];
        res.items.forEach((itemRef) => {
          eventImageRefs.push(itemRef);
        });
        return eventImageRefs;
      });

      fetchUploadedEventImageRefs.then((eventImageRefs) => {
      var uploadedEventImageURLs = [];
      for(var i = 0; i < eventImageRefs.length; i++){
        getDownloadURL(eventImageRefs[i]).then((imageURL) => {
          uploadedEventImageURLs.push(imageURL);
        });
      }
      setTimeout(function(){
        SetEventImageURLs(uploadedEventImageURLs);
        setTimeout(() => {
          ToggleUploadImage();
        }, 500)
      }, 500)
    });
  }, [])

  useEffect(() => {
    if(!auth.currentUser || (auth.currentUser.uid !== 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' && auth.currentUser.uid !== 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      SetNavigateToHome(true);
    }
  }, [props.authUser])

  useEffect(() => {
    calendarDateHeaderRef.current.innerHTML = `${calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${calendarDate.getFullYear()}`;
  }, [calendarDate]);

  useEffect(() => {
    CheckValidInput();
  }, [selectedEventImageURL]);

  function RepeatingOnChange(){
    if(repeatsInputRef.current.checked){
      repeatTimeFrameSelectRef.current.disabled = false;
      repeatsEndDateInputRef.current.disabled = false;
    }
    else{
      repeatTimeFrameSelectRef.current.disabled = true;
      repeatsEndDateInputRef.current.disabled = true;
    }
    CheckValidInput();
  }
  
  function ToggleUploadImage(){
    selectImageRadioInputRef.current.checked = false;
    newEventImageUploadInputRef.current.disabled = false;
    newUploadDivRef.current.classList.remove('disabledNewUploadDiv');
    previousUploadsDivRef.current.classList.add('disabledNewUploadDiv')
    var currSelectedEventImage = document.querySelector('.selectedEventImage');
    if(currSelectedEventImage !== null){
      currSelectedEventImage.classList.remove('selectedEventImage');
      SetSelectedEventImageURL('');
    }
    let previousUploadedImageDivs = document.querySelectorAll('.newEventImageDiv');
    for(var i = 0; i < previousUploadedImageDivs.length; i++){
      previousUploadedImageDivs[i].classList.add('disabledUpload');
    }
    newUploadHeaderRef.current.style.color = '#FFF';
    previousUploadsHeaderRef.current.style.color = '#949494AC';
    CheckValidInput();
  }

  function ToggleSelectImage(){
    uploadImageRadioInputRef.current.checked = false;
    newEventImageUploadInputRef.current.disabled = true;
    newUploadDivRef.current.classList.add('disabledNewUploadDiv');
    previousUploadsDivRef.current.classList.remove('disabledNewUploadDiv')
    let previousUploadedImageDivs = document.querySelectorAll('.newEventImageDiv');
    for(var i = 0; i < previousUploadedImageDivs.length; i++){
      previousUploadedImageDivs[i].classList.remove('disabledUpload');
    }
    newUploadHeaderRef.current.style.color = '#949494AC';
    previousUploadsHeaderRef.current.style.color = '#FFF';
    newEventImageUploadInputRef.current.value = null;
    CheckValidInput();
  }

  function ImageUploadOnChange(){
    if(newEventImageUploadInputRef.current.files[0] !== undefined &&
      (newEventImageUploadInputRef.current.files[0].type === 'image/jpeg' ||
      newEventImageUploadInputRef.current.files[0].type === 'image/jpg' ||
      newEventImageUploadInputRef.current.files[0].type === 'image/png' ||
      newEventImageUploadInputRef.current.files[0].type === 'image/svg+xml')){
        var currSelectedEventImage = document.querySelector('.selectedEventImage');
        if(currSelectedEventImage !== null){
          currSelectedEventImage.classList.remove('selectedEventImage');
          SetSelectedEventImageURL('');
        }
    }
    else{
      newEventImageUploadInputRef.current.value = null;
    }
    CheckValidInput();
  }

  function SelectEventImage(element){
    var currSelectedEventImage = document.querySelector('.selectedEventImage');
    if(currSelectedEventImage !== null){
      currSelectedEventImage.classList.remove('selectedEventImage');
      if(currSelectedEventImage.dataset['imageurl'] !== element.dataset['imageurl']){
        element.classList.add('selectedEventImage');
        SetSelectedEventImageURL(element.dataset['imageurl']);
      }
      else{
        SetSelectedEventImageURL('');
      }
    }
    else{
      element.classList.add('selectedEventImage');
      SetSelectedEventImageURL(element.dataset['imageurl']);
      CheckValidInput();
    }
  }

  function CheckValidInput(){
    var validInput = true;

    // Event Venue Check
    if(newEventVenueInputRef.current.value.length <= 0){
      validInput = false;
    }

    // Event Start Time Check


    // Event Description Check
    if(newEventDescriptionInputRef.current.value.length <= 0){
      validInput = false;
    }

    // Repeating Check
    if(repeatsInputRef.current.checked){
      if(repeatsEndDateInputRef.current.value === ''){
        validInput = false;
      }
    }

    // Uploaded File Check
    if(uploadImageRadioInputRef.current.checked){
      if(newEventImageUploadInputRef.current.files[0] === undefined ||
        (newEventImageUploadInputRef.current.files[0].type !== 'image/jpeg' &&
        newEventImageUploadInputRef.current.files[0].type !== 'image/jpg' &&
        newEventImageUploadInputRef.current.files[0].type !== 'image/png' &&
        newEventImageUploadInputRef.current.files[0].type !== 'image/svg+xml')){
          validInput = false;
      }
    }
    
    // Selected Image Check
    if(selectImageRadioInputRef.current.checked){
      if(selectedEventImageURL === ''){
        validInput = false;
      }
    }

    if(validInput){
      submitNewEventButtonRef.current.disabled = false;
    }
    else{
      submitNewEventButtonRef.current.disabled = true;
    }
  }

  function SubmitNewEvent(){
    let nextEventDate = calendarDate;
    let endDate = repeatsEndDateInputRef.current.value !== '' ? new Date(repeatsEndDateInputRef.current.value) : null;
    const fetchNewEventKey = get(child(dbRef, 'Events/')).then((snapshot) => {
      if(snapshot.val()){
        var highestEventKey = Object.keys(snapshot.val()).reduce((k1, k2) => parseInt(k1) > parseInt(k2) ? parseInt(k1) : parseInt(k2));
        let newEventKey = highestEventKey + 1;
        return newEventKey;
      }
      else{
        return 1;
      }
    });

    if(uploadImageRadioInputRef.current.checked){
      fetchNewEventKey.then((newEventKey) => {
        uploadBytes(storageRef(storage, `EventImages/EventImage-ID-${newEventKey}`), newEventImageUploadInputRef.current.files[0]).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((imageURL) => {
            RecursiveCreateNewEvent(newEventKey, nextEventDate, endDate, imageURL);
          });
        });
      });
    }
    else{
      fetchNewEventKey.then((newEventKey) => {
        RecursiveCreateNewEvent(newEventKey, nextEventDate, endDate, selectedEventImageURL);
      });
    }
  }

  function RecursiveCreateNewEvent(eventID, nextEventDate, endDate, imageURL){
    set(ref(db, `Events/${eventID}/`), {
      EventVenue : newEventVenueInputRef.current.value,
      EventDate : `${nextEventDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(nextEventDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${nextEventDate.getFullYear()}`,
      EventStartTime : `${hourSelectRef.current.value}:${minuteSelectRef.current.value} ${dayNightSelectRef.current.value}`,
      EventDescription : newEventDescriptionInputRef.current.value,
      EventImageURL : imageURL,
      Cancelled : false
    });
    
    if(endDate != null && repeatsInputRef.current.checked){
      if(repeatTimeFrameSelectRef.current.value === 'Weekly')
        nextEventDate.setDate(nextEventDate.getDate() + 7);
      
      if(nextEventDate <= endDate){
        RecursiveCreateNewEvent(eventID+1, nextEventDate, endDate, imageURL);
      }
      else{
        SetNavigateToUpcoming(true);
      }
    }
    else{
      SetNavigateToUpcoming(true);
    }
  }

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  else if(navigateToUpcoming === true){
    return <Navigate to='/Upcoming'/>;
  }
  return (
    <div id='newEventDiv'>
      <div id='newEventContainerDiv'>
        <div id='calendarAndDateDiv'>
          <div id='calendarDiv'>
            <Calendar id='upcomingCalendar' minDate={new Date()} maxDate={new Date("2035, 9, 19")} onChange={SetCalendarDate} value={calendarDate} />
          </div>
          <div id='calendarDateHeaderDiv'>
            <h3 id='calendarDateHeader' ref={calendarDateHeaderRef}></h3>
          </div>
        </div>
        <div id='newEventInfoContainerDiv'>
          <div id='newEventVenueDiv' className='newEventInfoDiv'>
            <label htmlFor='newEventVenueInput' className='newEventInfoLabel'>Event Venue: </label>
            <input type='text' id='newEventVenueInput' ref={newEventVenueInputRef} autoComplete='off' onChange={CheckValidInput}/>
          </div>
          <div id='newEventStartTimeDiv' className='newEventInfoDiv'>
            <label className='newEventInfoLabel'>Event Start Time:</label>
            <select id='hourSelect' ref={hourSelectRef} defaultValue={'9'} size={4}>
              <option value={'1'}>1</option>
              <option value={'2'}>2</option>
              <option value={'3'}>3</option>
              <option value={'4'}>4</option>
              <option value={'5'}>5</option>
              <option value={'6'}>6</option>
              <option value={'7'}>7</option>
              <option value={'8'}>8</option>
              <option value={'9'}>9</option>
              <option value={'10'}>10</option>
              <option value={'11'}>11</option>
              <option value={'12'}>12</option>
            </select>
            <select id='minuteSelect' ref={minuteSelectRef} defaultValue={'00'} size={4}>
              <option value={'00'}>00</option>
              <option value={'15'}>15</option>
              <option value={'30'}>30</option>
              <option value={'45'}>45</option>
            </select>
            <select id='dayNightSelect' ref={dayNightSelectRef} defaultValue={'PM'} size={2}>
              <option value={'AM'}>AM</option>
              <option value={'PM'}>PM</option>
            </select>
          </div>
          <div id='newEventDescriptionDiv' className='newEventInfoDiv'>
            <label htmlFor='newEventDescriptionInput' className='newEventInfoLabel'>Event Description:</label>
            <textarea id='newEventDescriptionInput' ref={newEventDescriptionInputRef} maxLength={150} rows={7} onChange={CheckValidInput}/>
          </div>
        </div>
      </div>
      <div id='repeatsDiv'>
        <div id='repeatsInputDiv'>
          <label htmlFor='repeatsInput' className='repeatsInfoLabel'>Repeating: </label>
          <input type='checkbox' id='repeatsInput' ref={repeatsInputRef} onChange={RepeatingOnChange}/>
        </div>
        <div id='repeatsTimeFrameSelectDiv'>
          <label>Cycle: </label>
          <select id='repeatsTimeFrameSelect' ref={repeatTimeFrameSelectRef} defaultValue={'Weekly'} onChange={CheckValidInput} size={1} disabled>
            <option value={'Weekly'}>Weekly</option>
          </select>
        </div>
        <div id='repeatsEndDateDiv'>
          <label htmlFor='repeatsEndDateInput' className='repeatsInfoLabel'>End Date: </label>
          <input type='date' id='repeatsEndDateInput' ref={repeatsEndDateInputRef} onChange={CheckValidInput} disabled/>
        </div>
      </div>
      <div id='uploadOrSelectImageDiv'>
        <div id='newUploadDiv' ref={newUploadDivRef}>
          <div id='newUploadHeaderDiv'>
            <h4 id='newUploadHeader'  ref={newUploadHeaderRef}>Upload Image</h4>
          </div>
          <div id='newEventImageDiv'>
            <label htmlFor='newEventImageUploadInput'>Event Image:</label>
            <input type='file' id='newEventImageUploadInput' ref={newEventImageUploadInputRef} onChange={ImageUploadOnChange}/>
          </div>
        </div>
        <div id='imageChoiceSpacer'>
          <div id='imageChoiceDiv'>
            <div id='uploadImageRadioInputDiv'>
              <label htmlFor='uploadImageRadioInput'>Upload Image:</label>
              <input type='radio' id='uploadImageRadioInput' ref={uploadImageRadioInputRef} onChange={ToggleUploadImage}/>
            </div>
            <div id='selectImageRadioInputDiv'>
              <label htmlFor='selectImageRadioInput'>Select Image:</label>
              <input type='radio' id='selectImageRadioInput' ref={selectImageRadioInputRef} onChange={ToggleSelectImage}/>
            </div>
          </div>
        </div>
        <div id='previousUploadsDiv' ref={previousUploadsDivRef}>
          <div id='previousUploadsHeaderDiv'>
            <h4 id='previousUploadsHeader' ref={previousUploadsHeaderRef}>Previous Uploads</h4>
          </div>
          <div id='UploadedImagesDiv'>
            {eventImageElements}
          </div>
        </div>
      </div>
      <div id='submitNewEventButtonDiv'>
          <button id='submitNewEventButton' ref={submitNewEventButtonRef} onClick={() => SubmitNewEvent()}>Submit</button>
      </div>
    </div>
  );
}

export default NewEvent;