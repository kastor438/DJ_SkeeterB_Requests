import logo from './skeeterB-Logo.png';
import './App.css';
import './RequestLineup.css';
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, child, get, onValue } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';
import { render } from '@testing-library/react';

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

const analytics = getAnalytics(app);
const database = getDatabase(app);
  
const clientID = '822b607fa31944ca91f198b9f5e31613';
const clientSecret = '4aae0065891841c197af65473ac00b49';

function App() {
  const [accessToken, SetAccessToken] = useState("");
  const [canSubmit, SetCanSubmit] = useState(false);
  const [invalidChars, SetInvalidChars] = useState('\'"\\/');
  const [inputSongName, SetInputSongName] = useState("");
  const [inputArtistName, SetInputArtistName] = useState("");
  const [hasListener, SetHasListener] = useState(false);
  const [renderedTracks, SetRenderedTracks] = useState([]);
  const [lineupTracks, SetLineupTracks] = useState([]);
  const [trackImageLink, SetTrackImageLink] = useState("");
  const [trackName, SetTrackName] = useState('');
  const [artistName, SetArtistName] = useState('');
  const [trackSpotifyURL, SetTrackSpotifyURL] = useState("");
  const [spotifyActive, SetSpotifyActive] = useState(true);
  const [customActive, SetCustomActive] = useState(false);
  const [trackStats, SetTrackStats] = useState(false);

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

  const lineupTracksRef = useRef([]);
  lineupTracksRef.current = lineupTracks;

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

  useEffect(() => {
    var currentUrl = window.location.href;
    var requestSongButton = document.getElementById("navRequestSongButton");
    requestSongButton.style.borderBottom = "1px solid white";
    requestSongButton.style.color = "#b1afaf";
    document.getElementById("requestGridContainer").style.display = "grid";

    var lineupButton = document.getElementById("navLineupButton");
    lineupButton.style.borderBottom = "none";
    lineupButton.style.color = "white";
    document.getElementById("lineupGridContainer").style.display = "none"
    
    if(currentUrl.includes("dj")){
      SetTrackStats(true);
    }
    InitializeSpotify();

    const db = getDatabase();
    const requestsRef = ref(db, 'Requests/');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      UpdateLineup(data);
    });
  }, []);

  useEffect(() => {
    CheckValidInput();
  }, [inputSongName, inputArtistName, spotifyActive, customActive]);

  useEffect(() => {
    if(!canSubmitRef.current){
      document.getElementById('submitBtn').setAttribute("disabled", "disabled");
    }
    else{
      document.getElementById('submitBtn').removeAttribute("disabled");
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

  function InitializeAppleMusic(){

  }

  function SwitchToRequestSong(){
    var requestSongButton = document.getElementById("navRequestSongButton");
    requestSongButton.style.borderBottom = "1px solid white";
    requestSongButton.style.color = "#b1afaf";
    document.getElementById("requestGridContainer").style.display = "grid";

    var lineupButton = document.getElementById("navLineupButton");
    lineupButton.style.borderBottom = "none";
    lineupButton.style.color = "white";
    document.getElementById("lineupGridContainer").style.display = "none"
  }

  function SwitchToCurrentLineup(){
    var requestSongButton = document.getElementById("navRequestSongButton");
    requestSongButton.style.borderBottom = "none";
    requestSongButton.style.color = "white";
    document.getElementById("requestGridContainer").style.display = "none";

    var lineupButton = document.getElementById("navLineupButton");
    lineupButton.style.borderBottom = "1px solid white";
    lineupButton.style.color = "#b1afaf";
    document.getElementById("lineupGridContainer").style.display = "block";
  }

  function SwitchToSpotify(e){
    if(!spotifyActiveRef.current){
      let screenWidth = window.innerWidth;
      var spotifyTab = document.getElementById("spotifyTab");
      spotifyTab.style.backgroundColor = "#36393f";
      spotifyTab.style.zIndex = "3";
      // spotifyTab.style.borderWidth = "1px 1px 0 1px";
      spotifyTab.children[0].style.width = "55%";
      spotifyTab.children[0].style.marginTop = "8%";

      if(screenWidth <= 660){
        spotifyTab.children[0].style.marginTop = "4%";
        spotifyTab.children[0].style.width = "50%";
      }

      var customTab = document.getElementById("customTab");
      customTab.style.backgroundColor = "#2e2f32";
      customTab.style.zIndex = "2";
      // appleMusicTab.style.borderWidth = "1px";
      // if(screenWidth >= 1465){
      //   customTab.children[0].style.marginTop = "10%";
      //   customTab.children[0].style.fontSize = "24px";
      // }
      // else if(screenWidth >= 1250){
      //   customTab.children[0].style.marginTop = "8%";
      //   customTab.children[0].style.fontSize = "20px";
      // }
      // else if(screenWidth >= 1100){
      //   customTab.children[0].style.marginTop = "5%";
      //   customTab.children[0].style.fontSize = "18px";
      // }
      // else if(screenWidth >= 660){
      //   customTab.children[0].style.marginTop = "0%";
      //   customTab.children[0].style.fontSize = "16px";
      // }
      document.getElementById("renderedTracksDiv").style.height = "200px";
      SetSpotifyActive(true);
      SetCustomActive(false);
    }
  }

  function SwitchToCustom(e){
    if(!customActiveRef.current){
      var spotifyTab = document.getElementById("spotifyTab");
      spotifyTab.style.backgroundColor = "#2e2f32";
      spotifyTab.style.zIndex = "2";
      // spotifyTab.style.borderWidth = "1px";
      spotifyTab.children[0].style.width = "40%";
      spotifyTab.children[0].style.marginTop = "9%";

      var customTab = document.getElementById("customTab");
      customTab.style.backgroundColor = "#36393f";
      customTab.style.zIndex = "3";
      // appleMusicTab.style.borderWidth = "1px 1px 0 1px";
      // if(screenWidth >= 1465){
      //   customTab.children[0].style.marginTop = "10%";
      //   customTab.children[0].style.fontSize = "28px";
      // }
      // else if(screenWidth >= 1250){
      //   // customTab.children[0].style.marginTop = "10%";
      //   customTab.children[0].style.fontSize = "26px";
      // }
      // else if(screenWidth >= 1100){
      //   customTab.children[0].style.marginTop = "6%";
      //   customTab.children[0].style.fontSize = "20px";
      // }
      // else if(screenWidth >= 660){
      //   customTab.children[0].style.marginTop = "6%";
      //   customTab.children[0].style.fontSize = "18px";
      // }
      document.getElementById("renderedTracksDiv").style.height = "0";

      SetSpotifyActive(false);
      SetCustomActive(true);
      CheckValidInput();
    }
  }

  function UpdateSongName(value){
    SetInputSongName(value);
  }

  function UpdateArtistName(value){
    SetInputArtistName(value);
  }

  function CheckValidInput(){
    for(var i = 0; i < 10; i++){
      var option = document.getElementById("option" + i);
      if(option){
        option.style.color = "white";
      }
    }
      
    if(!customActiveRef.current || inputSongNameRef.current.length <= 1){
      SetTrackName("");
      SetArtistName("");
      document.getElementById('submitBtn').setAttribute("disabled", "disabled");
      SetCanSubmit(false);
      SetRenderedTracks([]);
    }

    document.getElementById("renderedTracksDiv").style.overflowY = "hidden";

    if(inputSongNameRef.current.length <= 1){
      document.getElementById("renderedTracksDiv").style.display = "none";
      return;
    }
    else{
      for(var i = 0; i < inputSongNameRef.current.length; i++){
        if(invalidChars.includes(inputSongNameRef.current.substring(i, i+1))){
          document.getElementById("renderedTracksDiv").style.display = "none";
          return;
        }
      }
      for(i = 0; i < inputArtistNameRef.current.length; i++){
        if(invalidChars.includes(inputArtistNameRef.current.substring(i, i+1))){
          document.getElementById("renderedTracksDiv").style.display = "none";
          return;
        }
      }
    }
    if (hasListener === false) {
      document.getElementById('submitBtn').addEventListener("click", () => SubmitRequest());
      SetHasListener(true);
    }
    if(spotifyActiveRef.current){
      FetchSpotifySongs();
    }
    else if(customActiveRef.current && inputArtistNameRef.current.length > 1){
      CustomSetup();
    }
  }

  function SubmitRequest(){
      if(canSubmitRef.current){        
        if(spotifyActiveRef.current){ 
          AddRequest(trackNameRef.current, artistNameRef.current);
        }
        else if(customActiveRef.current){
          AddRequest(inputSongNameRef.current, inputArtistNameRef.current);
        }
        document.getElementById('songNameInput').value = '';
        document.getElementById('artistNameInput').value = '';

        SetInputSongName('');
        SetInputArtistName('');
        SetRenderedTracks([]);
      }
  }

  function AddRequest(songName, artistName){
    const dbRef = ref(getDatabase());
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
          const db = getDatabase();
          set(ref(db, 'Requests/' + nextSongID + '/'), {
            SongName: songName,
            ArtistName: artistName,
            RequestCount: 1,
            SpotifyURL: trackSpotifyURLRef.current,
            SpotifyImageURL: trackImageLinkRef.current.toString(),
            Upvotes: 0,
            Downvotes: 0
          });
          document.getElementById('submissionText').innerHTML = "Request Sent!";
        }
        else{
          const db = getDatabase();
          set(ref(db, 'Requests/' + songExistsID + '/RequestCount'), (prevRequestCount+1));
          document.getElementById('submissionText').innerHTML = "Request Already in Pool.";
        }
        setTimeout(function(){document.getElementById('submissionText').innerHTML = "";}, 5000);
      } 
      else {
        const db = getDatabase();
        set(ref(db, 'Requests/1/'), {
          SongName: songName,
          ArtistName: artistName,
          RequestCount: 1,
          SpotifyURL: trackSpotifyURLRef.current.toString(),
          SpotifyImageURL: trackImageLinkRef.current.toString(),
          Upvotes: 0,
          Downvotes: 0
        });
        document.getElementById('submissionText').innerHTML = "Request Sent!";
      }
    }).catch((error) => {
      console.error(error);
    });

    if(trackStatsRef.current){
      get(child(dbRef, 'SongStatistics/')).then((snapshot) => {
        const db = getDatabase();
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
            SpotifyURL: trackSpotifyURLRef.current.toString()
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
        'Authorization': 'Bearer ' + accessToken
      }
    }

    var songID = await fetch('https://api.spotify.com/v1/search?q=' + inputSongName + '&type=track&limit=50', songParams)
      .then(response => response.json())
      .then(data => {
        console.log(data);
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
        document.getElementById("renderedTracksDiv").style.display = "block";
        document.getElementById("renderedTracksDiv").style.overflowY = "scroll";
      });        
  }

  // async function FetchAppleMusicSongs(){
  //   var songParams = {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' + accessToken
  //     }
  //   }

  //   var songID = await fetch('https://api.music.apple.com/v1/catalog/ca/search?types=songs&term=' + inputSongName, songParams)
  //     .then(response => response.json())
  //     .then(data => {
  //       // console.log(data);
  //       var tracks = [];
  //       var searchedTracks = data.tracks.items;
  //       for(var i = 0; i < 10; i++){
  //         if(searchedTracks[i] == null)
  //             break;

  //         var artistFound = false;
  //         var searchingArtist = inputArtistName.length > 0 ? true : false;
  //         if(searchingArtist){
  //           for(var j = 0; j < searchedTracks[i].artists.length; j++){
  //             var currArtistName = searchedTracks[i].artists[j].name;
  //             var inputArtistNameIndex = 0;
  //             for(var k = 0; k < currArtistName.length; k++){
  //               if(currArtistName.length > k && currArtistName.substring(k, k+1).toLowerCase() == inputArtistName.substring(inputArtistNameIndex, inputArtistNameIndex+1).toLowerCase()){
  //                 inputArtistNameIndex++;
  //                 if(inputArtistNameIndex == inputArtistName.length){
  //                   artistFound = true;
  //                   break;
  //                 }
  //               }
  //             }
  //             if(artistFound){
  //               break;
  //             }
  //           }
  //         }
  //         var artistNames = searchedTracks[i].artists[0].name;
  //         for(var j = 1; j < searchedTracks[i].artists.length; j++){
  //           artistNames += ", " + searchedTracks[i].artists[j].name;
  //         }
  //         if(artistFound || !searchingArtist){
  //           var track = React.createElement('div', {key : 'option' + i, id : 'option' + i, className : 'songOption', onClick : (e) => SelectSong(e)},
  //               React.createElement('img', {className : 'songOptionImage', src : searchedTracks[i].album.images[0].url, alt : ''}),
  //               React.createElement('div', {className : 'songOptionInfo'},
  //                   React.createElement('p', {id : 'trackName' + i}, searchedTracks[i].name),
  //                   React.createElement('p', {id : 'artistName' + i}, artistNames)
  //               )
  //           );
  //           tracks.push(track);
  //         }
  //       }
  //       SetRenderedTracks(tracks);
  //     });        
  // }

  function CustomSetup(){
    SetCanSubmit(true);
  }

  function SelectSong(e){
    var element = e.target;
    while(element.nodeName !== "DIV" || element.className != "songOption"){
      element = element.parentNode;
    }

    for(var i = 0; i < 10; i++){
      var option = document.getElementById("option" + i);
      if(option){
        option.style.color = "white";
      }
    }

    if(trackNameRef.current != element.children[1].children[0].innerHTML && artistNameRef.current != element.children[1].children[1].innerHTML){
      element.style.color = "red";   
      SetTrackImageLink(element.children[0].src); 
      SetTrackName(element.children[1].children[0].innerHTML);
      SetArtistName(element.children[1].children[1].innerHTML);
      SetTrackSpotifyURL(element.children[1].children[0].dataset.spotifyurl);
      console.log(trackSpotifyURLRef.current + " " + element.children[1].children[0].dataset.spotifyurl);
      SetCanSubmit(true);
    }
    else{
      SetTrackImageLink("");
      SetTrackName("");
      SetArtistName("");
      SetCanSubmit(false);
    }
  }

  function UpdateLineup(data){
    var lineup = [];
    SetLineupTracks([]);
    if(data != null){
      for(var i = 0; i < data.length; i++){
        if(data[i] != null){
          console.log(data[i]);
          var track = React.createElement('div', {key : 'lineup' + i, id : 'lineup' + i, className : 'lineupSong'},
            React.createElement('img', {className : 'lineupSongImage', src : data[i].SpotifyImageURL, alt : ''}),
            React.createElement('div', {className : 'lineupSongInfo'},
              React.createElement('p', {id : 'lineupSongName' + i}, data[i].SongName),
              React.createElement('p', {id : 'lineupArtistName' + i}, data[i].ArtistName),
              React.createElement('p', {id : 'lineupRequestCount' + i}, "Requests: " + data[i].RequestCount.toString()),
              React.createElement('div', {className : 'lineupVoteDiv', 'data-requestkey' : i},
                React.createElement('p', {className : 'lineupVoteCount'}, data[i].Upvotes - data[i].Downvotes),
                React.createElement('button', {className : 'lineupUpvoteButton', onClick : (e) => UpvoteSong(e.target)}, "Upvote"),
                React.createElement('button', {className : 'lineupDownVoteButton', onClick : (e) => DownvoteSong(e.target)}, "Downvote")
              )
            )
          );
          lineup.push(track);
        }
      }
    }

    SetLineupTracks(lineup);
    console.log(lineupTracksRef.current);
  }

  function UpvoteSong(element){
    const db = getDatabase();
    const dbRef = ref(getDatabase());
    var currUpvotes = 0;
    var parent = element.parentNode;
    get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
      currUpvotes = snapshot.val().Upvotes;
      set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Upvotes'), currUpvotes + 1);
      // parent.children[0].innerHTML = snapshot.val().Upvotes - snapshot.val().Downvotes + 1;
    }).catch((error) => {
      console.error(error);
    });
  }

  function DownvoteSong(element){
    const db = getDatabase();
    const dbRef = ref(getDatabase());
    var currDownvotes = 0;
    var parent = element.parentNode;
    get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
      currDownvotes = snapshot.val().Downvotes;
      set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Downvotes'), currDownvotes + 1);
      // parent.children[0].innerHTML = snapshot.val().Upvotes - snapshot.val().Downvotes - 1;
    }).catch((error) => {
      console.error(error);
    });
  }

  return (
    <div>
      <div className="App">
        <header className="App-header">
        {/* <h2 id='pageHeader'>Song Requests</h2> */}
          <nav id='navBar'>
            <ul id='navBarList'>
              <li id='requestSongOption' className='navBarOption'><button id='navRequestSongButton' onClick={SwitchToRequestSong}>Request A Song</button></li>
              <li id='lineupOption' className='navBarOption'><button id='navLineupButton' onClick={SwitchToCurrentLineup}>Current Lineup</button></li>
            </ul>
          </nav>
          <div id='requestGridContainer'>
            <div id='logoDiv'>
              <div id="imageEffects"></div>
              <img src={logo} className="App-logo" alt="logo" />
            </div>
            <div id='formDiv'>
              <div id='songSearchTabs'>
                <div id='spotifyTab' onClick={e => SwitchToSpotify(e)}>
                  <img id='spotifyImage' src='SpotifyLogo.png'/>
                </div>
                <div id='customTab' onClick={e => SwitchToCustom(e)}>
                  <h4 id='customTag'>Custom</h4>
                </div>
              </div>
              <div id='searchDiv'>
                <div id='songDiv'>
                  <label htmlFor='songNameInput' className='requestLabel'>
                    <input id='songNameInput' className='requestInput' name='songNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={e => UpdateSongName(e.target.value)}/>
                    <span className='label'>Song</span>
                    <span className='focus-bg'></span>
                  </label>
                </div>
                <div id='artistDiv'>
                  <label htmlFor='artistNameInput' className='requestLabel'>
                    <input id='artistNameInput' className='requestInput' name='artistNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={e => UpdateArtistName(e.target.value)}/>
                    <span className='label'>Artist</span>
                    <span className='focus-bg'></span>
                  </label>
                </div>
                <div id='tracksDiv'>
                  <div id='renderedTracksDiv'>
                    {renderedTracksRef.current}
                  </div>
                </div>
              </div>
              <div>
                {/* <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} title="Must provide a song and artist name." placement="top-start"> */}
                    <span>
                      <button type='submit' id='submitBtn' disabled='disabled'>Submit Request</button>
                    </span>
                {/* </Tooltip> */}
              </div>
              <div id='submissionTextDiv'>
                <h4 id='submissionText'></h4>
              </div>
            </div>
          </div>
          <div id='lineupGridContainer'>
            <div id='lineupDiv'>
              <div id='lineupTracksDiv'>
                {lineupTracksRef.current}
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}

export default App;