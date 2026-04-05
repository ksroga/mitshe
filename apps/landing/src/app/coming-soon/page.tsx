"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/8 rounded-full blur-[200px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md relative"
      >
        <img src="/logo.svg" alt="mitshe" className="w-12 h-12 mx-auto mb-8" />

        <h1 className="text-4xl font-bold text-white mb-3">
          <span className="font-brand">mitshe</span> Cloud
        </h1>

        <p className="text-white/30 mb-8 leading-relaxed">
          Managed AI workflow automation. Same power, zero infrastructure.
          <br />
          Launching soon.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            <span className="text-sm text-emerald-400">You&apos;re on the list. We&apos;ll be in touch.</span>
          </motion.div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-all flex-shrink-0"
            >
              Join waitlist
            </button>
          </form>
        )}

        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-white/20">
          <a href="https://mitshe.com" className="hover:text-white/40 transition-colors">Home</a>
          <a href="https://github.com/mitshe/mitshe" className="hover:text-white/40 transition-colors">GitHub</a>
          <a href="https://docs.mitshe.com" className="hover:text-white/40 transition-colors">Docs</a>
        </div>
      </motion.div>
    </div>
  );
}
