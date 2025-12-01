import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const AppWithProviders = () => {
  if (clientId) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    );
  }
  return <App />;
};

createRoot(document.getElementById("root")).render(
  <AppWithProviders />
);