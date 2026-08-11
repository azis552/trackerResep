import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./App.css";
import "@fontsource/poppins";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";

import Dashboard from "./Dashboard.jsx";
import App from "./App.jsx";
import Display from "./Display.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tracker" element={<App />} />
      <Route path="/display" element={<Display />} />
    </Routes>
  </BrowserRouter>,
);
