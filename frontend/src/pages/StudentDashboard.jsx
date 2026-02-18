import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      const res = await api.get("/incidents");
      setIncidents(res.data.data.incidents);
    };

    fetchIncidents();
  }, []);

  return (
    <>
      <Navbar role="student" />

      <div className="bg-slate-50 min-h-screen px-12 py-10">
        {/* Welcome */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-slate-500">Stay safe and informed on campus</p>
        </div>

        {/* Top Action Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div
            onClick={() => navigate("/student/emergency")}
            className="bg-red-500 text-white p-6 rounded-xl shadow-md cursor-pointer hover:scale-105 transition"
          >
            <h2 className="text-lg font-semibold mb-1">Emergency Alert</h2>
            <p className="text-red-100">Activate panic button</p>
          </div>

          <div
            onClick={() => navigate("/student/report")}
            className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold mb-1">Report Incident</h2>
            <p className="text-slate-500">Submit a new report</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-1">Active Alerts</h2>
            <p className="text-slate-500">No active emergencies</p>
          </div>
        </div>

        {/* Recent Reports */}
        <h2 className="text-xl font-semibold mb-4">Your Recent Reports</h2>

        <div className="space-y-6">
          {incidents.map((incident) => (
            <div
              key={incident._id}
              onClick={() => navigate(`/student/incidents/${incident._id}`)}
              className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-lg">{incident.title}</h3>
                <p className="text-slate-500">{incident.description}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {incident.location?.address}
                </p>
              </div>

              <span
                className={`px-4 py-1 rounded-full text-sm ${
                  incident.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : incident.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {incident.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
