"use client";

import { useEffect, useState } from "react";
import AnimateOnScroll from "./AnimateOnScroll";

/* ── Workflow Builder Mockup ── */
function WorkflowMockup() {
  const [activeNode, setActiveNode] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setActiveNode((prev) => (prev + 1) % 4), 2000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { label: "Jira Trigger", color: "#3b82f6" },
    { label: "AI Analyze", color: "#8b5cf6" },
    { label: "Git Branch", color: "#22c55e" },
    { label: "Slack Notify", color: "#f59e0b" },
  ];

  return (
    <div>
      <div className="flex items-center justify-center gap-3 py-6">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${activeNode === i ? "scale-110" : "scale-100 opacity-50"}`}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-500"
                style={{
                  borderColor: activeNode === i ? node.color : "rgba(255,255,255,0.08)",
                  backgroundColor: activeNode === i ? `${node.color}15` : "rgba(255,255,255,0.03)",
                  boxShadow: activeNode === i ? `0 0 24px ${node.color}20` : "none",
                }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color, opacity: activeNode === i ? 1 : 0.3 }} />
              </div>
              <span className="text-[9px] text-white/40">{node.label}</span>
            </div>
            {i < 3 && <div className="w-8 h-px bg-white/10 mb-5" />}
          </div>
        ))}
      </div>
      <div className="text-center">
        <span className="text-[10px] text-white/25">
          {activeNode === 0 && "Listening for new issues..."}
          {activeNode === 1 && "AI analyzing requirements..."}
          {activeNode === 2 && "Creating feature branch..."}
          {activeNode === 3 && "Team notified in #dev"}
        </span>
      </div>
    </div>
  );
}

/* ── AI Code Review Mockup ── */
function AIMockup() {
  const [charCount, setCharCount] = useState(0);
  const fullText = "The PR looks good overall. Found 2 potential issues: Missing null check in handleAuth() and SQL query should use parameterized queries to prevent injection.";

  useEffect(() => {
    const cycle = () => {
      setCharCount(0);
      let i = 0;
      const typeInterval = setInterval(() => {
        i += 2;
        setCharCount(Math.min(i, fullText.length));
        if (i >= fullText.length) { clearInterval(typeInterval); setTimeout(cycle, 4000); }
      }, 25);
    };
    const initial = setTimeout(cycle, 1000);
    return () => clearTimeout(initial);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 px-1 mb-3">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] text-white/15">AI Code Review</span>
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/5 h-[140px] overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
          </div>
          <span className="text-[10px] text-white/30">Claude AI</span>
          {charCount < fullText.length && <span className="text-[9px] text-[#8b5cf6]/50 ml-auto">analyzing...</span>}
        </div>
        <p className="text-[12px] text-white/60 leading-relaxed">
          {fullText.slice(0, charCount)}
          {charCount < fullText.length && <span className="inline-block w-0.5 h-3 bg-[#8b5cf6] ml-px animate-pulse" />}
        </p>
      </div>
    </div>
  );
}

/* ── Git Automation Mockup ── */
function GitMockup() {
  const [step, setStep] = useState(0);
  const cmds = [
    { text: "$ git checkout -b feat/PROJ-42", color: "text-white/40" },
    { text: "$ git commit -m \"feat: auth flow\"", color: "text-white/40" },
    { text: "$ gh pr create --base main", color: "text-white/40" },
    { text: "✓ PR #47 created", color: "text-emerald-400" },
  ];

  useEffect(() => {
    const cycle = () => {
      setStep(0);
      let i = 0;
      const interval = setInterval(() => { i++; setStep(i); if (i >= cmds.length) { clearInterval(interval); setTimeout(cycle, 4000); } }, 1000);
    };
    const initial = setTimeout(cycle, 500);
    return () => clearTimeout(initial);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 px-1 mb-3">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] text-white/15">Terminal</span>
      </div>
      <div className="font-mono text-[12px] space-y-2 min-h-[120px]">
        {cmds.slice(0, step + 1).map((cmd, i) => (
          <div key={i} className={cmd.color}>{cmd.text}</div>
        ))}
        {step < cmds.length - 1 && <div className="w-2 h-3 bg-white/30 animate-pulse inline-block" />}
      </div>
    </div>
  );
}

/* ── Spinning integration circle with real icons ── */
function IntegrationsCircle() {
  const integrations = [
    { name: "Jira", svg: <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" fill="#2684FF"/> },
    { name: "GitHub", svg: <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="white"/> },
    { name: "GitLab", svg: <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z" fill="#FC6D26"/> },
    { name: "Slack", svg: <><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/><path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/><path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/><path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/></> },
    { name: "Discord", svg: <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" fill="#5865F2"/> },
    { name: "Telegram", svg: <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="#26A5E4"/> },
    { name: "Linear", svg: <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" fill="#5E6AD2"/> },
    { name: "Claude", svg: <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" fill="#D4A27F"/> },
    { name: "OpenAI", svg: <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10a37f"/> },
  ];

  return (
    <div className="py-4">
      <div className="relative w-52 h-52 md:w-64 md:h-64 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">10+</div>
            <div className="text-[10px] text-white/30 mt-1">Integrations</div>
          </div>
        </div>
        <div className="absolute inset-0" style={{ animation: "spin-slow 30s linear infinite" }}>
          {integrations.map((int, i) => {
            const angle = (i / integrations.length) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 42 * Math.cos(rad);
            const y = 50 + 42 * Math.sin(rad);
            return (
              <div key={int.name} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", animation: "spin-slow-reverse 30s linear infinite" }}>
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center" title={int.name}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5">{int.svg}</svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Feature Section (alternating layout) ── */
function FeatureSection({ title, description, children, reverse = false }: { title: string; description: string; children: React.ReactNode; reverse?: boolean }) {
  return (
    <AnimateOnScroll>
      <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-8 md:gap-12 items-center mb-20 md:mb-28`}>
        <div className="flex-1 max-w-lg">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{title}</h3>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">{description}</p>
        </div>
        <div className="flex-1 w-full">
          <div className="bg-[#0f0f1a] rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/20 border border-white/5">
            {children}
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateOnScroll>
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[#a78bfa] bg-clip-text text-transparent">automate</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Build powerful development automations without writing glue code.
            </p>
          </div>
        </AnimateOnScroll>

        <FeatureSection
          title="Visual workflow builder"
          description="Drag and drop nodes to build automations. Connect triggers, AI agents, git operations, and notifications. See your pipeline execute in real-time with step-by-step progress."
        >
          <WorkflowMockup />
        </FeatureSection>

        <FeatureSection
          title="AI agents that understand your code"
          description="Built-in agents for code review, analysis, and generation. Bring your own API keys for Claude, OpenAI, or any provider. Keys encrypted with AES-256, never leave your server."
          reverse
        >
          <AIMockup />
        </FeatureSection>

        <FeatureSection
          title="End-to-end git automation"
          description="From Jira ticket to merged PR without touching the terminal. Clone repos, create branches, commit changes, and open pull requests — all automated."
        >
          <GitMockup />
        </FeatureSection>

        <FeatureSection
          title="Connect everything, no webhooks needed"
          description="Polling-based triggers work behind NAT — no public URL required. Connect Jira, GitHub, GitLab, Slack, Discord, and Telegram. Just add your token and activate."
          reverse
        >
          <IntegrationsCircle />
        </FeatureSection>
      </div>
    </section>
  );
}
