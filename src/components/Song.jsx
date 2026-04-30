import { useState, useRef } from "react";

export default function Song({ track, index }) {
    if (!track) return null;

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePreviewToggle = () => {
        if (!track.previewUrl || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Pause any other playing previews
            document.querySelectorAll("audio").forEach((a) => {
                a.pause();
                a.currentTime = 0;
            });
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleEnded = () => setIsPlaying(false);

    return (
        <div
            className="song-card"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="song-artwork-wrapper" onClick={handlePreviewToggle}>
                <img
                    className="song-artwork"
                    src={track.artwork}
                    alt={`${track.trackName} album art`}
                    loading="lazy"
                />
                {track.previewUrl && (
                    <div className={`song-play-overlay ${isPlaying ? "playing" : ""}`}>
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                <polygon points="6,4 20,12 6,20" />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            <div className="song-info">
                <span className="song-title">{track.trackName}</span>
                <span className="song-artist">{track.artistName}</span>
            </div>

            <a
                className="song-apple-link"
                href={track.trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${track.trackName} in Apple Music`}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
            </a>

            {track.previewUrl && (
                <audio ref={audioRef} src={track.previewUrl} onEnded={handleEnded} />
            )}
        </div>
    );
}
