import '../StyleSheets/SkeeterSpecificsSongRequests.css'
import '../StyleSheets/RequestLineup.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, child, get, onValue, update } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';
import axios from 'axios';

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

const RequestLineup = props => {
  const [sortChoice, SetSortChoice] = useState('Chronological');
  const [lineupTracks, SetLineupTracks] = useState([]);
  const [preapprovalLineupTracks, SetPreapprovalLineupTracks] = useState([]);
  const [recentSnapshot, SetRecentSnapshot] = useState({});

  const recentSnapshotRef = useRef({});
  recentSnapshotRef.current = recentSnapshot;

  const sortChoiceRef = useRef("Chronological");
  sortChoiceRef.current = sortChoice;

  const lineupTracksRef = useRef([]);
  lineupTracksRef.current = lineupTracks;
  
  const preapprovalLineupTracksRef = useRef([]);
  preapprovalLineupTracksRef.current = preapprovalLineupTracks;

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  // DOM Refs
  const lineupGridContainerRef = useRef();
  const popupDivRef = useRef();
  const popupSpanRef = useRef();

  useEffect(() => {
    
    const dbRootRef = ref(db, '/');
    onValue(dbRootRef, (snapshot) => {
      const data = snapshot.val();
      if(data){
        if(!data.Requests || !recentSnapshotRef.current || !recentSnapshotRef.current.Requests || data.Requests != recentSnapshotRef.current.Requests){
          SetRecentSnapshot(data);
          UpdateLineup(data.Requests);
        }        
        if(!data.PreapprovalRequests || !recentSnapshotRef.current || !recentSnapshotRef.current.PreapprovalRequests || data.PreapprovalRequests != recentSnapshotRef.current.PreapprovalRequests){
          UpdatePreapprovalLineup(data.PreapprovalRequests);
        }
      } 
    });
  }, []);
  
  useEffect(() => {
    if(props.showLineup){
      lineupGridContainerRef.current.style.display = "grid";
    }
    else{
      lineupGridContainerRef.current.style.display = "none"
    }
  }, [props.showLineup]);

  useEffect(() => {
    if(recentSnapshotRef.current && recentSnapshotRef.current.Requests){
      UpdateLineup(recentSnapshotRef.current.Requests);
    }
  }, [sortChoice]);

  useEffect(() => {
    get(child(dbRef, '/')).then((snapshot) => {
      if(snapshot != null){
        SetRecentSnapshot(snapshot.val());
        UpdateLineup(snapshot.val().Requests);
      }
    });
  }, [props.authUser]);

  function UpdateLineup(data){
    var lineup = [];
    var sortedKeys = [];
    SetLineupTracks([]);

    if(data != null){
      // console.log("Data Before: " + data['1'].SongName);
      sortedKeys = SortLineup(data);
      for(var i = 0; i < sortedKeys.length; i++){
        if(data[sortedKeys[i]] != null){
          var userVote = 'none';
          var upvoteOn = false;
          var downvoteOn = false;

          // userID check
          if(auth.currentUser && data[sortedKeys[i]].Voters != null && data[sortedKeys[i]].Voters[auth.currentUser.uid]){
            userVote = data[sortedKeys[i]].Voters[auth.currentUser.uid];
            if(userVote == 'up'){
              upvoteOn = true;
            }
            else if(userVote == 'down'){
              downvoteOn = true;
            }
          }
          var track = 
          React.createElement('div', {key : 'lineup' + sortedKeys[i], id : 'lineup' + sortedKeys[i], className : 'lineupSong'},
            data[sortedKeys[i]].SpotifyImageURL != '' ?
            React.createElement('div', {className : 'lineupSongImageDiv'}, 
              React.createElement('img', {className : 'lineupSongImage', src : data[sortedKeys[i]].SpotifyImageURL, alt : 'Song Image'})
            ) : 
            React.createElement('div', {className : 'lineupSongImage'}, 
              React.createElement('h4', {className : 'customRequestHeader'}, 'Custom Request')
            ),
            React.createElement('div', {className : 'lineupSongInfo'},
              React.createElement('p', {id : 'lineupSongName' + sortedKeys[i], className : 'lineupSongName'}, data[sortedKeys[i]].SongName),
              React.createElement('p', {id : 'lineupArtistName' + sortedKeys[i]}, data[sortedKeys[i]].ArtistName),
              React.createElement('p', {id : 'lineupRequestCount' + sortedKeys[i]}, "Requests: " + data[sortedKeys[i]].RequestCount)
            ),
            React.createElement('div', {className : 'lineupVoteDiv upvote', 'data-requestkey' : sortedKeys[i], 'data-currvote' : userVote},
              React.createElement('a', {id : 'lineup' + sortedKeys[i] + 'upvoteButton', className : 'lineupUpvoteButton upvote' + (upvoteOn ? ' upvote-on' : '') + (auth.currentUser ? '' : ' disabledVoteButton'), onClick : (e) => UpvoteSong(e.target)}, ),
              React.createElement('span', {className : 'count lineupVoteCount'}, data[sortedKeys[i]].Upvotes - data[sortedKeys[i]].Downvotes), 
              React.createElement('a', {id : 'lineup' + sortedKeys[i] + 'downvoteButton', className : 'lineupDownVoteButton downvote' + (downvoteOn ? ' downvote-on' : '') + (auth.currentUser ? '' : ' disabledVoteButton'), onClick : (e) => DownvoteSong(e.target)}, )
            ), 
            React.createElement('div', {id : 'spotifyLinkDiv' + sortedKeys[i], className : 'spotifyLinkDiv'},
              (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') ? 
                React.createElement('button', {id : 'removeRequestButton', 'data-requestkey' : sortedKeys[i], onClick : (e) => SkeeterRemoveSong(e.target)}, 'X')
                :
                React.createElement('span', {}, '')
              ),
              React.createElement('a', {id : 'lineupSpotifyLink' + sortedKeys[i], className : ((data[sortedKeys[i]].SpotifyURL != '' ? ' lineupSpotifyLink' : 'noSpotifyLink')), href : data[sortedKeys[i]].SpotifyURL, target : 'blank'}, '\uD83D\uDD17'),
              React.createElement('span', {}, ''))
          );
          lineup.push(track);
        }
      }
    }
    else{
      var noLineup = 
        React.createElement('p', {id : 'noLineup', key : 'noLineup'}, 'No requests yet!');
        lineup.push(noLineup);
    }
    SetLineupTracks(lineup);
    // console.log(lineupTracksRef.current);
  }

  function UpdatePreapprovalLineup(data){
    var lineup = [];
    var sortedKeys = [];
    SetPreapprovalLineupTracks([]);

    if(data != null){
      // console.log("Data Before: " + data['1'].SongName);
      Object.keys(data).forEach((key) => {
        sortedKeys.push(key);
      });
      for(var i = 0; i < sortedKeys.length; i++){
        if(data[sortedKeys[i]] != null){
          // userID check
          var track = 
          React.createElement('div', {key : 'lineup' + sortedKeys[i], id : 'lineup' + sortedKeys[i], className : 'lineupSong'},
            data[sortedKeys[i]].SpotifyImageURL != '' ?
            React.createElement('div', {className : 'lineupSongImageDiv'}, 
              React.createElement('img', {className : 'lineupSongImage', src : data[sortedKeys[i]].SpotifyImageURL, alt : 'Song Image'})
            ) : 
            React.createElement('div', {className : 'lineupSongImage'}, 
              React.createElement('h4', {className : 'customRequestHeader'}, 'Custom Request')
            ),
            React.createElement('div', {className : 'lineupSongInfo'},
              React.createElement('p', {id : 'preApprovalLineupSongName' + sortedKeys[i], className : 'lineupSongName'}, data[sortedKeys[i]].SongName),
              React.createElement('p', {id : 'preApprovalLineupArtistName' + sortedKeys[i]}, data[sortedKeys[i]].ArtistName),
              React.createElement('p', {id : 'preApprovalLineupRequestCount' + sortedKeys[i]}, "Requests: " + data[sortedKeys[i]].RequestCount)
            ),
            React.createElement('div', {className : 'preapprovalLineupOptionsDiv', 'data-requestkey' : sortedKeys[i]},
              React.createElement('button', {id : 'preapprovalLineupOption' + sortedKeys[i] + 'AcceptButton', className : 'preapprovalLineupAcceptButton', onClick : (e) => AcceptSong(e.target)}, 'Accept Song'),
              React.createElement('button', {id : 'preapprovalLineupOption' + sortedKeys[i] + 'DeclineButton', className : 'preapprovalLineupDeclineButton', onClick : (e) => DeclineSong(e.target)}, 'Decline Song')
            ), 
            React.createElement('div', {id : 'preApprovalSpotifyLinkDiv' + sortedKeys[i], className : 'spotifyLinkDiv'},
              React.createElement('span', {}, ''),
              React.createElement('a', {id : 'preApprovalLineupSpotifyLink' + sortedKeys[i], className : ((data[sortedKeys[i]].SpotifyURL != '' ? ' lineupSpotifyLink' : 'noSpotifyLink')), href : data[sortedKeys[i]].SpotifyURL, target : 'blank'}, '\uD83D\uDD17'),
              React.createElement('span', {}, ''))
          );
          lineup.push(track);
        }
      }
    }
    else{
      var noLineup = 
        React.createElement('p', {id : 'noUnapprovedLineup', key : 'noUnapprovedLineup'}, 'No unapproved requests!\nGet the word out bro...');
        lineup.push(noLineup);
    }
    SetPreapprovalLineupTracks(lineup);
    // console.log(lineupTracksRef.current);
  }

  function UpvoteSong(element){
    if(auth.currentUser){
      var currUpvotes = 0;
      var parent = element.parentNode;
      var voteChange = 0;
      var downvoteChange = false;

      if(parent.dataset.currvote === 'up'){
        element.classList.remove('upvote-on');
        parent.dataset.currvote = 'none';
        voteChange = -1;
      }
      else if(parent.dataset.currvote === 'down'){
        element.classList.add('upvote-on');
        parent.children[2].classList.remove('downvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
        downvoteChange = true;
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('upvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
      }

      get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        var voters = {};
        if(snapshot.val() != null && snapshot.val().Voters != null){
          Object.entries(snapshot.val().Voters).forEach(([key, value]) => {
            voters[key] = value;
          });
        }
        voters[auth.currentUser.uid] = parent.dataset.currvote !== 'none' ? parent.dataset.currvote : null;
        currUpvotes = snapshot.val().Upvotes;
        update(ref(db, 'Requests/' + parent.dataset.requestkey + '/'), {
          Upvotes : currUpvotes + voteChange,
          Downvotes : downvoteChange ? snapshot.val().Downvotes -1 : snapshot.val().Downvotes,
          Voters : voters
        });
      }).catch((error) => {
        console.error(error);
      });
    }
    else{
      popupSpanRef.current.innerHTML = 'You must be signed in to vote on requests!';
      popupDivRef.current.classList.add('popupOn');
      setTimeout(function(){
        popupDivRef.current.classList.remove('popupOn');
      }, 4000);
    }
  }

  function DownvoteSong(element){
    if(auth.currentUser){
      var currDownvotes = 0;
      var parent = element.parentNode;
      var voteChange = 0;
      var upvoteChange = false;

      if(parent.dataset.currvote === 'down'){
        element.classList.remove('downvote-on');
        parent.dataset.currvote = 'none';
        voteChange = -1;
      }
      else if(parent.dataset.currvote === 'up'){
        element.classList.add('downvote-on');
        parent.children[0].classList.remove('upvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
        upvoteChange = true;
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('downvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
      }

      get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        var voters = {};
        if(snapshot.val() != null && snapshot.val().Voters != null){
          Object.entries(snapshot.val().Voters).forEach(([key, value]) => {
            voters[key] = value;
          });
        }
        voters[auth.currentUser.uid] = parent.dataset.currvote !== 'none' ? parent.dataset.currvote : null;
        currDownvotes = snapshot.val().Downvotes;
        update(ref(db, 'Requests/' + parent.dataset.requestkey + '/'), {
          Upvotes : upvoteChange ? snapshot.val().Upvotes -1 : snapshot.val().Upvotes,
          Downvotes : currDownvotes + voteChange,
          Voters : voters
        });
      }).catch((error) => {
        console.error(error);
      });
    }
    else{
      popupSpanRef.current.innerHTML = 'You must be signed in to vote on requests!';
      popupDivRef.current.classList.add('popupOn');
      setTimeout(function(){
        popupDivRef.current.classList.remove('popupOn');
      }, 4000);
    }
  }

  function SortMethodOnChange(e){
    SetSortChoice(e.target.value);
  }

  function SortLineup(data){
    const sortedKeys = [];
    var sortedDataType = [];
    if(sortChoiceRef.current == 'Chronological'){
      Object.entries(data).forEach(([key, value]) => {
        sortedKeys.push(key);
      });
    }
    else if(sortChoiceRef.current == 'MostRecent'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.DateTime);
      });
      sortedDataType.sort();
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(value.DateTime === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.unshift(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'SongName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.SongName);
      });
      sortedDataType.sort();
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(value.SongName === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'RevSongName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.SongName);
      });
      sortedDataType.sort();
      for(var i = sortedDataType.length -1; i >= 0; i--){
        Object.entries(data).forEach(([key, value]) => {
          if(value.SongName === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'ArtistName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.ArtistName);
      });
      sortedDataType.sort();
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(value.ArtistName === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'RevArtistName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.ArtistName);
      });
      sortedDataType.sort();
      for(var i = sortedDataType.length - 1; i >= 0; i--){
        Object.entries(data).forEach(([key, value]) => {
          if(value.ArtistName === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'TopRated'){
      Object.entries(data).forEach(([key, value]) => {
        if(!sortedDataType.includes(value.Downvotes - value.Upvotes)){
          sortedDataType.push(value.Downvotes - value.Upvotes);
        }
      });
      sortedDataType.sort(function(a,b){
        return a-b;
      });
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if((value.Downvotes - value.Upvotes) === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'MostHated'){
      Object.entries(data).forEach(([key, value]) => {
        if(!sortedDataType.includes(value.Upvotes - value.Downvotes)){
          sortedDataType.push(value.Upvotes - value.Downvotes);
        }
      });
      sortedDataType.sort(function(a,b){
        return a-b;
      });
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if((value.Upvotes - value.Downvotes) === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }

    return sortedKeys;
  }

  function AcceptSong(element){
    var parent = element.parentNode;
    get(child(dbRef, `/`)).then((snapshot) => {
      var nextKey = 1;
      if(snapshot.val().Requests){
        Object.entries(snapshot.val().Requests).forEach(([key, value]) => {
          if(parseInt(key) >= nextKey){
            nextKey = parseInt(key) + 1;
          }
        });
      }
      const songData = snapshot.val().PreapprovalRequests[parent.dataset.requestkey];
      set(ref(db, `Requests/${nextKey}`), {
        SongName : songData.SongName,
        ArtistName : songData.ArtistName,
        RequestCount: songData.RequestCount,
        SpotifyURL: songData.SpotifyURL,
        SpotifyImageURL: songData.SpotifyImageURL,
        Upvotes: songData.Upvotes,
        Downvotes: songData.Downvotes,
        RequestedBy: songData.RequestedBy,
        DateTime : (new Date()).toUTCString(),
        Approved : true
      });
      remove(ref(db, `PreapprovalRequests/${parent.dataset.requestkey}`));
    });
  }

  function DeclineSong(element){
    var parent = element.parentNode;
    // get(child(dbRef, `/`)).then((snapshot) => {
    //   var nextKey = 1;
    //   if(snapshot.val().Requests){
    //     Object.entries(snapshot.val().Requests).forEach(([key, value]) => {
    //       if(parseInt(key) >= nextKey){
    //         nextKey = parseInt(key) + 1;
    //       }
    //     });
    //   }

    //   set(ref(db, `Requests/${nextKey}`), snapshot.val().PreapprovalRequests[parent.dataset.requestkey]);
    //   remove(ref(db, `PreapprovalRequests/${parent.dataset.requestkey}`));
    // });
    remove(ref(db, `PreapprovalRequests/${parent.dataset.requestkey}`));
  }

  function SkeeterRemoveSong(element){
    set(ref(db, 'Requests/' + element.dataset.requestkey), null);
  }

  return (
    auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') ?
    <div id='lineupGridContainer' className='skeeterLineupGridContainer' ref={lineupGridContainerRef}>
      <select id='sortSelect' defaultValue={'Chronological'} onChange={SortMethodOnChange}>
        <option value='Chronological'>Chronological</option>
        <option value='MostRecent'>Most Recent</option>
        <option value='SongName'>Song A&#8594;Z</option>
        <option value='RevSongName'>Song Z&#8594;A</option>
        <option value='ArtistName'>Artist A&#8594;Z</option>
        <option value='RevArtistName'>Artist Z&#8594;A</option>
        <option value='TopRated'>Top Rated</option>
        <option value='MostHated'>Most Hated</option>
      </select>
      <div id='lineupDiv'>
        <div id='lineupTracksDiv'>
          {lineupTracksRef.current}
        </div>
      </div>
      <div id='pre-approvalLineupDiv'>
        <div id='pre-approvalLineupTracksDiv'>
          {preapprovalLineupTracksRef.current}
        </div>
      </div>
      <div id='popupDiv' ref={popupDivRef}>
        <span id='popupSpan' ref={popupSpanRef}></span>
      </div>
    </div>
    :
    <div id='lineupGridContainer' ref={lineupGridContainerRef}>
      <select id='sortSelect' defaultValue={'Chronological'} onChange={SortMethodOnChange}>
        <option value='Chronological'>Chronological</option>
        <option value='MostRecent'>Most Recent</option>
        <option value='SongName'>Song A&#8594;Z</option>
        <option value='RevSongName'>Song Z&#8594;A</option>
        <option value='ArtistName'>Artist A&#8594;Z</option>
        <option value='RevArtistName'>Artist Z&#8594;A</option>
        <option value='TopRated'>Top Rated</option>
        <option value='MostHated'>Most Hated</option>
      </select>
      <div id='lineupDiv'>
        <div id='lineupTracksDiv'>
          {lineupTracksRef.current}
        </div>
      </div>
      <div id='popupDiv' ref={popupDivRef}>
        <span id='popupSpan' ref={popupSpanRef}></span>
      </div>
    </div>
  );
}

export default RequestLineup;