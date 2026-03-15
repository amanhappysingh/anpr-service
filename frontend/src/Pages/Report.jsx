import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Loader2, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, Car, Download, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ZoomIn } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import http from '@/lib/http';
import Urls from '@/config/urls';

// ─── Image Modal ───────────────────────────────────────────────────────────────
const ImageModal = ({ images, initialIndex, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(p => Math.min(p + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setCurrent(p => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div>
            <p className="text-white font-semibold text-sm">{img.label}</p>
            <p className="text-gray-400 text-xs font-mono">{img.plate}</p>
          </div>
          <div className="flex items-center gap-3">
            {images.length > 1 && (
              <span className="text-xs text-gray-400">
                {current + 1} / {images.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative flex items-center justify-center bg-black min-h-64 max-h-[70vh]">
          <img
            src={img.src}
            alt={img.label}
            className="max-h-[70vh] max-w-full object-contain"
          />

          {/* Prev / Next arrows */}
          {current > 0 && (
            <button
              onClick={() => setCurrent(p => p - 1)}
              className="absolute left-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent(p => p + 1)}
              className="absolute right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Thumbnails if multiple */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 border-t border-gray-700 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === current ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.src} alt={img.label} className="h-12 w-20 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Clickable Thumbnail ────────────────────────────────────────────────────────
const Thumbnail = ({ src, alt, onClick }) => {
  if (!src) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <button
      onClick={onClick}
      className="relative group rounded border border-gray-200 dark:border-gray-600 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <img
        src={src}
        alt={alt}
        className="h-12 w-20 object-cover transition-transform group-hover:scale-105"
        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ReportPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal state
  const [modal, setModal] = useState(null); // { images: [], initialIndex: 0 }

  const openModal = (images, initialIndex = 0) => setModal({ images, initialIndex });
  const closeModal = () => setModal(null);

  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['report', fetchKey, page, pageSize],
    queryFn: async () => {
      const response = await http.get('/api/vehicle-report', {
        params: { startDate, endDate, page, limit: pageSize }
      });
      return response.data;
    },
    enabled: shouldFetch,
    retry: 2,
    keepPreviousData: true,
  });

  const handleGetReport = () => {
    setPage(1);
    setShouldFetch(true);
    setFetchKey(prev => prev + 1);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await http.get('/report/download', {
        params: { startDate, endDate },
        responseType: 'blob',
      });
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `vehicle-report-${startDate || 'all'}-to-${endDate || 'all'}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const fixImageUrl = (url) => url ? Urls.baseURL+url.replace(/^\/app/, '') : null;
  const getPlateNumber = (eventId) => eventId?.split('_')[0] || '—';
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const events = reportData?.data || [];
  const total = reportData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const isLimited = total > 100;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return [...new Set(range)];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg"><FileText size={24} /></div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Select date range and get your report</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={handleGetReport} disabled={isLoading}
                className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="animate-spin" size={18} /> Loading...</> : <><FileText size={18} /> Get Report</>}
              </button>
            </div>
            <div className="flex items-end">
              <button onClick={handleDownload} disabled={isDownloading}
                className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isDownloading ? <><Loader2 className="animate-spin" size={18} /> Downloading...</> : <><Download size={18} /> Download</>}
              </button>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setStartDate(''); setEndDate(''); setShouldFetch(false); setPage(1); }}
                className="w-full px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold">
                Clear
              </button>
            </div>
          </div>

          {reportData && !isLoading && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Total Records: <span className="font-bold">{total}</span>
                </p>
              </div>
              {isLimited && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Data is more than 100 records —{' '}
                    <button onClick={handleDownload} className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200 transition-colors">Download</button>
                    {' '}for complete data
                  </p>
                </div>
              )}
            </div>
          )}
          {isError && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">✗ Error: {error?.message || 'Failed to fetch data'}</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Fetching report data...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
              <FileText size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No data to display</p>
              <p className="text-sm mt-2">Select a date range and click Get Report</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{total}</span> records
                </p>
                {isLimited && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                    Download for full data
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Plate Number</th>
                      <th className="px-4 py-3 text-left">Vehicle Type</th>
                      <th className="px-4 py-3 text-left">Direction</th>
                      <th className="px-4 py-3 text-left">Authorized</th>
                      <th className="px-4 py-3 text-left">Vehicle Image</th>
                      <th className="px-4 py-3 text-left">Plate Image</th>
                      <th className="px-4 py-3 text-left">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {events.map((event, index) => {
                      const plate = getPlateNumber(event.event_id);
                      const vehicleImg = fixImageUrl(event.image_url);
                      const plateImg = fixImageUrl(event.plate_image_url);

                      // Build images array for this row's modal
                      const rowImages = [
                        vehicleImg && { src: vehicleImg, label: 'Vehicle Image', plate },
                        plateImg && { src: plateImg, label: 'Plate Image', plate },
                      ].filter(Boolean);

                      return (
                        <tr key={event.event_id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(page - 1) * pageSize + index + 1}</td>

                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {plate}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {event.vehicle_type
                              ? <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300"><Car size={14} /> {event.vehicle_type}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>

                          <td className="px-4 py-3">
                            {event.direction === 'IN' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                <ArrowDownCircle size={12} /> IN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                                <ArrowUpCircle size={12} /> OUT
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {event.is_authorized
                              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400"><CheckCircle size={14} /> Yes</span>
                              : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400"><XCircle size={14} /> No</span>}
                          </td>

                          {/* Vehicle Image */}
                          <td className="px-4 py-3">
                            <Thumbnail
                              src={vehicleImg}
                              alt="Vehicle"
                              onClick={() => openModal(rowImages, 0)}
                            />
                          </td>

                          {/* Plate Image */}
                          <td className="px-4 py-3">
                            <Thumbnail
                              src={plateImg}
                              alt="Plate"
                              onClick={() => openModal(rowImages, rowImages.findIndex(i => i.label === 'Plate Image'))}
                            />
                          </td>

                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(event.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(1)} disabled={page === 1}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronsLeft size={16} />
                    </button>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-gray-400 select-none">…</span>
                      ) : (
                        <button key={p} onClick={() => setPage(p)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                            page === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {modal && (
        <ImageModal
          images={modal.images}
          initialIndex={modal.initialIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ReportPage;