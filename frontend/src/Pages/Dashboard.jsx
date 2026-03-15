import { useState, useEffect, useRef } from "react";
import http from "@/lib/http";
import Urls from "@/config/urls";

// Day order for SQL TO_CHAR 'Dy' output (Mon/Tue/Wed...)
const DAY_ORDER = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];



// ─── Helpers ──────────────────────────────────────────────────────────────────
function ts() {
  const n = new Date(), h = n.getHours();
  const m  = String(n.getMinutes()).padStart(2,'0');
  const sc = String(n.getSeconds()).padStart(2,'0');
  return `${String(h % 12 || 12).padStart(2,'0')}:${m}:${sc} ${h >= 12 ? 'PM' : 'AM'}`;
}

function normalizeDet(d) {
  return {
    ...d,
    plate: d.plate ?? (d.id ? d.id.split('_')[0] : '—'),
    vtype: d.vtype ?? 'Unknown',
  };
}

function normalizeStats(data) {
  const c = data?.counters ?? {};
  return {
    totalVehicles:      parseInt(c.tot)    || 0,
    totalPlates:        (parseInt(c.tot)   || 0),
    inCount:            parseInt(c.inC)    || 0,
    outCount:           parseInt(c.outC)   || 0,
    inCar:              parseInt(c.inCar)  || 0,
    inTruck:            parseInt(c.inTrk)  || 0,
    outCar:             parseInt(c.outCar) || 0,
    outTruck:           parseInt(c.outTrk) || 0,
    authorised:         parseInt(c.auth)   || 0,
    unauthorised:       parseInt(c.unauth) || 0,
    registeredVehicles: parseInt(c.reg)    || 0,
    accuracy:           c.acc ?? null,
    carCount:           (parseInt(c.inCar)  || 0) + (parseInt(c.outCar) || 0),
    truckCount:         (parseInt(c.inTrk)  || 0) + (parseInt(c.outTrk) || 0),
    camerasOnline:      2,
    camerasTotal:       2,
  };
}

// ─── SVG Line Graph ───────────────────────────────────────────────────────────
function LineGraph({ data }) {
  const W = 560, H = 110, padL = 28, padR = 16, padT = 10, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = Math.max(...data.map(d => d.c), ...data.map(d => d.t), 1);
  const minVal = 0;

  const xStep = innerW / (data.length - 1);

  // Convert value to Y coordinate
  const yOf = v => padT + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;
  const xOf = i => padL + i * xStep;

  // Build polyline points
  const carPts  = data.map((d, i) => `${xOf(i)},${yOf(d.c)}`).join(' ');
  const truckPts = data.map((d, i) => `${xOf(i)},${yOf(d.t)}`).join(' ');

  // Build fill path (area under line)
  const carArea = `M ${xOf(0)},${yOf(data[0].c)} ` +
    data.map((d, i) => `L ${xOf(i)},${yOf(d.c)}`).join(' ') +
    ` L ${xOf(data.length-1)},${padT+innerH} L ${xOf(0)},${padT+innerH} Z`;
  const truckArea = `M ${xOf(0)},${yOf(data[0].t)} ` +
    data.map((d, i) => `L ${xOf(i)},${yOf(d.t)}`).join(' ') +
    ` L ${xOf(data.length-1)},${padT+innerH} L ${xOf(0)},${padT+innerH} Z`;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="truckGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map(tick => (
        <g key={tick}>
          <line
            x1={padL} y1={yOf(tick)} x2={W - padR} y2={yOf(tick)}
            stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"
            className="text-gray-500"
          />
          <text
            x={padL - 4} y={yOf(tick) + 3.5}
            textAnchor="end" fontSize="7"
            className="fill-gray-400 dark:fill-gray-500"
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Area fills */}
      <path d={truckArea} fill="url(#truckGrad)" />
      <path d={carArea}   fill="url(#carGrad)" />

      {/* Lines */}
      <polyline
        points={truckPts}
        fill="none" stroke="#f59e0b" strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round"
        className="dark:stroke-amber-400"
      />
      <polyline
        points={carPts}
        fill="none" stroke="#3b82f6" strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round"
        className="dark:stroke-blue-400"
      />

      {/* Dots on car line */}
      {data.map((d, i) => (
        <circle key={`c${i}`} cx={xOf(i)} cy={yOf(d.c)} r="2.8"
          fill="#3b82f6" className="dark:fill-blue-400" />
      ))}

      {/* Dots on truck line */}
      {data.map((d, i) => (
        <circle key={`t${i}`} cx={xOf(i)} cy={yOf(d.t)} r="2.8"
          fill="#f59e0b" className="dark:fill-amber-400" />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={d.d} x={xOf(i)} y={H - 4}
          textAnchor="middle" fontSize="8"
          className="fill-gray-400 dark:fill-gray-500"
        >
          {d.d}
        </text>
      ))}
    </svg>
  );
}

