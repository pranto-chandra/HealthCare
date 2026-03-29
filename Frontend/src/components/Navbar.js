import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Tooltip from "@mui/material/Tooltip";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import IconButton from "@mui/material/IconButton";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import hero1 from "../pages/images/hero1.png";
import hero2 from "../pages/images/hero2.png";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const [value, setValue] = React.useState(0);

  return (
    <header className="navbar font-semibold">
      <div className="navbar__logo">
        <Link to="/" className="hover:no-underline flex justify-center items-center gap-2">
          <img src={hero1} alt="Logo" className="h-10 w-10" />
          <img src={hero2} alt="Logo" className="h-5 w-20" />
        </Link>
      </div>

      <nav className="navbar__links hover:no-underline flex items-center justify-center gap-0 bg-transparent">
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            if (newValue === 0) navigate("/");
            else if (newValue === 1) navigate("/about");
            else if (newValue === 2) navigate("/location");
            else if (newValue === 3) navigate("/blogs");
            else if (newValue === 4) navigate("/contact");
          }}
          sx={{ backgroundColor: "transparent", boxShadow: "none" }}
        >
          <BottomNavigationAction label="Home" icon={<HomeFilledIcon />} />
          <BottomNavigationAction label="About" icon={<InfoOutlinedIcon />} />
          <BottomNavigationAction
            label="Location"
            icon={<LocationOnOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Blogs"
            icon={<NewspaperOutlinedIcon />}
          />
          <BottomNavigationAction label="Contact" icon={<CallOutlinedIcon />} />

          {user ? (
            <button
              className="login-link hover:no-underline"
              onClick={handleLogout}
            >
              <Tooltip title="Logout">
                <IconButton className="flex flex-col items-center justify-center">
                  <LogoutOutlinedIcon fontSize="medium" />
                  <h5 className="text-sm">Logout</h5>
                </IconButton>
              </Tooltip>
            </button>
          ) : (
            <Link to="/login" className="login-link hover:no-underline">
              <Tooltip title="Login">
                <IconButton className="flex flex-col items-center justify-center">
                  <LoginOutlinedIcon fontSize="medium" />
                  <h5 className="text-sm">Login</h5>
                </IconButton>
              </Tooltip>
            </Link>
          )}
        </BottomNavigation>
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
