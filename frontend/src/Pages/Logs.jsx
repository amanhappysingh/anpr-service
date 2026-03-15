import { getVehicleLogs } from '@/api/vehicle.api';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Urls from '@/config/urls';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Eye, ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, ImageOff, VideoOff } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

const LIMIT_OPTIONS = [10, 20, 40, 50];

const COLS = [
    { key: 'event_id',             label: 'Event ID',  sortable: true,  w: '22%' },
    { key: 'plate_number',         label: 'Plate',     sortable: true,  w: '13%' },
    { key: 'driver_name',          label: 'Driver',    sortable: true,  w: '15%' },
    { key: 'direction',            label: 'Direction', sortable: true,  w: '11%' },
    { key: 'authorization_status', label: 'Status',    sortable: true,  w: '13%' },
    { key: 'created_at',           label: 'Time',      sortable: true,  w: '18%' },
    { key: 'actions',              label: 'Actions',   sortable: false, w: '8%'  },
];

function StatCard({ label, value, color }) {
    return (
        <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg px-3 py-2.5 min-w-[64px] text-center">
            <div className={`text-lg font-medium ${color || 'text-gray-900 dark:text-white'}`}>{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
        </div>
    );
}

function DirectionBadge({ direction }) {
    if (direction === 'IN') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                IN
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            OUT
        </span>
    );
}

function StatusBadge({ status }) {
    if (status === 'Authorized') {
        return (
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Authorized
            </span>
        );
    }
    return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Unauthorized
        </span>
    );
}