// ─── Reusable pieces ──────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">
    {children}
  </p>
);

const Pill = ({ children, variant }) => {
  const map = {
    car:    'bg-blue-50   dark:bg-blue-950/40   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800/50',
    truck:  'bg-amber-50  dark:bg-amber-950/40  text-amber-700  dark:text-amber-400  border-amber-200  dark:border-amber-800/50',
    unknown:'bg-gray-50   dark:bg-gray-700       text-gray-600   dark:text-gray-400   border-gray-200   dark:border-gray-600',
    in:     'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    out:    'bg-red-50    dark:bg-red-950/40    text-red-700    dark:text-red-400    border-red-200    dark:border-red-800/50',
    auth:   'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    unauth: 'bg-red-50    dark:bg-red-950/40    text-red-700    dark:text-red-400    border-red-200    dark:border-red-800/50',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${map[variant] ?? map.unknown}`}>
      {children}
    </span>
  );
};

const StatCard = ({ topColor, iconBg, icon, label, value, sub, chg }) => (
  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-300">
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${topColor}`} />
    <div className="flex items-center justify-between mb-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${iconBg}`}>{icon}</div>
      {chg && (
        <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
          {chg}
        </span>
      )}
    </div>
    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
    <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 my-0.5">{value ?? '—'}</p>
    <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
  </div>
);

