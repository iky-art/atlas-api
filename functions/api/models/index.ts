// functions/api/models/index.ts
// Endpoint: GET /api/models
// Mengembalikan daftar model yang tersedia per provider (buat ditampilkan di landing page / dashboard).

export const onRequestGet: PagesFunction = async () => {
  const models = {
    gemini: ["gemini-2.5-flash", "gemini-2.5-pro"],
    groq: ["llama-3.3-70b", "mixtral-8x7b"],
    openrouter: ["varies-by-model"],
    hf: ["varies-by-model"],
    nvidia: ["varies-by-model"],
  };

  return Response.json(models);
};
