import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function StudentIncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await api.get(`/incidents/${id}`);
        setIncident(res.data.data.incident);
      } catch (error) {
        console.error("Failed to fetch incident", error);
      }
    };

    fetchIncident();
  }, [id]);

  if (!incident) return null;

  return (
    <>
      <Navbar role="student" />

      <div className="bg-slate-50 min-h-screen px-10 py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate("/student")}
          className="text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-8">

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex gap-3 mb-4">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  High Priority
                </span>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {incident.status}
                </span>
              </div>

              <h1 className="text-2xl font-semibold mb-2">
                {incident.title}
              </h1>

              <p className="text-slate-500 mb-6">
                {new Date(incident.createdAt).toLocaleString()}
              </p>

              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-slate-600">
                {incident.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-6">

                <div>
                  <h4 className="text-slate-500 text-sm mb-1">
                    Location
                  </h4>
                  <p className="font-medium">
                    {incident.location?.address}
                  </p>
                </div>

                <div>
                  <h4 className="text-slate-500 text-sm mb-1">
                    Reported By
                  </h4>
                  <p className="font-medium">
                    {incident.reportedBy?.name || "Anonymous"}
                  </p>
                </div>

              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white rounded-xl shadow-sm">

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-t-xl">
                Incident Location
              </div>

              <div className="h-64 flex items-center justify-center text-slate-400">
                📍 Map Placeholder
              </div>
            </div>

            {/* Investigation Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">
                Investigation Notes
              </h3>

              <div className="space-y-4">

                <div className="bg-slate-100 p-4 rounded-xl">
                  <p className="font-medium">
                    Officer Rodriguez
                  </p>
                  <p className="text-sm text-slate-500 mb-2">
                    Feb 6 at 2:45 PM
                  </p>
                  <p className="text-slate-600">
                    Responding to the scene. ETA 5 minutes.
                  </p>
                </div>

                <div className="bg-slate-100 p-4 rounded-xl">
                  <p className="font-medium">
                    Officer Chen
                  </p>
                  <p className="text-sm text-slate-500 mb-2">
                    Feb 6 at 3:10 PM
                  </p>
                  <p className="text-slate-600">
                    Situation under investigation.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 h-fit">

            <h3 className="text-red-600 font-semibold mb-4">
              Emergency Contacts
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-sm">
                  Campus Security
                </p>
                <p className="font-medium">
                  555-SAFE
                </p>
              </div>

              <div>
                <p className="text-slate-500 text-sm">
                  Emergency Services
                </p>
                <p className="font-medium">
                  911
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
