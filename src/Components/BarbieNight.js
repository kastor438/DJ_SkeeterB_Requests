import '../StyleSheets/BarbieNight.css';

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { NavLink, Navigate, Link, useLocation } from 'react-router-dom';
import { getDatabase, ref, set, remove, child, get, onValue, update } from "firebase/database";

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

const BarbieNight = props => {
  const [navigateToHome, SetNavigateToHome] = useState(false);

  const userEmailRef = useRef();
  const location = useLocation();

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    get(child(dbRef, 'Features/BarbieNight/')).then((snapshot) => {
      var visits = 1;
      if(snapshot.exists()){
        visits = parseInt(snapshot.val().Visits) + 1;
      }
      set(ref(db, 'Features/BarbieNight/Visits'), visits);
    });
  }, [])

  if(navigateToHome === true){
    return <Navigate to='/'/>;
  }
  return (
    <div id='barbieNightDiv'>
      <div className='featureHeaderDiv'>
        <h1 className='featureHeader'>Hey Barbie!!!</h1>
      </div>
      <div className='featureContentDiv'>
        <div className='featureInfoDiv info1'>
          <div className='firstLineHeaderDiv'>
            <h3>🎀👠💄</h3>
            <h3 className='firstLineHeader'>Welcome to Barbie's Ultimate Glam Night!</h3>
            <h3>💄👠🎀</h3>
          </div>
          <p>Darlings, you've just stepped into a world of glitz, glam, and pure Barbie magic! As you prepare to embark on this dazzling journey, our Barbie's Dreamland just got even more fabulous upon your arrival!</p>
          <p>🌟<b>Unlock the Magic</b>🌟</p>
        </div>
        <div className='featureInfoDiv info2'>
          <p>📸 <b>Barbie Box Photo Wall:</b> Strike a pose, darlings! Our life-sized Barbie Box Photo Wall is a must-visit. Snap your most glamorous photos and share them with the world. Remember, Barbie always knows how to work the camera!</p>
          <p>👠 <b>The Runway:</b> It's your time to shine on our Barbie-inspired runway! Channel your inner supermodel, flaunt your best Barbie-inspired attire, and strut your stuff. Confidence is your accessory, and the spotlight is all yours!</p>
          <p>🪄 <b>Barbie Donation Center:</b> True beauty is found in kindness. At our event, we're spreading the Barbie love beyond the glamour. Discover the Barbie Donation Center at the back bar, where you can bring any old or new dolls to be donated to North End Parent Resource Centre. All donations, big or small, are welcome. Let's make the world a little brighter, one Barbie at a time.</p>
          <p className={(new Date() < new Date('October 25, 2023 05:00:00') ? ' liveWednesday' : '')}>🎵 <b>Song Requests:</b> Your wish is our command! Be the DJ for a moment and curate the soundtrack of our dreamy night. Head to the "Requests" section and choose the tunes that make your Barbie heart sing. We're taking your requests live and keeping the dance floor hot!</p>
        </div>
        <div className='featureInfoDiv info3'>
          <h4 className={(new Date() < new Date('October 25, 2023 05:00:00') ? ' liveWednesday' : '')}>Now, here's how to navigate our Barbie Dreamland Interactive Website:</h4>
          <ol className={(new Date() < new Date('October 25, 2023 05:00:00') ? ' liveWednesday' : '')}>
            <li><b>Scan:</b> You've already simply scanned the QR code on your phone, just like a glamorous Barbie! Not all QR Codes are equal though so make sure to scan some of the others for a surprise! Encourage your friends to do the same, and together, you'll be whisked away to our enchanting Barbie paradise.</li>
            <li><b>Click:</b> Click the link below to discover the dazzling main Request Page. Think of it as your backstage pass to control the music and bring your Barbie fantasy to life.</li>
            <li><b>Search:</b> Use the Spotify Search Engine to find your favorite tunes and click 'Submit Request!' Remember, the DJ will be using this as a reference to search through our limited offline library. While Barbie's options are vast, not all songs are guaranteed to be playable. Choose something you think or know the DJ would have available, just like a true Barbie fashionista!</li>
            <li><b>Vote:</b> Be the star of the show by choosing whether a song deserves more or less attention. Upvote and downvote to make your voice heard! The songs with the most votes are most likely to get played and steal the spotlight, just like Barbie herself!</li>
          </ol>
          <p>Remember, darlings, tonight is all about celebrating the glamour, the fun, and the nostalgia of Barbie. So, bring your A-game, and let's make this night sparkle like never before!</p>
          <p>Are you ready to dive into Barbie's Dreamland? Let's paint the town pink and dance the night away in true Barbie style! 💖👑💃🎉 <br/><b>#BarbieAndKaisDreamhouse</b></p>
          <p>💖 Get Ready to Rock Your Barbie World! 💖</p>
        </div>
        <div className='featureInfoDiv info4'>
          <p>Barbie enthusiasts, your glamorous adventure begins here! Before we dive into the night, here are a few Barbie-tastic extras to elevate your experience:</p>
          <p>🎶 DJ Skeeter-B's Barbie Playlist: Step into Barbie's world with a playlist specially curated by DJ Skeeter-B on Spotify. Feel the vibes, soak in the nostalgia, and discover the essence of Barbie. It's the perfect soundtrack to fuel your Barbie spirit and set the stage for a glamorous night ahead!</p>
          <div className='barbieNightFeatureImageDiv'>
            <a href='https://open.spotify.com/playlist/2iwX8ELQMpIDvU2eDi1Kzf?si=06eed8c19af541c9' target='blank' title='Go To DJ-SkeeterB&apos;s Barbie Playlist!'>
              <img src='/Barbie_Playlist_Cover_Photo.jpeg' className='barbieNightFeatureImage' alt='A promotional photo representing the barbie playlist.'/>
            </a>
          </div>
          <p>🎵 Groove to the '90s Dance Classics: DJ Skeeter-B is taking you on a nostalgia trip! Check out his throwback mix on Mixcloud to rediscover the '90s dance classics. Get ready to dance the night away to the beats that'll take you back in time.</p>
          <div className='barbieNightFeatureImageDiv'>
            <a href='https://www.mixcloud.com/djskeeterb/music-monday-vol-7-sept-18-2017-90s-power-mix/' target='blank' title='Go To DJ-SkeeterB&apos;s Mixcloud'>
              <img src='/MixCloudLogoAlphaBackground.png' className='barbieNightFeatureImage' alt='A mixcloud logo photo.'/>
            </a>
          </div>
          <p>🎧 Unleash Your Inner Barbie on Spotify: Have a Spotify playlist that's your secret source of inspiration? Link up to your Spotify account for quick access to your own beloved playlists. After all, every Barbie needs her anthem!</p>
          <div className='barbieNightFeatureImageDiv'>
            <a href='https://open.spotify.com/?' target='blank' title='Open Spotify'>
              <img src='/SpotifyLogo.png' className='barbieNightFeatureImage' alt='The Spotify logo.'/>
            </a>
          </div>
        </div>
      </div>
      {/* <div className='headerbarbieNightFeatureImageDiv'>
        <img className='headerbarbieNightFeatureImage' src='/Barbie_Playlist_Cover_Photo.jpeg' alt='Feature promotional image.'></img>
      </div> */}
      <div>
          <h4>Now, darlings, let's make sure you're all set for an unforgettable Barbie-themed soirée! 💃👠</h4>
      </div>
      <div className={'featureToHomeLinkDiv' + (new Date() < new Date('October 25, 2023 05:00:00') ? ' liveWednesday' : '')}>
        <NavLink className='featureToHomeLink' to='/'><h4>Request Songs</h4></NavLink>
      </div>
    </div>
  );
}

export default BarbieNight;