import React, { useState, useContext} from "react";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Landing.css";
import chairmanImage from "./images/Chairman-removebg-preview.png";
import cardiacImage from "./images/Cardiac.jpg";
import dentalImage from "./images/Dental.jpg";
import neuroImage from "./images/Neurology.jpg";
import orthoImage from "./images/Orthopedics.jpg";
import dermaImage from "./images/Dermatology.jpg";
import peditricImage from "./images/pediatrics.jpg";

export default function Landing() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDermatologyOptions, setShowDermatologyOptions] = React.useState(false);

  // Only show sidebar for logged-in users
  const shouldShowSidebar = user && user.role;
  const normalizedRole = user?.role
    ? user.role.toLowerCase().charAt(0).toUpperCase() +
      user.role.toLowerCase().slice(1)
    : null;

  const handleDermatologyClick = () => {
    setShowDermatologyOptions(!showDermatologyOptions);
  };

  const navigateToDermatology = (specialization) => {
    navigate(`/doctors/${encodeURIComponent(specialization)}`);
    setShowDermatologyOptions(false);
  };

  return (
    <div className="dashboard">
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
      {/* --- Hero Section --- */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, Our Priority —</h1>
          <h1>Anytime, Anywhere.</h1>
          <p>I am looking for</p>

          <div className="hero-buttons">
            <button>Yours More</button>
            <button>Lorem Ipsum Simp Do!</button>
          </div>
        </div>
      </section>

      {/* --- Chairman Section --- */}
      <section className="chairman">
        <div className="chairman-content">
          <h2>MESSAGE FROM OUR CHAIRMAN</h2>
          <div>
            <img className="chaimanimg"
            src={chairmanImage}
            alt="Manager"
            />
          </div>
          <p>
            It gives me immense pleasure to witness how technology is
            transforming the healthcare sector. Our Medical Management System
            represents a significant step toward smarter, more accessible, and
            more reliable healthcare delivery.
          </p>
        </div>
      </section>

      {/* --- Departments Section --- */}
      <section className="departments">
        <h2>Our Medical Departments</h2>
        <div className="dept-grid">
          {[
            {
    title: "Cardiology",
    text: "Advanced cardiac care with modern diagnostics and experienced cardiologists.",
    img: cardiacImage,
  },
  {
    title: "Neurosurgery",
    text: "Expert neurological treatment and brain diagnostics with cutting-edge imaging systems.",
    img: neuroImage,
  },
  {
    title: "Orthopaedics",
    text: "Comprehensive joint and bone care from trusted specialists.",
    img: orthoImage,
  },
  {
    title: "Pediatrics",
    text: "Holistic healthcare for children of all ages with compassion and precision.",
    img: peditricImage,
  },
  {
    title: "Dentistry",
    text: "Modern dental care and cosmetic treatments ensuring perfect smiles.",
    img: dentalImage,
  },
  {
    title: "Dermatology and Venerology",
    text: "Advanced skin health and aesthetic dermatological and venereal treatments.",
    img: dermaImage,
    subSpecializations: [
      "Skin-V.D-Allergy-Dermato-Laser-Dermato-Surgery and Cosmetic Dermatology",
      "Skin & Venereal Diseases"
    ]
  },
  {
    title: "ENT",
    text: "Specialized care for ear, nose, and throat disorders.",
    //img: entImage,
  },
  {
    title: "Gynaecology & Obstetrics",
    text: "Comprehensive women’s health and maternity care services.",
    //img: gynaeImage,
  },
  {
    title: "Oncology",
    text: "Integrated cancer care with modern diagnostic and treatment facilities.",
    //img: oncologyImage,
  },
  {
    title: "Nephrology",
    text: "Specialized kidney care including dialysis and transplant support.",
    //img: nephroImage,
  },
  {
    title: "Urology",
    text: "Diagnosis and treatment of urinary tract and male reproductive conditions.",
    //img: urologyImage,
  },
  {
    title: "Psychiatry",
    text: "Comprehensive mental health care with confidentiality and compassion.",
    //img: psychImage,
  },
  {
    title: "Hepatology",
    text: "Expert diagnosis and treatment of liver-related diseases.",
    //img: gastroImage,
  },
  {
    title: "Rheumatology",
    text: "Specialized care for arthritis and autoimmune disorders.",
    //img: rheumaImage,
  },
  {
    title: "Respiratory Medicine",
    text: "Advanced treatment for lung and breathing disorders.",
    //img: respiratoryImage,
  },
  {
    title: "General Surgery",
    text: "Safe and effective surgical procedures across multiple specialties.",
    //img: surgeryImage,
  },
  {
    title: "Burn & Plastic Surgery",
    text: "Reconstructive and cosmetic surgery with advanced techniques.",
    //img: plasticImage,
  },
  {
    title: "Colorectal Surgery",
    text: "Specialized surgical care for colorectal diseases.",
    //img: colorectalImage,
  },
  {
    title: "Laparoscopic Surgery",
    text: "Minimally invasive surgeries for faster recovery.",
    //img: laparoscopicImage,
  },
  {
    title: "Endocrinology",
    text: "Diagnosis and treatment of hormonal and metabolic disorders.",
    //img: endocrineImage,
  },
  {
    title: "Physical Medicine",
    text: "Rehabilitation services for recovery and mobility improvement.",
    //img: physicalImage,
  },
  {
    title: "Surgical Oncology",
    text: "Surgical treatment and management of cancer cases.",
    //img: surgicalOncologyImage,
  },
          ].map((item, i) => (
            item.subSpecializations ? (
              <div key={i} className="dept-card-container">
                <div 
                  className="dept-card"
                  onClick={handleDermatologyClick}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="dept-img">
                    <img src={item.img} alt={item.title} />
                  </div>
                  <div className="dept-text">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
                {showDermatologyOptions && (
                  <div className="sub-specializations">
                    {item.subSpecializations.map((spec, idx) => (
                      <button
                        key={idx}
                        className="sub-spec-btn"
                        onClick={() => navigateToDermatology(spec)}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="dept-card" 
                key={i}
                onClick={() => navigate(`/doctors/${encodeURIComponent(item.title)}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="dept-img">
                  <img src={item.img} alt={item.title} />
                </div>
                <div className="dept-text">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* --- Footer Section --- */}
      <footer className="footer">
        <p>© 2025 Organic Healthcare. All rights reserved.</p>
      </footer>
    </div>
  );
}
