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
  const [navigateToHome, SetNavigateToHome] = useState(false);

  // DOM Refs
  const logoPreviewImageRef = useRef();
  
  // DB Refs
  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    if(!auth.currentUser || (auth.currentUser.uid !== 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' && auth.currentUser.uid !== 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      SetNavigateToHome(true);
    }
  }, [props.authUser])
  
  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='settingsDiv'>
      <div>
        <div id='settingsHeaderBar'>
          <div className='settingsHeaderButtonDiv'>
            <button>Navigation Bar</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button>Theme</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button>Venues</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button>Socials</button>
          </div>
          <div className='settingsHeaderButtonDiv'>
            <button>Security</button>
          </div>
        </div>
        <div>
          <div id='navbarSettingsDiv' className='settingsSection'>
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
          <div id='themeSettingsDiv' className='settingsSection'>
            <div>
              <h3>Themes</h3>
            </div>
          </div>
          <div id='venueSettingsDiv' className='settingsSection'>
            <div>
              <h3>Venues</h3>
            </div>
          </div>
          <div id='socialsSettingsDiv' className='settingsSection'>
            <div>
              <h3>Socials</h3>
            </div>
          </div>
          <div id='securitySettingsDiv' className='settingsSection'>
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