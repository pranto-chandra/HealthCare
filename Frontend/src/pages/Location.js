import React from "react";

export default function Location() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-teal-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Location</h1>
        <p className="text-teal-100">
          Visit us for world-class healthcare services
        </p>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Address Info */}
        <div>
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">
            Hospital Address
          </h2>
          <p className="text-gray-600 mb-2">
            📍 Chittagong Medical Area
          </p>
          <p className="text-gray-600 mb-2">
            Road No: 12, Health Avenue
          </p>
          <p className="text-gray-600 mb-2">
            Chattogram, Bangladesh
          </p>
          <p className="text-gray-600 mb-4">
            ☎ +880 1234 567 890
          </p>

          <h3 className="text-lg font-semibold text-teal-700 mb-2">
            Working Hours
          </h3>
          <p className="text-gray-600">
            Monday – Sunday: 24 Hours Open
          </p>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <iframe
            title="Hospital Location"
            src="https://www.google.com/maps?q=Chittagong,Bangladesh&output=embed"
            className="w-full h-80 border-0"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
