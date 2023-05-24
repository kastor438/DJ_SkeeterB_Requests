import '../StyleSheets/SongRequests.css';
import '../StyleSheets/SkeeterSpecificsSongRequests.css'
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, child, get, onValue, update } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';
import axios from 'axios';

// Component Imports
import RequestLineup from './RequestLineup';
import SkeeterPanel from './SkeeterPanel';

require('upvote/lib/jquery.upvote.js');
// require('upvote/lib/jquery.upvote.css');
require('upvote/lib/images/sprites-stackoverflow.png');

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
const analytics = getAnalytics(app);
const database = getDatabase(app);

const clientID = '822b607fa31944ca91f198b9f5e31613';
const clientSecret = '4aae0065891841c197af65473ac00b49';

const SongRequests = props => {
  const [accessToken, SetAccessToken] = useState("");
  const [canSubmit, SetCanSubmit] = useState(false);
  const [inputSongName, SetInputSongName] = useState("");
  const [inputArtistName, SetInputArtistName] = useState("");
  const [hasListener, SetHasListener] = useState(false);
  const [renderedTracks, SetRenderedTracks] = useState([]);
  const [trackImageLink, SetTrackImageLink] = useState("");
  const [trackName, SetTrackName] = useState('');
  const [artistName, SetArtistName] = useState('');
  const [trackSpotifyURL, SetTrackSpotifyURL] = useState("");
  const [spotifyActive, SetSpotifyActive] = useState(true);
  const [customActive, SetCustomActive] = useState(false);
  const [trackStats, SetTrackStats] = useState(false);
  const [lineupActive, SetLineupActive] = useState(false);

  const accessTokenRef = useRef("");
  accessTokenRef.current = accessToken;

  const inputSongNameRef = useRef("");
  inputSongNameRef.current = inputSongName;

  const inputArtistNameRef = useRef("");
  inputArtistNameRef.current = inputArtistName;

  const spotifyActiveRef = useRef(true);
  spotifyActiveRef.current = spotifyActive;

  const customActiveRef = useRef(false);
  customActiveRef.current = customActive;

  const renderedTracksRef = useRef([]);
  renderedTracksRef.current = renderedTracks;

  const canSubmitRef = useRef(false);
  canSubmitRef.current = canSubmit;

  const trackImageLinkRef = useRef("");
  trackImageLinkRef.current = trackImageLink;

  const trackNameRef = useRef("");
  trackNameRef.current = trackName;

  const artistNameRef = useRef("");
  artistNameRef.current = artistName;

  const trackSpotifyURLRef = useRef("");
  trackSpotifyURLRef.current = trackSpotifyURL;

  const trackStatsRef = useRef(false);
  trackStatsRef.current = trackStats;

  const db = getDatabase();
  const dbRef = ref(getDatabase());
  const invalidChars = '\'"\\/';

  // DOM Refs
  const requestSongButtonRef = useRef();
  const lineupButtonRef = useRef();
  const requestGridContainerRef = useRef();
  const lineupGridContainerRef = useRef();
  const spotifyTabRef = useRef();
  const customTabRef = useRef();
  const songNameInputRef = useRef();
  const artistNameInputRef = useRef();
  const tracksDivRef = useRef();
  const renderedTracksDivRef = useRef();
  const submitSongRequestButtonRef = useRef();
  const submissionTextRef = useRef();
  const popupDivRef = useRef();
  const popupSpanRef = useRef();

  useEffect(() => {
    var currentUrl = window.location.href;
    requestSongButtonRef.current.style.borderBottom = "1px solid white";
    requestSongButtonRef.current.style.color = "#b1afaf";
    requestGridContainerRef.current.style.display = "grid";

    lineupButtonRef.current.style.borderBottom = "none";
    lineupButtonRef.current.style.color = "white";
    
    if(currentUrl.includes("dj")){
      SetTrackStats(true);
    }

    InitializeSpotify();
  }, []);

  useEffect(() => {
    CheckValidInput();
  }, [inputSongName, inputArtistName, spotifyActive, customActive]);

  useEffect(() => {
    if(!canSubmitRef.current){
      submitSongRequestButtonRef.current.setAttribute("disabled", "disabled");
    }
    else{
      submitSongRequestButtonRef.current.removeAttribute("disabled");
    }
  }, [canSubmit]);

  useEffect(() => {
    if(trackStatsRef.current){
      getUserData();
    }
  }, [trackStats]);

  const getUserData = async () => {
    const res = await axios.get('https://geolocation-db.com/json/');
    // console.log(res.data);

    if(trackStatsRef.current){
      var visitorCount = 0;
      get(child(dbRef, 'Visitors/' + res.data['country_code'] + '/' + res.data.city)).then((snapshot) => {
        if(snapshot != null){
          visitorCount = snapshot.val();
          // console.log(snapshot.val())
        }
        set(ref(db, 'Visitors/' + res.data['country_code'] + '/' + res.data.city), (visitorCount+1));
      });
    }
  }

  function InitializeSpotify(){
    var authParams = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + clientID + '&client_secret=' + clientSecret
    }

    fetch('https://accounts.spotify.com/api/token', authParams)
      .then(result => result.json())
      .then(data => SetAccessToken(data.access_token));
  }

  function SwitchToRequestSong(){
    requestSongButtonRef.current.style.borderBottom = "1px solid white";
    requestSongButtonRef.current.style.color = "#b1afaf";
    requestGridContainerRef.current.style.display = "grid";

    lineupButtonRef.current.style.borderBottom = "none";
    lineupButtonRef.current.style.color = "white";
    SetLineupActive(false);
  }

  function SwitchToCurrentLineup(){
    requestSongButtonRef.current.style.borderBottom = "none";
    requestSongButtonRef.current.style.color = "white";
    requestGridContainerRef.current.style.display = "none";

    lineupButtonRef.current.style.borderBottom = "1px solid white";
    lineupButtonRef.current.style.color = "#b1afaf";
    SetLineupActive(true);
  }

  function SwitchToSpotify(){
    if(!spotifyActiveRef.current){
      let screenWidth = window.innerWidth;
      spotifyTabRef.current.style.backgroundColor = "#36393f";
      spotifyTabRef.current.style.zIndex = "3";
      spotifyTabRef.current.children[0].classList.add('selectedTab')

      customTabRef.current.style.backgroundColor = "#2e2f32";
      customTabRef.current.style.zIndex = "2";
      customTabRef.current.children[0].classList.remove('selectedTab')

      if(screenWidth <= 800)
        renderedTracksDivRef.current.style.height = "95%";
      else
        renderedTracksDivRef.current.style.height = "320px";

      SetSpotifyActive(true);
      SetCustomActive(false);
    }
  }

  function SwitchToCustom(){
    if(!customActiveRef.current){
      spotifyTabRef.current.style.backgroundColor = "#2e2f32";
      spotifyTabRef.current.style.zIndex = "2";
      spotifyTabRef.current.children[0].classList.remove('selectedTab')

      customTabRef.current.style.backgroundColor = "#36393f";
      customTabRef.current.style.zIndex = "3";
      customTabRef.current.children[0].classList.add('selectedTab')

      tracksDivRef.current.style.height = "0";
      renderedTracksDivRef.current.style.height = "0px";

      SetSpotifyActive(false);
      SetCustomActive(true);
    }
  }

  function UpdateSongName(value){
    SetInputSongName(value);
  }

  function UpdateArtistName(value){
    SetInputArtistName(value);
  }

  function CheckValidInput(){
    let screenWidth = window.innerWidth;
    if(screenWidth <= 800)
      tracksDivRef.current.style.height = "0px";

    // Reset all song options to be visually unselected.
    var songOptions = document.querySelectorAll('.songOption');
    for(var i = 0; i < songOptions.length; i++){
      songOptions[i].classList.remove('selectedSongOption');
    }
    
    // Initial resets
    if(!customActiveRef.current || inputSongNameRef.current.length <= 1 || inputArtistNameRef.current.length <= 1){
      SetTrackName("");
      SetArtistName("");
      submitSongRequestButtonRef.current.setAttribute("disabled", "disabled");
      SetCanSubmit(false);
      SetRenderedTracks([]);
    }
    renderedTracksDivRef.current.style.overflowY = "hidden";

    // Checks for valid input to proceed.
    if(inputSongNameRef.current.length <= 1){
      renderedTracksDivRef.current.style.display = "none";
      return;
    }
    else{
      for(var i = 0; i < inputSongNameRef.current.length; i++){
        if(invalidChars.includes(inputSongNameRef.current.substring(i, i+1))){
          renderedTracksDivRef.current.style.display = "none";
          return;
        }
      }
      for(i = 0; i < inputArtistNameRef.current.length; i++){
        if(invalidChars.includes(inputArtistNameRef.current.substring(i, i+1))){
          renderedTracksDivRef.current.style.display = "none";
          return;
        }
      }
    }

    // All checks passed, allow submission or fetch spotify song options.
    if (hasListener === false) {
      submitSongRequestButtonRef.current.addEventListener("click", () => SubmitRequest());
      SetHasListener(true);
    }
    if(spotifyActiveRef.current){
      FetchSpotifySongs();
    }
    else if(customActiveRef.current && inputArtistNameRef.current.length > 1){
      CustomSetup();
    }
  }

  async function SubmitRequest(){
    if(canSubmitRef.current){
      if(spotifyActiveRef.current){ 
        AddRequest(trackNameRef.current, artistNameRef.current, trackSpotifyURLRef.current, trackImageLinkRef.current);
      }
      else if(customActiveRef.current){
        AddRequest(inputSongNameRef.current, inputArtistNameRef.current, '', '');
      }
      
      songNameInputRef.current.value = '';
      artistNameInputRef.current.value = '';

      SetInputSongName('');
      SetInputArtistName('');
      SetTrackSpotifyURL('');
      SetTrackImageLink('')
      SetRenderedTracks([]);
    }
  }

  function AddRequest(songName, artistName, spotifyURL, spotifyImageLink){
    var nextSongKey = 1;
    var preapprovalSongIDs = [];
    var songRequests = [];
    var prevRequestCount = 0;
    var requestedByUID = (auth.currentUser != null ? auth.currentUser.uid : '');
    var newDateTime = (new Date()).toString();

    get(child(dbRef, '/')).then((snapshot) => {
      nextSongKey = parseInt(snapshot.val().Keys.LatestRequestKey) + 1;
      if (snapshot.val() && (snapshot.val().PreapprovalRequests || snapshot.val().Requests)) {
        //console.log(snapshot.val());
        // Check if request is already accepted.
        var songAlreadyApproved = false;
        var songAlreadyApprovedKey = -1;
        if(snapshot.val().Requests){
          Object.entries(snapshot.val().Requests).forEach(([key, value]) => {
            if(!songAlreadyApproved && value.SongName === songName && value.ArtistName === artistName){
              songAlreadyApproved = true;
              songAlreadyApprovedKey = key;
              prevRequestCount = value.RequestCount;
            }
          });  
        }

        if(songAlreadyApproved){
          update(ref(db, 'Requests/' + songAlreadyApprovedKey + '/'), {
            RequestCount : (prevRequestCount+1),
            DateTime : newDateTime
          });
          submissionTextRef.current.innerHTML = "Request Already in Pool.";
        }
        else{
          var songInPreapproval = false;
          var songInPreapprovalKey = -1;
          if(snapshot.val().PreapprovalRequests){
            Object.entries(snapshot.val().PreapprovalRequests).forEach(([key, value]) => {
              preapprovalSongIDs.push(key);
              songRequests.push(value);
              if(!songInPreapproval && value.SongName === songName && value.ArtistName === artistName){
                songInPreapproval = true;
                songInPreapprovalKey = key;
                prevRequestCount = value.RequestCount;
              }
            });
          }

          if(songInPreapproval){
            update(ref(db, 'PreapprovalRequests/' + songInPreapprovalKey + '/'), {
              RequestCount : (prevRequestCount+1),
              DateTime : (new Date()).toString()
            });
            submissionTextRef.current.innerHTML = "Request Already in Pool.";
          }
          else{
            set(ref(db, 'PreapprovalRequests/' + nextSongKey + '/'), {
              SongName: songName,
              ArtistName: artistName,
              RequestCount: 1,
              SpotifyURL: spotifyURL,
              SpotifyImageURL: spotifyImageLink,
              Upvotes: 0,
              Downvotes: 0,
              RequestedBy: requestedByUID,
              DateTime : newDateTime,
              Approved : false
            });
            set(ref(db, `Keys/LatestRequestKey/`), nextSongKey)
            if(requestedByUID != ''){
              set(ref(db, `Users/${requestedByUID}/Requests/LiveRequests/${nextSongKey}/`), {
                SongName: songName,
                ArtistName: artistName,
                SpotifyImageURL: spotifyImageLink,
                DateTime : newDateTime,
                NotificationRead: true,
                Approved : false
              });
            }
            submissionTextRef.current.innerHTML = "Request Sent!";
          }
        }
      }
      else {
        set(ref(db, 'PreapprovalRequests/' + nextSongKey + '/'), {
          SongName: songName,
          ArtistName: artistName,
          RequestCount: 1,
          SpotifyURL: spotifyURL,
          SpotifyImageURL: spotifyImageLink,
          Upvotes: 0,
          Downvotes: 0,
          RequestedBy: requestedByUID,
          DateTime : newDateTime,
          Approved : false
        });
        set(ref(db, `Keys/LatestRequestKey/`), nextSongKey)
        if(requestedByUID != ''){
          set(ref(db, `Users/${requestedByUID}/Requests/LiveRequests/${nextSongKey}/`), {
            SongName: songName,
            ArtistName: artistName,
            SpotifyImageURL: spotifyImageLink,
            DateTime : newDateTime,
            NotificationRead: true,
            Approved : false
          });
        }
        submissionTextRef.current.innerHTML = "Request Sent!";
      }
      setTimeout(function(){
        if(submissionTextRef.current != null){
          submissionTextRef.current.innerHTML = "";
        }
      }, 5000); 
        
    }).catch((error) => {
      console.error(error);
    });

    if(trackStatsRef.current){
      get(child(dbRef, 'SongStatistics/')).then((snapshot) => {
        var songKey = -1;
        var newKeyIndex = 0;
        var statsSong;
        if (snapshot.exists()) {  
          Object.entries(snapshot.val()).forEach(([key, value]) => {
            var currKey = parseInt(key);
            if(value.SongName == songName){
              songKey = currKey;
              statsSong = value;
            }
            else if(newKeyIndex <= currKey){
              newKeyIndex = currKey+1;
            }
          });
        }

        if(songKey > -1){
          set(ref(db, 'SongStatistics/' + songKey + '/RequestCount'), (statsSong.RequestCount+1));
        }
        else{
          set(ref(db, 'SongStatistics/' + newKeyIndex + '/'), {
            SongName: songName,
            ArtistName: artistName,
            RequestCount: 1,
            SpotifyURL: spotifyURL
          });
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  async function FetchSpotifySongs(){
    var songParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessTokenRef.current
      }
    }

    await fetch('https://api.spotify.com/v1/search?q=' + inputSongName + '&type=track&limit=50', songParams)
      .then(response => response.json())
      .then(data => { 
        // console.log(data);

        if(data.error != null){
          if(data.status === 401){
            InitializeSpotify();
            FetchSpotifySongs();
          }
          return;
        }
        
        var tracks = [];
        var searchedTracks = data.tracks.items;
        for(var i = 0; i < 50; i++){
          if(searchedTracks[i] == null)
            break;

          var artistFound = false;
          var searchingArtist = inputArtistName.length > 0 ? true : false;
          if(searchingArtist){
            for(var j = 0; j < searchedTracks[i].artists.length; j++){
              var currArtistName = searchedTracks[i].artists[j].name;
              var inputArtistNameIndex = 0;
              for(var k = 0; k < currArtistName.length; k++){
                if(currArtistName.length > k && currArtistName.substring(k, k+1).toLowerCase() == inputArtistName.substring(inputArtistNameIndex, inputArtistNameIndex+1).toLowerCase()){
                  inputArtistNameIndex++;
                  if(inputArtistNameIndex == inputArtistName.length){
                    artistFound = true;
                    break;
                  }
                }
              }
              if(artistFound){
                break;
              }
            }
          }
          var artistNames = searchedTracks[i].artists[0].name;
          for(var j = 1; j < searchedTracks[i].artists.length; j++){
            artistNames += ", " + searchedTracks[i].artists[j].name;
          }
          if(artistFound || !searchingArtist){
            var track = React.createElement('div', {key : 'option' + i, id : 'option' + i, className : 'songOption', onClick : (e) => SelectSong(e)},
              React.createElement('img', {className : 'songOptionImage', src : searchedTracks[i].album.images[0].url, alt : ''}),
              React.createElement('div', {className : 'songOptionInfo'},
                React.createElement('p', {id : 'trackName' + i, 'data-spotifyurl' : searchedTracks[i].external_urls.spotify}, searchedTracks[i].name),
                React.createElement('p', {id : 'artistName' + i}, artistNames)
              )
            );
            tracks.push(track);
          }
          if(tracks.length >= 10)
            break;
        }
        SetRenderedTracks(tracks);
        renderedTracksDivRef.current.style.display = "block";
        renderedTracksDivRef.current.style.overflowY = "scroll";
        let screenWidth = window.innerWidth;
        if(screenWidth <= 800){
          tracksDivRef.current.style.height = "40vh";      
          renderedTracksDivRef.current.style.height = "95%";
        }
        else{
          renderedTracksDivRef.current.style.height = "320px";
          tracksDivRef.current.style.height = "fit-content"
        }  
      }).catch((error) => {
        console.log(error);
        InitializeSpotify();
        // FetchSpotifySongs();
      });        
  }

  function CustomSetup(){
    SetCanSubmit(true);
  }

  function SelectSong(e){
    var element = e.target;

    var songOptions = document.querySelectorAll('.songOption');
    for(var i = 0; i < songOptions.length; i++){
      songOptions[i].classList.remove('selectedSongOption');
    }

    if(trackNameRef.current != element.children[1].children[0].innerHTML && artistNameRef.current != element.children[1].children[1].innerHTML){
      element.classList.add('selectedSongOption');

      SetTrackImageLink(element.children[0].src); 
      var newTrackName = element.children[1].children[0].innerHTML;
      while(newTrackName.includes('&amp;')){
        newTrackName = newTrackName.replace('&amp;', '&');
      }
      SetTrackName(newTrackName);
      SetArtistName(element.children[1].children[1].innerHTML);
      SetTrackSpotifyURL(element.children[1].children[0].dataset.spotifyurl);
      SetCanSubmit(true);
    }
    else{
      SetTrackImageLink("");
      SetTrackName("");
      SetArtistName("");
      SetCanSubmit(false);
    }
  }

  return (
    <div id='songRequestsDiv'>
      <ul id='requestAndLineupList'>
          <li id='requestSongOption' className='contentOption'><button id='requestSongButton' ref={requestSongButtonRef} onClick={SwitchToRequestSong}>Request Song</button></li>
          <li id='lineupOption' className='contentOption'><button id='lineupButton' ref={lineupButtonRef} onClick={SwitchToCurrentLineup}>Current Lineup</button></li>
      </ul>
      <div id='contentDiv'>
        <div id='requestGridContainer' ref={requestGridContainerRef}>
          <div id='formDiv'>
            <div id='songSearchTabs'>
              <div id='spotifyTab' ref={spotifyTabRef} onClick={() => SwitchToSpotify()}>
                <img id='spotifyImage' src='/SpotifyLogo.png' alt='Spotify Logo'/>
              </div>
              <div id='customTab' ref={customTabRef} onClick={() => SwitchToCustom()}>
                <img id='customImage' src='/CustomLogo.png' alt='Custom Logo'/>
              </div>
            </div>
            <div id='searchDiv'>
              <div id='songDiv'>
                <label htmlFor='songNameInput' className='requestLabel'>
                  <input id='songNameInput' ref={songNameInputRef} className='requestInput' name='songNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={e => UpdateSongName(e.target.value)}/>
                  <span className='label'>Song</span>
                  <span className='focus-bg'></span>
                </label>
              </div>
              <div id='artistDiv'>
                <label htmlFor='artistNameInput' className='requestLabel'>
                  <input id='artistNameInput' ref={artistNameInputRef} className='requestInput' name='artistNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={e => UpdateArtistName(e.target.value)}/>
                  <span className='label'>Artist</span>
                  <span className='focus-bg'></span>
                </label>
              </div>
              <div id='tracksDiv' ref={tracksDivRef}>
                <div id='renderedTracksDiv' ref={renderedTracksDivRef}>
                  {renderedTracksRef.current}
                </div>
              </div>
            </div>
            <div>
              {/* <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} title="Must provide a song and artist name." placement="top-start"> */}
                  <span>
                    <button type='submit' id='submitBtn' ref={submitSongRequestButtonRef} disabled='disabled'>Submit Request</button>
                  </span>
              {/* </Tooltip> */}
            </div>
            <div id='submissionTextDiv'>
              <h4 id='submissionText' ref={submissionTextRef}></h4>
            </div>
          </div>
        </div>
        <RequestLineup showLineup={lineupActive} authUser={props.authUser}/>
        <SkeeterPanel authUser={props.authUser}/>
      </div>
    </div>
  );
}

export default SongRequests;