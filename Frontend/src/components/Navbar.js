import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";
import logoutimage from "../pages/images/logout.png";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import ThreeDRotation from "@mui/icons-material/ThreeDRotation";
import Tooltip from "@mui/material/Tooltip";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import IconButton from "@mui/material/IconButton";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar font-semibold">
      <div className="navbar__logo">
        <Link to="/" className="hover:no-underline">
          <h2>
            ORGANIC<span> HEALTHCARE</span>
          </h2>
        </Link>
      </div>

      <nav className="navbar__links hover:no-underline flex items-center justify-evenly">
        <Link to="/about" className="hover:no-underline">
          <Tooltip title="About Us">
            <IconButton>
              <InfoOutlinedIcon fontSize="medium"/>
            </IconButton>
          </Tooltip>
        </Link>
        <Link to="/location" className="hover:no-underline">
          <Tooltip title="Location">
            <IconButton>
              <LocationOnOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Link>
        <Link to="/blogs" className="hover:no-underline">
          <Tooltip title="Blogs">
            <IconButton>
              <NewspaperOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Link>
        <Link to="/contact" className="hover:no-underline">
          <Tooltip title="Contact Us">
            <IconButton>
              <CallOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Link>
        {user ? (
          <button
            className="login-link hover:no-underline"
            onClick={handleLogout}
          >
            <Tooltip title="Logout">
              <IconButton>
                <LogoutOutlinedIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </button>
        ) : (
          <Link to="/login" className="login-link hover:no-underline">
            <Tooltip title="Login">
              <IconButton>
                <LoginOutlinedIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Link>
        )}
      </nav>

      <Link
        to="/book-appointment"
        className="navbar__button font-semibold hover:no-underline"
      >
        <Tooltip title="Book Appointment">
          <IconButton color="inherit" fontSize="small">
            <AddBoxOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        Book Appointment
      </Link>
    </header>
  );
}
