import { useState, useEffect } from "react";
import './Hero.css'
import Song from "./Song";

// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState("your playlists will display here 🥰");
  const [IsDisabled, setIsDisabled] = useState(false);

  function handleChange(e){
    setPrompt(e.target.value)
  }

  async function handleClick(){
    setIsDisabled(true);
    setPlaylist("Loading... ⌛")

    const aiprompt = `
    The user has described their mood as: "${prompt}".  
    Generate an array of Spotify song URLs that best match this mood.
    
    **Response Format:**
    - Return only a valid JSON array of Spotify song URLs.
    - Do NOT include any text, explanations, descriptions, or formatting—just the raw array.
    - Each URL should be a direct link to the song on Spotify.
    - Provide a minimum of 8 and a maximum of 12 URLs.
    - Make sure the URL is correct and working.
    
    **Strict Output Example:**
    [
      "https://open.spotify.com/track/1234567890abcdef",
      "https://open.spotify.com/track/abcdef1234567890"
    ]
    `;
    
    
    const result = await model.generateContent(aiprompt);

    // converting the result into a valid array of URLs
    let playlistArr = JSON.parse(result.response.text().replace(/```json|```|json/g, "").trim());
    console.log(playlistArr);
    console.log(Array.isArray(playlistArr));

    setPlaylist(playlistArr)
    console.log(playlist)

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
