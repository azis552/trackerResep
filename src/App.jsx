import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import {
  EllipsisVertical,
  House,
  Monitor,
  MonitorCheck,
  Check,
} from "lucide-react";
import rsuratih from "./assets/RSURATIH.png";
import smkti from "./assets/SMKTI.jpg";

const steps = ["resep_masuk", "validasi_farmasi", "proses", "penyerahan"];
const stepLabel = {
  resep_masuk: "Resep Masuk",
  validasi_farmasi: "Validasi Farmasi",
  proses: "Proses",
  penyerahan: "Penyerahan",
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const TOKEN = import.meta.env.VITE_API_TOKEN;

  const fetchData = async (type = "semua") => {
    try {
      setLoading(true);
      let url = `${API_URL}/reseptracker/?action=list`;
      if (type === "ranap") url += "&jenis=ranap";
      if (type === "rajal") url += "&jenis=rajal";

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();
      setData(Array.isArray(json) ? json : json?.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("semua");
  }, []);

  const total = data.length;
  const ranap = data.filter(
    (item) => item.jenis_pelayanan?.toLowerCase() === "ranap",
  ).length;
  const rajal = data.filter(
    (item) => item.jenis_pelayanan?.toLowerCase() === "rajal",
  ).length;

  return (
    <div className="tracker-page">
      <div className="tracker-shell">
        <div className="tracker-topbar">
          <div className="brand">
            <div className="brand-logo-group">
              <img src={rsuratih} alt="RS Uratih" className="logo-img" />
              <img src={smkti} alt="SMK TI" className="logo-img" />
            </div>
          </div>

          <h2>Resep Farmasi Tracker</h2>

          <div className="actions">
            <Link to="/" className="top-icon">
              <House size={20} />
            </Link>

            <Link to="/tracker" className="top-icon">
              <Monitor size={20} />
            </Link>

            <Link to="/display" className="top-icon">
              <MonitorCheck size={20} />
            </Link>

            <button
              className="icon-btn"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <EllipsisVertical size={20} />
            </button>

            {filterOpen && (
              <div className="filter-menu">
                <button
                  onClick={() => {
                    fetchData("semua");
                    setFilterOpen(false);
                  }}
                >
                  Semua
                </button>

                <button
                  onClick={() => {
                    fetchData("ranap");
                    setFilterOpen(false);
                  }}
                >
                  Ranap
                </button>

                <button
                  onClick={() => {
                    fetchData("rajal");
                    setFilterOpen(false);
                  }}
                >
                  Rajal
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Resep</span>
            <strong>{total}</strong>
          </div>
          <div className="stat-card">
            <span>Ranap</span>
            <strong>{ranap}</strong>
          </div>
          <div className="stat-card">
            <span>Rajal</span>
            <strong>{rajal}</strong>
          </div>
        </div>

        <div className="table-panel">
          {loading ? (
            <div className="loading">Memuat data...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No Rawat</th>
                  <th>No Resep</th>
                  <th>Nama Pasien</th>
                  <th>Jenis</th>
                  <th>Status Tracker</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => {
                    const currentStep = steps.indexOf(
                      item.status_akhir || "resep_masuk",
                    );
                    return (
                      <tr key={index}>
                        <td>{item.no_rawat}</td>
                        <td>{item.no_resep}</td>
                        <td>{item.nama_pasien}</td>
                        <td>
                          <span
                            className={`badge ${item.jenis_pelayanan || ""}`}
                          >
                            {item.jenis_pelayanan}
                          </span>
                        </td>
                        <td>
                          <div className="stepper">
                            {steps.map((step, idx) => (
                              <div
                                key={step}
                                className={`step ${currentStep >= idx ? "active" : ""}`}
                              >
                                <div
                                  className={`step-icon ${
                                    currentStep >= idx ? "completed" : "pending"
                                  } ${step}`}
                                >
                                  {currentStep >= idx && (
                                    <Check size={14} strokeWidth={3} />
                                  )}
                                </div>

                                <span>{stepLabel[step]}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
