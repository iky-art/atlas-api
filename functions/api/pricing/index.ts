// functions/api/pricing/index.ts
// GET /api/pricing → daftar plan & harga transparan, dipakai landing page biar gak hardcode angka dobel.

import { PLANS } from "../../_lib/plans";

export const onRequestGet: PagesFunction = async () => {
  return Response.json({
    currency: "IDR",
    plans: Object.values(PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.priceIdr,
      priceDisplay: p.priceIdr === 0 ? "Gratis" : `Rp${p.priceIdr.toLocaleString("id-ID")}/bulan`,
      requestsPerWeek: p.requestsPerWeek,
      features: p.features,
    })),
    note: "Kuota mingguan, reset otomatis. Tidak ada biaya tersembunyi — kelebihan pemakaian akan diblokir (429), bukan ditagih otomatis.",
  });
};
