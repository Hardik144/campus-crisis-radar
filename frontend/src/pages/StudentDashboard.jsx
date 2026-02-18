import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function StudentDashboard() {
  const { logout } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Other"
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
      setIncidents(res.data.data.incidents);
    } catch (error) {
      console.error("Failed to fetch incidents", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/incidents", form);
      setForm({ title: "", description: "", type: "Other" });
      fetchIncidents(); // refresh list
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create incident");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Create Incident Form */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Report New Incident
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-3 rounded bg-gray-700"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            required
          />

          <textarea
            placeholder="Description"
            className="w-full p-3 rounded bg-gray-700"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />

          <select
            className="w-full p-3 rounded bg-gray-700"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option value="Medical">Medical</option>
            <option value="Harassment">Harassment</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Other">Other</option>
          </select>

          <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">
            Submit Incident
          </button>
        </form>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <p>No incidents reported yet.</p>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident._id}
              className="bg-gray-800 p-4 rounded-lg shadow"
            >
              <h2 className="text-xl font-semibold">
                {incident.title}
              </h2>
              <p className="text-gray-400">
                {incident.description}
              </p>
              <p className="text-sm mt-2">
                Status:{" "}
                <span className="text-blue-400">
                  {incident.status}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}