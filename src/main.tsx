import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSiteAccelerator } from "./lib/siteAccelerator";

createRoot(document.getElementById("root")!).render(<App />);
initializeSiteAccelerator();
