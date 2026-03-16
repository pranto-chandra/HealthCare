import React, { useState, useContext} from "react";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

import facebookImage from "./images/facebook.png";
import instaImage from "./images/insta.png";
import twitterImage from "./images/x.png";
import linkedinImage from "./images/linkedin.png";

export default function Contact() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  
  // Only show sidebar for logged-in users
  const shouldShowSidebar = user && user.role;
  const normalizedRole = user?.role
    ? user.role.toLowerCase().charAt(0).toUpperCase() +
      user.role.toLowerCase().slice(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      
      {/* Toggle Button - Only show if logged in */}
      {shouldShowSidebar && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
      )}
      

      <div className={`border border-gray-200 rounded-lg shadow-lg p-6 w-full max-w-4xl flex flex-col justify-center items-center ${isSidebarOpen ? "" : "collapsed"}`}>
        {shouldShowSidebar && isSidebarOpen && <Sidebar role={normalizedRole} />}
        <div>
            <h1 className="text-3xl font-bold text-center text-teal-800 mb-2">
                Contact Us
            </h1>
        </div>
        <div>
            <p className="text-center font-semibold text-gray-600 mb-10">
                We’re here to help. Reach out to us anytime.
            </p>
        </div>
        <div className="bg-teal-100 rounded-lg shadow-md p-6 w-full max-w-md">
            <div>
            <h3 className="text-xl font-bold text-teal-800 mb-4 text-center">
              Get in Touch
            </h3>

            <div className="space-y-3 text-gray-700 text-sm">
              <p>📍 <span className="font-medium">Address:</span> Chittagong, Bangladesh</p>
              <p>📞 <span className="font-medium">Phone:</span> +880 1234 567 890</p>
              <p>📧 <span className="font-medium">Email:</span> support@healthcare.com</p>
              <p>⏰ <span className="font-medium">Hours:</span> 9:00 AM – 8:00 PM</p>
            </div>
          </div>

            <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-teal-700">Follow Us</h3>
                <div className="flex justify-center items-center space-x-4 mt-2">
                  <a href="https://www.facebook.com" target="_blank" className="text-teal-600 hover:text-teal-800">
                    <img src={facebookImage} alt="Facebook" className="w-8 h-8" />
                  </a>
                  <a href="https://www.twitter.com" target="_blank" className="text-teal-600 hover:text-teal-800">
                    <img src={twitterImage} alt="Twitter" className="w-6 h-6" />
                  </a>
                  <a href="https://www.instagram.com" target="_blank" className="text-teal-600 hover:text-teal-800">
                    <img src={instaImage} alt="Instagram" className="w-8 h-8" />
                  </a>
                  <a href="https://www.linkedin.com" target="_blank" className="text-teal-600 hover:text-teal-800">
                    <img src={linkedinImage} alt="LinkedIn" className="w-6 h-6" />
                  </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
