import React, { useState, useContext} from "react";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";


export default function AboutUs() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  
  // Only show sidebar for logged-in users
  const shouldShowSidebar = user && user.role;
  const normalizedRole = user?.role
    ? user.role.toLowerCase().charAt(0).toUpperCase() +
      user.role.toLowerCase().slice(1)
    : null;
    
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Toggle Button - Only show if logged in */}
      {shouldShowSidebar && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
      )}
      {shouldShowSidebar && isSidebarOpen && <Sidebar role={normalizedRole} />}
      {/* Hero Section */}
      <section className="bg-teal-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="max-w-2xl mx-auto text-lg text-teal-100">
          Delivering trusted healthcare through innovation, compassion, and excellence.
        </p>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">
            Who We Are
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our Healthcare Management System is designed to simplify patient care,
            empower doctors, and streamline administrative operations.
          </p>
          <p className="text-gray-600 leading-relaxed">
            With modern technology and a patient-first approach, we aim to make
            healthcare accessible, efficient, and reliable for everyone.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">
            Our Mission
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li>✔ Improve patient experience through digital solutions</li>
            <li>✔ Enable doctors with accurate, real-time data</li>
            <li>✔ Ensure secure and scalable healthcare management</li>
            <li>✔ Promote healthy living and preventive care</li>
          </ul>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-teal-700">10K+</h3>
            <p className="text-gray-600">Patients Served</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-teal-700">120+</h3>
            <p className="text-gray-600">Qualified Doctors</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-teal-700">25+</h3>
            <p className="text-gray-600">Departments</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-teal-700">24/7</h3>
            <p className="text-gray-600">Support</p>
          </div>
        </div>
      </section>
    </div>
  );
}
