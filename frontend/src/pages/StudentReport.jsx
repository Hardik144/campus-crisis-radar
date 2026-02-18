import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function StudentReport() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "",
    location: "",
    description: "",
    anonymous: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/incidents", {
        title: form.type,
        description: form.description,
        type: form.type,
        location: { address: form.location },
      });

      alert("Report submitted successfully!");
      navigate("/student");
    } catch (error) {
      alert(error.response?.data?.message || "Submission failed");
    }
  };

  return (
    <>
      <Navbar role="student" />

      <div className="bg-slate-50 min-h-screen px-6 py-10">

        {/* Back Button */}
        <div className="max-w-3xl mx-auto mb-6">
          <button
            onClick={() => navigate("/student")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Header Card */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl shadow-md">
          <h2 className="text-xl font-semibold">
            Report an Incident
          </h2>
          <p className="text-blue-100 text-sm">
            Help keep our campus safe
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-b-xl shadow-md">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Incident Type */}
            <div>
              <label className="block font-medium mb-2">
                Incident Type *
              </label>
              <select
                required
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select incident type</option>
                <option value="Medical">Medical</option>
                <option value="Harassment">Harassment</option>
                <option value="Theft">Theft</option>
                <option value="Fire">Fire Hazard</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Library Building, Room 204"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-2">
                Description *
              </label>
              <textarea
                required
                rows="4"
                placeholder="Please provide as much detail as possible..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-sm text-slate-500 mt-2">
                Include what happened, when, and any other relevant details
              </p>
            </div>

            {/* Upload Section (UI only) */}
            <div>
              <label className="block font-medium mb-2">
                Attach Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
                Click to upload photos or drag and drop
                <div className="text-sm mt-2">
                  PNG, JPG up to 10MB
                </div>
              </div>
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) =>
                  setForm({ ...form, anonymous: e.target.checked })
                }
              />
              <div>
                <p className="font-medium">
                  Submit Anonymously
                </p>
                <p className="text-sm text-slate-500">
                  Your identity will be kept confidential
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/student")}
                className="px-6 py-3 bg-slate-200 rounded-xl hover:bg-slate-300 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>

        {/* Emergency Notice */}
        <div className="max-w-3xl mx-auto mt-8 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
          For immediate emergencies: Call Campus Security at <strong>555-SAFE</strong> or dial <strong>911</strong>
        </div>

      </div>
    </>
  );
}