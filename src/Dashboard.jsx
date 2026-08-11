import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { House, Monitor, MonitorCheck } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="menu">
      <div className="menu-grid">
        <Link to="/" className="btn-card" title="Home">
          <House size={36} strokeWidth={2.2} />
        </Link>

        <Link to="/tracker" className="btn-card" title="Monitoring">
          <Monitor size={36} strokeWidth={2.2} />
        </Link>

        <Link to="/display" className="btn-card" title="Display">
          <MonitorCheck size={36} strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  );
}