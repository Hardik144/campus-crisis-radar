import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      <button
        onClick={logout}
        className="bg-red-600 px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}