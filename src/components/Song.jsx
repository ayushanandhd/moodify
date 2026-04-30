export default function Song({ url, index }) {
    if (!url || url === "Track not found") return null;

    // Replace "open.spotify.com" with "open.spotify.com/embed"
    const embedUrl = url.replace("open.spotify.com", "open.spotify.com/embed");

    return (
        <div 
            className="song-card" 
            style={{ animationDelay: `${index * 0.08}s` }}
        >
            <iframe
                src={embedUrl} 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
            ></iframe>
        </div>
    );
}
