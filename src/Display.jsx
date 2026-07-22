import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Display.css";

import {
  House,
  Monitor,
  MonitorCheck,
  Clock3,
  ClipboardList,
  ShieldCheck,
  PackageCheck,
  CircleCheckBig,
} from "lucide-react";

import rsuratih from "./assets/RSURATIH.png";
import smkti from "./assets/SMKTI.jpg";

const steps = ["resep_masuk", "validasi_farmasi", "proses", "penyerahan"];

const stepIcons = {
  resep_masuk: ClipboardList,
  validasi_farmasi: ShieldCheck,
  proses: PackageCheck,
  penyerahan: CircleCheckBig,
};

const stepLabel = {
  resep_masuk: "Resep Masuk",
  validasi_farmasi: "Validasi Farmasi",
  proses: "Proses",
  penyerahan: "Penyerahan",
};

export default function Display() {
  const API_URL = import.meta.env.VITE_API_URL;
  const TOKEN = import.meta.env.VITE_API_TOKEN;

  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Date().toLocaleString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${API_URL}/reseptracker/?action=list&jenis=rajal&only_active=1`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: "application/json",
          },
        },
      );

      const json = await res.json();

      const result = Array.isArray(json) ? json : json.data || [];

      const sortedPatients = [...result].sort((a, b) => {
        return (
          new Date(a.waktu.resep_masuk).getTime() -
          new Date(b.waktu.resep_masuk).getTime()
        );
      });

      setPatients(sortedPatients);

      setCurrentPatient((old) => {
        if (!sortedPatients.length) return null;

        if (!old) {
          return sortedPatients[0];
        }

        const current = sortedPatients.find((p) => p.no_resep === old.no_resep);

        if (!current) {
          return sortedPatients[0];
        }

        if (
          current.status_akhir === "validasi_farmasi" ||
          current.status_akhir === "proses"
        ) {
          return current;
        }

        if (current.status_akhir === "resep_masuk") {
          const priority = sortedPatients.find(
            (p) =>
              p.no_resep !== current.no_resep &&
              (p.status_akhir === "validasi_farmasi" ||
                p.status_akhir === "proses"),
          );

          if (priority) {
            return priority;
          }

          return current;
        }

        if (current.status_akhir === "penyerahan") {
          const priority = sortedPatients.find(
            (p) =>
              p.status_akhir === "validasi_farmasi" ||
              p.status_akhir === "proses",
          );

          if (priority) {
            return priority;
          }

          const nextQueue = sortedPatients.find(
            (p) =>
              p.no_resep !== current.no_resep &&
              p.status_akhir === "resep_masuk",
          );

          if (nextQueue) {
            return nextQueue;
          }

          return current;
        }

        return current;
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  const patient = currentPatient;

  if (loading) {
    return <div className="loading">Memuat data...</div>;
  }

  if (!patient) {
    return <div className="loading">Tidak ada data pasien</div>;
  }

  const currentStep = steps.indexOf(patient.status_akhir || "resep_masuk");

  return (
    <div className="tracker-page">
      <div className="tracker-shell">
        <div className="tracker-topbar">
          <div className="brand">
            <div className="brand-logo-group">
              <img src={rsuratih} className="logo-img" alt="" />
              <img src={smkti} className="logo-img" alt="" />
            </div>
          </div>

          <h2>Display Resep Farmasi</h2>

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
          </div>
        </div>

        <div className="patient-card">
          <div className="clock-box">
            <Clock3 size={18} />
            <span>{clock}</span>
          </div>
          <div className="patient-header">
            <div className="recipe-box">
              <span>No. Resep</span>
              <strong>{patient.no_resep}</strong>
            </div>

            <div className="patient-box">
              <span>Nama Pasien</span>
              <h1>{patient.nama_pasien}</h1>
            </div>
          </div>
          <div className="display-stepper">
            {steps.map((step, idx) => {
              const Icon = stepIcons[step];

              return (
                <div
                  key={step}
                  className={`display-step ${currentStep >= idx ? "active" : ""}`}
                >
                  <div
                    className={`display-icon ${step} ${
                      currentStep >= idx ? "done" : ""
                    }`}
                  >
                    <Icon
                      size={62}
                      strokeWidth={2.5}
                      className={currentStep === idx ? "active-icon" : ""}
                    />
                  </div>

                  <h4>{stepLabel[step]}</h4>

                  <p>
                    {step === "resep_masuk" && "Resep telah diterima"}
                    {step === "validasi_farmasi" && "Sedang divalidasi"}
                    {step === "proses" && "Obat sedang disiapkan"}
                    {step === "penyerahan" && "Obat siap diambil"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
