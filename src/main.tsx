
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

console.log('[NutriGo] API_BASE_URL =', API_BASE_URL);


  createRoot(document.getElementById("root")!).render(<App />);
  