import React, { useEffect, useState } from "react";
import "./App.css";

import rsuratih from "./assets/RSURATIH.png";
import smkti from "./assets/SMKTI.jpg";

const steps = [
  "resep_masuk",
  "validasi_farmasi",
  "proses",
  "penyerahan",
];

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
  const [filter, setFilter] = useState("semua");

  const API_URL = import.meta.env.VITE_API_URL;
  const TOKEN = import.meta.env.VITE_API_TOKEN;

  const fetchData = async (type = "semua") => {
    try {
      setLoading(true);

      let url = `${API_URL}/reseptracker/?action=list`;

      switch (type) {
        case "ranap":
          url = `${API_URL}/reseptracker/?action=list&jenis=ranap`;
          break;

        case "rajal":
          url = `${API_URL}/reseptracker/?action=list&jenis=rajal`;
          break;

        case "belum_penyerahan":
          url = `${API_URL}/reseptracker/?action=list&only_active=1`;
          break;

        default:
          url = `${API_URL}/reseptracker/?action=list`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const json = await res.json();

      console.log("API Response:", json);

      if (Array.isArray(json)) {
        setData(json);
      } else if (json?.data && Array.isArray(json.data)) {
        setData(json.data);
      } else {
        setData([]);
      }
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
    (item) => item.jenis_pelayanan?.toLowerCase() === "ranap"
  ).length;

  const rajal = data.filter(
    (item) => item.jenis_pelayanan?.toLowerCase() === "rajal"
  ).length;

  const belum = data.filter(
    (item) => item.status_akhir !== "penyerahan"
  ).length;

  return (
    <div className="tracker-page">
      <div className="tracker-shell">

        <div className="tracker-topbar">
          <div className="brand">

            <div className="brand-logo-group">
              <img
                src={rsuratih}
                alt="RS Uratih"
                className="logo-img"
              />

              <img
                src={smkti}
                alt="SMK TI"
                className="logo-img"
              />
            </div>

            <div>
              <h1>Resep Farmasi Tracker</h1>

              <p>
                Monitoring resep masuk, validasi farmasi,
                proses dan penyerahan obat
              </p>

              <small>
                Filter aktif : <b>{filter}</b>
              </small>
            </div>
          </div>

          <div className="actions">
            <button
              className="filter-btn"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              ⏷ Filter
            </button>

            {filterOpen && (
              <div className="filter-menu">

                <button
                  onClick={() => {
                    setFilter("semua");
                    fetchData("semua");
                    setFilterOpen(false);
                  }}
                >
                  Semua
                </button>

                <button
                  onClick={() => {
                    setFilter("ranap");
                    fetchData("ranap");
                    setFilterOpen(false);
                  }}
                >
                  Ranap
                </button>

                <button
                  onClick={() => {
                    setFilter("rajal");
                    fetchData("rajal");
                    setFilterOpen(false);
                  }}
                >
                  Rajal
                </button>

                <button
                  onClick={() => {
                    setFilter("belum_penyerahan");
                    fetchData("belum_penyerahan");
                    setFilterOpen(false);
                  }}
                >
                  Belum Penyerahan
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

          <div className="stat-card">
            <span>Belum Penyerahan</span>
            <strong>{belum}</strong>
          </div>

        </div>

        <div className="table-panel">

          {loading ? (
            <div className="loading">
              Memuat data...
            </div>
          ) : (
            <table className="data-table">

              <thead>
                <tr>
                  <th>No Rawat</th>
                  <th>No Resep</th>
                  <th>Nama Pasien</th>
                  <th>Jenis Pelayanan</th>
                  <th>Status Tracker</th>
                </tr>
              </thead>

              <tbody>

                {data.length > 0 ? (
                  data.map((item, index) => {

                    const currentStep = steps.indexOf(
                      item.status_akhir || "resep_masuk"
                    );

                    return (
                      <tr key={index}>

                        <td>{item.no_rawat}</td>

                        <td>{item.no_resep}</td>

                        <td>{item.nama_pasien}</td>

                        <td>
                          <span
                            className={`badge ${
                              item.jenis_pelayanan || ""
                            }`}
                          >
                            {item.jenis_pelayanan}
                          </span>
                        </td>

                        <td>
                          <div className="stepper">

                            {steps.map((step, idx) => {

                              const active =
                                currentStep >= idx;

                              return (
                                <div
                                  key={step}
                                  className={`
                                    step
                                    ${step}
                                    ${currentStep >= idx ? "active" : ""}
                                    ${currentStep === idx ? "current" : ""}
                                  `}
                                >
                                  <div className="dot" />

                                  <span>
                                    {stepLabel[step]}
                                  </span>
                                </div>
                              );
                            })}

                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
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