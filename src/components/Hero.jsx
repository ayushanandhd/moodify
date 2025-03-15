import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Hero.css'
import Song from "./Song";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState("Tell us how you're feeling and we'll generate a playlist for you! 😼");
  const [IsDisabled, setIsDisabled] = useState(false);

  // spotify api code

  const getSpotifyToken = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
      },
      body: "grant_type=client_credentials",
    });
  
    const data = await response.json();
    return data.access_token;
  };

  const searchTrack = async (songName) => {
    const token = await getSpotifyToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const data = await response.json();
    if (data.tracks.items.length > 0) {
      return data.tracks.items[0].external_urls.spotify; // Returns track URL
    } else {
      return "Track not found";
    }
  };
  
  
  // end spotify api code

  function handleChange(e){
    setPrompt(e.target.value)
  }

  async function handleClick(){
    setIsDisabled(true);
    setPlaylist("Loading... ⌛")

    const aiprompt = `
    The user has described their mood as: "${prompt}".  
    Generate a list of songs that best match this mood.  
    
    **Response Format:**  
    - Return the output as a valid JavaScript array.  
    - Each item in the array must be a string in the format: "Song Name Artist Name" note that theres no "by" after the song name.  
    - Do NOT include any explanations, descriptions, or extra text—only return the array.  
    - Ensure the response is properly formatted as JSON.  
    
    **Example Output:**  
    ["Intentions Justin Bieber", "Shape of You Ed Sheeran", "Blinding Lights The Weeknd"]
    
    Provide a minimum of 5 and a maximum of 10 songs.
    `;
     
    const result = await model.generateContent(aiprompt);

    const songsArr = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

    const songUrls = songsArr.map(async (song) => {
      return await searchTrack(song);
    }
    );

    const resultArr = await Promise.all(songUrls);

    setPlaylist(resultArr)
    console.log(songsArr)
    
    setPrompt('')
    setIsDisabled(false);
  }

  return (
    <div className="hero-container">
      <div className="input-container">
        <input className="input-box" type="text" placeholder="Explain your mood 👀" value={prompt} onChange={(e)=>{handleChange(e)}} />
        <button disabled={IsDisabled} className="send-button" onClick={()=>{handleClick()}}> 🔥 </button>
      </div>
      <div className="playlist-container">


      {Array.isArray(playlist) ? playlist.map((url, index) => (
        <Song key={index} url={url} />
      )) : playlist}

      

      </div>
    </div>
  );
}
