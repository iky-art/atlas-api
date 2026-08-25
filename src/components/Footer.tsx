import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand mono">Atlas API</div>
        <p className="footer-copy">
          Gateway eksperimental ke Gemini, Groq, OpenRouter, Hugging Face, dan
          NVIDIA. Status: v1, aktif dikembangkan.
        </p>
        <div className="footer-links">
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#provider">Provider</a>
          <a href="#harga">Harga</a>
        </div>
      </div>
    </footer>
  );
}
