import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <MantineProvider>
            <App />
          </MantineProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
