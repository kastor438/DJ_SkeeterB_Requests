import '../StyleSheets/ModifyEvent.css';
import '../StyleSheets/ReactCalendar.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get, set, update } from "firebase/database";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes, listAll } from "firebase/storage";
import { Navigate, useParams } from 'react-router-dom';
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

const ModifyEvent = props => {
  const { eventID } = useParams();
  // States
  const [navigateToHome, SetNavigateToHome] = useState(false);
  const [navigateToUpcoming, SetNavigateToUpcoming] = useState(false);
  const [originalCalendarDate, SetOriginalCalendarDate] = useState(new Date());
  const [calendarDate, SetCalendarDate] = useState(new Date());
  const [selectedEventImageURL, SetSelectedEventImageURL] = useState('');
  const [eventImageURLs, SetEventImageURLs] = useState([]);
  const [originalEventInfo, SetOriginalEventInfo] = useState(null);

  const eventImageElements = eventImageURLs.map((val) => (
    React.createElement('div', {key : val, className : 'newEventImageDiv', 'data-imageurl' : val, onClick : (e) => SelectEventImage(e.target)},
      React.createElement('img', {src : val, alt : '', className : 'newEventImage'})
    )
  ));

  // DOM Refs
  const originalCalendarDateHeaderRef = useRef();
  const calendarDateHeaderRef = useRef();
  const newEventTitleInputRef = useRef();
  const newEventVenueInputRef = useRef();
  const hourSelectRef = useRef();
  const minuteSelectRef = useRef();
  const dayNightSelectRef = useRef();
  const newEventDescriptionInputRef = useRef();
  const newUploadDivRef = useRef();
  const newUploadHeaderRef = useRef();
  const newEventImageUploadInputRef = useRef();
  const uploadImageRadioInputRef = useRef();
  const selectImageRadioInputRef = useRef();
  const previousUploadsDivRef = useRef();
  const previousUploadsHeaderRef = useRef();
  const submitModifiedEventButtonRef = useRef();

  // DB Refs
  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    submitModifiedEventButtonRef.current.disabled = false;
    selectImageRadioInputRef.current.checked = true;
    ToggleSelectImage();
    const fetchUploadedEventImageRefs = 
      listAll(storageRef(storage, 'EventImages/')).then((res) => {
        var eventImageRefs = [];
        res.items.forEach((itemRef) => {
          eventImageRefs.push(itemRef);
        });
        return eventImageRefs;
      });

    get(child(dbRef, 'Events/')).then((snapshot) => {
      if(snapshot.val()){
        const eventInfo = snapshot.val()[eventID];
        SetOriginalEventInfo(eventInfo);
        if(eventInfo){
          let modifyingEventDate = eventInfo.EventDate.split('/');
          let modifyingYear = parseInt(modifyingEventDate[2]);
          let modifyingMonthIndex = parseInt(modifyingEventDate[1])-1;
          let modifyingDate = parseInt(modifyingEventDate[0]);
          SetOriginalCalendarDate(new Date(modifyingYear, modifyingMonthIndex, modifyingDate));
          SetCalendarDate(new Date(modifyingYear, modifyingMonthIndex, modifyingDate));
          newEventTitleInputRef.current.value = eventInfo.EventTitle;
          newEventVenueInputRef.current.value = eventInfo.EventVenue;
          newEventDescriptionInputRef.current.value = eventInfo.EventDescription;
          hourSelectRef.current.value = eventInfo.EventStartTime.split(':')[0];
          minuteSelectRef.current.value = eventInfo.EventStartTime.split(':')[1].split(' ')[0];
          dayNightSelectRef.current.value = eventInfo.EventStartTime.split(' ')[1];
        }
        else{
          SetNavigateToHome(true);
        }
      }
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
      }, 500)
    });
  }, [])

  useEffect(() => {
    setTimeout(() => {
      let previousUploads = document.querySelectorAll('.newEventImageDiv');
      for(var i = 0; i < previousUploads.length; i++){
        // console.log(originalEventInfo);
        if(originalEventInfo && previousUploads[i].dataset.imageurl === originalEventInfo.EventImageURL){
          SelectEventImage(previousUploads[i]);
          break;
        }
      }
    }, 1000);
  }, [originalEventInfo])

  useEffect(() => {
    if(!auth.currentUser || (auth.currentUser.uid !== 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' && auth.currentUser.uid !== 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      SetNavigateToHome(true);
    }
  }, [props.authUser])

  
  useEffect(() => {
    originalCalendarDateHeaderRef.current.innerHTML = `${originalCalendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(originalCalendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${originalCalendarDate.getFullYear()}`;
  }, [originalCalendarDate]);

  useEffect(() => {
    calendarDateHeaderRef.current.innerHTML = `${calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${calendarDate.getFullYear()}`;
  }, [calendarDate]);

  useEffect(() => {
    CheckValidInput();
  }, [selectedEventImageURL]);
  
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

    // Event Title Check
    if(newEventTitleInputRef.current.value.length <= 0){
      validInput = false;
    }

    // Event Venue Check
    if(newEventVenueInputRef.current.value.length <= 0){
      validInput = false;
    }

    // Event Start Time Check


    // Event Description Check
    if(newEventDescriptionInputRef.current.value.length <= 0){
      validInput = false;
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
      submitModifiedEventButtonRef.current.disabled = false;
    }
    else{
      submitModifiedEventButtonRef.current.disabled = true;
    }
  }

  function SubmitNewEvent(){
    if(uploadImageRadioInputRef.current.checked){
      uploadBytes(storageRef(storage, `EventImages/EventImage-ID-${eventID}`), newEventImageUploadInputRef.current.files[0]).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((imageURL) => {
          UpdateEvent(imageURL);
        });
      });
    }
    else{
      UpdateEvent(selectedEventImageURL);
    }
  }

  function UpdateEvent(imageURL){
    update(ref(db, `Events/${eventID}/`), {
      EventTitle : newEventTitleInputRef.current.value,
      EventVenue : newEventVenueInputRef.current.value,
      EventDate : `${calendarDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2})}/${(calendarDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2})}/${calendarDate.getFullYear()}`,
      EventStartTime : `${hourSelectRef.current.value}:${minuteSelectRef.current.value} ${dayNightSelectRef.current.value}`,
      EventDescription : newEventDescriptionInputRef.current.value,
      EventImageURL : imageURL
    });

    SetNavigateToUpcoming(true);
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
            <h3 id='originalCalendarDateHeader' ref={originalCalendarDateHeaderRef}></h3>
            <span>--&gt;</span>
            <h3 id='calendarDateHeader' ref={calendarDateHeaderRef}></h3>
          </div>
        </div>
        <div id='newEventInfoContainerDiv'>
          <div id='newEventTitleDiv' className='newEventInfoDiv'>
            <label htmlFor='newEventTitleInput' className='newEventInfoLabel'>Event Title: </label>
            <input type='text' id='newEventTitleInput' ref={newEventTitleInputRef} autoComplete='off' onChange={CheckValidInput}/>
          </div>
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
          <button id='submitNewEventButton' ref={submitModifiedEventButtonRef} onClick={() => SubmitNewEvent()}>Submit</button>
      </div>
    </div>
  );
}

export default ModifyEvent;