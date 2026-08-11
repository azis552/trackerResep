import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { House, Monitor, MonitorCheck, Check } from "lucide-react";
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
  const [activeFilter, setActiveFilter] = useState("semua");

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

  const handleFilter = (type) => {
    setActiveFilter(type);
    fetchData(type);
  };

  const getJenisFarmasi = (jenisResep) => {
    if (!jenisResep) return "-";

    const jenis = jenisResep.toString().toLowerCase().trim();

    if (jenis === "umum") return "Umum (Non Racikan)";
    if (jenis === "non racikan") return "Umum (Non Racikan)";
    if (jenis === "non_racikan") return "Umum (Non Racikan)";
    if (jenis === "racikan") return "Racikan";

    return jenisResep;
  };

  const getEstimasiSelesai = (waktuResep, jenisResep) => {
    if (!waktuResep) return "-";

    const waktu = new Date(waktuResep.replace(" ", "T"));

    if (Number.isNaN(waktu.getTime())) return "-";

    const jenis = jenisResep?.toString().toLowerCase().trim();

    const durasi = jenis === "racikan" ? 30 : 15;

    waktu.setMinutes(waktu.getMinutes() + durasi);

    return waktu.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const total = data.length;
  const ranap = data.filter(
    (item) => item.jenis_pelayanan?.toLowerCase() === "ranap"
  ).length;
  const rajal = data.filter(
    (item) => item.jenis_pelayanan?.toLowerCase() === "rajal"
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
          <h2>resep farmasi tracker</h2>
          <div className="actions">
            <Link to="/" className="top-icon" title="Home">
              <House size={20} />
            </Link>
            <Link to="/tracker" className="top-icon" title="Monitoring">
              <Monitor size={20} />
            </Link>
            <Link to="/display" className="top-icon" title="Display">
              <MonitorCheck size={20} />
            </Link>
          </div>
        </div>
        <div className="stats-grid">
          <div
            className={`stat-card ${activeFilter === "semua" ? "active" : ""}`}
            onClick={() => handleFilter("semua")}
          >
            <span>Total Resep</span>
            <strong>{total}</strong>
          </div>
          <div
            className={`stat-card ${activeFilter === "ranap" ? "active" : ""}`}
            onClick={() => handleFilter("ranap")}
          >
            <span>Rawat Inap (Ranap)</span>
            <strong>{ranap}</strong>
          </div>
          <div
            className={`stat-card ${activeFilter === "rajal" ? "active" : ""}`}
            onClick={() => handleFilter("rajal")}
          >
            <span>Rawat Jalan (Rajal)</span>
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
                  <th>No Resep</th>
                  <th>Nama Pasien</th>
                  <th>Jenis Farmasi</th>
                  <th>Estimasi Selesai</th>
                  <th>Status Tracker</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => {
                    const currentStep = steps.indexOf(
                      item.status_akhir || "resep_masuk"
                    );
                    const jenisResep = item.jenis_resep || "-";
                    const jenisFarmasi = getJenisFarmasi(jenisResep);
                    const estimasiSelesai = getEstimasiSelesai(
                      item.waktu?.resep_masuk,
                      jenisResep
                    );

                    return (
                      <tr key={item.no_resep || index}>
                        <td>{item.no_resep || "-"}</td>
                        <td>{item.nama_pasien || "-"}</td>
                        <td>
                          <span
                            className={`badge ${jenisResep
                              .toString()
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {jenisFarmasi}
                          </span>
                        </td>
                        <td>{estimasiSelesai}</td>
                        <td>
                          <div className="stepper">
                            {steps.map((step, idx) => (
                              <div
                                key={step}
                                className={`step ${
                                  currentStep >= idx ? "active" : ""
                                }`}
                              >
                                <div
                                  className={`step-icon ${
                                    currentStep >= idx
                                      ? "completed"
                                      : "pending"
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