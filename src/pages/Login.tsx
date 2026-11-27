import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import { useLogin } from "../hooks/useAuth";
import Logo from "/ReviveMedicalTech.png";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const login = useLogin();
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem("edms_remember_user");
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    login.mutate(
      { username, password },
      {
        onSuccess: (data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (rememberMe) {
            localStorage.setItem("edms_remember_user", username);
          } else {
            localStorage.removeItem("edms_remember_user");
          }
          navigate("/dashboard");
        },
        onError: () => {
          setLoginError("Login failed. Check your username and password.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      <aside className="hidden md:flex w-[42%] bg-[#0b1622] text-white flex-col justify-between p-10 lg:p-14">
        <div>
          <Link to="/" className="inline-block max-w-[240px]">
            <img
              src={Logo}
              alt="Revive Medical Technologies"
              className="w-full h-auto object-contain mix-blend-lighten"
            />
          </Link>
          <h1 className="mt-10 text-3xl font-semibold tracking-tight leading-tight">
            Electronic Document
            <br />
            Management System
          </h1>
          <p className="mt-4 text-[#8aa2b8] text-[15px] max-w-sm leading-relaxed">
            Secure file and folder control for Revive Medical Technologies —
            permissions, archive, and audit in one place.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-[#b8c6d3]">
          <li className="flex gap-2">
            <span className="text-[#5aa6e6]">—</span>
            Granular view and download permissions
          </li>
          <li className="flex gap-2">
            <span className="text-[#5aa6e6]">—</span>
            Hierarchical folders with stamp-aware PDFs
          </li>
          <li className="flex gap-2">
            <span className="text-[#5aa6e6]">—</span>
            Full activity audit for super admins
          </li>
        </ul>
      </aside>

      <main className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="md:hidden mb-8 max-w-[200px]">
          <img
            src={Logo}
            alt="Revive Medical Technologies"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted">
            Use your EDMS account to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {loginError && (
              <div className="rounded-md border border-[#f5c2c0] bg-[#fdecea] px-3 py-2.5 text-sm text-[#b42318]">
                {loginError}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-[13px] font-medium text-ink mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9384]"
                  size={15}
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-md border border-rule bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand-dark"
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-ink mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9384]"
                  size={15}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 rounded-md border border-rule bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand-dark"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink rounded"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((v) => !v)}
                className="rounded border-rule"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full h-11 rounded-md bg-[#0b1622] text-white text-sm font-medium hover:bg-ink-soft disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {login.isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {login.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            <Link to="/" className="hover:text-ink underline-offset-2 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
