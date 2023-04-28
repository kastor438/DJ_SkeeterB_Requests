import '../StyleSheets/Settings.css';

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

const Settings = props => {
  const [venuesElements, SetVenuesElements] = useState([]);
  const [newVenueSubmitHasListener, SetNewVenueSubmitHasListener] = useState(false);
  const settingsSectionHeaders = ['NavBar', 'Theme', 'Venues', 'Socials', 'Security'];
  const [navigateToHome, SetNavigateToHome] = useState(false);
  const [previewObjectURL, SetPreviewObjectURL] = useState(null);
  // DOM Refs
  const logoPreviewImageRef = useRef();
  const newVenueNameRef = useRef();
  const newVenueAddressRef = useRef();
  const newVenueImageRef = useRef();
  const newVenueImageInputRef = useRef();
  const newVenueSubmiButtonRef = useRef();

  // DB Refs
  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    LoadVenues();
  }, [])

  useEffect(() => {
    if(!auth.currentUser || (auth.currentUser.uid !== 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' && auth.currentUser.uid !== 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      SetNavigateToHome(true);
    }
  }, [props.authUser])
  
  function LoadVenues(){
    get(child(dbRef, '/Venues/')).then((snapshot) => {
      if(snapshot.exists()){
        var venuesElements = [];
        Object.entries(snapshot.val()).forEach((venueData) => {
          var venueElement = 
            React.createElement('div', {key : 'venue' + venueData[0], id : 'venue' + venueData[0], className : 'venueInfoDiv'},
              React.createElement('div', {className : 'venueImageDiv'}, 
                React.createElement('img', {className : 'venueImage', src : venueData[1].VenueImageURL, alt : 'Venue Image'})
              ),
              React.createElement('div', {className : 'venueInfo'},
                React.createElement('p', {id : 'venueName' + venueData[0], className : 'venueName'}, venueData[1].VenueName),
                React.createElement('p', {id : 'venueAdress' + venueData[0]}, venueData[1].VenueAddress),
              ),
            // Replace with socials
            // --------------------
            //   React.createElement('div', {id : 'spotifyLinkDiv' + venueData[0], className : 'spotifyLinkDiv'},
            //     (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') ? 
            //       React.createElement('button', {id : 'removeRequestButton', 'data-requestkey' : venueData[0], onClick : (e) => SkeeterRemoveSong(e.target)}, 'X')
            //       :
            //       React.createElement('span', {}, '')
            //     ),
            //     React.createElement('a', {id : 'lineupSpotifyLink' + venueData[0], className : ((venueData[1].SpotifyURL != '' ? ' lineupSpotifyLink' : 'noSpotifyLink')), href : venueData[1].SpotifyURL, target : 'blank'}, '\uD83D\uDD17'),
            //     React.createElement('span', {}, '')
            //   )
            );
          venuesElements.push(venueElement);
        });
        SetVenuesElements(venuesElements);
      }
      else{
        SetVenuesElements([React.createElement('h4', {id : 'noVenuesFoundSpan', key : 'noVenuesFound'}, 'No Venues Added')])
      }
    });
  }

  function SwitchSection(element){
    if(element.dataset['settings_section'] == document.querySelector('.activeSection').dataset['settings_section'])
      return;
    const settingsSectionContainers = document.querySelectorAll('.settingsSectionContainer');
    for(var i = 0; i < settingsSectionContainers.length; i++){
      if(settingsSectionContainers[i].dataset['settings_section'] == element.dataset['settings_section']){
        if(element.dataset['settings_section'] == 'Venues')
          LoadVenues();
        settingsSectionContainers[i].classList.add('activeSection');
        settingsSectionContainers[i].classList.remove('inactiveSection');
      }
      else{
        settingsSectionContainers[i].classList.add('inactiveSection');
        settingsSectionContainers[i].classList.remove('activeSection');
      }
    }
  }

  function ToggleNewVenueMenu(){
    var newVenueDiv = document.querySelector('#newVenueDiv');
    var newVenueFieldsDiv = document.querySelector('#newVenueFieldsDiv');
    if(newVenueFieldsDiv.classList.contains('closedFields')){
      newVenueDiv.classList.add('activeFields');
      newVenueFieldsDiv.className = 'openFields';
    }
    else{
      newVenueDiv.classList.remove('activeFields');
      newVenueFieldsDiv.className = 'closedFields';
    }
  }

  function CheckValidInput_NewVenue(){
    if(newVenueNameRef.current.value.length > 0 && newVenueAddressRef.current.value.length > 0 &&
      newVenueImageInputRef.current.files[0] !== undefined){
        newVenueSubmiButtonRef.current.removeAttribute("disabled");
        if (newVenueSubmitHasListener === false) {
          newVenueSubmiButtonRef.current.addEventListener("click", () => SubmitNewVenue());
          SetNewVenueSubmitHasListener(true);
        }
      }
      else{
        newVenueSubmiButtonRef.current.setAttribute("disabled", "disabled");
      }
  }

  function NewVenueImageOnChange(){
    if(newVenueImageInputRef.current.files[0] !== undefined &&
      (newVenueImageInputRef.current.files[0].type === 'image/jpeg' ||
      newVenueImageInputRef.current.files[0].type === 'image/jpg' ||
      newVenueImageInputRef.current.files[0].type === 'image/png' ||
      newVenueImageInputRef.current.files[0].type === 'image/svg+xml')){
        if(previewObjectURL != null){
          URL.revokeObjectURL(previewObjectURL)
        }         
        const newPreviewObjectURL = URL.createObjectURL(newVenueImageInputRef.current.files[0])
        SetPreviewObjectURL(newPreviewObjectURL)
        newVenueImageRef.current.src = newPreviewObjectURL;
        CheckValidInput_NewVenue();
      }
      else{
        if(previewObjectURL != null){
          URL.revokeObjectURL(previewObjectURL)
        }
        SetPreviewObjectURL(null);
        newVenueImageRef.current.src = 'No-Image-Placeholder-Transparent-Background.png';
        newVenueImageRef.current.value = null;
      }
  }

  function SubmitNewVenue(){
    var newVenueKey = 1;
    var newVenueImageURL = '';
    const fetchNewKey =
      get(child(dbRef, '/Venues/')).then((snapshot) => {
        if(snapshot.exists()){
          newVenueKey = parseInt(Object.keys(snapshot.val()).reduce((k1, k2) => parseInt(k1) > parseInt(k2) ? parseInt(k1) : parseInt(k2))) + 1;
        }
        return newVenueKey;
      });

    fetchNewKey.then((newVenueKey) =>{
      uploadBytes(storageRef(storage, `VenueImages/VenueImage-ID-${newVenueKey}`), newVenueImageInputRef.current.files[0]).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((imageURL) => {
          newVenueImageURL = imageURL;
          CreateNewVenue(newVenueKey, newVenueImageURL)
        });
      });  
    })
  }

  function CreateNewVenue(newVenueKey, newVenueImageURL){
    set(ref(db, `Venues/${newVenueKey}`), {
      VenueName: newVenueNameRef.current.value,
      VenueAddress: newVenueAddressRef.current.value,
      VenueImageURL: newVenueImageURL,
    });
  }

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='settingsDiv'>
      <div>
        <div id='settingsHeaderBar'>
          <div className='settingsHeaderButtonDiv'>
            <button data-settings_section={settingsSectionHeaders[0]} onClick={(e) => SwitchSection(e.target)}>Navigation Bar</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button data-settings_section={settingsSectionHeaders[1]} onClick={(e) => SwitchSection(e.target)}>Theme</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button data-settings_section={settingsSectionHeaders[2]} onClick={(e) => SwitchSection(e.target)}>Venues</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button data-settings_section={settingsSectionHeaders[3]} onClick={(e) => SwitchSection(e.target)}>Socials</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button data-settings_section={settingsSectionHeaders[4]} onClick={(e) => SwitchSection(e.target)}>Security</button>
          </div>
        </div>
        <div id='settingsSectionsDiv'>
          <div id='navbarSettingsDiv' className='settingsSectionContainer activeSection' data-settings_section={settingsSectionHeaders[0]}>
            <div>
              <h3>Navigation Display</h3>
            </div>
            <div>
              <div id='logoSettingsDiv'>
                <div id='logoPreviewDiv'>
                  <img id='logoPreviewImage' ref={logoPreviewImageRef} src='/skeeterB-Logo.ico' alt=''/>
                </div>
                <div>
                  <label>Navigation Bar Logo: </label>
                  <input type='file' id=''/>
                </div>
              </div>
              <div id='navbarHeaderSettingsDiv'>
                <div>
                  <label>Navigation Header: </label>
                  <input type='text' id=''/>
                </div>
              </div>
            </div>
          </div>
          <div id='themeSettingsDiv' className='settingsSectionContainer inactiveSection' data-settings_section={settingsSectionHeaders[1]}>
            <div>
              <h3>Themes</h3>
            </div>
          </div>
          <div id='venueSettingsDiv' className='settingsSectionContainer inactiveSection' data-settings_section={settingsSectionHeaders[2]}>
            <h3>Venues</h3>
            <div id='venuesContainers'>
              {venuesElements}
            </div>
            <div id='newVenueDiv'>
              <button id='newVenueButton' onClick={() => ToggleNewVenueMenu()}>
                <div id='newVenueButtonImageDiv'>
                  <img id='newVenueButtonImage' src='NewVenueIcon.png'/>
                </div>
                New Venue
              </button>
              <div id='newVenueFieldsDiv' className='closedFields'>
                <div id='newVenueTextFieldsDiv'>
                  <div id='newVenueNameDiv' className='newVenueFieldDiv'>
                    <label htmlFor='newVenueName' className='newVenueLabelField'>Venue Name: </label>
                    <input type='text' id='newVenueName' ref={newVenueNameRef} className='newVenueInputTextField' onChange={CheckValidInput_NewVenue}/>
                  </div>
                  <div id='newVenueAddressDiv' className='newVenueFieldDiv'>
                    <label htmlFor='newVenueAddress' className='newVenueLabelField'>Venue Address: </label>
                    <input type='text' id='newVenueAddress' ref={newVenueAddressRef} className='newVenueInputTextField' onChange={CheckValidInput_NewVenue}/>
                  </div>
                </div>
                <div id='newVenueImageFieldDiv'>
                  <div id='newVenueImageDiv'>
                    <img id='newVenueImage' ref={newVenueImageRef} src='No-Image-Placeholder-Transparent-Background.png'/>
                  </div>
                  <div id='newVenueImageInputDiv'>
                    <input id='newVenueImageInput' ref={newVenueImageInputRef} type='file' onChange={() => NewVenueImageOnChange()}/>
                  </div>
                </div>
                <div id='newVenueSubmitButtonDiv'>
                  <button id='newVenueSubmitButton' ref={newVenueSubmiButtonRef} disabled='disabled'>Submit</button>
                </div>
              </div>
            </div>
          </div>
          <div id='socialsSettingsDiv' className='settingsSectionContainer inactiveSection' data-settings_section={settingsSectionHeaders[3]}>
            <div>
              <h3>Socials</h3>
            </div>
          </div>
          <div id='securitySettingsDiv' className='settingsSectionContainer inactiveSection' data-settings_section={settingsSectionHeaders[4]}>
            <div>
              <h3>Security</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;