import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMusic } from 'react-icons/fa';

const musicStreams = [
  { name: 'Chillhop', url: 'https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/' },
  { name: 'ReyFM Lofi', url: 'https://listen.reyfm.de/lofi_320kbps.mp3' },
  { name: 'Digital Malayali', url: 'https://radio.digitalmalayali.in/listen/stream/radio.mp3' },
];

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStream, setCurrentStream] = useState(musicStreams[0]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.src = currentStream.url;
      audioRef.current.play().catch(e => console.error("Audio play error:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentStream]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleStreamChange = (e) => {
    const stream = musicStreams.find(s => s.url === e.target.value);
    setCurrentStream(stream);
    if (isPlaying) {
      // If already playing, changing the source will be handled by the useEffect
    } else {
      // If paused, just set the new source
      audioRef.current.src = stream.url;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-zen-green to-zen-green-dark text-white shadow-2xl flex items-center justify-center transform transition-transform hover:scale-110"
      >
        <FaMusic className="w-6 h-6" />
      </button>
      
      <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-white/50 dark:bg-black/25 backdrop-blur-3xl rounded-3xl shadow-2xl p-6 border border-white/60 dark:border-black/30 w-72">
          <h4 className="text-lg font-semibold text-zen-charcoal dark:text-zen-sand mb-4 text-center">Lofi Player</h4>
          <div className="flex items-center justify-center space-x-4">
            <button onClick={togglePlay} className="p-4 rounded-full bg-white/70 dark:bg-black/30 text-zen-charcoal dark:text-zen-sand transform transition-transform hover:scale-110">
              {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
            </button>
            <select 
                value={currentStream.url} 
                onChange={handleStreamChange}
                className="flex-1 px-4 py-2.5 rounded-full border border-white/60 dark:border-black/30 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-zen-green-dark appearance-none text-center font-medium text-zen-charcoal dark:text-zen-sand"
            >
              {musicStreams.map(stream => (
                <option key={stream.name} value={stream.url}>{stream.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-3 mt-5">
            <FaVolumeMute className="text-zen-charcoal/70 dark:text-zen-sand/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-white/60 dark:bg-black/30 rounded-full appearance-none cursor-pointer accent-zen-green-dark"
            />
            <FaVolumeUp className="text-zen-charcoal/70 dark:text-zen-sand/70" />
          </div>
        </div>
      </div>
      <audio ref={audioRef} crossOrigin="anonymous"></audio>
    </>
  );
}

export default MusicPlayer;
