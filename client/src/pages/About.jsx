import React from "react";
import BannerModal from "../components/BannerModal";

const About = () => (
  <div className="w-full space-y-16">
    {/* Professional Artistic Hero Section */}
    <div className="relative w-full overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 opacity-60"></div>
      
      {/* Animated Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-rose-300/20 rounded-full blur-3xl -mr-48 -mt-24 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-orange-300/20 rounded-full blur-3xl -ml-40 -mb-20 animate-pulse" style={{animationDelay: "1s"}}></div>

      {/* Content Container */}
      <div className="relative px-4 md:px-10 2xl:px-20 py-16 md:py-24 2xl:py-32 space-y-10">
        {/* Header Section with Animation */}
        <section className="space-y-6 max-w-4xl">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-orange-600 to-slate-900 dark:from-white dark:via-orange-400 dark:to-white leading-tight">
              About Maseno Radio
            </h1>
            <p className="text-lg md:text-xl 2xl:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium max-w-2xl">
              Discover our story, mission, and the authentic voices behind the platform that connects our community worldwide.
            </p>
          </div>

          {/* Accent Line */}
          <div className="flex items-center gap-3 pt-4">
            <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"></div>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Your Connection Hub</span>
          </div>
        </section>

        {/* Featured Banner CTA */}
        <div className="w-full pt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000" style={{animationDelay: "200ms"}}>
          <div className="rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 origin-left">
            <BannerModal />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Section */}
    <div className="w-full px-4 md:px-10 2xl:px-20 space-y-16">

    {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6 relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 opacity-60 -z-10" />
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-center text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-orange-600 to-slate-900 dark:from-white dark:via-orange-400 dark:to-white leading-tight">
              Our Mission
            </h2>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium max-w-2xl">
              We are dedicated to bringing quality content, engaging discussions, and authentic voices to our audience. Our platform empowers creators to share their stories and connect with listeners worldwide.
            </p>
          </div>
          <ul className="space-y-3">
            {["Quality Content", "Community First", "Creator Empowerment", "Innovation"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
     
    </section>

    {/* Values Grid */}
    <section className="space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Our Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Authenticity", desc: "Real stories from real people" },
          { title: "Quality", desc: "Excellence in every broadcast" },
          { title: "Community", desc: "Building lasting connections" },
        ].map((value) => (
          <div key={value.title} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{value.title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{value.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Team Highlight */}
    <section className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Powered by Passionate Creators</h2>
      <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
        Our team is composed of dedicated professionals and content creators who believe in the power of audio storytelling 
        and community engagement. Together, we work to deliver the best experience for our listeners and creators.
      </p>
    </section>
    </div>
  </div>
);

export default About;