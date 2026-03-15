import React, { useEffect, useRef, useState } from "react";
import { Camera, Radio, ImageIcon, X, Eye, Maximize2, Car, Hash } from "lucide-react";
import http from "@/lib/http";
import Urls from "@/config/urls";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CAMERAS = [
  { id: 1, label: "CAM — 01", badge: "IN",  accent: "cyan", streamUrl: `http://62.72.42.155:8888/cam1/` },
  { id: 2, label: "CAM — 02", badge: "OUT", accent: "rose", streamUrl: `http://62.72.42.155:8888/cam2/` },
];

const IMAGE_API_URL = `${Urls.baseURL}/api/images`;
const IMAGE_WS_URL  = Urls.baseURL.replace(/^http/, 'ws') + '/ws/images';
const MAX_IMAGES    = 5;
const BASE_URL      = Urls.baseURL; // for resolving relative image paths

// ─── Resolve relative image path to full URL ──────────────────────────────────
function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.replace("/app","")}`;
}

// ─── Normalize API image record ───────────────────────────────────────────────
function normalizeImage(item) {
  return {
    id:            item.event_id || item.id || Date.now(),
    plate:         item.plate_number || '—',
    vehicleUrl:    resolveUrl(item.image_url),
    plateUrl:      resolveUrl(item.plate_image_url),
    createdAt:     item.created_at,
  };
}

// ─── CAM CARD ─────────────────────────────────────────────────────────────────
const CamPanel = ({ label, badge, accent, streamUrl, onExpand }) => {
  const isCyan     = accent === "cyan";
  const accentText = isCyan ? "text-cyan-500 dark:text-cyan-400" : "text-rose-500 dark:text-rose-400";
  const accentBg   = isCyan ? "bg-cyan-50 dark:bg-cyan-950"      : "bg-rose-50 dark:bg-rose-950";
  const bc         = isCyan ? "border-cyan-400"                   : "border-rose-400";

  return (
    <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border
      bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300">

      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700
        transition-colors duration-300 ${accentBg}`}>
        <Radio className={`w-4 h-4 ${accentText}`} />
        <span className={`text-xs font-bold tracking-widest uppercase font-mono ${accentText}`}>{label}</span>
        <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${accentText} border-current opacity-60`}>
          {badge}
        </span>
        <Eye className={`w-3.5 h-3.5 ml-0.5 opacity-50 ${accentText}`} />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">LIVE</span>
        </div>
      </div>

      {/* Iframe + click overlay */}
      <div
        className="relative flex-1 bg-black cursor-pointer group"
        onClick={() => onExpand({ type: "stream", streamUrl, label, badge, accent })}
      >
        <iframe
          src={streamUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          style={{ pointerEvents: "none" }}
          title={label}
        />
        <div className={`absolute top-2 left-2   w-5 h-5 border-t-2 border-l-2 pointer-events-none ${bc}`} />
        <div className={`absolute top-2 right-2  w-5 h-5 border-t-2 border-r-2 pointer-events-none ${bc}`} />
        <div className={`absolute bottom-2 left-2  w-5 h-5 border-b-2 border-l-2 pointer-events-none ${bc}`} />
        <div className={`absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 pointer-events-none ${bc}`} />
        <div className="absolute inset-0 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          bg-black/25 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20">
            <Maximize2 className="w-4 h-4 text-white" />
            <span className="text-xs font-mono text-white tracking-widest">EXPAND</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ modal, onClose }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!modal) return null;

  const isStream = modal.type === "stream";
  const isImage  = modal.type === "image";
  const isCyan   = modal.accent === "cyan";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ width: isImage ? "70vw" : "80vw", height: isImage ? "auto" : "80vh", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center gap-2 px-5 py-3 flex-shrink-0 ${
          isStream
            ? isCyan ? "bg-cyan-950 border-b border-cyan-800"
                     : "bg-rose-950 border-b border-rose-800"
            : "bg-gray-900 border-b border-gray-700"
        }`}>
          {isStream ? (
            <>
              <Radio className={`w-4 h-4 ${isCyan ? "text-cyan-400" : "text-rose-400"}`} />
              <span className={`text-xs font-bold tracking-widest font-mono uppercase
                ${isCyan ? "text-cyan-400" : "text-rose-400"}`}>{modal.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border opacity-60
                ${isCyan ? "text-cyan-400 border-cyan-400" : "text-rose-400 border-rose-400"}`}>{modal.badge}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ml-1
                ${isCyan ? "bg-cyan-500/20 text-cyan-300" : "bg-rose-500/20 text-rose-300"}`}>LIVE</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold tracking-widest font-mono uppercase text-gray-300">
                {modal.plate || 'CAPTURE'}
              </span>
              {modal.createdAt && (
                <span className="text-[10px] font-mono text-gray-500 ml-1">
                  {new Date(modal.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 active:scale-95
              flex items-center justify-center transition-all duration-150"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className={`${isStream ? 'flex-1' : ''} bg-black overflow-hidden`}>
          {isStream ? (
            <>
              <iframe
                src={`${modal.streamUrl.split("?")[0]}?autoplay=1&muted=1&controls=1&playsinline=1`}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                title={modal.label}
              />
              <div className={`absolute top-4 left-4  w-7 h-7 border-t-2 border-l-2 pointer-events-none ${isCyan ? "border-cyan-400" : "border-rose-400"}`} />
              <div className={`absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 pointer-events-none ${isCyan ? "border-cyan-400" : "border-rose-400"}`} />
              <div className={`absolute bottom-4 left-4  w-7 h-7 border-b-2 border-l-2 pointer-events-none ${isCyan ? "border-cyan-400" : "border-rose-400"}`} />
              <div className={`absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 pointer-events-none ${isCyan ? "border-cyan-400" : "border-rose-400"}`} />
            </>
          ) : (
            /* Image modal — show vehicle + plate side by side */
            <div className="grid grid-cols-2 gap-0">
              <div className="flex flex-col">
                <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Vehicle</span>
                </div>
                {modal.vehicleUrl ? (
                  <img src={modal.vehicleUrl} alt="Vehicle" className="w-full object-contain max-h-[60vh] bg-black" />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-900">
                    <ImageIcon className="w-8 h-8 text-gray-700" />
                  </div>
                )}
              </div>
              <div className="flex flex-col border-l border-gray-700">
                <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Number Plate</span>
                </div>
                {modal.plateUrl ? (
                  <img src={modal.plateUrl} alt="Plate" className="w-full object-contain max-h-[60vh] bg-black" />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-900">
                    <ImageIcon className="w-8 h-8 text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── IMAGE CARD ───────────────────────────────────────────────────────────────
const ImageCard = ({ img, index, isNew, onExpand }) => (
  <button
    onClick={() => onExpand({
      type: "image",
      vehicleUrl: img.vehicleUrl,
      plateUrl:   img.plateUrl,
      plate:      img.plate,
      createdAt:  img.createdAt,
    })}
    className="flex-1 flex flex-col rounded-xl overflow-hidden border group
      border-gray-300 hover:border-cyan-400 dark:border-gray-700 dark:hover:border-cyan-400
      bg-gray-100 dark:bg-gray-900 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
  >
    {/* Vehicle image thumbnail */}
    <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
      {img.vehicleUrl ? (
        <img src={img.vehicleUrl} alt="Vehicle" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
        </div>
      )}

      {/* NEW badge */}
      {isNew && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded
          bg-cyan-500/90 text-white tracking-widest animate-pulse">NEW</span>
      )}

      {/* Expand overlay */}
      <div className="absolute inset-0 flex items-center justify-center
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 pointer-events-none">
        <Maximize2 className="w-5 h-5 text-white drop-shadow-lg" />
      </div>
    </div>

    {/* Plate image thumbnail strip */}
    <div className="relative h-9 bg-black overflow-hidden border-t border-gray-200 dark:border-gray-700">
      {img.plateUrl ? (
        <img src={img.plateUrl} alt="Plate" className="w-full h-full object-cover object-center" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[9px] font-mono text-gray-600">NO PLATE</span>
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300 truncate">
        {img.plate}
      </span>
      <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600 flex-shrink-0 ml-1">
        #{String(index + 1).padStart(2, "0")}
      </span>
    </div>
  </button>
);

// ─── IMAGE FEED ───────────────────────────────────────────────────────────────
const ImageFeed = ({ onExpand }) => {
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [newId,    setNewId]    = useState(null);

  // Fetch initial images
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get(IMAGE_API_URL);
        // ✅ API returns { success, count, data: [...] }
        const raw = res.data?.data ?? res.data;
        const normalized = (Array.isArray(raw) ? raw : [])
          .slice(0, MAX_IMAGES)
          .map(normalizeImage);
        setImages(normalized);
      } catch (err) {
        console.error("Image fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // WebSocket — append new detections
  useEffect(() => {
    let ws, timer;
    const connect = () => {
      try {
        ws = new WebSocket(IMAGE_WS_URL);
        ws.onopen    = () => setWsStatus("open");
        ws.onmessage = ({ data }) => {
          try {
            const raw = JSON.parse(data);
            const img = normalizeImage(raw);
            setImages(prev => {
              // Deduplicate by id
              if (prev.some(x => x.id === img.id)) return prev;
              const next = [img, ...prev].slice(0, MAX_IMAGES);
              return next;
            });
            setNewId(img.id);
            // Clear "NEW" badge after 3s
            setTimeout(() => setNewId(null), 3000);
          } catch {}
        };
        ws.onerror = () => setWsStatus("closed");
        ws.onclose = () => {
          setWsStatus("closed");
          timer = setTimeout(connect, 4000);
        };
      } catch {
        setWsStatus("closed");
        timer = setTimeout(connect, 4000);
      }
    };
    connect();
    return () => { clearTimeout(timer); ws?.close(); };
  }, []);

  return (
    <>
      {/* Section divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-mono tracking-widest uppercase">Latest Captures</span>
          <span className={`w-1.5 h-1.5 rounded-full ml-1 ${
            wsStatus === "open"        ? "bg-green-400 animate-pulse"
            : wsStatus === "connecting" ? "bg-yellow-400 animate-pulse"
            : "bg-red-500"
          }`} />
        </div>
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-28">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <ImageCard
              key={img.id}
              img={img}
              index={i}
              isNew={img.id === newId}
              onExpand={onExpand}
            />
          ))}
          {/* Empty placeholder slots */}
          {Array.from({ length: MAX_IMAGES - images.length }).map((_, i) => (
            <div key={`e${i}`} className="flex-1 rounded-xl border border-dashed
              border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50
              flex flex-col items-center justify-center gap-1.5 aspect-video">
              <ImageIcon className="w-5 h-5 text-gray-300 dark:text-gray-700" />
              <span className="text-[9px] font-mono text-gray-300 dark:text-gray-700 tracking-widest">EMPTY</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
const SentinelMonitor = () => {
  const [modal, setModal] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300">

      <header className="flex items-center justify-between px-6 py-3 sticky top-0 z-10
        bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-rose-500 flex items-center justify-center shadow">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-500 to-rose-500 bg-clip-text text-transparent">
            SENTINEL MONITOR
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border
          bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono">SYSTEM ONLINE</span>
        </div>
      </header>

      <main className="flex flex-col flex-1 p-5 gap-5">
        {/* Camera streams */}
        <div className="flex gap-4 h-72">
          {CAMERAS.map((cam) => (
            <CamPanel
              key={cam.id}
              label={cam.label}
              badge={cam.badge}
              accent={cam.accent}
              streamUrl={cam.streamUrl}
              onExpand={setModal}
            />
          ))}
        </div>

        {/* Image feed */}
        <ImageFeed onExpand={setModal} />
      </main>

      <Modal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default SentinelMonitor;