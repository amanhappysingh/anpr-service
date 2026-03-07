import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, WifiOff, Radio, ImageIcon, X, Sun, Moon } from "lucide-react";

const STREAM_CONFIGS = [
  { id: 1, label: "CAM — 01", webrtcUrl: "http://localhost:8889/webrtc" },
  { id: 2, label: "CAM — 02", webrtcUrl: "http://localhost:8890/webrtc" },
];

const IMAGE_API = "http://localhost:5000/api/images";

/* ─── Single Stream Panel ─── */
const StreamPanel = ({ config }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("connecting");
  const [err, setErr] = useState(null);
  const isFirst = config.id === 1;

  useEffect(() => {
    let pc = null;
    const init = async () => {
      try {
        setStatus("connecting");
        pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        pc.ontrack = (e) => {
          if (videoRef.current) {
            videoRef.current.srcObject = e.streams[0];
            setStatus("connected");
          }
        };
        pc.oniceconnectionstatechange = () => {
          const s = pc.iceConnectionState;
          if (s === "connected" || s === "completed") setStatus("connected");
          else if (s === "failed" || s === "disconnected") {
            setStatus("error");
            setErr("Connection lost");
          }
        };
        const offer = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: false });
        await pc.setLocalDescription(offer);
        const res = await fetch(config.webrtcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const answer = await res.json();
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        setErr(e.message || "Failed");
        setStatus("error");
      }
    };
    init();
    return () => pc?.close();
  }, [config.webrtcUrl]);

  return (
    <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border
      bg-white border-gray-200
      dark:bg-gray-900 dark:border-gray-700
      transition-colors duration-300">

      {/* Panel Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b transition-colors duration-300
        ${isFirst
          ? "border-gray-200 bg-cyan-50 dark:border-gray-700 dark:bg-cyan-950"
          : "border-gray-200 bg-rose-50 dark:border-gray-700 dark:bg-rose-950"
        }`}>
        <Radio className={`w-4 h-4 ${isFirst ? "text-cyan-500 dark:text-cyan-400" : "text-rose-500 dark:text-rose-400"}`} />
        <span className={`text-xs font-bold tracking-widest uppercase font-mono
          ${isFirst ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"}`}>
          {config.label}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === "connected" ? "bg-green-400 animate-pulse"
            : status === "connecting" ? "bg-yellow-400 animate-pulse"
            : "bg-red-500"
          }`} />
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
            {status === "connected" ? "LIVE" : status === "connecting" ? "INIT" : "ERR"}
          </span>
        </div>
      </div>

      {/* Video */}
      <div className="relative flex-1 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />

        {/* Corner brackets */}
        <div className={`absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 ${isFirst ? "border-cyan-400" : "border-rose-400"}`} />
        <div className={`absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 ${isFirst ? "border-cyan-400" : "border-rose-400"}`} />
        <div className={`absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 ${isFirst ? "border-cyan-400" : "border-rose-400"}`} />
        <div className={`absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 ${isFirst ? "border-cyan-400" : "border-rose-400"}`} />

        {/* Overlay */}
        {status !== "connected" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              {status === "connecting" ? (
                <>
                  <div className={`w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3
                    ${isFirst ? "border-cyan-400" : "border-rose-400"}`} />
                  <p className={`text-xs tracking-widest font-mono ${isFirst ? "text-cyan-400" : "text-rose-400"}`}>
                    CONNECTING...
                  </p>
                </>
              ) : (
                <>
                  <WifiOff className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                  <p className="text-xs text-gray-400 font-mono">{err || "NO SIGNAL"}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const WebRTCWithImages = () => {
  
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingImgs, setLoadingImgs] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(IMAGE_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const latest = data.slice(0, 5);
      setImages(latest);
      if (latest.length && !selected) setSelected(latest[0].url);
    } catch (e) {
      console.error("Image fetch failed:", e);
    } finally {
      setLoadingImgs(false);
    }
  }, [selected]);

  useEffect(() => {
    fetchImages();
    const t = setInterval(fetchImages, 5000);
    return () => clearInterval(t);
  }, [fetchImages]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300
      bg-gray-100 text-gray-900
      dark:bg-gray-950 dark:text-white">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 transition-colors duration-300
        bg-white border-b border-gray-200 shadow-sm
        dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-rose-500 flex items-center justify-center shadow">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-500 to-rose-500 bg-clip-text text-transparent">
            SENTINEL MONITOR
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* System status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border transition-colors duration-300
            bg-gray-100 border-gray-200 text-gray-600
            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-5">
        {/* Dual Streams */}
        <div className="flex gap-4 h-72">
          {STREAM_CONFIGS.map((cfg) => (
            <StreamPanel key={cfg.id} config={cfg} />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px transition-colors duration-300 bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-2 transition-colors duration-300 text-gray-400 dark:text-gray-500">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-mono tracking-widest uppercase">Latest Captures</span>
          </div>
          <div className="flex-1 h-px transition-colors duration-300 bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Images Strip */}
        {loadingImgs ? (
          <div className="flex items-center justify-center h-28">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center h-28 font-mono text-xs tracking-widest transition-colors duration-300 text-gray-400 dark:text-gray-600">
            NO CAPTURES AVAILABLE
          </div>
        ) : (
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                onClick={() => setSelected(img.url)}
                className={`flex-1 relative aspect-video rounded-xl overflow-hidden border transition-all duration-200 hover:scale-105 group
                  ${selected === img.url
                    ? "border-cyan-400 dark:border-cyan-400"
                    : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                  }
                  bg-gray-200 dark:bg-gray-900`}
              >
                <img src={img.url} alt={`Capture ${i + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 left-2 text-xs font-mono text-white/60 group-hover:text-white/90 transition-colors">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                {selected === img.url && (
                  <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-cyan-400/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected} alt="Preview" className="w-full block" />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCWithImages;