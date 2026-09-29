// Demo content. Every product, price, fee and delay below is illustrative:
// the real catalogue, rates and policies come from Slay'z, not from us.
window.SLZ = {
  config: {
    // After this date the demo shows a "démo expirée" screen. Extend it by editing this line.
    expires: "2026-11-15",
    maker: "Omar",
  },

  categories: [
    { id: "nouveautes", label: "Nouveautés", img: "img/trench-rose-1-s.webp" },
    { id: "trenchs", label: "Trenchs", img: "img/trench-noir-s.webp" },
    { id: "tailleurs", label: "Tailleurs", img: "img/tailleur-bordeaux-s.webp" },
    { id: "abayas", label: "Abayas & kaftans", img: "img/kaftan-noir-s.webp" },
    { id: "robes", label: "Robes", img: "img/robe-perle-s.webp" },
    { id: "hijabs", label: "Hijabs", img: "img/hijab-caramel-s.webp" },
  ],

  sizes: ["XS", "S", "M", "L", "XL"],

  products: [
    {
      id: "trench-rose-poudre", name: "Trench Rose Poudré", cat: ["trenchs", "nouveautes"], price: 590,
      img: ["trench-rose-1", "trench-rose-2"],
      colors: [{ n: "Rose poudré", h: "#e6c3b4" }, { n: "Sable", h: "#cdb89c" }],
      stock: { XS: 0, S: 3, M: 5, L: 2, XL: 0 },
      desc: "Le trench fluide qui habille tout : col revers, ceinture à nouer, manches longues. Se porte ouvert sur une robe ou fermé en robe-manteau.",
      fit: { Longueur: "Mi-mollet (118 cm en M)", Opacité: "Opaque", Doublure: "Non doublé", Élasticité: "Aucune", Mannequin: "1m70, porte un S" },
    },
    {
      id: "tailleur-bordeaux", name: "Tailleur Bordeaux", cat: ["tailleurs", "nouveautes"], price: 890,
      img: ["tailleur-bordeaux"],
      colors: [{ n: "Bordeaux", h: "#5b1a26" }],
      stock: { XS: 1, S: 2, M: 4, L: 3, XL: 1 },
      desc: "Veste croisée à col châle et pantalon droit taille haute. L'ensemble signature, du bureau au dîner.",
      fit: { Longueur: "Veste 72 cm · pantalon 104 cm", Opacité: "Opaque", Doublure: "Veste doublée", Élasticité: "Légère", Mannequin: "1m75, porte un M" },
    },
    {
      id: "abaya-trench-sable", name: "Abaya-Trench Sable", cat: ["abayas", "trenchs"], price: 650,
      img: ["abaya-sable"],
      colors: [{ n: "Sable", h: "#d8b99a" }, { n: "Noir", h: "#1d1a1a" }],
      stock: { XS: 0, S: 4, M: 6, L: 4, XL: 2 },
      desc: "Coupe trench, longueur abaya. Boutonnage discret, poignets resserrés, tombé ample.",
      fit: { Longueur: "Cheville (138 cm en M)", Opacité: "Opaque", Doublure: "Non doublé", Élasticité: "Aucune", Mannequin: "1m64, porte un S" },
    },
    {
      id: "kaftan-noir-brode", name: "Kaftan Noir Brodé", cat: ["abayas", "nouveautes"], price: 790,
      img: ["kaftan-noir"],
      colors: [{ n: "Noir & or", h: "#141212" }],
      stock: { XS: 0, S: 1, M: 2, L: 2, XL: 1 },
      desc: "Kaftan droit en crêpe, broderies dorées à la main sur le plastron et les manches.",
      fit: { Longueur: "Sol (145 cm)", Opacité: "Opaque", Doublure: "Doublé", Élasticité: "Aucune", Mannequin: "1m72, porte un M" },
    },
    {
      id: "robe-longue-perle", name: "Robe Longue Perle", cat: ["robes"], price: 720,
      img: ["robe-perle"],
      colors: [{ n: "Gris perle", h: "#b9c1c9" }, { n: "Rose thé", h: "#e7c6c0" }],
      stock: { XS: 2, S: 3, M: 0, L: 2, XL: 1 },
      desc: "Satin fluide, manches longues, taille marquée. Pensée pour les fiançailles et les soirées.",
      fit: { Longueur: "Sol", Opacité: "Opaque", Doublure: "Doublée", Élasticité: "Légère", Mannequin: "1m68, porte un S" },
    },
    {
      id: "blazer-camel", name: "Blazer Camel Oversize", cat: ["tailleurs"], price: 490,
      img: ["blazer-camel"],
      colors: [{ n: "Camel", h: "#bfa588" }],
      stock: { XS: 2, S: 4, M: 4, L: 1, XL: 0 },
      desc: "Épaules structurées, coupe ample, une poche poitrine. Le blazer qui va avec tout.",
      fit: { Longueur: "Hanches (76 cm)", Opacité: "Opaque", Doublure: "Doublé", Élasticité: "Aucune", Mannequin: "1m71, porte un XS" },
    },
    {
      id: "trench-noir", name: "Trench Noir Ceinturé", cat: ["trenchs"], price: 620,
      img: ["trench-noir"],
      colors: [{ n: "Noir", h: "#1b1a1a" }],
      stock: { XS: 1, S: 2, M: 3, L: 3, XL: 2 },
      desc: "Effet cuir souple, ceinture à boucle, longueur maxi. Pour les soirées d'automne.",
      fit: { Longueur: "Maxi (125 cm)", Opacité: "Opaque", Doublure: "Doublé", Élasticité: "Aucune", Mannequin: "1m69, porte un S" },
    },
    {
      id: "robe-chemise-azur", name: "Robe Chemise Azur", cat: ["robes"], price: 450,
      img: ["robe-denim"],
      colors: [{ n: "Azur", h: "#6b86a8" }],
      stock: { XS: 0, S: 2, M: 5, L: 5, XL: 3 },
      desc: "Robe chemise longue boutonnée, manches longues, ceinture amovible. Le basique du quotidien.",
      fit: { Longueur: "Cheville", Opacité: "Opaque", Doublure: "Non doublée", Élasticité: "Aucune", Mannequin: "1m66, porte un S" },
    },
    {
      id: "hijab-mousseline-caramel", name: "Hijab Mousseline Caramel", cat: ["hijabs", "nouveautes"], price: 120,
      img: ["hijab-caramel"],
      colors: [{ n: "Caramel", h: "#d6ad74" }, { n: "Nude", h: "#e9cfc0" }, { n: "Bordeaux", h: "#6d1f2c" }],
      stock: { "Taille unique": 12 },
      desc: "Mousseline légère qui ne glisse pas, bords finis main. 180 × 70 cm.",
      fit: { Dimensions: "180 × 70 cm", Opacité: "Semi-opaque", Matière: "Mousseline" },
    },
  ],

  cities: [
    { n: "Casablanca", fee: 25, d: "24 h" },
    { n: "Rabat", fee: 30, d: "24–48 h" },
    { n: "Salé", fee: 30, d: "24–48 h" },
    { n: "Mohammédia", fee: 30, d: "24–48 h" },
    { n: "Marrakech", fee: 35, d: "48 h" },
    { n: "Tanger", fee: 35, d: "48 h" },
    { n: "Fès", fee: 35, d: "48 h" },
    { n: "Meknès", fee: 35, d: "48 h" },
    { n: "Agadir", fee: 40, d: "48–72 h" },
    { n: "Oujda", fee: 40, d: "48–72 h" },
    { n: "Kénitra", fee: 35, d: "48 h" },
    { n: "Tétouan", fee: 40, d: "48–72 h" },
    { n: "El Jadida", fee: 35, d: "48 h" },
    { n: "Autre ville", fee: 45, d: "72 h" },
  ],

  // Fictional orders for the owner's space. Names and numbers are invented.
  sampleOrders: [
    { n: "SLZ-1042", who: "Salma B.", city: "Casablanca", items: "Tailleur Bordeaux · M", total: 915, status: "confirmer", at: "il y a 12 min" },
    { n: "SLZ-1041", who: "Imane K.", city: "Fès", items: "Abaya-Trench Sable · L", total: 685, status: "confirmer", at: "il y a 40 min" },
    { n: "SLZ-1039", who: "Nour E.", city: "Rabat", items: "Trench Rose Poudré · S + Hijab", total: 740, status: "confirmee", at: "il y a 2 h" },
    { n: "SLZ-1036", who: "Hajar M.", city: "Tanger", items: "Kaftan Noir Brodé · M", total: 825, status: "expediee", at: "hier" },
    { n: "SLZ-1033", who: "Yasmine A.", city: "Marrakech", items: "Robe Longue Perle · S", total: 755, status: "livree", at: "hier" },
  ],
};
