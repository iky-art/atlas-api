import "./how-it-works.css";

const STEPS = [
  {
    n: "01",
    title: "Ambil API key",
    body: "Generate key gratis, langsung aktif. Tanpa kartu kredit, tanpa proses approval.",
    code: `POST /api/keys`,
  },
  {
    n: "02",
    title: "Panggil satu endpoint",
    body: "Kirim request ke /api/chat/:provider dengan API key kamu di header Authorization.",
    code: `POST /api/chat/groq
Authorization: Bearer atlas_live_...`,
  },
  {
    n: "03",
    title: "Atlas yang urus rute",
    body: "Request diteruskan ke provider pilihan, kuota mingguan kamu jalan otomatis di background.",
    code: `→ Gemini · Groq · OpenRouter
→ Hugging Face · NVIDIA`,
  },
];

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="section how">
      <div className="container">
        <div className="eyebrow">Cara kerja</div>
        <h2 className="how-title">Tiga langkah, dari nol ke request pertama</h2>

        <div className="how-grid">
          {STEPS.map((s) => (
            <div className="how-step" key={s.n}>
              <span className="how-num mono">{s.n}</span>
              <h3 className="how-step-title">{s.title}</h3>
              <p className="how-step-body">{s.body}</p>
              <pre className="how-code mono">{s.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
