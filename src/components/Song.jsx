export default function Song({ url }) {
    if (!url) return null; // Prevent rendering if URL is missing

    // Replace "open.spotify.com" with "open.spotify.com/embed"
    const embedUrl = url.replace("open.spotify.com", "open.spotify.com/embed");

    return (
        <iframe
            className="song-embed"
            style={{ borderRadius: "12px" }} 
            src={embedUrl} 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
        ></iframe>
    );
}
