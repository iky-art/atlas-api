import { useState } from "react";
import { generateApiKey, type GenerateKeyResponse } from "../lib/api";
import { getStoredSession, type AuthUser } from "../lib/auth";
import "./api-key-generator.css";

type Status = "idle" | "loading" | "success" | "error";

interface ApiKeyGeneratorProps {
  user: AuthUser | null;
  onRequireAuth: () => void;
}

export default function ApiKeyGenerator({ user, onRequireAuth }: ApiKeyGeneratorProps) {
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<GenerateKeyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const token = getStoredSession();
    if (!user || !token) {
      onRequireAuth();
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await generateApiKey(token, label.trim() || undefined);
      setResult(res);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setStatus("error");
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API bisa gagal di beberapa browser/permission — key tetap
      // terlihat di layar jadi user masih bisa copy manual.
    }
  }

  return (
    <section id="mulai" className="section keygen">
      <div className="container keygen-inner">
        <div className="card keygen-card">
          <div className="eyebrow">Mulai sekarang</div>
          <h2 className="keygen-title">Buat API key gratis</h2>
          <p className="keygen-sub">
            {user
              ? "Aktif langsung, 500 request/minggu. Simpan key-nya baik-baik — hanya ditampilkan satu kali."
              : "Masuk atau daftar dulu untuk membuat API key yang terhubung ke akun kamu."}
          </p>

          {!user && status !== "success" && (
            <button className="btn btn-primary keygen-submit" onClick={onRequireAuth}>
              Masuk / Daftar untuk lanjut
            </button>
          )}

          {user && status !== "success" && (
            <div className="keygen-form">
              <label htmlFor="key-label" className="keygen-label">
                Nama key (opsional)
              </label>
              <input
                id="key-label"
                type="text"
                className="keygen-input"
                placeholder="Contoh: Atlas Academy prod"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={status === "loading"}
              />
              <button
                className="btn btn-primary keygen-submit"
                onClick={handleGenerate}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Membuat key…" : "Buat API key"}
              </button>

              {status === "error" && (
                <p className="keygen-error" role="alert">
                  {errorMsg} — coba lagi, atau hubungi kami kalau terus terjadi.
                </p>
              )}
            </div>
          )}

          {status === "success" && result && (
            <div className="keygen-result">
              <div className="keygen-key-row">
                <code className="keygen-key mono">{result.apiKey}</code>
                <button className="btn btn-secondary keygen-copy" onClick={handleCopy}>
                  {copied ? "Tersalin" : "Salin"}
                </button>
              </div>
              <p className="keygen-warning">{result.message}</p>
              <div className="keygen-meta mono">
                plan: {result.plan} · kuota: {result.weeklyLimit.toLocaleString("id-ID")} req/minggu
              </div>
              <button
                className="keygen-again"
                onClick={() => {
                  setStatus("idle");
                  setResult(null);
                  setLabel("");
                }}
              >
                Buat key lain
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
