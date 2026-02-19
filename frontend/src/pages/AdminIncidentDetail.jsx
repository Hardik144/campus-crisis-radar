import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function AdminIncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchIncident();
  }, []);

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data.data.incident);
    } catch (error) {
      console.error("Failed to fetch incident");
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/incidents/${id}`, { status: newStatus });
      fetchIncident();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const addNote = async () => {
    if (!note) return;

    try {
      await api.post(`/incidents/${id}/notes`, {
        note,
      });

      setNote("");
      fetchIncident(); // Refresh incident data
    } catch (error) {
      console.error("Failed to add note");
    }
  };

  if (!incident) return null;

  return (
    <>
      <Navbar role="admin" />

      <div className="bg-slate-50 min-h-screen px-10 py-10">
        {/* Back */}
        <button
          onClick={() => navigate("/admin")}
          className="text-blue-600 mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-8">
            {/* Incident Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex gap-3 mb-4">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                  High Priority
                </span>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                  {incident.status}
                </span>
              </div>

              <h1 className="text-2xl font-semibold mb-2">{incident.title}</h1>

              <p className="text-slate-500 text-sm mb-4">
                {new Date(incident.createdAt).toLocaleString()}
              </p>

              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-slate-600 mb-6">{incident.description}</p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 text-sm">Location</p>
                  <p className="font-medium">{incident.location?.address}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">Reported By</p>
                  <p className="font-medium">
                    {incident.reportedBy?.name || "Anonymous"}
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-t-xl">
                Incident Location
              </div>

              <div className="h-64 flex items-center justify-center text-slate-400">
                📍 Map Placeholder
              </div>
            </div>

            {/* Investigation Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Investigation Notes</h3>

              <div className="space-y-4 mb-6">
                {incident.investigationNotes.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No investigation notes yet.
                  </p>
                ) : (
                  incident.investigationNotes.map((n) => (
                    <div key={n._id} className="bg-slate-100 p-4 rounded-xl">
                      <p className="font-medium">
                        {n.addedBy?.name || "Admin"}
                      </p>

                      <p className="text-sm text-slate-500 mb-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>

                      <p className="text-slate-600">{n.note}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add investigation note..."
                  className="flex-1 p-3 border rounded-xl"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <button
                  onClick={addNote}
                  className="bg-blue-600 text-white px-6 rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={() => updateStatus("Investigating")}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl"
                >
                  Assign to Officer
                </button>

                <button
                  onClick={() => updateStatus("Pending")}
                  className="w-full bg-slate-200 py-2 rounded-xl"
                >
                  Send Update
                </button>

                <button
                  onClick={() => updateStatus("Resolved")}
                  className="w-full bg-red-100 text-red-600 py-2 rounded-xl"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Reporter Information</h3>

              <p className="text-slate-500 text-sm">Name</p>
              <p className="font-medium mb-3">{incident.reportedBy?.name}</p>

              <p className="text-slate-500 text-sm">Email</p>
              <p className="font-medium">{incident.reportedBy?.email}</p>

              <button className="mt-4 w-full bg-indigo-100 text-indigo-600 py-2 rounded-xl">
                Contact Reporter
              </button>
            </div>

            {/* Emergency Contacts */}
            <div className="border border-red-200 bg-red-50 rounded-xl p-6">
              <h3 className="text-red-600 font-semibold mb-4">
                Emergency Contacts
              </h3>

              <p className="text-slate-500 text-sm">Campus Security</p>
              <p className="font-medium mb-3">555-SAFE</p>

              <p className="text-slate-500 text-sm">Emergency Services</p>
              <p className="font-medium">911</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
