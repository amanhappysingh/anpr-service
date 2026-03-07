import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Cell, PieChart, Pie
} from 'recharts';
import { 
  Car, Calendar, Hash, TrendingUp, Activity, Database,
  Download, RefreshCw, Settings, Filter, Search, Clock,
  ArrowUpRight, ArrowDownRight, CheckCircle2, ShieldCheck, ShieldX, BookCheck
} from 'lucide-react';

// --- Mock API Function ---
const fetchVehicleData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    todayData: {
      totalVehicles: 234,
      totalPlates: 468,
      totalDetected: 234,
      accuracy: 98.5,
      authorised: 198,
      unauthorised: 36,
      registered: 210,
      change: {
        vehicles: 12.5,
        plates: 8.3,
        detected: 12.5,
        authorised: 5.2,
        unauthorised: -3.1,
        registered: 7.4,
      }
    },
    
    last7DaysData: [
      { day: 'Mon', car: 185, bus: 38, truck: 52 },
      { day: 'Tue', car: 198, bus: 42, truck: 48 },
      { day: 'Wed', car: 175, bus: 35, truck: 45 },
      { day: 'Thu', car: 210, bus: 45, truck: 55 },
      { day: 'Fri', car: 225, bus: 48, truck: 58 },
      { day: 'Sat', car: 165, bus: 28, truck: 35 },
      { day: 'Sun', car: 145, bus: 22, truck: 28 },
    ],
    
    vehicleClassification: [
      { type: 'Car', count: 1303, color: '#6366f1', percentage: 60.8 },
      { type: 'Bus', count: 258, color: '#10b981', percentage: 20.2 },
      { type: 'Truck', count: 321, color: '#f59e0b', percentage: 19.0 },
    ],
    
    recentDetections: [
      { id: 1, plateNumber: 'DL-01-AB-1234', vehicleType: 'Car', direction: 'IN', time: '09:45 AM', confidence: 99.2, camera: 'CAM-01', status: 'Authorised' },
      { id: 2, plateNumber: 'DL-02-CD-5678', vehicleType: 'Bus', direction: 'OUT', time: '09:42 AM', confidence: 98.8, camera: 'CAM-02', status: 'Authorised' },
      { id: 3, plateNumber: 'DL-03-EF-9012', vehicleType: 'Truck', direction: 'IN', time: '09:40 AM', confidence: 97.5, camera: 'CAM-01', status: 'Unauthorised' },
      { id: 4, plateNumber: 'DL-05-IJ-7890', vehicleType: 'Car', direction: 'OUT', time: '09:35 AM', confidence: 99.5, camera: 'CAM-02', status: 'Authorised' },
      { id: 5, plateNumber: 'DL-06-KL-2345', vehicleType: 'Car', direction: 'IN', time: '09:32 AM', confidence: 98.1, camera: 'CAM-01', status: 'Authorised' },
      { id: 6, plateNumber: 'DL-07-MN-6789', vehicleType: 'Truck', direction: 'OUT', time: '09:30 AM', confidence: 97.8, camera: 'CAM-03', status: 'Unauthorised' },
      { id: 7, plateNumber: 'DL-09-QR-4567', vehicleType: 'Bus', direction: 'IN', time: '09:25 AM', confidence: 98.6, camera: 'CAM-01', status: 'Authorised' },
      { id: 8, plateNumber: 'DL-10-ST-8901', vehicleType: 'Car', direction: 'OUT', time: '09:22 AM', confidence: 99.1, camera: 'CAM-03', status: 'Authorised' },
      { id: 9, plateNumber: 'DL-11-UV-2345', vehicleType: 'Truck', direction: 'IN', time: '09:18 AM', confidence: 96.4, camera: 'CAM-02', status: 'Unauthorised' },
      { id: 10, plateNumber: 'DL-12-WX-6789', vehicleType: 'Bus', direction: 'OUT', time: '09:15 AM', confidence: 98.0, camera: 'CAM-01', status: 'Authorised' },
    ],

    systemStatus: {
      cameras: { active: 3, total: 3 },
      uptime: '99.8%',
      lastUpdate: 'Just now'
    }
  };
};

