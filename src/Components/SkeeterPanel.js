import '../StyleSheets/SkeeterSpecificsSongRequests.css';
import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, child, get, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAXh2tjWcUeOvEhUIyeZVNBRBwtn7BebgI",
  authDomain: "dj-skeeterb.firebaseapp.com",
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com",
  projectId: "dj-skeeterb",
  storageBucket: "dj-skeeterb.appspot.com",
  messagingSenderId: "222672756825",
  appId: "1:222672756825:web:974f65737776a233265148",
  measurementId: "G-E5J0711GSP",
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SkeeterPanel = props => {
  const [isPanelOpen, SetIsPanelOpen] = useState(false);

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    const rootRef = ref(db, '/');
    if(auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')){
      onValue(rootRef, (snapshot) => {
        const data = snapshot.val();
        if(data && document.getElementById('skeeterRemoveAllButton') != null){
          if(!data.Requests){
            document.getElementById('skeeterRemoveAllButton').disabled = true;
          }
          else{
            document.getElementById('skeeterRemoveAllButton').disabled = false;
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
        // document.getElementById('skeeterRemoveAllButton').disabled = true;
    });
  }

  return (
      (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')) ?
      <div id='skeeterPanel' className={isPanelOpen ? "openSkeeterPanel" : 'closeSkeeterPanel'}>
        <div id='slidingButtonDiv' className={isPanelOpen ? "slidingButtonDivOpen" : 'slidingButtonDivClosed'}>
          <button id='slidingButton' onClick={(e) => ToggleSkeeterPanel(e.target)}>&#8592;</button>
        </div>
        <div id='skeeterButtonsDiv'>
          <button id='skeeterRemoveAllButton' onClick={() => SkeeterRemoveAllSongs()}>Remove All Requests</button>
        </div>
      </div>
      :
      <div></div>
  );
}

export default SkeeterPanel;