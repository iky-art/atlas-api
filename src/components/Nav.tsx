import "./nav.css";
import type { AuthUser } from "../lib/auth";

interface NavProps {
  user: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Nav({ user, onOpenAuth, onLogout }: NavProps) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-brand">
          <span className="nav-brand-mark" aria-hidden="true" />
          Atlas API
        </a>
        <nav className="nav-links" aria-label="Navigasi utama">
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#provider">Provider</a>
          <a href="#harga">Harga</a>

          {user ? (
            <div className="nav-user">
              <span className="nav-user-email mono">{user.email}</span>
              <button className="nav-user-logout" onClick={onLogout}>
                Keluar
              </button>
            </div>
          ) : (
            <button className="btn btn-primary nav-cta" onClick={onOpenAuth}>
              Masuk / Daftar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
