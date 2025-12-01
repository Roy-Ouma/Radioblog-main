import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter }from "react-router-dom";
import { GoogleOAuthProviderSafe } from "./components/GoogleOAuthProviderSafe";

const rawClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const clientId = rawClientId ? rawClientId.trim() : rawClientId;

const root = ReactDOM.createRoot(document.getElementById("root"));

// Always wrap with GoogleOAuthProviderSafe
// It will only initialize Google OAuth when clientId is valid
const AppWithProviders = () => {
  return (
    <GoogleOAuthProviderSafe clientId={clientId}>
      <App />
    </GoogleOAuthProviderSafe>
  );
};

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  </React.StrictMode>
);
