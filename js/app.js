(() => {
  "use strict";
  const { config, categories, products, sizes, cities, sampleOrders } = window.SLZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $("#app");
  const dh = (n) => `${n.toLocaleString("fr-FR")} DH`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = (id) => products.find((p) => p.id === id);
  const img = (name, small) => `img/${name}${small ? "-s" : ""}.webp`;
  const inStock = (p, s) => (p.stock[s] || 0) > 0;
  const sizesOf = (p) => Object.keys(p.stock);

  // ── Storage (per-viewer convenience only; the demo works without it) ──
  const store = {
    get(k, d) { try { const v = localStorage.getItem("slz-" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("slz-" + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const state = {
    cart: store.get("cart", []),
    mySize: store.get("size", null),
    city: store.get("city", "Casablanca"),
    orders: store.get("orders", null) || sampleOrders.map((o) => ({ ...o })),
    seen: store.get("seen", []),
  };
  const save = () => { store.set("cart", state.cart); store.set("size", state.mySize); store.set("city", state.city); store.set("orders", state.orders); store.set("seen", state.seen); };
  const cityOf = (n) => cities.find((c) => c.n === n) || cities[0];

  $$("[data-maker]").forEach((el) => (el.textContent = config.maker));

  // ── Expiry ──
  if (new Date() > new Date(config.expires + "T23:59:59")) {
    document.body.innerHTML = `<div class="expired"><div><h1>Slay'z</h1><p>Cette démo était disponible jusqu'au ${new Date(config.expires).toLocaleDateString("fr-FR")}.<br>Pour la revoir, contactez ${esc(config.maker)}.</p></div></div>`;
    return;
  }

  // ── Toast ──
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ── Overlays ──
  function openPanel(id) {
    closeAll(); document.body.classList.add("lock");
    const el = document.getElementById(id); el.classList.add("open");
    if (id === "cart") renderCart();
  }
  function closeAll() {
    $$(".drawer.open, .sheet.open").forEach((e) => e.classList.remove("open"));
    document.body.classList.remove("lock");
  }
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]"); if (o) { e.preventDefault(); openPanel(o.dataset.open); return; }
    if (e.target.closest("[data-close]")) closeAll();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeAll(); closeStory(); } });

  $(".menu-links").innerHTML = [
    ["#/", "Accueil"], ["#/boutique", "Toute la boutique"],
    ...categories.map((c) => [`#/boutique?cat=${c.id}`, c.label]),
  ].map(([h, l]) => `<a href="${h}" data-close>${l}</a>`).join("");

  // ── Cart ──
  const cartCount = () => state.cart.reduce((a, l) => a + l.qty, 0);
  const cartSub = () => state.cart.reduce((a, l) => a + byId(l.id).price * l.qty, 0);
  function updateBadge(bump) {
    const b = $(".cart-count"), n = cartCount();
    b.hidden = !n; b.textContent = n;
    if (bump) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  }
  function addToCart(id, color, size) {
    const l = state.cart.find((x) => x.id === id && x.color === color && x.size === size);
    l ? l.qty++ : state.cart.push({ id, color, size, qty: 1 });
    save(); updateBadge(true); toast(`${byId(id).name} ajouté au panier`);
  }
  function lineHTML(l, i, editable) {
    const p = byId(l.id);
    return `<div class="line"><img src="${img(p.img[0], 1)}" alt="">
      <div><h4>${p.name}</h4><p>${l.color} · ${l.size}</p>
      ${editable ? `<div class="qty"><button data-q="${i}" data-d="-1" aria-label="Retirer">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="Ajouter">+</button></div>` : `<p>Qté ${l.qty}</p>`}</div>
      <b>${dh(p.price * l.qty)}</b></div>`;
  }
  function renderCart() {
    const body = $(".cart-body");
    if (!state.cart.length) {
      body.innerHTML = `<div class="cart-empty"><p>Votre panier est vide</p><a class="btn" href="#/boutique" data-close>Découvrir la boutique</a></div>`;
      return;
    }
    const c = cityOf(state.city);
    body.innerHTML = state.cart.map((l, i) => lineHTML(l, i, true)).join("") + `
      <div class="cart-foot">
        <div class="row"><span>Sous-total</span><span>${dh(cartSub())}</span></div>
        <div class="row"><span>Livraison ${c.n}</span><span>${dh(c.fee)}</span></div>
        <div class="row big"><span>À payer à la livraison</span><span>${dh(cartSub() + c.fee)}</span></div>
        <a class="btn block" href="#/commande" data-close>Commander · paiement à la livraison</a>
        <button class="btn wa block" data-wa-cart>Commander via WhatsApp</button>
        <p class="tiny">Tarifs de livraison d'exemple, à remplacer par ceux de Slay'z.</p>
      </div>`;
  }
  $(".cart-body").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]");
    if (q) {
      const l = state.cart[+q.dataset.q]; l.qty += +q.dataset.d;
      if (l.qty < 1) state.cart.splice(+q.dataset.q, 1);
      save(); updateBadge(); renderCart();
      if (location.hash.startsWith("#/commande")) { const y = scrollY; app.innerHTML = viewCheckout(); scrollTo(0, y); }
    }
    if (e.target.closest("[data-wa-cart]")) waSheet(state.cart.map((l) => ({ ...l })));
  });

  // ── WhatsApp message (preview only in the demo) ──
  function waMessage(lines, cityName) {
    const c = cityOf(cityName);
    const sub = lines.reduce((a, l) => a + byId(l.id).price * l.qty, 0);
    const items = lines.map((l) => `• ${byId(l.id).name}, ${l.color}, taille ${l.size}${l.qty > 1 ? ` ×${l.qty}` : ""} : ${dh(byId(l.id).price * l.qty)}`).join("\n");
    return `Bonjour Slay'z ✨\nJe souhaite commander :\n${items}\n\nVille : ${c.n} (livraison ${dh(c.fee)})\nTotal à la livraison : ${dh(sub + c.fee)}`;
  }
  function waSheet(lines) {
    $("#sheet").onclick = null; $("#sheet").onchange = null;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    openSheet(`
      <h3>Votre commande WhatsApp</h3>
      <p class="mute" style="margin:0">L'essentiel arrive dans le premier message : pièce, couleur, taille, ville, total.</p>
      <div class="wa-phone">
        <div class="wa-head"><i>S</i><div>Slay'z Fashion Store<small>Compte professionnel</small></div></div>
        <div class="wa-bubble">${esc(waMessage(lines, state.city))}<time>${now} ✓✓</time></div>
        <div class="wa-reply">Merci&nbsp;! On confirme avec vous l'adresse de livraison 💕</div>
      </div>
      <div class="compare">
        <div class="before"><b>Exemple en DM</b>« Quelle taille ? » « Quelle couleur ? » « Vous êtes où ? » « C'est combien la livraison ? »</div>
        <div class="after"><b>Avec le site</b>Taille, couleur, ville et total déjà réglés. Il reste l'adresse à confirmer.</div>
      </div>
      <button class="btn wa block" data-wa-send>Envoyer sur WhatsApp</button>
      <p class="tiny" style="text-align:center">Démo : aucun message n'est envoyé. Conversation d'exemple.</p>`);
  }

  // ── Bottom sheet ──
  function openSheet(html) {
    closeAll(); const s = $("#sheet"); s.innerHTML = html; s.scrollTop = 0;
    document.body.classList.add("lock"); requestAnimationFrame(() => s.classList.add("open"));
  }
  $("#sheet").addEventListener("click", (e) => {
    if (e.target.closest("[data-wa-send]")) toast("Démo : dans la vraie boutique, WhatsApp s'ouvre ici");
  });

  // Quick order sheet: size → city → total → WhatsApp or cart
  function quickSheet(id) {
    const p = byId(id);
    let color = p.colors[0].n;
    let size = state.mySize && inStock(p, state.mySize) ? state.mySize : (sizesOf(p).length === 1 ? sizesOf(p)[0] : null);
    const draw = () => {
      const c = cityOf(state.city);
      openSheetKeep(`
        <div class="sheet-product"><img src="${img(p.img[0], 1)}" alt=""><div><h3>${p.name}</h3><div class="price">${dh(p.price)}</div></div></div>
        ${p.colors.length > 1 ? `<div class="opt-label"><span>Couleur : <b>${color}</b></span></div>
        <div class="colors">${p.colors.map((x) => `<button data-color="${x.n}" style="background:${x.h}" aria-label="${x.n}" aria-pressed="${x.n === color}"></button>`).join("")}</div>` : ""}
        <div class="opt-label"><span>Taille${size ? ` : <b>${size}</b>` : ""}</span><button data-guide>Guide des tailles</button></div>
        <div class="sizes">${sizesOf(p).map((s) => `<button data-size="${s}" ${inStock(p, s) ? "" : "disabled"} aria-pressed="${s === size}">${s}</button>`).join("")}</div>
        <div class="delivery-box">
          <label for="q-city">Livrée à</label>
          <select id="q-city">${cities.map((x) => `<option ${x.n === c.n ? "selected" : ""}>${x.n}</option>`).join("")}</select>
          <div class="delivery-lines"><span>Article</span><span>${dh(p.price)}</span><span>Livraison · ${c.d}</span><span>${dh(c.fee)}</span>
          <span class="total">À payer à la livraison</span><span class="total">${dh(p.price + c.fee)}</span></div>
        </div>
        <div style="display:grid;gap:8px;margin-top:16px">
          <button class="btn wa" data-q-wa ${size ? "" : "disabled"}>Commander via WhatsApp</button>
          <button class="btn ghost" data-q-add ${size ? "" : "disabled"}>Ajouter au panier</button>
        </div>
        <p class="tiny" style="text-align:center">${size ? "" : "Choisissez votre taille pour continuer. "}Démo : prix, tailles et tarifs de livraison d'exemple.</p>`);
    };
    const s = $("#sheet");
    s.onclick = (e) => {
      const t = e.target;
      if (t.dataset.color) { color = t.dataset.color; draw(); }
      else if (t.dataset.size) { size = t.dataset.size; draw(); }
      else if (t.closest("[data-guide]")) guideSheet(() => quickSheetResume());
      else if (t.closest("[data-q-add]")) { addToCart(p.id, color, size); closeAll(); }
      else if (t.closest("[data-q-wa]")) { s.onclick = null; waSheet([{ id: p.id, color, size, qty: 1 }]); }
    };
    const onchange = (e) => { if (e.target.id === "q-city") { state.city = e.target.value; save(); draw(); } };
    const onclick = s.onclick;
    s.onchange = onchange;
    quickSheetResume = () => { s.onclick = onclick; s.onchange = onchange; draw(); };
    draw();
  }
  let quickSheetResume = () => {};
  function openSheetKeep(html) { // redraw without closing/reopening animation
    const s = $("#sheet");
    if (s.classList.contains("open")) s.innerHTML = html; else openSheet(html);
  }
  function guideSheet(back) {
    const s = $("#sheet"); s.onclick = back ? (e) => { if (e.target.closest("[data-guide-back]")) back(); } : null; s.onchange = null;
    openSheetKeep(`${back ? `<button class="btn ghost" style="min-height:36px;padding:0 14px;font-size:13px;margin-bottom:12px" data-guide-back>← Retour à la pièce</button>` : ""}<h3>Guide des tailles</h3><p class="mute" style="margin:0 0 12px">Mesures du corps en cm. Guide d'exemple, à remplacer par celui de Slay'z.</p>
      <div class="fit">${[["XS", "80–84", "62–66", "88–92"], ["S", "84–88", "66–70", "92–96"], ["M", "88–92", "70–74", "96–100"], ["L", "92–98", "74–80", "100–106"], ["XL", "98–104", "80–86", "106–112"]]
        .map(([s, a, b, c]) => `<div><dt><b>${s}</b></dt><dd>Poitrine ${a} · Taille ${b} · Hanches ${c}</dd></div>`).join("")}</div>
      <p class="tiny">Entre deux tailles ? Pour les coupes amples, prenez la plus petite.</p>`);
  }

  // ── Story viewer ──
  let storyIdx = 0, storyList = [], storyTimer;
  function openStory(catId) {
    storyList = products.filter((p) => p.cat.includes(catId));
    storyIdx = 0;
    if (!state.seen.includes(catId)) { state.seen.push(catId); save(); }
    $$(`.story-dot[data-story="${catId}"]`).forEach((d) => d.classList.add("seen"));
    $("#story").classList.add("open"); document.body.classList.add("lock");
    drawStory(catId);
  }
  function drawStory(catId) {
    clearTimeout(storyTimer);
    const p = storyList[storyIdx];
    $("#story").innerHTML = `<div class="story-frame">
      <img src="${img(p.img[0])}" alt="${p.name}">
      <div class="story-bars">${storyList.map((_, i) => `<span class="${i < storyIdx ? "done" : i === storyIdx ? "run" : ""}"><i></i></span>`).join("")}</div>
      <div class="story-top"><span class="av">S</span><b>slayz.fashionstore</b><span style="opacity:.7">${categories.find((c) => c.id === catId).label}</span><span class="tag-sim">Exemple</span>
        <button data-story-close aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <button class="story-tap prev" data-story-step="-1" aria-label="Précédent"></button>
      <button class="story-tap next" data-story-step="1" aria-label="Suivant"></button>
      <div class="story-card"><h3>${p.name}</h3><p>${dh(p.price)} · ${sizesOf(p).filter((s) => inStock(p, s)).join(" · ")}</p>
        <button class="btn light" data-story-buy="${p.id}">Je la veux — choisir ma taille</button></div></div>`;
    storyTimer = setTimeout(() => stepStory(1, catId), 5000);
    $("#story").onclick = (e) => {
      if (e.target.closest("[data-story-close]")) closeStory();
      const st = e.target.closest("[data-story-step]"); if (st) stepStory(+st.dataset.storyStep, catId);
      const b = e.target.closest("[data-story-buy]"); if (b) { closeStory(); quickSheet(b.dataset.storyBuy); }
    };
  }
  function stepStory(d, catId) {
    storyIdx += d;
    if (storyIdx < 0) storyIdx = 0;
    if (storyIdx >= storyList.length) return closeStory();
    drawStory(catId);
  }
  function closeStory() {
    clearTimeout(storyTimer);
    if (!$("#story").classList.contains("open")) return;
    $("#story").classList.remove("open"); $("#story").innerHTML = ""; document.body.classList.remove("lock");
  }

  // ── Views ──
  function card(p) {
    const avail = !state.mySize || inStock(p, state.mySize) || sizesOf(p).length === 1;
    const out = sizesOf(p).every((s) => !inStock(p, s));
    return `<a class="card reveal ${avail ? "" : "dim"}" href="#/produit/${p.id}">
      <div class="card-media"><img src="${img(p.img[0], 1)}" alt="${p.name}" loading="lazy">${p.img[1] ? `<img src="${img(p.img[1], 1)}" alt="" loading="lazy">` : ""}
        ${!avail ? `<span class="card-badge off">Pas en ${state.mySize}</span>` : p.cat.includes("nouveautes") ? `<span class="card-badge">Nouveau</span>` : ""}
        ${out ? "" : `<button class="card-quick" data-quick="${p.id}" aria-label="Commande rapide ${p.name}"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>`}</div>
      <h3>${p.name}</h3><div class="price">${dh(p.price)}</div>
      <div class="swatches">${p.colors.map((c) => `<span class="sw" style="background:${c.h}" title="${c.n}"></span>`).join("")}</div></a>`;
  }

  function storiesRail() {
    return `<div class="stories" aria-label="Collections">${categories.map((c) => `
      <button class="story-dot ${state.seen.includes(c.id) ? "seen" : ""}" data-story="${c.id}"><div class="ring"><img src="${c.img}" alt=""></div><span>${c.label}</span></button>`).join("")}</div>`;
  }

  function viewHome() {
    const news = products.filter((p) => p.cat.includes("nouveautes"));
    const tailored = products.filter((p) => p.cat.some((c) => c === "tailleurs" || c === "trenchs")).slice(0, 4);
    const words = ["Abayas", "Kaftans brodés", "Tailleurs", "Trenchs", "Robes de soirée", "Hijabs mousseline"];
    return `<div class="page">
      ${storiesRail()}
      <p class="stories-hint">↑ Vos highlights Instagram, devenus des rayons de boutique. Touchez un cercle.</p>
      <section class="hero">
        <img src="${img("tailleur-bordeaux")}" alt="Tailleur bordeaux">
        <a class="hero-tag" href="#/produit/tailleur-bordeaux" data-quick="tailleur-bordeaux"><i>+</i>Repérée en story ? Votre taille ici</a>
        <div class="hero-copy">
          <span class="eyebrow">Collection automne</span>
          <h1>L'élégance <em>qui slay</em></h1>
          <p>Tailleurs, abayas et kaftans pensés pour vous : choisissez votre taille, payez à la livraison.</p>
          <div class="hero-actions"><a class="btn light" href="#/boutique">Découvrir la boutique</a><button class="btn light-ghost" data-quick="tailleur-bordeaux">Commander en 2 gestes</button></div>
        </div>
      </section>
      <div class="marquee" aria-hidden="true"><div>${[...words, ...words].map((w) => `<span>${w}</span>`).join("")}</div></div>
      <section class="section wrap">
        <div class="section-head"><h2>Les <i>nouveautés</i></h2><a href="#/boutique?cat=nouveautes">Tout voir →</a></div>
        <div class="grid">${news.map(card).join("")}</div>
      </section>
      <section class="section wrap">
        <div class="feature reveal">
          <div class="feature-media"><img src="${img("trench-rose-2")}" alt="" loading="lazy"></div>
          <div>
            <span class="eyebrow">De la story à la commande</span>
            <h2>Fini les <i>« prix en DM »</i></h2>
            <p>Votre cliente voit la pièce en story, touche le lien, choisit sa taille et sa ville. Elle voit le total à payer à la livraison, puis vous envoie une commande complète, sur WhatsApp ou directement sur le site.</p>
            <button class="btn" data-wa-demo>Voir le message que vous recevez</button>
          </div>
        </div>
      </section>
      <section class="section wrap">
        <div class="section-head"><h2>Coupes <i>structurées</i></h2><a href="#/boutique?cat=tailleurs">Tailleurs →</a></div>
        <div class="grid">${tailored.map(card).join("")}</div>
        <div class="promises reveal">
          <div><b>Paiement à la livraison</b><span>Aucune carte demandée</span></div>
          <div><b>Tout le Maroc</b><span>Frais et délai affichés avant de commander</span></div>
          <div><b>WhatsApp</b><span>Commande complète en un message</span></div>
          <div><b>Votre taille d'abord</b><span>Ne voir que ce qui vous va</span></div>
          <small>Conditions d'exemple, à définir avec Slay'z.</small>
        </div>
      </section>
      <section class="section wrap">
        <div class="owner-banner reveal" style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">
          <div><b style="font:italic 24px var(--serif)">Et de votre côté ?</b><br>Chaque commande arrive rangée : à confirmer, confirmée, expédiée, livrée.</div>
          <a class="btn light" href="#/gerante">Voir l'espace gérante</a>
        </div>
      </section></div>`;
  }

  function viewShop(q) {
    const cat = q.get("cat");
    const list = cat ? products.filter((p) => p.cat.includes(cat)) : products;
    const sorted = state.mySize ? [...list].sort((a, b) => (inStock(b, state.mySize) || sizesOf(b).length === 1) - (inStock(a, state.mySize) || sizesOf(a).length === 1)) : list;
    const title = cat ? categories.find((c) => c.id === cat)?.label || "Boutique" : "La boutique";
    const fits = state.mySize ? list.filter((p) => inStock(p, state.mySize) || sizesOf(p).length === 1).length : list.length;
    return `<div class="page wrap">
      <h1 class="page-title">${title}</h1>
      <div class="size-bar">
        <p>${state.mySize ? `<b>${fits} pièce${fits > 1 ? "s" : ""}</b> disponible${fits > 1 ? "s" : ""} en ${state.mySize}` : "Votre taille ? On vous montre d'abord ce qui est disponible."}</p>
        <div class="chips">${sizes.map((s) => `<button class="chip" data-mysize="${s}" aria-pressed="${s === state.mySize}">${s}</button>`).join("")}${state.mySize ? `<button class="chip" data-mysize="">Toutes</button>` : ""}</div>
        <div class="cat-tabs"><a href="#/boutique" class="${cat ? "" : "on"}">Tout</a>${categories.map((c) => `<a href="#/boutique?cat=${c.id}" class="${c.id === cat ? "on" : ""}">${c.label}</a>`).join("")}</div>
      </div>
      <div class="grid">${sorted.map(card).join("")}</div></div>`;
  }

  function viewProduct(id) {
    const p = byId(id); if (!p) return viewShop(new URLSearchParams());
    const c = cityOf(state.city);
    const size = state.mySize && inStock(p, state.mySize) ? state.mySize : null;
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/boutique">Boutique</a> / ${categories.find((x) => x.id === p.cat[0]).label}</div>
      <div class="pdp" data-pid="${p.id}" data-color="${p.colors[0].n}" data-size="${size || (sizesOf(p).length === 1 ? sizesOf(p)[0] : "")}">
        <div class="pdp-gallery">${p.img.map((n) => `<img src="${img(n)}" alt="${p.name}">`).join("")}</div>
        <div class="pdp-info">
          <span class="eyebrow">${categories.find((x) => x.id === p.cat[0]).label}</span>
          <h1>${p.name}</h1>
          <p class="price-lg">${dh(p.price)}</p>
          <p>${p.desc}</p>
          <div class="opt-label"><span>Couleur : <b data-color-label>${p.colors[0].n}</b></span></div>
          <div class="colors">${p.colors.map((x, i) => `<button data-pcolor="${x.n}" style="background:${x.h}" aria-label="${x.n}" aria-pressed="${i === 0}"></button>`).join("")}</div>
          <div class="opt-label"><span>Taille</span><button data-guide>Guide des tailles</button></div>
          <div class="sizes">${sizesOf(p).map((s) => `<button data-psize="${s}" ${inStock(p, s) ? "" : "disabled"} aria-pressed="${s === size || sizesOf(p).length === 1}">${s}</button>`).join("")}</div>
          <p class="size-note mute" data-size-note>${stockNote(p, size)}</p>
          <div class="delivery-box">
            <label for="p-city">Où êtes-vous livrée ?</label>
            <select id="p-city">${cities.map((x) => `<option ${x.n === c.n ? "selected" : ""}>${x.n}</option>`).join("")}</select>
            <div class="delivery-lines" data-lines></div>
            <p class="tiny">Tarifs et délais d'exemple, à remplacer par ceux de Slay'z.</p>
          </div>
          <dl class="fit">${Object.entries(p.fit).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          <p class="tiny">Fiche de coupe d'exemple : les vraies mesures viendront de vos pièces.</p>
          <div class="buybar"><button class="btn ghost" data-padd>Ajouter au panier</button><button class="btn wa" data-pwa>Commander WhatsApp</button></div>
        </div>
      </div>
      <section class="section"><div class="section-head"><h2>À porter <i>avec</i></h2></div>
        <div class="grid">${products.filter((x) => x.id !== p.id).slice(0, 4).map(card).join("")}</div></section></div>`;
  }
  function stockNote(p, s) {
    if (!s) return "Choisissez votre taille.";
    return `Taille ${s} disponible.`;
  }
  function pdpLines() {
    const pdp = $(".pdp"); if (!pdp) return;
    const p = byId(pdp.dataset.pid), c = cityOf(state.city);
    $("[data-lines]").innerHTML = `<span>Article</span><span>${dh(p.price)}</span><span>Livraison · ${c.d}</span><span>${dh(c.fee)}</span>
      <span class="total">À payer à la livraison</span><span class="total">${dh(p.price + c.fee)}</span>`;
  }

  function viewCheckout() {
    if (!state.cart.length) return `<div class="page wrap confirm"><h1>Panier vide</h1><p>Ajoutez une pièce pour tester le passage de commande.</p><a class="btn" href="#/boutique">Voir la boutique</a></div>`;
    const c = cityOf(state.city);
    return `<div class="page wrap">
      <h1 class="page-title">Commande</h1>
      <div class="checkout">
        <form id="co" novalidate>
          <p class="mute" style="margin-top:0">Trois informations, puis confirmation par téléphone (étape proposée). <button type="button" class="btn ghost" style="min-height:34px;padding:0 12px;font-size:12px" data-fake>Remplir avec des données fictives</button></p>
          <div class="field"><label for="f-name">Nom complet</label><input id="f-name" autocomplete="name" required><span class="err">Indiquez votre nom</span></div>
          <div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" type="tel" inputmode="tel" placeholder="06 12 34 56 78" autocomplete="tel" required><span class="err">Numéro marocain : 06… ou 07…</span></div>
          <div class="field"><label for="f-city">Ville</label><select id="f-city">${cities.map((x) => `<option ${x.n === c.n ? "selected" : ""}>${x.n}</option>`).join("")}</select></div>
          <div class="field"><label for="f-addr">Adresse</label><input id="f-addr" autocomplete="street-address" required><span class="err">Indiquez l'adresse de livraison</span></div>
          <div class="field"><label for="f-note">Note (facultatif)</label><textarea id="f-note" placeholder="Ex. : appeler après 18 h"></textarea></div>
          <div class="opt-label"><span>Paiement</span></div>
          <div class="pay-option"><span class="dot"></span><div><b>Paiement à la livraison</b><br><span class="mute">Vous payez en espèces à réception.</span></div></div>
          <div class="pay-option off"><span class="dot"></span><div>Carte bancaire <span class="tag-sim">Fonctionnalité proposée</span></div></div>
          <button class="btn block" style="margin-top:22px" type="submit">Valider la commande · <span data-co-total>${dh(cartSub() + c.fee)}</span></button>
          <p class="tiny" style="text-align:center">Démo : rien n'est envoyé ni enregistré ailleurs que sur cet appareil.</p>
        </form>
        <aside class="summary"><h3 style="font-size:22px;font-style:italic">Récapitulatif</h3>
          ${state.cart.map((l, i) => lineHTML(l, i, false)).join("")}
          <div class="cart-foot"><div class="row"><span>Sous-total</span><span>${dh(cartSub())}</span></div>
          <div class="row"><span>Livraison <span data-co-city>${c.n} · ${c.d}</span></span><span data-co-fee>${dh(c.fee)}</span></div>
          <div class="row big"><span>À la livraison</span><span data-co-total>${dh(cartSub() + c.fee)}</span></div></div>
        </aside>
      </div></div>`;
  }
  function checkoutTotals() {
    const c = cityOf(state.city);
    $$("[data-co-total]").forEach((e) => (e.textContent = dh(cartSub() + c.fee)));
    $("[data-co-fee]").textContent = dh(c.fee); $("[data-co-city]").textContent = `${c.n} · ${c.d}`;
  }
  function submitCheckout(form) {
    if (!state.cart.length) { toast("Votre panier est vide"); route(); return; }
    const name = $("#f-name").value.trim(), tel = $("#f-tel").value.replace(/[\s.-]/g, ""), addr = $("#f-addr").value.trim();
    const checks = [["#f-name", name.length > 1], ["#f-tel", /^(?:\+212|0)[67]\d{8}$/.test(tel)], ["#f-addr", addr.length > 3]];
    let ok = true;
    checks.forEach(([s, v]) => { $(s).closest(".field").classList.toggle("bad", !v); if (!v && ok) { $(s).focus(); ok = false; } });
    if (!ok) return;
    const n = "SLZ-" + (1043 + state.orders.filter((o) => o.mine).length);
    const c = cityOf(state.city);
    state.orders.unshift({
      n, who: name, city: c.n, mine: true, tel: $("#f-tel").value.trim(), addr, note: $("#f-note").value.trim(),
      items: state.cart.map((l) => `${byId(l.id).name} · ${l.color} · ${l.size}${l.qty > 1 ? ` ×${l.qty}` : ""}`).join(" + "),
      total: cartSub() + c.fee, status: "confirmer", at: "à l'instant",
    });
    state.cart = []; save(); updateBadge();
    location.hash = `#/merci/${n}?p=${encodeURIComponent(name.split(" ")[0])}`;
  }

  function viewThanks(n, q) {
    return `<div class="page wrap confirm">
      <div class="seal">S</div>
      <h1>Merci ${esc(q.get("p") || "")}&nbsp;!</h1>
      <p>Commande <b>${esc(n)}</b> reçue. Étape proposée : Slay'z vous appelle pour confirmer avant l'expédition.</p>
      <span class="sim-note">Simulation terminée : aucune commande envoyée.</span>
      <p class="mute">Côté gérante, cette commande vient d'arriver en tête de la liste « À confirmer ».</p>
      <a class="btn" href="#/gerante">Voir comment elle arrive chez vous →</a></div>`;
  }

  const lanes = [
    ["confirmer", "À confirmer"], ["confirmee", "Confirmée"], ["expediee", "Expédiée"], ["livree", "Livrée"],
  ];
  function viewOwner() {
    const o = state.orders;
    const count = (s) => o.filter((x) => x.status === s).length;
    const done = o.filter((x) => x.status !== "confirmer");
    const ca = done.reduce((a, x) => a + x.total, 0);
    return `<div class="page wrap owner">
      <h1 class="page-title">Espace gérante</h1>
      <div class="owner-banner"><b>Simulation, données fictives.</b> Voici ce que vous verriez chaque matin : les commandes du site et de WhatsApp au même endroit, dans l'ordre où les traiter.</div>
      <div class="kpis">
        <div class="kpi"><span>Commandes</span><b>${o.length}</b></div>
        <div class="kpi"><span>À confirmer par téléphone</span><b>${count("confirmer")}</b></div>
        <div class="kpi"><span>Montant confirmé</span><b>${dh(ca)}</b></div>
        <div class="kpi"><span>Taux de confirmation</span><b>${Math.round((done.length / (o.length || 1)) * 100)} %</b></div>
      </div>
      <div class="lanes">${lanes.map(([k, label]) => `<div class="lane"><h3>${label} <em>${count(k)}</em></h3>
        ${o.map((x, i) => x.status !== k ? "" : `<article class="order ${x.mine ? "fresh" : ""}"><header><span>${esc(x.n)}</span><span>${esc(x.at)}</span></header>
          <h4>${esc(x.who)} · ${esc(x.city)}</h4><p>${esc(x.items)}</p>${x.addr ? `<p class="mute">${esc(x.tel)} · ${esc(x.addr)}${x.note ? ` · « ${esc(x.note)} »` : ""}</p>` : ""}<p><b>${dh(x.total)}</b> à encaisser</p>
          ${k === "confirmer" ? `<div class="acts"><button data-call>Appeler</button><button class="go" data-move="${i}">Confirmer</button></div>`
          : k === "confirmee" ? `<div class="acts"><button class="go" data-move="${i}">Marquer expédiée</button></div>`
          : k === "expediee" ? `<div class="acts"><button class="go" data-move="${i}">Marquer livrée</button></div>` : ""}
        </article>`).join("")}</div>`).join("")}</div>
      <p style="text-align:center;margin-top:24px"><button class="btn ghost" data-reset>Réinitialiser la démo</button></p></div>`;
  }

  function viewDemo() {
    return `<div class="page wrap demo-page">
      <span class="eyebrow">Transparence</span>
      <h1>Qu'est-ce que cette démo&nbsp;?</h1>
      <p>Cette boutique a été conçue par ${esc(config.maker)} <b>spécialement pour Slay'z</b>, pour vous montrer une proposition concrète. Ce n'est pas un site déjà livré à un autre client : c'est une maquette fonctionnelle de ce que pourrait devenir votre boutique en ligne.</p>
      <h2>Ce que vous pouvez essayer</h2>
      <ul class="demo-list">
        <li><b>Les cercles en haut de l'accueil</b> : vos highlights Instagram deviennent des rayons, et chaque story mène à la pièce.</li>
        <li><b>« Votre taille »</b> dans la boutique : la cliente ne voit d'abord que ce qui existe dans sa taille.</li>
        <li><b>La ville de livraison</b> sur chaque pièce : frais, délai et total à payer à la livraison, avant même le panier.</li>
        <li><b>Commander via WhatsApp</b> : vous recevez un message complet, rien à redemander.</li>
        <li><b>Passer une commande</b>, puis ouvrir l'<a href="#/gerante">espace gérante</a> : elle y arrive, prête à confirmer.</li>
      </ul>
      <h2>Ce qui est simulé</h2>
      <ul class="demo-list">
        <li>Les photos proviennent d'Unsplash : <b>aucune ne montre un article Slay'z</b>.</li>
        <li>Produits, prix, stocks, tarifs de livraison et fiches de coupe sont des exemples.</li>
        <li>Aucune commande ni aucun message n'est réellement envoyé. L'espace gérante contient des commandes inventées.</li>
      </ul>
      <h2>Ce qu'on définirait ensemble</h2>
      <ul class="demo-list">
        <li>Vos vraies pièces et photos, vos prix, vos conditions de livraison et d'échange.</li>
        <li>Votre numéro WhatsApp, votre nom de domaine, et la façon dont vous traitez les commandes aujourd'hui.</li>
      </ul>
      <p style="margin-top:28px"><a class="btn" href="#/">Retour à la boutique</a></p></div>`;
  }

  // ── Router ──
  function route() {
    closeAll(); closeStory();
    const [path, qs] = (location.hash.slice(1) || "/").split("?");
    const q = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    let html;
    if (!parts.length) html = viewHome();
    else if (parts[0] === "boutique") html = viewShop(q);
    else if (parts[0] === "produit") html = viewProduct(parts[1]);
    else if (parts[0] === "commande") html = viewCheckout();
    else if (parts[0] === "merci") html = viewThanks(decodeURIComponent(parts[1] || ""), q);
    else if (parts[0] === "gerante") html = viewOwner();
    else if (parts[0] === "demo") html = viewDemo();
    else html = viewHome();
    app.innerHTML = html;
    window.scrollTo(0, 0);
    if ($(".pdp")) pdpLines();
    $$(".top-nav a").forEach((a) => a.toggleAttribute("aria-current", location.hash.startsWith(a.getAttribute("href").split("?")[0]) && a.getAttribute("href") !== "#/"));
    observe();
  }
  window.addEventListener("hashchange", route);

  // Scroll reveals
  let io;
  function observe() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((e) => e.classList.add("in")); return; }
    io?.disconnect();
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((e, i) => { e.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(e); });
  }

  // ── Page-level interactions (delegated) ──
  app.addEventListener("click", (e) => {
    const t = e.target;
    const qk = t.closest("[data-quick]"); if (qk) { e.preventDefault(); quickSheet(qk.dataset.quick); return; }
    const st = t.closest("[data-story]"); if (st) { openStory(st.dataset.story); return; }
    if (t.closest("[data-wa-demo]")) { waSheet([{ id: "tailleur-bordeaux", color: "Bordeaux", size: "M", qty: 1 }]); return; }
    const ms = t.closest("[data-mysize]");
    if (ms) { state.mySize = ms.dataset.mysize || null; save(); const y = scrollY; route(); scrollTo(0, y); return; }

    const pdp = $(".pdp");
    if (pdp) {
      if (t.dataset.pcolor) { pdp.dataset.color = t.dataset.pcolor; $$("[data-pcolor]").forEach((b) => b.setAttribute("aria-pressed", b === t)); $("[data-color-label]").textContent = t.dataset.pcolor; }
      if (t.dataset.psize) { pdp.dataset.size = t.dataset.psize; $$("[data-psize]").forEach((b) => b.setAttribute("aria-pressed", b === t)); $("[data-size-note]").textContent = stockNote(byId(pdp.dataset.pid), t.dataset.psize); }
      if (t.closest("[data-guide]")) guideSheet();
      if (t.closest("[data-padd]") || t.closest("[data-pwa]")) {
        if (!pdp.dataset.size) { toast("Choisissez d'abord votre taille"); $(".sizes").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
        const line = { id: pdp.dataset.pid, color: pdp.dataset.color, size: pdp.dataset.size, qty: 1 };
        t.closest("[data-padd]") ? addToCart(line.id, line.color, line.size) : waSheet([line]);
      }
    }
    if (t.closest("[data-fake]")) { $("#f-name").value = "Salma Test"; $("#f-tel").value = "06 00 00 00 00"; $("#f-addr").value = "12 rue de la Démo, Maârif"; }
    if (t.closest("[data-call]")) toast("Démo : l'appel se lance depuis votre téléphone");
    const mv = t.closest("[data-move]");
    if (mv) { const o = state.orders[+mv.dataset.move]; o.status = lanes[lanes.findIndex(([k]) => k === o.status) + 1][0]; save(); const y = scrollY; route(); scrollTo(0, y); toast(`${o.n} : ${lanes.find(([k]) => k === o.status)[1].toLowerCase()}`); }
    if (t.closest("[data-reset]")) { state.orders = sampleOrders.map((o) => ({ ...o })); state.seen = []; save(); route(); toast("Démo réinitialisée"); }
  });
  app.addEventListener("change", (e) => {
    if (e.target.id === "p-city") { state.city = e.target.value; save(); pdpLines(); }
    if (e.target.id === "f-city") { state.city = e.target.value; save(); checkoutTotals(); }
  });
  app.addEventListener("submit", (e) => { if (e.target.id === "co") { e.preventDefault(); submitCheckout(e.target); } });

  updateBadge();
  route();
})();
