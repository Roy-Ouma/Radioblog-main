import { Routes, Route, Outlet } from "react-router-dom";
import * as Sentry from '@sentry/react';
import Home from "./pages/Home";
import Live from "./pages/Live";
import CategoriesPage from "./pages/CategoriesPage";
import BlogDetails from "./pages/BlogDetails";
import WriterPage from "./pages/WriterPage";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import { LoginPage, SignupPage } from "./pages";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Podcasts from "./pages/Podcasts";
import PodcastShowDetail from "./pages/PodcastShowDetail";
import PodcastDetail from "./pages/PodcastDetail";
import useStore from "./store";
import { useEffect } from "react";
import Contact from "./pages/Contact"; // Add this import
import About from "./pages/About"; // Add this import

// Initialize Sentry for error tracking (optional - requires REACT_APP_SENTRY_DSN env var)
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [new Sentry.Replay()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}


function Layout () {
  return (
    <div className="w-full flex flex-col
     min-h-screen px-4 md:px-8 2xl:px-32">
    { /* <Navbar/> */}
    <Navbar />


     <div className="flex-1">
      <Outlet />
     </div>
     <Footer/>
    </div>
  );
}



function App() {
  // guard against useStore() being null/undefined during startup
  const store = useStore() || {};
  const isLoading = store?.isLoading ?? false;

  // Apply theme class to <html> for Tailwind dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (store?.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [store?.theme]);

  return (
    <>
      {/* Global transparent loader overlay - appears above all content */}
      {isLoading && <Loading />}

      <div className="App">
        <main>
          <div className="w-full min-h-screen relative bg-white dark:bg-[#020b19]">
            <Routes>
              <Route element={<Layout />}> 
                <Route path="/" element={<Home />} />
                <Route path="/category" element={<CategoriesPage />} />
                <Route path="/podcasts" element={<Podcasts />} />
                <Route path="/podcasts/:id" element={<PodcastShowDetail />} />
                <Route path="/podcast/:id" element={<PodcastDetail />} />
                <Route path="/blog" element={<Home />} />
                <Route path="/live" element={<Live />} />
                <Route path="/:slug/:id?" element={<BlogDetails />} />
                <Route path="/writer/:id" element={<WriterPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
              </Route>
              {/* Auth routes */}
              <Route path="/sign-up" element={<SignupPage />} />
              <Route path="/sign-in" element={<LoginPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
