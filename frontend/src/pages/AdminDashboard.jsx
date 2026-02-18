import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    investigating: 0,
    resolved: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
      const data = res.data.data.incidents;

      setIncidents(data);

      setStats({
        total: data.length,
        pending: data.filter(i => i.status === "Pending").length,
        investigating: data.filter(i => i.status === "Investigating").length,
        resolved: data.filter(i => i.status === "Resolved").length
      });
    } catch (error) {
      console.error("Failed to fetch incidents");
    }
  };

  return (
    <>
      <Navbar role="admin" />

      <div className="bg-slate-50 min-h-screen px-10 py-10">

        {/* Header */}
        <div className="bg-linear-to-r from-slate-100 to-slate-200 rounded-2xl p-6 mb-8">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-slate-500">
            Monitor and manage campus incidents
          </p>
        </div>

        {/* Live Alerts */}
        <div className="border border-red-200 bg-red-50 rounded-2xl p-6 mb-8">
          <h3 className="text-red-600 font-semibold mb-4">
            Live Alerts
          </h3>

          <div className="space-y-4">
            {incidents
              .filter(i => i.status === "Pending")
              .slice(0, 2)
              .map(i => (
                <div
                  key={i._id}
                  className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <p className="font-medium">{i.title}</p>
                    <p className="text-slate-500 text-sm">
                      {i.location?.address}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/admin/incidents/${i._id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Respond
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">

          <StatCard title="Total Incidents" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Investigating" value={stats.investigating} />
          <StatCard title="Resolved" value={stats.resolved} />

        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search incidents..."
            className="w-full outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          <table className="w-full text-left">

            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="p-4">Priority</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {incidents.map(i => (
                <tr key={i._id} className="border-t hover:bg-slate-50">
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                      High
                    </span>
                  </td>

                  <td className="p-4">{i.title}</td>

                  <td className="p-4">
                    {i.location?.address}
                  </td>

                  <td className="p-4">
                    {i.reportedBy?.name || "Anonymous"}
                  </td>

                  <td className="p-4 text-sm text-slate-500">
                    {new Date(i.createdAt).toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                      {i.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/incidents/${i._id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-slate-500 text-sm">{title}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
    </div>
  );
}