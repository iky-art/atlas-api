import { useEffect, useState } from "react";
import { fetchPricing, FALLBACK_PRICING, type PricingResponse } from "../lib/api";
import "./pricing.css";

export default function Pricing() {
  const [data, setData] = useState<PricingResponse>(FALLBACK_PRICING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPricing().then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="harga" className="section pricing">
      <div className="container">
        <div className="eyebrow">Harga</div>
        <h2 className="pricing-title">Transparan dari awal — bukan &ldquo;hubungi sales&rdquo;</h2>
        <p className="pricing-sub">
          Dua plan, kuota jelas, tanpa biaya kelebihan pakai otomatis. Kalau kuota
          mingguan habis, request diblokir dengan pesan jelas — bukan tagihan mendadak.
        </p>

        <div className="pricing-grid" aria-busy={loading}>
          {data.plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.id === "pro" ? "pricing-card-pro" : ""}`}
            >
              {plan.id === "pro" && <span className="pricing-badge">Paling banyak dipakai</span>}
              <h3 className="pricing-plan-name">{plan.name}</h3>
              <div className="pricing-price">
                <span className="pricing-price-amount">{plan.priceDisplay}</span>
              </div>
              <p className="pricing-quota mono">
                {plan.requestsPerWeek.toLocaleString("id-ID")} request / minggu
              </p>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                href="#mulai"
                className={`btn ${plan.id === "pro" ? "btn-primary" : "btn-secondary"} pricing-cta`}
              >
                {plan.id === "pro" ? "Mulai dengan Pro" : "Mulai gratis"}
              </a>
            </div>
          ))}
        </div>

        <p className="pricing-note mono">{data.note}</p>
      </div>
    </section>
  );
}
