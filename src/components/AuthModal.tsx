import { useState } from "react";
import { login, register, type AuthUser } from "../lib/auth";
import "./auth-modal.css";

type Tab = "login" | "register";
type Status = "idle" | "loading" | "error";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialTab?: Tab;
}

export default function AuthModal({ onClose, onSuccess, initialTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function switchTab(next: Tab) {
    setTab(next);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setStatus("error");
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }
    if (tab === "register" && password.length < 8) {
      setStatus("error");
      setErrorMsg("Password minimal 8 karakter.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const user = tab === "login" ? await login(email, password) : await register(email, password);
      onSuccess(user);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Masuk atau daftar akun">
      <div className="auth-backdrop" onClick={onClose} />
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose} aria-label="Tutup">
          &times;
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "auth-tab-active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Masuk
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "auth-tab-active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Daftar
          </button>
        </div>

        <div className="auth-form">
          <label className="auth-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            className="auth-input"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />

          <label className="auth-label" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            className="auth-input"
            placeholder={tab === "register" ? "Minimal 8 karakter" : "Password kamu"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === "loading"}
          />

          {status === "error" && (
            <p className="auth-error" role="alert">
              {errorMsg}
            </p>
          )}

          <button className="btn btn-primary auth-submit" onClick={handleSubmit} disabled={status === "loading"}>
            {status === "loading"
              ? tab === "login"
                ? "Masuk…"
                : "Membuat akun…"
              : tab === "login"
                ? "Masuk"
                : "Buat akun"}
          </button>
        </div>
      </div>
    </div>
  );
}
