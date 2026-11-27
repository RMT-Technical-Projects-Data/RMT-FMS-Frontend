import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiUsers,
  FiFolder,
  FiShare2,
} from "react-icons/fi";
import Logo from "/ReviveMedicalTech.png";
import DrMurtaza from "../assets/DrMurtaza.jpeg";
import Ammad from "../assets/Ammad.png";
import soal from "../assets/soal.jpg";

const features = [
  {
    title: "Granular permissions",
    description:
      "Control view and download access at file and folder level with precision.",
    icon: FiShield,
  },
  {
    title: "User management",
    description:
      "Create accounts and assign roles so the right people reach the right records.",
    icon: FiUsers,
  },
  {
    title: "Structured storage",
    description:
      "Organize documents in nested folders with a clear path and archive trail.",
    icon: FiFolder,
  },
  {
    title: "Controlled sharing",
    description:
      "Share internally with permission-based access instead of scattered copies.",
    icon: FiShare2,
  },
];

const leaders = [
  {
    name: "Dr. Murtaza Najabat Ali",
    role: "Chief Executive Officer",
    avatar: DrMurtaza,
  },
  {
    name: "Ammad Ahmed",
    role: "Chief Production Officer",
    avatar: Ammad,
  },
  {
    name: "Suhail Meghwar",
    role: "Quality Manager",
    avatar: soal,
  },
];

const Hero: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header
        className={`sticky top-0 z-40 transition-colors ${
          isScrolled
            ? "bg-paper/95 backdrop-blur border-b border-rule"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center max-w-[180px]">
            <img
              src={Logo}
              alt="Revive Medical Technologies"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium inline-flex items-center hover:bg-ink-soft"
          >
            {isLoggedIn ? "Open Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      {/* Hero — brand first, one composition */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0b1622]" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(ellipse_at_20%_20%,#5aa6e6,transparent_50%),radial-gradient(ellipse_at_80%_60%,#1f7a5a,transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20 w-full text-white">
          <img
            src={Logo}
            alt="Revive Medical Technologies"
            className="h-14 md:h-20 w-auto object-contain mix-blend-lighten mb-8"
          />
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            Document control built for medical teams
          </h1>
          <p className="mt-4 text-[#b8c6d3] text-base md:text-lg max-w-xl leading-relaxed">
            EDMS keeps files, folders, stamps, and permissions in one secure
            workspace for Revive Medical Technologies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={isLoggedIn ? "/dashboard" : "/login"}
              className="h-11 px-5 rounded-md bg-white text-[#0b1622] text-sm font-semibold inline-flex items-center hover:bg-[#f3f1ea]"
            >
              {isLoggedIn ? "Open Dashboard" : "Sign in to EDMS"}
            </Link>
            <a
              href="#features"
              className="h-11 px-5 rounded-md border border-[#2a4258] text-[#b8c6d3] text-sm font-medium inline-flex items-center hover:text-white hover:border-[#5aa6e6]"
            >
              See capabilities
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Built for controlled documents
          </h2>
          <p className="mt-2 text-muted max-w-2xl text-[15px]">
            Everything your team needs to store, share, and audit files without
            losing the paper trail.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="min-w-0">
                  <span className="h-9 w-9 rounded-md bg-[#0b1622] text-white inline-flex items-center justify-center">
                    <Icon size={16} />
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-6 border-t border-rule bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Leadership
          </h2>
          <p className="mt-2 text-muted text-[15px] max-w-xl">
            Guided by the team building safer medical technology workflows.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {leaders.map((person) => (
              <div key={person.name} className="text-center sm:text-left">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-28 h-28 rounded-full object-cover mx-auto sm:mx-0 border border-rule"
                />
                <h3 className="mt-4 text-[15px] font-semibold">{person.name}</h3>
                <p className="text-sm text-muted">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-rule py-8 px-4 md:px-6 bg-[#0b1622] text-[#8aa2b8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} Revive Meditech Pvt Ltd</p>
          <Link to="/login" className="hover:text-white">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
