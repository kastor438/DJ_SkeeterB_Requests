import '../StyleSheets/UpcomingEventRequests.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useParams } from 'react-router-dom';

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
const database = getDatabase(app);

const clientID = '822b607fa31944ca91f198b9f5e31613';
const clientSecret = '4aae0065891841c197af65473ac00b49';

const UpcomingEventRequests = props => {
  // States
  const [sortChoice, SetSortChoice] = useState('Chronological');
  const [accessToken, SetAccessToken] = useState("");
  const [canSubmit, SetCanSubmit] = useState(false);
  const [hasListener, SetHasListener] = useState(false);
  const [renderedTracks, SetRenderedTracks] = useState([]);
  const [trackImageLink, SetTrackImageLink] = useState("");
  const [trackName, SetTrackName] = useState('');
  const [artistName, SetArtistName] = useState('');
  const [trackSpotifyURL, SetTrackSpotifyURL] = useState("");
  const [spotifyActive, SetSpotifyActive] = useState(true);
  const [customActive, SetCustomActive] = useState(false);

  // State Refs
  const sortChoiceRef = useRef("Chronological");
  sortChoiceRef.current = sortChoice;

  const accessTokenRef = useRef("");
  accessTokenRef.current = accessToken;

  const spotifyActiveRef = useRef(true);
  spotifyActiveRef.current = spotifyActive;

  const customActiveRef = useRef(false);
  customActiveRef.current = customActive;

  const upcomingRenderedTracksRef = useRef([]);
  upcomingRenderedTracksRef.current = renderedTracks;

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

  // DOM Refs
  const upcomingRequestGridContainerRef = useRef();
  const upcomingSpotifyTabRef = useRef();
  const upcomingCustomTabRef = useRef();
  const upcomingSongNameInputRef = useRef();
  const upcomingArtistNameInputRef = useRef();
  const upcomingTracksDivRef = useRef();
  const upcomingRenderedTracksDivRef = useRef();
  const upcomingSubmitSongRequestButtonRef = useRef();
  const upcomingSubmissionTextRef = useRef();

  const db = getDatabase();
  const dbRef = ref(getDatabase());
  const invalidChars = '\'"\\/';

  useEffect(() => {
    upcomingRequestGridContainerRef.current.style.display = "grid";

    InitializeSpotify();
  }, []);

  useEffect(() => {
    CheckValidInput();
  }, [spotifyActive, customActive]);

  useEffect(() => {
    if(!canSubmitRef.current){
      upcomingSubmitSongRequestButtonRef.current.setAttribute("disabled", "disabled");
    }
    else{
      upcomingSubmitSongRequestButtonRef.current.removeAttribute("disabled");
    }
  }, [canSubmit]);

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

  function SwitchToSpotify(){
    if(!spotifyActiveRef.current){
      let screenWidth = window.innerWidth;
      upcomingSpotifyTabRef.current.style.backgroundColor = "#36393f";
      upcomingSpotifyTabRef.current.style.zIndex = "3";
      upcomingSpotifyTabRef.current.children[0].classList.add('selectedTab')

      upcomingCustomTabRef.current.style.backgroundColor = "#2e2f32";
      upcomingCustomTabRef.current.style.zIndex = "2";
      upcomingCustomTabRef.current.children[0].classList.remove('selectedTab')

      if(screenWidth <= 800)
        upcomingRenderedTracksDivRef.current.style.height = "95%";
      else
        upcomingRenderedTracksDivRef.current.style.height = "320px";

      SetSpotifyActive(true);
      SetCustomActive(false);
    }
  }

  function SwitchToCustom(){
    if(!customActiveRef.current){
      upcomingSpotifyTabRef.current.style.backgroundColor = "#2e2f32";
      upcomingSpotifyTabRef.current.style.zIndex = "2";
      upcomingSpotifyTabRef.current.children[0].classList.remove('selectedTab')

      upcomingCustomTabRef.current.style.backgroundColor = "#36393f";
      upcomingCustomTabRef.current.style.zIndex = "3";
      upcomingCustomTabRef.current.children[0].classList.add('selectedTab')

      upcomingTracksDivRef.current.style.height = "0";
      upcomingRenderedTracksDivRef.current.style.height = "0px";

      SetSpotifyActive(false);
      SetCustomActive(true);
    }
  }

  function CheckValidInput(){
    let screenWidth = window.innerWidth;
    if(screenWidth <= 800)
      upcomingTracksDivRef.current.style.height = "0px";

    // Reset all song options to be visually unselected.
    var songOptions = document.querySelectorAll('.songOption');
    for(var i = 0; i < songOptions.length; i++){
      songOptions[i].classList.remove('selectedSongOption');
    }
    
    // Initial resets
    if(!customActiveRef.current || upcomingSongNameInputRef.current.value.length <= 1 || upcomingArtistNameInputRef.current.value.length <= 1){
      SetTrackName("");
      SetArtistName("");
      upcomingSubmitSongRequestButtonRef.current.setAttribute("disabled", "disabled");
      SetCanSubmit(false);
      SetRenderedTracks([]);
    }
    upcomingRenderedTracksDivRef.current.style.overflowY = "hidden";

    // Checks for valid input to proceed.
    if(upcomingSongNameInputRef.current.value.length <= 1){
      upcomingRenderedTracksDivRef.current.style.display = "none";
      return;
    }
    else{
      for(var i = 0; i < upcomingSongNameInputRef.current.value.length; i++){
        if(invalidChars.includes(upcomingSongNameInputRef.current.value.substring(i, i+1))){
          upcomingRenderedTracksDivRef.current.style.display = "none";
          return;
        }
      }
      for(i = 0; i < upcomingArtistNameInputRef.current.value.length; i++){
        if(invalidChars.includes(upcomingArtistNameInputRef.current.value.substring(i, i+1))){
          upcomingRenderedTracksDivRef.current.style.display = "none";
          return;
        }
      }
    }

    // All checks passed, allow submission or fetch spotify song options.
    if (hasListener === false) {
      upcomingSubmitSongRequestButtonRef.current.addEventListener("click", () => SubmitRequest());
      SetHasListener(true);
    }
    if(spotifyActiveRef.current){
      FetchSpotifySongs();
    }
    else if(customActiveRef.current && upcomingArtistNameInputRef.current.value.length > 1){
      CustomSetup();
    }
  }

  async function SubmitRequest(){
    if(canSubmitRef.current){
      if(spotifyActiveRef.current){ 
        AddRequest(trackNameRef.current, artistNameRef.current, trackSpotifyURLRef.current, trackImageLinkRef.current);
      }
      else if(customActiveRef.current){
        AddRequest(upcomingSongNameInputRef.current.value, upcomingArtistNameInputRef.current.value, '', '');
      }
      
      upcomingSongNameInputRef.current.value = '';
      upcomingArtistNameInputRef.current.value = '';

      SetTrackSpotifyURL('');
      SetTrackImageLink('')
      SetRenderedTracks([]);
    }
  }

  function AddRequest(songName, artistName, spotifyURL, spotifyImageLink){
    var nextSongID = 1;
    var songIDs = [];
    var songRequests = [];
    var addRequestBool = true;
    var songExistsID = -1;
    var prevRequestCount = 0;

    get(child(dbRef, 'Requests/')).then((snapshot) => {
      if (snapshot.exists()) {
        //console.log(snapshot.val());

        Object.entries(snapshot.val()).forEach(([key, value]) => {
          songIDs.push(key);
          songRequests.push(value);
        });

        for(var i = 0; i < songRequests.length; i++){
          if(songRequests[i].SongName == songName && songRequests[i].ArtistName == artistName){
            addRequestBool = false;
            prevRequestCount = songRequests[i].RequestCount;
            songExistsID = songIDs[i];
          }
        }

        if(addRequestBool){
          for(i = 0; i < songIDs.length; i++){
            if(songIDs[i] >= nextSongID){
              nextSongID = parseInt(songIDs[i]) + 1;
            }
          }
          set(ref(db, 'Requests/' + nextSongID + '/'), {
            SongName: songName,
            ArtistName: artistName,
            RequestCount: 1,
            SpotifyURL: spotifyURL,
            SpotifyImageURL: spotifyImageLink,
            Upvotes: 0,
            Downvotes: 0,
            Voters : {},
            RequestedBy : (auth.currentUser ? auth.currentUser.uid : '')
          });
          upcomingSubmissionTextRef.current.innerHTML = "Request Sent!";
        }
        else{
          set(ref(db, 'Requests/' + songExistsID + '/RequestCount'), (prevRequestCount+1));
          upcomingSubmissionTextRef.current.innerHTML = "Request Already in Pool.";
        }
      } 
      else {
        set(ref(db, 'Requests/1/'), {
          SongName: songName,
          ArtistName: artistName,
          RequestCount: 1,
          SpotifyURL: spotifyURL,
          SpotifyImageURL: spotifyImageLink,
          Upvotes: 0,
          Downvotes: 0,
          RequestedBy: (auth.currentUser ? auth.currentUser.uid : '')
        });
        upcomingSubmissionTextRef.current.innerHTML = "Request Sent!";
      }
      setTimeout(function(){
        if(upcomingSubmissionTextRef.current != null){
          upcomingSubmissionTextRef.current.innerHTML = "";
        }
      }, 5000);
    }).catch((error) => {
      console.error(error);
    });
  }

  async function FetchSpotifySongs(){
    var songParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessTokenRef.current
      }
    }

    await fetch('https://api.spotify.com/v1/search?q=' + upcomingSongNameInputRef.current.value + '&type=track&limit=50', songParams)
      .then(response => response.json())
      .then(data => { 
        // console.log(data);

        if(data.error != null)
          return;
        
        var tracks = [];
        var searchedTracks = data.tracks.items;
        for(var i = 0; i < 50; i++){
          if(searchedTracks[i] == null)
            break;

          var artistFound = false;
          var searchingArtist = upcomingArtistNameInputRef.current.value.length > 0 ? true : false;
          if(searchingArtist){
            for(var j = 0; j < searchedTracks[i].artists.length; j++){
              var currArtistName = searchedTracks[i].artists[j].name;
              var inputArtistNameIndex = 0;
              for(var k = 0; k < currArtistName.length; k++){
                if(currArtistName.length > k && currArtistName.substring(k, k+1).toLowerCase() == upcomingArtistNameInputRef.current.value.substring(inputArtistNameIndex, inputArtistNameIndex+1).toLowerCase()){
                  inputArtistNameIndex++;
                  if(inputArtistNameIndex == upcomingArtistNameInputRef.current.value.length){
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
        upcomingRenderedTracksDivRef.current.style.display = "block";
        upcomingRenderedTracksDivRef.current.style.overflowY = "scroll";
        let screenWidth = window.innerWidth;
        if(screenWidth <= 800){
          upcomingTracksDivRef.current.style.height = "40vh";      
          upcomingRenderedTracksDivRef.current.style.height = "95%";
        }
        else{
          upcomingRenderedTracksDivRef.current.style.height = "320px";
          upcomingTracksDivRef.current.style.height = "fit-content"
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
    <div>
      <div id='upcomingRequestGridContainer' ref={upcomingRequestGridContainerRef}>
          <div id='upcomingFormDiv'>
            <div id='upcomingSongSearchTabs'>
              <div id='upcomingSpotifyTab' ref={upcomingSpotifyTabRef} onClick={() => SwitchToSpotify()}>
                <img id='upcomingSpotifyImage' src='/SpotifyLogo.png' alt='Spotify Logo'/>
              </div>
              <div id='upcomingCustomTab' ref={upcomingCustomTabRef} onClick={() => SwitchToCustom()}>
                <img id='upcomingCustomImage' src='/CustomLogo.png' alt='Custom Logo'/>
              </div>
            </div>
            <div id='upcomingSearchDiv'>
              <div id='upcomingSongDiv'>
                <label htmlFor='upcomingSongNameInput' className='upcomingRequestLabel'>
                  <input id='upcomingSongNameInput' ref={upcomingSongNameInputRef} className='upcomingRequestInput' name='upcomingSongNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={CheckValidInput}/>
                  <span className='label'>Song</span>
                  <span className='focus-bg'></span>
                </label>
              </div>
              <div id='upcomingArtistDiv'>
                <label htmlFor='upcomingArtistNameInput' className='upcomingRequestLabel'>
                  <input id='upcomingArtistNameInput' ref={upcomingArtistNameInputRef} className='upcomingRequestInput' name='upcomingArtistNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={CheckValidInput}/>
                  <span className='label'>Artist</span>
                  <span className='focus-bg'></span>
                </label>
              </div>
              <div id='upcomingTracksDiv' ref={upcomingTracksDivRef}>
                <div id='upcomingRenderedTracksDiv' ref={upcomingRenderedTracksDivRef}>
                  {upcomingRenderedTracksRef.current}
                </div>
              </div>
            </div>
            <div>
              {/* <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} title="Must provide a song and artist name." placement="top-start"> */}
                  <span>
                    <button type='submit' id='upcomingSubmitBtn' ref={upcomingSubmitSongRequestButtonRef} disabled='disabled'>Submit Request</button>
                  </span>
              {/* </Tooltip> */}
            </div>
            <div id='upcomingSubmissionTextDiv'>
              <h4 id='upcomingSubmissionText' ref={upcomingSubmissionTextRef}></h4>
            </div>
          </div>
        </div>
    </div>
  );
}

export default UpcomingEventRequests;