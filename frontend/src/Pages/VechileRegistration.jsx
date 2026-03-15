import {
  deleteVehicle,
  getRegisteredVehicles,
  registerVehicle,
  updatedVehicle,
  uploadVehiclesBulk,
} from "@/api/vehicle.api";
import * as XLSX from "xlsx";
import { useState, useRef, useEffect } from "react";

const VEHICLE_TYPES = ["Car", "Truck"];

const BADGE_CLASSES = {
  Car: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Truck: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
};

function Badge({ type }) {
  const cls =
    BADGE_CLASSES[type] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
      {type}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function VehicleRegister() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vehicleType: "",
    plateNumber: "",
    driverName: "",
    area: "",
    contact: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const fileRef = useRef();

  const filtered = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase()) ||
      v.driverName.toLowerCase().includes(search.toLowerCase()) ||
      v.area.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditData(null);
    setForm({ vehicleType: "", plateNumber: "", driverName: "", area: "", contact: "" });
    setCreateOpen(true);
  };

  const openEdit = (v) => {
    setEditData(v);
    setForm({
      vehicleType: v.vehicleType,
      plateNumber: v.plateNumber,
      driverName: v.driverName,
      area: v.area,
      contact: v.contact,
    });
    setCreateOpen(true);
  };

  const fetchVehicles = async () => {
    try {
      const data = await getRegisteredVehicles();
      const formatted = data.data.map((v) => ({
        _id: v.id,
        name: v.name,
        vehicleType: v.vehicle_type,
        plateNumber: v.plate_number,
        driverName: v.driver_name,
        area: v.area,
        contact: v.contact,
        addedAt: v.added_at,
      }));
      setVehicles(formatted);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteVehicle(id);
      await fetchVehicles();
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.vehicleType || !form.plateNumber || !form.driverName || !form.area || !form.contact) return;

    try {
      setSaving(true);
      const payload = {
        vehicleType: form.vehicleType,
        plateNumber: form.plateNumber,
        driverName: form.driverName,
        area: form.area,
        contact: form.contact,
      };
      if (editData) {
        await updatedVehicle(editData._id, payload);
      } else {
        await registerVehicle(payload);
      }
      await fetchVehicles();
      setCreateOpen(false);
      setForm({ vehicleType: "", plateNumber: "", driverName: "", area: "", contact: "" });
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      "vehicleType,plateNumber,driverName,area,contact\nCar,DL 01 AA 0000,John Doe,North Delhi,9876543210\nTruck,MH 02 BB 1111,Ramesh Kumar,Andheri,9123456789";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vehicle_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    try {
      setUploading(true);
      const data = await uploadFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      const formatted = jsonData.map((row) => ({
        vehicleType: row.vehicleType,
        plateNumber: row.plateNumber,
        driverName: row.driverName,
        area: row.area,
        contact: String(row.contact),
      }));
      await uploadVehiclesBulk(formatted);
      await fetchVehicles();
      setUploadFile(null);
      setUploadOpen(false);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={""}>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-6 md:p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30">
                🚗
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Vehicle Registry
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 ml-12">
              Manage and track registered vehicles
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search by number, type, driver or area..."
            className="w-72 px-4 py-2 rounded-xl text-sm outline-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setUploadFile(null); setUploadOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            >
              <span>⬆</span> Upload File
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span className="text-base leading-none">+</span> Create Vehicle
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm dark:shadow-2xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  {["#", "Vehicle Type", "Plate Number", "Driver Name", "Area", "Contact", "Added At", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-gray-400 dark:text-gray-600">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  filtered.map((v, i) => (
                    <tr
                      key={v._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs font-semibold text-gray-400 dark:text-gray-600">{i + 1}</td>
                      <td className="px-5 py-4"><Badge type={v.vehicleType} /></td>
                      <td className="px-5 py-4 font-mono font-bold text-gray-900 dark:text-white tracking-wide">{v.plateNumber}</td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{v.driverName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{v.area}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 font-mono">{v.contact}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(v.addedAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(v)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v._id)}
                            disabled={deletingId === v._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === v._id ? "Deleting..." : "🗑 Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600">
            Showing {filtered.length} of {vehicles.length} vehicles
          </div>
        </div>

        {/* Create / Edit Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title={editData ? "Edit Vehicle" : "Register New Vehicle"}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                Vehicle Type
              </label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
              >
                <option value="">Select type...</option>
                {VEHICLE_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                Plate Number
              </label>
              <input
                value={form.plateNumber}
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                placeholder="e.g. DL 01 AB 1234"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                Driver Name
              </label>
              <input
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                Area
              </label>
              <input
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="e.g. North Delhi"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                Contact
              </label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-2.5 mt-1 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? editData ? "Updating..." : "Registering..."
                : editData ? "Save Changes" : "Register Vehicle"}
            </button>
          </div>
        </Modal>

        {/* Upload Modal */}
        <Modal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          title="Bulk Upload Vehicles"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Upload an Excel / CSV file with columns:{" "}
              {["vehicleType", "plateNumber", "driverName", "area", "contact"].map((col, idx, arr) => (
                <span key={col}>
                  <code className="bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-mono">
                    {col}
                  </code>
                  {idx < arr.length - 1 ? " " : ""}
                </span>
              ))}
            </p>

            <button
              onClick={downloadTemplate}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              ⬇ Download Template
            </button>

            <div
              onClick={() => fileRef.current.click()}
              className={`rounded-xl flex flex-col items-center justify-center py-8 gap-2 cursor-pointer transition-all border-2 border-dashed
                ${uploadFile
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
            >
              <span className="text-3xl">📂</span>
              <span className={`text-sm ${uploadFile ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-gray-400 dark:text-gray-500"}`}>
                {uploadFile ? uploadFile.name : "Click to select Excel / CSV file"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </div>

            <button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || uploading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Submit Upload"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}