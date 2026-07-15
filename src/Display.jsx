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
  const [current, setCurrent] = useState(0);
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

  const priority = {
    resep_masuk: 1,
    validasi_farmasi: 2,
    proses: 3,
    penyerahan: 4,
  };

  const getLastActivityTime = (item) => {
    switch (item.status_akhir) {
      case "penyerahan":
        return item.waktu.penyerahan;

      case "proses":
        return item.waktu.proses;

      case "validasi_farmasi":
        return item.waktu.validasi_farmasi;

      default:
        return item.waktu.resep_masuk;
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${API_URL}/reseptracker/?action=list&jenis=rajal`,
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
        const timeA = new Date(getLastActivityTime(a)).getTime();
        const timeB = new Date(getLastActivityTime(b)).getTime();

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return priority[b.status_akhir] - priority[a.status_akhir];
      });

      setPatients((old) => {
        if (JSON.stringify(old) === JSON.stringify(sortedPatients)) {
          return old;
        }

        return sortedPatients;
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

  useEffect(() => {
    if (!patients.length) return;

    const slide = setInterval(() => {
      setCurrent((prev) => (prev + 1) % patients.length);
    }, 5000);

    return () => clearInterval(slide);
  }, [patients]);

  useEffect(() => {
    if (current >= patients.length && patients.length > 0) {
      setCurrent(0);
    }
  }, [patients, current]);

  const patient = useMemo(() => {
    return patients[current] || null;
  }, [patients, current]);

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
