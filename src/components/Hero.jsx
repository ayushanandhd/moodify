import { useState } from "react";
import './Hero.css'
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export default function Hero() {
  const [prompt, setPrompt] = useState("");
  const [playlists, setPlaylists] = useState('Your playlists will display here 🥰');
  const [IsDisabled, setIsDisabled] = useState(false);

  function handleChange(e){
    setPrompt(e.target.value)
  }

  async function handleClick(){
    setIsDisabled(true);

    setPlaylists("Loading... ⌛")
    // const aiprompt = `user-input: ${prompt} . the user has given input of how they are feeling or what their mood is. based on that you have to recommend the user some songs or a playlist of some songs that suits their mood or emotion. Only display the song name and the artist name, do not display any extra text at all. display the songs in bullet lists. make sure theres no unnecessary text. straight up display the songs.`;

    const aiprompt = `
    The user has described their mood as: "${prompt}".  
    Generate a list of songs that best match this mood.  
    
    **Response Format:**  
    - Each song must be displayed on a new line.  
    - Include only the song name and the artist name.  
    - Do NOT add any extra text, explanations, or descriptions.  
    - Do NOT use any markup, emojis, or formatting—just plain text.  
    
    **Strict Formatting Example:**  
    Song Name - Artist Name  
    Second Song - Second Artist  
    
    Provide a minimum of 5 and a maximum of 10 songs.  
    Ensure the recommendations are relevant and diverse.
    `;
    
    const result = await model.generateContent(aiprompt);

    setPlaylists(result.response.text())
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
        {playlists}
      </div>
    </div>
  );
}
