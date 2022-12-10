import logo from './skeeterB-Logo.png';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, child, get } from "firebase/database";
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
    const [trackName, SetTrackName] = useState('');
    const [artistName, SetArtistName] = useState('');
    const [spotifyActive, SetSpotifyActive] = useState(true);
    const [customActive, SetCustomActive] = useState(false);

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

    const trackNameRef = useRef("");
    trackNameRef.current = trackName;

    const artistNameRef = useRef("");
    artistNameRef.current = artistName;

    useEffect(() => {
        InitializeSpotify();
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

    function SwitchToSpotify(e){
      if(!spotifyActiveRef.current){
        let screenWidth = window.innerWidth;
        var spotifyTab = document.getElementById("spotifyTab");
        spotifyTab.style.backgroundColor = "#36393f";
        spotifyTab.style.zIndex = "3";
        // spotifyTab.style.borderWidth = "1px 1px 0 1px";
        spotifyTab.children[0].style.width = "60%";
        spotifyTab.children[0].style.marginTop = "5%";

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

        document.getElementById("renderedTracksDiv").style.height = "250px";

        SetSpotifyActive(true);
        SetCustomActive(false);
      }
    }

    function SwitchToCustom(e){
      if(!customActiveRef.current){
        let screenWidth = window.innerWidth;
        console.log(screenWidth);
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
              RequestCount: 1
            });
            document.getElementById('submissionText').innerHTML = "Request Sent!";
          }
          else{
            const db = getDatabase();
            set(ref(db, 'Requests/' + songExistsID + '/RequestCount'), (prevRequestCount+1));
            document.getElementById('submissionText').innerHTML = "Request Already in Pool."
          }
        } 
        else {
          const db = getDatabase();
          set(ref(db, 'Requests/1/'), {
            SongName: songName,
            ArtistName: artistName,
            RequestCount: 1
          });
        }
      }).catch((error) => {
        console.error(error);
      });
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
                  React.createElement('p', {id : 'trackName' + i}, searchedTracks[i].name),
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
            SetTrackName(element.children[1].children[0].innerHTML);
            SetArtistName(element.children[1].children[1].innerHTML);
            SetCanSubmit(true);
        }
        else{
            SetTrackName("");
            SetArtistName("");
            SetCanSubmit(false);
        }
    }

  return (
    <div>
      <div className="App">
        <header className="App-header">
        <h2 id='pageHeader'>Song Requests</h2>
          <div id='gridContainer'>
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
                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} title="Must provide a song and artist name." placement="top-start">
                    <span>
                      <button type='submit' id='submitBtn' disabled='disabled'>Submit Request</button>
                    </span>
                </Tooltip>
              </div>
              <div>
                <h4 id='submissionText'></h4>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}

export default App;