import "./routing-diagram.css";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

// Hub Atlas di tengah, 5 provider tersebar di sekelilingnya —
// menampilkan secara literal apa yang dilakukan produk ini: merutekan.
const PROVIDERS: Node[] = [
  { id: "gemini", label: "Gemini", x: 300, y: 40 },
  { id: "groq", label: "Groq", x: 520, y: 150 },
  { id: "openrouter", label: "OpenRouter", x: 460, y: 380 },
  { id: "nvidia", label: "NVIDIA", x: 140, y: 380 },
  { id: "hf", label: "Hugging Face", x: 80, y: 150 },
];

const HUB = { x: 300, y: 210 };

export default function RoutingDiagram() {
  return (
    <div className="routing-3d-wrap perspective-root">
    <svg
      className="routing-diagram"
      viewBox="0 0 600 440"
      role="img"
      aria-label="Diagram Atlas API merutekan satu request ke lima provider AI: Gemini, Groq, OpenRouter, NVIDIA, dan Hugging Face"
    >
      {/* garis rute */}
      {PROVIDERS.map((p, i) => (
        <line
          key={`line-${p.id}`}
          x1={HUB.x}
          y1={HUB.y}
          x2={p.x}
          y2={p.y}
          className="route-line"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* pulsa data berjalan di sepanjang rute */}
      {PROVIDERS.map((p, i) => (
        <circle
          key={`pulse-${p.id}`}
          r="4"
          className="route-pulse"
          style={{ animationDelay: `${i * 0.35}s` }}
        >
          <animateMotion
            dur="2.6s"
            repeatCount="indefinite"
            begin={`${i * 0.35}s`}
            path={`M${HUB.x},${HUB.y} L${p.x},${p.y}`}
          />
        </circle>
      ))}

      {/* node provider */}
      {PROVIDERS.map((p) => (
        <g key={p.id} className="provider-node">
          <circle cx={p.x} cy={p.y} r="26" className="node-circle" />
          <text x={p.x} y={p.y + 44} textAnchor="middle" className="node-label">
            {p.label}
          </text>
        </g>
      ))}

      {/* hub Atlas */}
      <g className="hub-node">
        <circle cx={HUB.x} cy={HUB.y} r="44" className="hub-ring" />
        <circle cx={HUB.x} cy={HUB.y} r="34" className="hub-circle" />
        <text x={HUB.x} y={HUB.y + 5} textAnchor="middle" className="hub-label">
          ATLAS
        </text>
      </g>
    </svg>
    </div>
  );
}
