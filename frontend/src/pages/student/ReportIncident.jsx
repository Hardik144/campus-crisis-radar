import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Send,
  Upload,
  AlertTriangle,
  MapPin,
  FileText,
  Navigation,
} from "lucide-react";
import { api } from "../../api/api";
import { incidentTypes } from "../../data/mockData";

export default function ReportIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "",
    location: "",
    description: "",
    anonymous: false,
  });
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const captureGPS = () => {
    setGpsLoading(true);
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported by your browser.");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      () => {
        setGpsError("Could not get location. Please allow location access.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.location || !form.description) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", `${form.type} — ${form.location}`);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append(
        "location",
        JSON.stringify({
          address: form.location,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
        }),
      );
      formData.append("isAnonymous", form.anonymous);
      if (file) formData.append("image", file);

      const token = JSON.parse(localStorage.getItem("ccr_user"))?.token;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/incidents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit report. Please try again.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-5 max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 text-center w-full animate-fade_up">
          <div className="w-12 h-12 bg-green-950 border border-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={20} className="text-green-400" />
          </div>
          <div className="font-display text-3xl tracking-widest text-radar-text mb-2">
            SUBMITTED
          </div>
          <p className="text-sm font-body text-radar-dim mb-2">
            Your incident report has been filed and campus security has been
            notified.
          </p>
          {coords && (
            <p className="text-xs font-mono text-green-400 mb-4">
              GPS location attached: {coords.latitude.toFixed(5)},{" "}
              {coords.longitude.toFixed(5)}
            </p>
          )}
          <button
            onClick={() => navigate("/student")}
            className="btn-primary px-6 mt-2"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-2xl mx-auto animate-fade_up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/student")}
          className="p-2 rounded border border-radar-border text-radar-dim hover:text-radar-text hover:border-radar-muted transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="text-xs font-mono text-radar-dim tracking-widest uppercase">
            New Report
          </div>
          <h1 className="font-display text-2xl tracking-widest text-radar-text">
            REPORT INCIDENT
          </h1>
        </div>
      </div>

      {/* Emergency notice */}
      <div className="flex items-start gap-3 p-3 bg-red-950 border border-radar-red rounded mb-6">
        <AlertTriangle size={14} className="text-radar-red mt-0.5 shrink-0" />
        <p className="text-xs font-mono text-red-300 leading-relaxed">
          FOR LIFE-THREATENING EMERGENCIES: Use the Panic button or call campus
          emergency ext. 1800 immediately. Do not use this form.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950 border border-red-900 rounded mb-4 text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Incident Type */}
        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">
            Incident Type *
          </label>
          <select
            value={form.type}
            onChange={set("type")}
            className="input-field"
            required
          >
            <option value="">Select type...</option>
            {incidentTypes
              .filter((t) => t !== "Emergency Panic")
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>
        </div>

        {/* Location + GPS */}
        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">
            Location *
          </label>
          <div className="relative">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim"
            />
            <input
              type="text"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Engineering Block, Lab 204"
              className="input-field pl-9"
              required
            />
          </div>

          {/* GPS button */}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={captureGPS}
              disabled={gpsLoading}
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border transition-all duration-200 disabled:opacity-50 ${
                coords
                  ? "border-green-800 bg-green-950 text-green-400"
                  : "border-radar-border text-radar-dim hover:border-radar-muted hover:text-radar-text"
              }`}
            >
              <Navigation
                size={11}
                className={gpsLoading ? "animate-pulse" : ""}
              />
              {gpsLoading
                ? "CAPTURING GPS..."
                : coords
                  ? "GPS CAPTURED ✓"
                  : "CAPTURE MY GPS"}
            </button>
            {coords && (
              <span className="text-[10px] font-mono text-green-400">
                {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </span>
            )}
          </div>
          {gpsError && (
            <p className="text-[10px] font-mono text-red-400 mt-1">
              {gpsError}
            </p>
          )}
          <p className="text-[10px] font-mono text-radar-dim mt-1">
            GPS helps security locate the incident precisely on the map.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">
            Description *
          </label>
          <div className="relative">
            <FileText
              size={14}
              className="absolute left-3 top-3 text-radar-dim"
            />
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Describe what happened, when, and any other relevant details..."
              rows={5}
              className="input-field pl-9 resize-none"
              required
            />
          </div>
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs font-mono ${form.description.length > 1800 ? "text-radar-red" : "text-radar-dim"}`}
            >
              {form.description.length}/2000
            </span>
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">
            Photo Evidence (Optional)
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input").click()}
            className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? "border-radar-red bg-red-950"
                : "border-radar-border hover:border-radar-muted"
            }`}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Upload size={20} className="text-radar-dim mx-auto mb-2" />
            {file ? (
              <p className="text-sm font-mono text-green-400">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-body text-radar-dim">
                  Drop image here or click to upload
                </p>
                <p className="text-xs font-mono text-radar-dim mt-1">
                  PNG, JPG up to 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Anonymous */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.anonymous}
            onChange={set("anonymous")}
            className="accent-radar-red w-4 h-4"
          />
          <span className="text-sm font-body text-radar-dim group-hover:text-radar-text transition-colors">
            Submit anonymously — your identity will not be visible to other
            students
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-radar-border">
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="btn-ghost"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={
              loading || !form.type || !form.location || !form.description
            }
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
          >
            {loading ? (
              <span className="font-mono text-sm tracking-widest">
                SUBMITTING...
              </span>
            ) : (
              <>
                <Send size={14} />
                <span className="font-mono text-sm tracking-widest">
                  SUBMIT REPORT
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
