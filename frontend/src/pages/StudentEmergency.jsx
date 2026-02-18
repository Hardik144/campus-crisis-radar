import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function StudentEmergency() {
  const navigate = useNavigate();

  const handleEmergency = () => {
    alert("Emergency Activated! Campus security notified.");
  };

  return (
    <>
      <Navbar role="student" />

      <div className="bg-slate-50 min-h-screen py-10 px-6">

        {/* Back Button */}
        <div className="max-w-5xl mx-auto mb-6">
          <button
            onClick={() => navigate("/student")}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col items-center">

          {/* Info Card */}
          <div className="bg-white border border-red-200 rounded-xl p-8 max-w-xl w-full text-center shadow-sm mb-12">
            <div className="bg-red-100 text-red-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠
            </div>

            <h2 className="text-xl font-semibold mb-3">
              Emergency Panic Button
            </h2>

            <p className="text-slate-600">
              Press the button below if you are in immediate danger.
              This will alert campus security and nearby officers to
              your location.
            </p>
          </div>

          {/* Big Red Emergency Button */}
          <button
            onClick={handleEmergency}
            className="w-72 h-72 rounded-full bg-red-500 hover:bg-red-600 shadow-xl flex flex-col items-center justify-center text-white text-center transition active:scale-95"
          >
            <div className="text-5xl mb-4">⚠</div>
            <h1 className="text-3xl font-bold tracking-wide">
              EMERGENCY
            </h1>
            <p className="text-red-100 mt-2">
              Tap to Activate
            </p>
          </button>

          {/* What Happens Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg w-full mt-16">
            <h3 className="font-semibold mb-4">
              What happens when you activate:
            </h3>

            <ul className="space-y-2 text-slate-600">
              <li>• Campus security receives an immediate alert</li>
              <li>• Your current location is shared</li>
              <li>• Nearby officers are dispatched to your location</li>
              <li>• Emergency contacts are notified</li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full mt-10 text-center">
            <p className="text-slate-600">
              Campus Security: <strong>555-SAFE</strong>
            </p>
            <p className="text-slate-600 mt-2">
              Emergency Services: <strong>911</strong>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}