function SortIcon({ field, sortKey, sortDir }) {
    if (sortKey !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 1
        ? <ArrowUp className="h-3 w-3 text-blue-500" />
        : <ArrowDown className="h-3 w-3 text-blue-500" />;
}

function fmtTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

// ── Placeholder for missing image ─────────────────────────────────────────────
function ImagePlaceholder({ label }) {
    return (
        <div className="w-full h-36 rounded-lg border-2 border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 flex flex-col items-center justify-center gap-1.5">
            <ImageOff className="h-6 w-6 text-gray-300 dark:text-neutral-600" />
            <span className="text-[11px] text-gray-400 dark:text-neutral-500">{label} not available</span>
        </div>
    );
}

// ── Placeholder for missing video ─────────────────────────────────────────────
function VideoPlaceholder() {
    return (
        <div className="w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 flex flex-col items-center justify-center gap-1.5 py-8">
            <VideoOff className="h-7 w-7 text-gray-300 dark:text-neutral-600" />
            <span className="text-[11px] text-gray-400 dark:text-neutral-500">Recording not available</span>
        </div>
    );
}

export default function Logs() {
    const [search, setSearch]             = useState('');
    const [dirFilter, setDirFilter]       = useState('all');
    const [page, setPage]                 = useState(1);
    const [limit, setLimit]               = useState(20);
    const [sortKey, setSortKey]           = useState('created_at');
    const [sortDir, setSortDir]           = useState(-1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen]   = useState(false);

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['vehicle-logs', page, limit],
        queryFn: () => getVehicleLogs({ page, limit }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    const logs       = data?.data        || [];
    const totalCount = data?.totalRecords || 0;
    const totalPages = data?.totalPages   || 1;

    const filtered = useMemo(() => {
        let rows = [...logs];
        if (dirFilter !== 'all') rows = rows.filter(r => r.direction === dirFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(r =>
                (r.event_id     || '').toLowerCase().includes(q) ||
                (r.plate_number || '').toLowerCase().includes(q) ||
                (r.driver_name  || '').toLowerCase().includes(q)
            );
        }
        rows.sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            return av < bv ? -sortDir : av > bv ? sortDir : 0;
        });
        return rows.slice(0, limit);
    }, [logs, search, dirFilter, sortKey, sortDir, limit]);

    function handleSort(key) {
        if (sortKey === key) setSortDir(d => d * -1);
        else { setSortKey(key); setSortDir(-1); }
    }

    function handleLimitChange(e) {
        setLimit(Number(e.target.value));
        setPage(1);
    }

    function handleView(item) {
        setSelectedItem(item);
        setIsModalOpen(true);
    }

    const inCount     = logs.filter(r => r.direction === 'IN').length;
    const outCount    = logs.filter(r => r.direction === 'OUT').length;
    const unauthCount = logs.filter(r => r.authorization_status === 'Unauthorized').length;

    return (
        <>
            <div className="flex flex-col h-screen bg-white dark:bg-neutral-900 overflow-hidden">
                <Outlet />

                {/* ── Header ── */}
                <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 pt-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">Vehicle Logs</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Detection events from all cameras</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <StatCard label="Total"  value={totalCount || logs.length} />
                        <StatCard label="IN"     value={inCount}    color="text-green-600 dark:text-green-400" />
                        <StatCard label="OUT"    value={outCount}   color="text-orange-600 dark:text-orange-400" />
                        <StatCard label="Unauth" value={unauthCount} color="text-red-600 dark:text-red-400" />
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-4 md:px-6 py-2.5 border-b border-gray-100 dark:border-neutral-800">
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            placeholder="Search event ID, plate, driver..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 h-8 text-sm"
                        />
                    </div>

                    <div className="flex gap-1">
                        {[['all', 'All'], ['IN', 'IN'], ['OUT', 'OUT']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => { setDirFilter(val); setPage(1); }}
                                className={`h-8 px-3 rounded-lg text-xs border transition-all ${
                                    dirFilter === val
                                        ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white font-medium'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700 dark:hover:bg-neutral-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-gray-400 whitespace-nowrap">Rows</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="h-8 px-2 pr-7 rounded-lg text-xs border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-600 appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                        >
                            {LIMIT_OPTIONS.map(n => (
                                <option key={n} value={n}>{n} / page</option>
                            ))}
                        </select>
                    </div>

                    {isFetching && !isLoading && (
                        <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
                    )}
                </div>

                {/* ── Table wrapper ── */}
                <div className="flex-1 overflow-hidden flex flex-col mx-4 md:mx-6 my-3 border border-gray-200 dark:border-neutral-700 rounded-xl">
                    <div className="flex-1 overflow-y-auto overflow-x-auto">
                        <table className="w-full text-sm table-fixed">
                            <colgroup>
                                {COLS.map(col => <col key={col.key} style={{ width: col.w }} />)}
                            </colgroup>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                                    {COLS.map(col => (
                                        <th
                                            key={col.key}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            className={`text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                                                col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {col.label}
                                                {col.sortable && <SortIcon field={col.key} sortKey={sortKey} sortDir={sortDir} />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {COLS.map((col, j) => (
                                                <td key={col.key} className="px-4 py-3.5">
                                                    <div className={`h-4 bg-gray-100 dark:bg-neutral-800 rounded ${j >= 5 ? 'w-1/2' : 'w-2/3'}`} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError ? (
                                    <tr>
                                        <td colSpan={COLS.length} className="px-4 py-16 text-center text-red-500 text-sm">
                                            Error loading logs: {error.message}
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLS.length} className="px-4 py-16 text-center text-gray-400 text-sm">
                                            No events found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(row => (
                                        <tr key={row.event_id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate block">{row.event_id}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    const plate = row.plate_number || row.event_id?.split('_')[0];
                                                    return plate
                                                        ? <span className="font-mono font-semibold text-gray-900 dark:text-white">{plate}</span>
                                                        : <span className="text-gray-300 dark:text-gray-600">—</span>;
                                                })()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                                                    {row.driver_name || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3"><DirectionBadge direction={row.direction} /></td>
                                            <td className="px-4 py-3"><StatusBadge status={row.authorization_status} /></td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtTime(row.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                    onClick={() => handleView(row)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {!isLoading && !isError && (
                        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-xl">
                            <span className="text-xs text-gray-400">
                                Page <span className="font-medium text-gray-600 dark:text-gray-300">{page}</span>
                                {' '}of <span className="font-medium text-gray-600 dark:text-gray-300">{totalPages}</span>
                                {totalCount > 0 && <span className="ml-1.5">· {totalCount} records</span>}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>
                                    <ChevronLeft className="h-3 w-3 mr-0.5" /> Prev
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                        acc.push(p); return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === '...'
                                            ? <span key={`e${i}`} className="px-1 text-xs text-gray-300 dark:text-gray-600">…</span>
                                            : <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'}
                                                className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)} disabled={isFetching}>{p}</Button>
                                    )}
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isFetching}>
                                    Next <ChevronRight className="h-3 w-3 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
                title="Event Detail"
                size="lg"
                showCloseButton={true}
                closeOnBackdrop={true}
                closeOnEscape={true}
            >
                {selectedItem && (
                    <div className="overflow-y-auto max-h-[75vh] flex flex-col gap-5 p-1 pr-2">

                        {/* ── Video — always shown, placeholder if null ── */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Recording</p>
                            {selectedItem.video_url ? (
                                <video
                                    
                                    controls
                                    className="w-full rounded-xl border border-gray-100 dark:border-neutral-700 bg-black"
                                    style={{ maxHeight: '280px' }}
                                >
                                     <source src={Urls.baseURL + selectedItem.video_url.replace("/app","")} type="video/mp4"></source>
                                </video>
                            ) : (
                                <VideoPlaceholder />
                            )}
                        </div>

                        {/* ── Images — always shown, placeholder if null ── */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Captures</p>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Vehicle image */}
                                <div>
                                    <p className="text-xs text-gray-400 mb-1.5">Vehicle</p>
                                    {selectedItem.image_url
                                        ? <img src={Urls.baseURL + selectedItem.image_url.replace("/app","")} alt="Vehicle"
                                            className="w-full h-36 object-cover rounded-lg border border-gray-100 dark:border-neutral-700" />
                                        : <ImagePlaceholder label="Vehicle image" />
                                    }
                                </div>
                                {/* Plate image */}
                                <div>
                                    <p className="text-xs text-gray-400 mb-1.5">Number Plate</p>
                                    {selectedItem.plate_image_url
                                        ? <img src={Urls.baseURL + selectedItem.plate_image_url.replace("/app","")} alt="Plate"
                                            className="w-full h-36 object-cover rounded-lg border border-gray-100 dark:border-neutral-700" />
                                        : <ImagePlaceholder label="Plate image" />
                                    }
                                </div>
                            </div>
                        </div>

                        {/* ── Details ── */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Details</p>
                            <div className="divide-y divide-gray-100 dark:divide-neutral-800 text-sm rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                                {[
                                    { label: 'Event ID',     value: selectedItem.event_id },
                                    { label: 'Plate',        value: selectedItem.plate_number || selectedItem.event_id?.split('_')[0] || '—' },
                                    { label: 'Driver',       value: selectedItem.driver_name || '—' },
                                    { label: 'Direction',    value: selectedItem.direction },
                                    { label: 'Status',       value: selectedItem.authorization_status },
                                    { label: 'Vehicle Type', value: selectedItem.vehicle_type || '—' },
                                    { label: 'Time',         value: fmtTime(selectedItem.created_at) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center px-4 py-3 bg-white dark:bg-neutral-900">
                                        <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">{label}</span>
                                        <span className="text-gray-900 dark:text-white font-medium text-right max-w-[60%] truncate text-sm">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </Modal>
        </>
    );
}