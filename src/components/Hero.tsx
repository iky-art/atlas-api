import RoutingDiagram from "./RoutingDiagram";
import "./hero.css";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">Atlas API — v1</div>
          <h1 className="hero-title">
            Satu API key.
            <br />
            Lima provider AI.
            <br />
            <span className="hero-title-accent">Nol drama.</span>
          </h1>
          <p className="hero-sub">
            Panggil Gemini, Groq, OpenRouter, Hugging Face, atau NVIDIA lewat satu
            endpoint yang sama. Atlas yang urus routing-nya — kamu tinggal fokus
            bangun produk.
          </p>
          <div className="hero-actions">
            <a href="#mulai" className="btn btn-primary">
              Ambil API key gratis
            </a>
            <a href="#cara-kerja" className="btn btn-secondary">
              Lihat cara kerjanya
            </a>
          </div>
          <p className="hero-note mono">
            500 request/minggu gratis · tanpa kartu kredit
          </p>
        </div>
        <div className="hero-visual" aria-hidden="false">
          <RoutingDiagram />
        </div>
      </div>
    </section>
  );
}
