import "./providers.css";

const PROVIDERS = [
  { id: "gemini", name: "Gemini", desc: "Model Google, kuat untuk konteks panjang dan multimodal." },
  { id: "groq", name: "Groq", desc: "Inference tercepat di kelasnya, cocok buat respons real-time." },
  { id: "openrouter", name: "OpenRouter", desc: "Gerbang ke ratusan model open dan proprietary sekaligus." },
  { id: "hf", name: "Hugging Face", desc: "Akses ke model open-source dari komunitas HF Inference." },
  { id: "nvidia", name: "NVIDIA", desc: "Model NIM dari NVIDIA, dioptimalkan untuk performa GPU." },
];

export default function Providers() {
  return (
    <section id="provider" className="section providers">
      <div className="container">
        <div className="eyebrow">Provider yang didukung</div>
        <h2 className="providers-title">Rute yang sudah tersambung dari hari pertama</h2>
        <p className="providers-sub">
          Ganti provider tinggal ganti satu segmen URL — payload dan cara autentikasi tetap sama.
        </p>

        <div className="providers-grid">
          {PROVIDERS.map((p) => (
            <div className="provider-card" key={p.id}>
              <div className="provider-card-top">
                <span className="provider-dot" aria-hidden="true" />
                <span className="provider-name">{p.name}</span>
              </div>
              <p className="provider-desc">{p.desc}</p>
              <code className="provider-path mono">/api/chat/{p.id}</code>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
