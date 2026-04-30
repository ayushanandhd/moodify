import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Hero.css'
import Song from "./Song";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });


export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spotify token error:", response.status, errorText);
      throw new Error(`Failed to get Spotify token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  };

  const searchTrack = async (songName, token) => {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify search error for "${songName}":`, response.status, errorText);
      return "Track not found";
    }
  
    const data = await response.json();
    if (data.tracks && data.tracks.items.length > 0) {
      return data.tracks.items[0].external_urls.spotify;
    } else {
      return "Track not found";
    }
  };
  

  // end spotify api code

  function handleChange(e){
    setPrompt(e.target.value)
  }

  async function handleClick(){
    if (!prompt.trim()) return;
    setIsLoading(true);
    setPlaylist(null);
    setError(null);

    try {
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

      // Fetch token ONCE and reuse for all searches
      const token = await getSpotifyToken();

      const songUrls = songsArr.map((song) => searchTrack(song, token));

      const resultArr = await Promise.all(songUrls);

      setPlaylist(resultArr);
      console.log(songsArr);
    } catch (err) {
      console.error("Error generating playlist:", err);
      setError("Something went wrong. Please try again.");
    }
    
    setPrompt('');
    setIsLoading(false);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <span className="loading-text">Curating your playlist...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-message">
          <span className="state-message-icon">⚠️</span>
          <p className="state-message-text">{error}</p>
        </div>
      );
    }

    if (playlist) {
      return playlist.map((url, index) => (
        <Song key={index} url={url} index={index} />
      ));
    }

    return null;
  };

  return (
    <div className="hero-container">
      <div className="hero-headline">
        <h1 className="hero-title">What's your mood?</h1>
        <p className="hero-subtitle">
          AI-powered playlists tailored to exactly how you feel, right now.
        </p>
      </div>

      <div className="input-container">
        <input 
          className="input-box" 
          type="text" 
          placeholder="I'm feeling nostalgic..." 
          value={prompt} 
          onChange={handleChange} 
          onKeyDown={(e) => e.key === "Enter" && handleClick()}
        />
        <button 
          disabled={isLoading || !prompt.trim()} 
          className="send-button" 
          onClick={handleClick}
          aria-label="Generate playlist"
        >
          🎧
        </button>
      </div>

      <div className="playlist-container">
        {renderContent()}
      </div>
    </div>
  );
}