// --- Stat Card Component ---
const StatCard = ({ title, value, change, icon: Icon, subtitle, accentColor = 'indigo' }) => {
  const isPositive = change >= 0;

  const colorMap = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-600 dark:text-sky-400' },
  };
  const accent = colorMap[accentColor] || colorMap.indigo;

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 ${accent.bg} rounded-xl`}>
          <Icon size={20} className={accent.text} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
            isPositive 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['vehicleData'],
    queryFn: fetchVehicleData,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const filteredDetections = data?.recentDetections.filter(detection => {
    const matchesSearch = detection.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || detection.vehicleType === filterType;
    return matchesSearch && matchesFilter;
  }) || [];

  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Unable to Load Data</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">There was an error connecting to the system. Please try again.</p>
          <button onClick={() => refetch()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'dark' : ''} transition-colors duration-300`}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-neutral-900/80">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                  <Car size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Vehicle Detection System</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Real-time Plate Recognition · Heavy Vehicles Only</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {data && (
                  <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">System Active</span>
                  </div>
                )}
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  title="Toggle Theme"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                <p className="text-neutral-500 dark:text-neutral-400 font-semibold">Loading dashboard...</p>
              </div>
            </div>
          )}

          {!isLoading && data && (
            <>
              {/* Row 1: Core Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Total Vehicles"
                  value={data.todayData.totalVehicles}
                  change={data.todayData.change.vehicles}
                  icon={Car}
                  subtitle="Detected today"
                  accentColor="indigo"
                />
                <StatCard
                  title="Total Plates"
                  value={data.todayData.totalPlates}
                  change={data.todayData.change.plates}
                  icon={Hash}
                  subtitle="IN + OUT combined"
                  accentColor="violet"
                />
                <StatCard
                  title="Unique Detections"
                  value={data.todayData.totalDetected}
                  change={data.todayData.change.detected}
                  icon={Database}
                  subtitle="Individual vehicles"
                  accentColor="sky"
                />
                <StatCard
                  title="Accuracy Rate"
                  value={`${data.todayData.accuracy}%`}
                  icon={Activity}
                  subtitle="Detection confidence"
                  accentColor="amber"
                />
              </div>

              {/* Row 2: Auth / Registered Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Authorised Vehicles"
                  value={data.todayData.authorised}
                  change={data.todayData.change.authorised}
                  icon={ShieldCheck}
                  subtitle="Cleared for entry"
                  accentColor="emerald"
                />
                <StatCard
                  title="Unauthorised Vehicles"
                  value={data.todayData.unauthorised}
                  change={data.todayData.change.unauthorised}
                  icon={ShieldX}
                  subtitle="Flagged / denied"
                  accentColor="rose"
                />
                <StatCard
                  title="Registered Vehicles"
                  value={data.todayData.registered}
                  change={data.todayData.change.registered}
                  icon={BookCheck}
                  subtitle="In system database"
                  accentColor="sky"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Weekly Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <TrendingUp size={20} className="text-indigo-500" />
                      Weekly Trend Analysis
                    </h3>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Last 7 Days</span>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.last7DaysData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#262626" : "#f5f5f5"} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 11}} />
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#171717' : '#fff', borderColor: isDark ? '#262626' : '#e5e7eb', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }} labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" formatter={(value) => <span style={{ fontSize: '13px', fontWeight: 600 }}>{value}</span>} />
                        <Line type="monotone" dataKey="car" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Car" />
                        <Line type="monotone" dataKey="bus" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Bus" />
                        <Line type="monotone" dataKey="truck" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} name="Truck" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Vehicle Distribution */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Car size={20} className="text-indigo-500" />
                      Distribution
                    </h3>
                  </div>
                  <div className="h-48 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.vehicleClassification} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3}>
                          {data.vehicleClassification.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#171717' : '#fff', borderColor: isDark ? '#262626' : '#e5e7eb', borderRadius: '12px', padding: '8px 12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {data.vehicleClassification.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{item.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{item.percentage}%</span>
                          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Detections Table */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Clock size={20} className="text-indigo-500" />
                      Recent Detections
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search plate number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                        />
                      </div>
                      
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option>All</option>
                        <option>Car</option>
                        <option>Bus</option>
                        <option>Truck</option>
                      </select>
                      
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap">
                        <Download size={16} />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-bold tracking-wider">
                        <th className="px-6 py-4 text-left">ID</th>
                        <th className="px-6 py-4 text-left">Plate Number</th>
                        <th className="px-6 py-4 text-left">Type</th>
                        <th className="px-6 py-4 text-left">Direction</th>
                        <th className="px-6 py-4 text-left">Camera</th>
                        <th className="px-6 py-4 text-left">Confidence</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {filteredDetections.length > 0 ? (
                        filteredDetections.map((detection) => (
                          <tr key={detection.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-neutral-500 dark:text-neutral-500">
                              #{detection.id.toString().padStart(4, '0')}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{detection.plateNumber}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                ${detection.vehicleType === 'Car' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' : ''}
                                ${detection.vehicleType === 'Bus' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : ''}
                                ${detection.vehicleType === 'Truck' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' : ''}
                              `}>
                                {detection.vehicleType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold
                                ${detection.direction === 'IN' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'}
                              `}>
                                {detection.direction}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">{detection.camera}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden max-w-[80px]">
                                  <div 
                                    className={`h-full rounded-full ${
                                      detection.confidence >= 98 ? 'bg-emerald-500' :
                                      detection.confidence >= 95 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${detection.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{detection.confidence}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                ${detection.status === 'Authorised' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'}
                              `}>
                                {detection.status === 'Authorised' ? <ShieldCheck size={12} /> : <ShieldX size={12} />}
                                {detection.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">{detection.time}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                            No detections found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/30 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Showing {filteredDetections.length} of {data.recentDetections.length} recent detections
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;