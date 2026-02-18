import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ role }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-4 flex justify-between items-center shadow-md">

      <div>
        <h1 className="text-white font-semibold text-lg">
          Campus Crisis Radar
        </h1>
        <p className="text-blue-100 text-sm">
          {role === "admin" ? "Admin Portal" : "Student Portal"}
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="bg-white/20 text-white px-4 py-1 rounded-full text-sm">
          {role === "admin" ? "Admin User" : "Student User"}
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
        >
          ↪
        </button>

      </div>
    </div>
  );
}