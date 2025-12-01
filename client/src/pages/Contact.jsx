import React from "react";

const Contact = () => (
  <div className="w-full px-4 py-12 md:py-16 2xl:py-20 md:px-10 2xl:px-20 space-y-12">
    {/* Header Section */}
    <section className="space-y-4 max-w-2xl">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
        Get In Touch
      </h1>
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
        We'd love to hear from you. Have a question or feedback? Reach out to us.
      </p>
    </section>

    {/* Contact Methods Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Email Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700 space-y-4">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Email</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Send us an email and we'll respond as soon as possible.
        </p>
        <a 
          href="mailto:info@example.com" 
          className="inline-block text-blue-600 dark:text-blue-400 font-semibold hover:underline text-lg"
        >
          info@masenoradio.com
        </a>
      </div>

      {/* Response Time Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-8 border border-green-200 dark:border-green-700 space-y-4">
        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Response Time</h3>
        <p className="text-slate-600 dark:text-slate-400">
          We typically respond to inquiries within 24-48 hours.
        </p>
        <span className="inline-block px-4 py-2 bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 rounded-full font-semibold text-sm">
          Usually Fast ✓
        </span>
      </div>
    </div>

    {/* Message */}
    <section className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 max-w-2xl">
      <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
        Whether you have a question about content, want to collaborate, or just want to say hello, 
        feel free to reach out. We appreciate your interest and feedback!
      </p>
    </section>
  </div>
);

export default Contact;