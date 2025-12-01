import React, { useState } from "react";
import { FaYoutube, FaFacebookF, FaBroadcastTower, FaShareAlt, FaGlobe } from "react-icons/fa";
import { toast } from "sonner";

const YOUTUBE_URL = "https://www.youtube.com/@MasenoRadio/live";
const RADIO_API_URL = "https://your-radio-api-url.com/stream";
const FACEBOOK_URL = "https://www.facebook.com/masenoradio/live";

const TABS = [
  { key: "youtube", label: "YouTube", icon: FaYoutube, color: "text-red-600" },
  { key: "facebook", label: "Facebook", icon: FaFacebookF, color: "text-blue-600" },
  { key: "radio", label: "Radio", icon: FaBroadcastTower, color: "text-orange-500" },
];

const Live = () => {
  const [activeTab, setActiveTab] = useState("youtube");

  const handleShare = async () => {
    let url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Maseno Radio Live", url });
      } catch (e) {
        // user cancelled or unsupported
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch (e) {
        // fallback
        alert("Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="w-full px-4 py-12 md:py-16 2xl:py-20 md:px-10 2xl:px-20 space-y-12">
      {/* Header Section */}
      <section className="space-y-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500">Live Broadcast</h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
          Watch or listen to Maseno Radio live across multiple platforms
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <FaGlobe className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="text-sm text-slate-700 dark:text-slate-300">masenoradio.live</span>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition"
            aria-label="Share live page"
          >
            <FaShareAlt className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border transition-all duration-200 focus:outline-none ${
                activeTab === tab.key
                  ? `bg-gradient-to-r from-orange-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-md ${tab.color}`
                  : `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105`
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className={`w-5 h-5 ${tab.color}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="w-full max-w-5xl mx-auto">
        {activeTab === "youtube" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-orange-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <FaYoutube className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Watch on YouTube</h2>
            </div>
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/live_stream?channel=UC4a-Gbdw7vOaccHmFo40b9g"
                title="YouTube Live"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white font-semibold"
              >
                <FaYoutube />
                <span>Open on YouTube</span>
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(YOUTUBE_URL).then(() => toast.success('YouTube link copied'))}
                className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300"
              >
                Copy Link
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Join thousands of viewers watching our live broadcast</p>
          </div>
        )}

        {activeTab === "facebook" && (
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-blue-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <FaFacebookF className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-600">Facebook Live</h2>
            </div>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <span className="inline-block px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-full text-lg animate-pulse shadow-lg">COMING SOON</span>
              <p className="text-gray-600 dark:text-gray-300 text-center text-base">Our Facebook Live stream will be available here soon. Stay tuned!</p>
              <div className="flex gap-2 mt-2">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-blue-600 text-white">Visit Facebook</a>
                <button onClick={() => navigator.clipboard.writeText(FACEBOOK_URL).then(() => toast.success('Facebook link copied'))} className="px-3 py-2 rounded-md border">Copy Link</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "radio" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-orange-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <FaBroadcastTower className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-orange-500">Listen to Radio</h2>
            </div>
            <div className="space-y-4">
              <audio controls className="w-full h-12 rounded-lg">
                <source src={RADIO_API_URL} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <div className="flex gap-2">
                <a href={RADIO_API_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-orange-600 text-white">Open Stream</a>
                <button onClick={() => navigator.clipboard.writeText(RADIO_API_URL).then(() => toast.success('Stream link copied'))} className="px-3 py-2 rounded-md border">Copy Link</button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enjoy our radio stream live on this page. No need to open a new tab!</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <section className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Stream Quality Tips</h3>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            Ensure you have a stable internet connection for smooth playback
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            Use the latest version of your browser for best experience
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            Share this page with friends to grow our community
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Live;