import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

import {
  House,
  Monitor,
  MonitorCheck
} from "lucide-react";

export default function Dashboard() {

  return (
    <div className="menu">
      <div className="menu-grid">
        <Link to="/" className="btn-card">
          <House size={55} />
          <p>Home</p>
        </Link>

        <Link to="/tracker" className="btn-card">
          <Monitor size={55} />
          <p>Monitoring</p>
        </Link>

        <Link to="/display" className="btn-card">
          <MonitorCheck size={55} />
          <p>Display</p>
        </Link>
      </div>
    </div>
  );

}