import '../StyleSheets/SkeeterSpecificsSongRequests.css';
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, child, get, onValue } from "firebase/database";
import axios from 'axios';

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
const auth = getAuth(app);

const SkeeterPanel = props => {
  const [isPanelOpen, SetIsPanelOpen] = useState(false);
  const [requestsData, SetRequestsData] = useState(null);

  // DOM Refs
  const SkeeterRemoveAllButtonRef = useRef();
  const SkeeterExportRequestsButtonRef = useRef();

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    const rootRef = ref(db, '/');
    if(auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      onValue(rootRef, (snapshot) => {
        const data = snapshot.val();
        SetRequestsData(data.Requests);
        if(data && SkeeterRemoveAllButtonRef.current != null){
          if(!data.Requests){
            SkeeterRemoveAllButtonRef.current.disabled = true;
            SkeeterExportRequestsButtonRef.current.disabled = true;
          }
          else{
            SkeeterRemoveAllButtonRef.current.disabled = false;
            SkeeterExportRequestsButtonRef.current.disabled = false;
          }
        } 
      });
    }
  }, [props.authUser])

  useEffect(() => {

  }, [isPanelOpen]);

  function ToggleSkeeterPanel(element){
    if(isPanelOpen){
      element.innerHTML = '&#8592;';
    }
    else{
      element.innerHTML = '&#8594;';
    }
    SetIsPanelOpen(!isPanelOpen);
  }

  function SkeeterRemoveAllSongs(){
    get(child(dbRef, 'Requests/')).then((snapshot) => {
      set(ref(db, 'Requests/'), null);
    });
  }

  function SkeeterExportSongs(){
    if(requestsData != null){
      // Google sheet connection URL found on sheet.best
      const deleteSheetData = axios.delete('https://sheet.best/api/sheets/9974aba4-b745-4c88-acbf-f18abcb2c4d2/ID/*');
      deleteSheetData.then(() => {
        const sheetsData = [];
        Object.entries(requestsData).forEach(([key, value]) => {
          sheetsData.push({
            ID : key,
            'Song Name' : value.SongName,
            'Artist Name' : value.ArtistName,
            'Request Count' : value.RequestCount,
            'Spotify URL' : value.SpotifyURL,
            'Spotify Image URL' : value.SpotifyImageURL,
            Upvotes : value.Upvotes,
            Downvotes : value.Downvotes,
            'Vote Count' : value.Upvotes - value.Downvotes
          });
        });

        // console.log(sheetsData);
        axios.post('https://sheet.best/api/sheets/9974aba4-b745-4c88-acbf-f18abcb2c4d2', sheetsData).then((response) => {
          // console.log(response);
        });
      });
    }
  }

  return (
      (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')) ?
      <div id='skeeterPanel' className={isPanelOpen ? "openSkeeterPanel" : 'closeSkeeterPanel'}>
        <div id='slidingButtonDiv' className={isPanelOpen ? "slidingButtonDivOpen" : 'slidingButtonDivClosed'}>
          <button id='slidingButton' onClick={(e) => ToggleSkeeterPanel(e.target)}>&#8592;</button>
        </div>
        <div id='skeeterButtonsDiv'>
          <div className='skeeterButtonDiv'>
            <button id='skeeterRemoveAllButton' ref ={SkeeterRemoveAllButtonRef} className='skeeterPanelButton' onClick={() => SkeeterRemoveAllSongs()}>Remove All Requests</button>
          </div>
          <div className='skeeterButtonDiv'>
            <button id='skeeterExportRequestsButton' ref ={SkeeterExportRequestsButtonRef} className='skeeterPanelButton' onClick={() => SkeeterExportSongs()}>Export Songs</button>
          </div>
        </div>
      </div>
      :
      <div></div>
  );
}

export default SkeeterPanel;