const IOCard = ({ isIn, num, car, trk, pct }) => (
  <div className={`rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-300 ${isIn ? 'border-l-[3px] border-l-emerald-500' : 'border-l-[3px] border-l-red-500'}`}>
    <div className="flex items-center justify-between mb-2.5">
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${isIn ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
          {isIn ? '↑' : '↓'}
        </span>
        {isIn ? 'Vehicles IN' : 'Vehicles OUT'}
      </div>
      <span className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded ${isIn ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
        {pct}% share
      </span>
    </div>
    <p className={`text-4xl font-bold tracking-tighter mb-2.5 ${isIn ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {num ?? '—'}
    </p>
    <div className="flex gap-1.5 mb-2.5">
      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">Car {car ?? 0}</span>
      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">Truck {trk ?? 0}</span>
    </div>
    <div className="h-[3px] bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
      <div
        className={`h-full rounded-full transition-all duration-700 ${isIn ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-amber-400'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
    <div className="flex justify-between text-[10px] font-mono text-gray-400 dark:text-gray-500">
      <span>of total daily traffic</span>
      <span>{ts()}</span>
    </div>
  </div>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function VehicleDashboard() {
  const [clock,    setClock]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [stats,    setStats]    = useState(null);
  const [dets,     setDets]     = useState([]);
  const [newId,    setNewId]    = useState(null);
  const [wsStatus, setWsStatus] = useState('Connecting...');
  const [wsCount,  setWsCount]  = useState(0);
  const [search,   setSearch]   = useState('');
  const [fdir,     setFdir]     = useState('');
  const [fstat,    setFstat]    = useState('');
  const [weeklyData, setWeeklyData] = useState([]);
  const wsCountRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() =>
      setClock(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    , 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: res } = await http.get(`${Urls.baseURL}/api/dashboard`);
        const payload = res?.data ?? res;
        setStats(normalizeStats(payload));

        // ✅ Normalize weekly data from API
        // SQL returns: [{ d: 'Mon', c: '5', t: '2' }, ...]
        // Sort by DAY_ORDER so graph is always Mon→Sun
        if (payload.weekly && Array.isArray(payload.weekly)) {
          // Map API rows by day key
          const byDay = {};
          payload.weekly.forEach(row => {
            byDay[row.d] = { c: parseInt(row.c) || 0, t: parseInt(row.t) || 0 };
          });
          // Always show all 7 days Mon→Sun, missing days = 0
          const normalized = DAY_ORDER.map(day => ({
            d: day,
            c: byDay[day]?.c ?? 0,
            t: byDay[day]?.t ?? 0,
          }));
          setWeeklyData(normalized);
        }

        if (payload.detections && Array.isArray(payload.detections)) {
          setDets(payload.detections.map(normalizeDet));
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const wsUrl = Urls.baseURL.replace(/^http/, 'ws') + '/ws/images';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus('Connected · 0 events');
    };

    ws.onmessage = ({ data }) => {
      try {
        const raw = JSON.parse(data);
        const det = normalizeDet(raw);
        setDets(prev => [det, ...prev].slice(0, 200));
        setNewId(det.id);
        setStats(prev => {
          if (!prev) return prev;
          const n = { ...prev };
          n.totalVehicles = (n.totalVehicles || 0) + 1;
          n.totalPlates   = (n.totalPlates   || 0) + 1;
          if (det.dir === 'IN') {
            n.inCount = (n.inCount || 0) + 1;
            if (det.vtype === 'Car') n.inCar   = (n.inCar   || 0) + 1;
            else                     n.inTruck  = (n.inTruck  || 0) + 1;
          } else {
            n.outCount = (n.outCount || 0) + 1;
            if (det.vtype === 'Car') n.outCar   = (n.outCar   || 0) + 1;
            else                     n.outTruck  = (n.outTruck  || 0) + 1;
          }
          if (det.vtype === 'Car') n.carCount   = (n.carCount   || 0) + 1;
          else                     n.truckCount  = (n.truckCount  || 0) + 1;
          det.status === 'Authorised' ? n.authorised++ : n.unauthorised++;
          return n;
        });
        wsCountRef.current++;
        const now = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
        setWsStatus(`${wsCountRef.current} events · ${now}`);
        setWsCount(wsCountRef.current);
      } catch (err) {
        console.error('Parse error:', err);
      }
    };

    ws.onerror = () => setWsStatus('Connection error');
    ws.onclose = () => setWsStatus('Disconnected');
    return () => ws.close();
  }, []);

  const filtered = dets
    .filter(d =>
      (!search || d.plate?.toLowerCase().includes(search.toLowerCase())) &&
      (!fdir   || d.dir    === fdir)  &&
      (!fstat  || d.status === fstat)
    )
    .slice(0, 10);

  const inCount  = stats?.inCount  || 0;
  const outCount = stats?.outCount || 0;
  const totTraff = inCount + outCount || 1;
  const ip       = Math.round(inCount  / totTraff * 100);
  const op       = 100 - ip;
  const distCar  = stats?.carCount   || 0;
  const distTrk  = stats?.truckCount || 0;
  const dtot     = distCar + distTrk || 1;

  const ctrlCls = [
    'bg-gray-50 dark:bg-gray-700',
    'border border-gray-200 dark:border-gray-600',
    'rounded-md px-2.5 py-1.5',
    'text-[10px] font-mono',
    'text-gray-700 dark:text-gray-300',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'outline-none focus:border-blue-400 dark:focus:border-blue-500',
    'transition-colors',
  ].join(' ');

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/40 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Failed to load dashboard</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4 font-mono">{error}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">

        {/* ── TOPBAR ── */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🚦</div>
            <div>
              <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">ANPR Command Center</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Automatic Number Plate Recognition · Real-time Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
           
              
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium border ${
              wsStatus.startsWith('Connected') || wsStatus.includes('events')
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400'
                : wsStatus === 'Disconnected' || wsStatus === 'Connection error'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                wsStatus.startsWith('Connected') || wsStatus.includes('events') ? 'bg-blue-500 animate-pulse'
                : wsStatus === 'Disconnected' || wsStatus === 'Connection error' ? 'bg-red-500'
                : 'bg-gray-400'
              }`} />
              {wsStatus.startsWith('Connected') || wsStatus.includes('events') ? 'WS LIVE'
                : wsStatus.startsWith('Connecting') ? 'WS ...' : 'WS OFF'}
            </span>
            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 rounded-md">
              {clock}
            </span>
          </div>
        </header>

        {/* ── STATS ── */}
        <div>
          <SectionLabel>Overview · Today</SectionLabel>
          <div className="grid grid-cols-4 gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))
            ) : (
              <>
                <StatCard topColor="bg-gradient-to-r from-blue-500 to-violet-500"   iconBg="bg-blue-50 dark:bg-blue-950/40"     icon="🚗" label="Total Vehicles"       value={stats?.totalVehicles}      sub="Detected today"      chg={null} />
                <StatCard topColor="bg-gradient-to-r from-teal-400 to-blue-500"     iconBg="bg-teal-50 dark:bg-teal-950/40"     icon="🪪" label="Total Plates"         value={stats?.totalPlates}        sub="IN + OUT combined"   chg={null} />
                <StatCard topColor="bg-gradient-to-r from-violet-500 to-blue-500"   iconBg="bg-violet-50 dark:bg-violet-950/40" icon="📷" label="Cameras Online"       value="2 / 2"                     sub="All systems nominal"  chg={null} />
                <StatCard topColor="bg-gradient-to-r from-emerald-500 to-teal-400"  iconBg="bg-emerald-50 dark:bg-emerald-950/40" icon="📋" label="Registered Vehicles" value={stats?.registeredVehicles} sub="In system database"  chg={null} />
              </>
            )}
          </div>
        </div>

        {/* ── IN / OUT + AUTH ── */}
        <div>
          <SectionLabel>Traffic Flow</SectionLabel>
          <div className="grid grid-cols-[1fr_1fr_210px] gap-3">
            {loading ? (
              <>
                {[0,1].map(i => (
                  <div key={i} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-3">
                    <Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-40" /><Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
                <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-3">
                  <Skeleton className="h-3 w-32" /><Skeleton className="h-8 w-16" />
                  <Skeleton className="h-px w-full" /><Skeleton className="h-8 w-16" />
                </div>
              </>
            ) : (
              <>
                <IOCard isIn num={inCount}  car={stats?.inCar   || 0} trk={stats?.inTruck  || 0} pct={ip} />
                <IOCard      num={outCount} car={stats?.outCar  || 0} trk={stats?.outTruck || 0} pct={op} />
                <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col gap-2.5 transition-all duration-300">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Authorization Status</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">AUTHORISED</p>
                      <p className="text-2xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400">{stats?.authorised ?? '—'}</p>
                    </div>
                    <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">CLEARED</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-0.5">UNAUTHORISED</p>
                      <p className="text-2xl font-bold tracking-tight text-red-500 dark:text-red-400">{stats?.unauthorised ?? '—'}</p>
                    </div>
                    <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40">FLAGGED</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">Registered in DB</span>
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{stats?.registeredVehicles ?? '—'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div>
          <SectionLabel>Analytics</SectionLabel>
          <div className="grid grid-cols-[1fr_220px] gap-3">

            {/* ✅ Line Graph */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Weekly Traffic Trend</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">Last 7 days · Car & Truck</p>
              </div>
              <LineGraph data={weeklyData.length > 0 ? weeklyData : DAY_ORDER.map(d => ({ d, c: 0, t: 0 }))} />
              <div className="flex gap-4 mt-2">
                {[
                  { col: 'bg-blue-500',  lbl: 'Car'   },
                  { col: 'bg-amber-400', lbl: 'Truck' },
                ].map(({ col, lbl }) => (
                  <div key={lbl} className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                    <div className={`w-6 h-[2px] rounded-full ${col}`} />
                    {lbl}
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution donut */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-300">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Distribution</p>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="38" fill="none" className="stroke-gray-100 dark:stroke-gray-700" strokeWidth="12" />
                      <circle cx="48" cy="48" r="38" fill="none" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="12"
                        strokeDasharray={`${Math.round(distCar/dtot*239)} ${239-Math.round(distCar/dtot*239)}`}
                        strokeDashoffset="0" transform="rotate(-90 48 48)" />
                      <circle cx="48" cy="48" r="38" fill="none" className="stroke-amber-400 dark:stroke-amber-500" strokeWidth="12"
                        strokeDasharray={`${239-Math.round(distCar/dtot*239)} ${Math.round(distCar/dtot*239)}`}
                        strokeDashoffset={`-${Math.round(distCar/dtot*239)}`} transform="rotate(-90 48 48)" />
                      <circle cx="48" cy="48" r="30" className="fill-white dark:fill-gray-800" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">{distCar + distTrk}</span>
                      <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">TOTAL</span>
                    </div>
                  </div>
                  {[
                    { lbl:'Car',   col:'bg-blue-500 dark:bg-blue-400',   pct:Math.round(distCar/dtot*100), cnt:distCar  },
                    { lbl:'Truck', col:'bg-amber-400 dark:bg-amber-500', pct:Math.round(distTrk/dtot*100), cnt:distTrk  },
                  ].map(item => (
                    <div key={item.lbl} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-sm ${item.col}`} />
                        <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">{item.lbl}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">{item.pct}%</span>
                        <span className="text-[12px] font-semibold font-mono text-gray-900 dark:text-gray-100">{item.cnt}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── LIVE DETECTION TABLE ── */}
        <div>
          <SectionLabel>Live Detection Feed · Latest 10</SectionLabel>
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Detections</span>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">
                  {filtered.length} records
                </span>
              </div>
              <div className="flex gap-1.5 items-center">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate..." className={`${ctrlCls} w-36`} />
                <select value={fdir}  onChange={e => setFdir(e.target.value)}  className={ctrlCls}>
                  <option value="">IN + OUT</option>
                  <option value="IN">IN only</option>
                  <option value="OUT">OUT only</option>
                </select>
                <select value={fstat} onChange={e => setFstat(e.target.value)} className={ctrlCls}>
                  <option value="">All Status</option>
                  <option value="Authorised">Authorised</option>
                  <option value="Unauthorised">Unauthorised</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/60">
                    {['Plate Number','Type','Direction','Status','Time'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap border-b border-gray-100 dark:border-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length ? filtered.map((d, i) => (
                    <tr key={d.id}
                      className={`border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-150 ${i === 0 && d.id === newId ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[12px] font-medium text-gray-900 dark:text-gray-100 tracking-wide">{d.plate}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {d.vtype === 'Car' ? <Pill variant="car">🚗 Car</Pill>
                          : d.vtype === 'Truck' ? <Pill variant="truck">🚛 Truck</Pill>
                          : <Pill variant="unknown">❓ {d.vtype}</Pill>}
                      </td>
                      <td className="px-4 py-2.5">
                        {d.dir === 'IN' ? <Pill variant="in">↑ IN</Pill> : <Pill variant="out">↓ OUT</Pill>}
                      </td>
                      <td className="px-4 py-2.5">
                        {d.status === 'Authorised' ? <Pill variant="auth">✓ Authorised</Pill> : <Pill variant="unauth">✕ Unauthorised</Pill>}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-gray-400 dark:text-gray-500">{d.time}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">📡</span>
                          <span className="text-sm font-medium">Waiting for live detections...</span>
                          <span className="text-[11px] font-mono">{wsStatus}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border-t border-gray-100 dark:border-gray-700">
              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                Showing {filtered.length} of {dets.length} total · Latest 10 only
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 dark:text-gray-500">
                <span className={`w-1.5 h-1.5 rounded-full ${wsStatus.startsWith('Connected') || wsStatus.includes('events') ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <span>WebSocket</span>
                <span className="text-blue-600 dark:text-blue-400">{wsStatus}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}