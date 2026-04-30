import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Hero.css'
import Song from "./Song";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });


export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Apple Music search via iTunes API (no auth needed)
  const searchTrack = async (songName, artistName) => {
    try {
      const query = `${songName} ${artistName}`;
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`
      );

      if (!response.ok) {
        console.error(`iTunes search error for "${query}":`, response.status);
        return null;
      }

      const data = await response.json();
      if (data.resultCount > 0) {
        const track = data.results[0];
        // Get high-res artwork by replacing size in URL
        const artworkHiRes = track.artworkUrl100.replace("100x100", "600x600");
        return {
          trackUrl: track.trackViewUrl,
          trackName: track.trackName,
          artistName: track.artistName,
          albumName: track.collectionName,
          artwork: artworkHiRes,
          previewUrl: track.previewUrl,
        };
      }
      return null;
    } catch (err) {
      console.error(`Error searching "${songName}":`, err);
      return null;
    }
  };

  function handleChange(e) {
    setPrompt(e.target.value);
  }

  async function handleClick() {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setPlaylist(null);
    setError(null);

    try {
      const aiprompt = `
      The user has described their mood as: "${prompt}".  
      Generate a list of songs that best match this mood.  
      
      **Response Format:**  
      - Return the output as a valid JSON array of objects.
      - Each object must have exactly two keys: "title" (song name) and "artist" (artist name).
      - Do NOT include any explanations, descriptions, markdown formatting, or extra text—only return the JSON array.
      
      **Example Output:**  
      [{"title": "Blinding Lights", "artist": "The Weeknd"}, {"title": "Shape of You", "artist": "Ed Sheeran"}]
      
      Provide exactly 10 songs.
      `;

      const result = await model.generateContent(aiprompt);
      const responseText = result.response.text().replace(/```json|```/g, "").trim();
      const songsArr = JSON.parse(responseText);

      console.log("AI suggested:", songsArr);

      // Search all songs in parallel via iTunes API
      const trackPromises = songsArr.map((song) =>
        searchTrack(song.title, song.artist)
      );

      const tracks = await Promise.all(trackPromises);
      const validTracks = tracks.filter((t) => t !== null);

      if (validTracks.length === 0) {
        setError("Couldn't find any tracks. Try a different mood!");
      } else {
        setPlaylist(validTracks);
      }
    } catch (err) {
      console.error("Error generating playlist:", err);
      setError("Something went wrong. Please try again.");
    }

    setPrompt("");
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
      return playlist.map((track, index) => (
        <Song key={index} track={track} index={index} />
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
