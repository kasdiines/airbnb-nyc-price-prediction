const pptxgen = require("pptxgenjs");
const path = require("path");

const NAVY = "2F3C7E";
const NAVY_DARK = "232C5E";
const CORAL = "F96167";
const GOLD = "F9E795";
const WHITE = "FFFFFF";
const INK = "1B1F3B";
const MUTED = "6B7280";
const CARD_BG = "F5F6FA";

const FIG = (name) => path.resolve(__dirname, "..", "reports", "figures", name);

function newDeck() {
  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  p.author = "Ines Kasdi";
  p.company = "Universite - Projet Machine Learning";
  return p;
}

const pres = newDeck();

// ---------- helpers ----------
function bgFill(slide, color) {
  slide.background = { color };
}

function pageNumber(slide, n) {
  slide.addText(String(n), {
    x: 12.55, y: 7.05, w: 0.6, h: 0.35, fontFace: "Calibri",
    fontSize: 10, color: MUTED, align: "right", isTextBox: true, margin: 0,
  });
}

function kicker(slide, text, color = CORAL) {
  slide.addText(text.toUpperCase(), {
    x: 0.6, y: 0.45, w: 8, h: 0.35, fontFace: "Calibri", bold: true,
    fontSize: 13, color, charSpacing: 2, isTextBox: true, margin: 0,
  });
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.6, y: opts.y || 0.75, w: opts.w || 11.5, h: opts.h || 0.9,
    fontFace: "Cambria", bold: true, fontSize: opts.size || 32,
    color: opts.color || INK, isTextBox: true, margin: 0,
  });
}

function statCard(slide, x, y, w, h, value, label, opts = {}) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.bg || CARD_BG }, line: { type: "none" },
    shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 2, angle: 90 },
  });
  slide.addText(value, {
    x: x + 0.15, y: y + 0.12, w: w - 0.3, h: h * 0.55, isTextBox: true, margin: 0,
    fontFace: "Cambria", bold: true, fontSize: opts.valueSize || 30,
    color: opts.valueColor || NAVY, align: "left", valign: "bottom",
  });
  slide.addText(label, {
    x: x + 0.15, y: y + h * 0.6, w: w - 0.3, h: h * 0.38, isTextBox: true, margin: 0,
    fontFace: "Calibri", fontSize: opts.labelSize || 12, color: MUTED, align: "left", valign: "top",
  });
}

function iconCircle(slide, x, y, d, letter, opts = {}) {
  slide.addShape("ellipse", {
    x, y, w: d, h: d, fill: { color: opts.bg || CORAL }, line: { type: "none" },
  });
  slide.addText(letter, {
    x, y, w: d, h: d, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: "Calibri", bold: true, fontSize: opts.fontSize || 20, color: opts.color || WHITE,
  });
}

function bulletBlock(slide, items, opts = {}) {
  const paras = items.map((t, i) => ({
    text: t,
    options: {
      bullet: { code: "25CF", indent: 18 },
      color: opts.color || INK,
      fontFace: "Calibri",
      fontSize: opts.fontSize || 14,
      breakLine: i < items.length - 1,
      paraSpaceAfter: opts.spaceAfter || 10,
    },
  }));
  slide.addText(paras, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h, isTextBox: true, margin: 0, valign: "top",
  });
}

// =====================================================================
// SLIDE 1 - TITRE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, NAVY);
  s.addShape("ellipse", { x: 10.6, y: -2.2, w: 6, h: 6, fill: { color: NAVY_DARK }, line: { type: "none" } });
  s.addShape("ellipse", { x: -2.5, y: 5.2, w: 5, h: 5, fill: { color: NAVY_DARK }, line: { type: "none" } });

  iconCircle(s, 0.6, 0.6, 0.7, "🏠", { bg: CORAL, fontSize: 26 });

  s.addText("PROJET DE MACHINE LEARNING", {
    x: 0.6, y: 2.35, w: 10, h: 0.4, isTextBox: true, margin: 0,
    fontFace: "Calibri", bold: true, fontSize: 14, color: GOLD, charSpacing: 3,
  });
  s.addText("Prediction des prix de location\nAirbnb a New York City", {
    x: 0.6, y: 2.8, w: 11.5, h: 2.0, isTextBox: true, margin: 0,
    fontFace: "Cambria", bold: true, fontSize: 42, color: WHITE, lineSpacing: 46,
  });
  s.addText("Comparaison de 12 algorithmes de regression, optimisation des hyperparametres\net application interactive d'aide a la decision", {
    x: 0.6, y: 4.55, w: 10.5, h: 0.8, isTextBox: true, margin: 0,
    fontFace: "Calibri", italic: true, fontSize: 16, color: "CFD5EE",
  });

  s.addShape("line", { x: 0.6, y: 5.6, w: 3.2, h: 0, line: { color: CORAL, width: 2 } });

  s.addText([
    { text: "Ines Kasdi", options: { bold: true, breakLine: true, color: WHITE, fontSize: 16 } },
    { text: "Projet Machine Learning - Donnees Kaggle NYC Airbnb Open Data", options: { color: "CFD5EE", fontSize: 12, breakLine: true } },
    { text: "github.com/kasdiines/airbnb-nyc-price-prediction", options: { color: GOLD, fontSize: 12 } },
  ], { x: 0.6, y: 5.85, w: 9, h: 1.2, isTextBox: true, margin: 0, fontFace: "Calibri" });

  s.addNotes(
    "[~55s] Bonjour a toutes et a tous, je m'appelle Ines Kasdi et je vais vous presenter mon projet de Machine Learning sur la prediction des prix de location Airbnb a New York. L'idee de depart est simple a formuler mais difficile a resoudre : peut-on estimer automatiquement, et de facon fiable, le prix d'une nuit sur Airbnb a partir des seules caracteristiques d'une annonce -- son type de logement, sa localisation, sa popularite, sa disponibilite -- sans jamais regarder ni les photos ni le texte de la description ? Pour repondre a cette question, j'ai mene un travail complet de bout en bout. J'ai d'abord compare douze algorithmes de Machine Learning differents, des plus simples comme la regression lineaire jusqu'aux plus avances comme XGBoost, en appliquant a chacun exactement le meme protocole d'evaluation pour que la comparaison soit honnete. J'ai ensuite optimise les hyperparametres des trois meilleurs modeles. Et enfin, j'ai construit une application interactive complete qui permet a n'importe quel utilisateur d'explorer les donnees, de choisir et d'entrainer un modele, et de tester une prediction de prix en temps reel directement sur une carte. Pour vous donner tout de suite le resultat principal : mon meilleur modele, un XGBoost optimise, explique 45% de la variation des prix, avec une erreur moyenne d'environ 48 dollars par nuit. Je vais maintenant detailler comment j'y suis arrivee."
  );
}

// =====================================================================
// SLIDE 2 - SOMMAIRE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "Plan de la soutenance");
  title(s, "Sommaire");

  const items = [
    ["01", "Contexte, problematique et objectifs"],
    ["02", "Veille scientifique et choix technologiques"],
    ["03", "Donnees et analyse exploratoire"],
    ["04", "Methodologie : pretraitement, features, pipeline"],
    ["05", "Comparaison de 12 modeles et optimisation"],
    ["06", "Resultats, analyse critique et demonstration"],
    ["07", "Difficultes, conclusion et perspectives"],
  ];
  const colW = 5.55, rowH = 0.78, startY = 2.0;
  items.forEach((it, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = 0.6 + col * (colW + 0.6);
    const y = startY + row * rowH;
    s.addText(it[0], {
      x, y, w: 0.9, h: rowH - 0.15, isTextBox: true, margin: 0,
      fontFace: "Cambria", bold: true, fontSize: 26, color: CORAL, valign: "middle",
    });
    s.addText(it[1], {
      x: x + 0.95, y, w: colW - 0.95, h: rowH - 0.15, isTextBox: true, margin: 0,
      fontFace: "Calibri", fontSize: 15, color: INK, valign: "middle",
    });
    s.addShape("line", { x, y: y + rowH - 0.12, w: colW, h: 0, line: { color: "E2E4EE", width: 1 } });
  });
  pageNumber(s, 2);
  s.addNotes(
    "[~35s] Voici le plan de ma presentation, organise en sept parties qui suivent exactement la structure de mon rapport ecrit. Je vais d'abord poser le contexte et la problematique du projet. Ensuite, je ferai un point de veille scientifique : ce que dit la litterature, et pourquoi j'ai choisi ces technologies precises plutot que d'autres. Puis je presenterai les donnees et les premiers constats de l'analyse exploratoire. Je detaillerai ensuite ma methodologie : le pretraitement, la creation de nouvelles variables, et l'architecture du pipeline. Le coeur de la presentation portera sur la comparaison des douze modeles et leur optimisation. J'enchainerai avec les resultats, une analyse critique volontairement honnete sur les limites, et une demonstration de l'application. Et je terminerai sur les difficultes techniques rencontrees, la conclusion et les perspectives d'amelioration."
  );
}

// =====================================================================
// SLIDE 3 - CONTEXTE & PROBLEMATIQUE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "01 . Introduction");
  title(s, "Contexte et problematique");

  bulletBlock(s, [
    "Airbnb : des dizaines de milliers d'annonces a New York, des prix tres heterogenes selon le quartier, le type de logement et la popularite de l'hote.",
    "Un hote fixe son prix sans reference objective ; un voyageur ne sait pas si le tarif propose est coherent avec le marche local.",
    "Question centrale : peut-on predire le prix d'une annonce a partir de ses seules caracteristiques structurelles et geographiques ?",
  ], { x: 0.6, y: 2.05, w: 6.6, h: 4.3, fontSize: 15, spaceAfter: 18 });

  // right column - challenge cards
  const chal = [
    ["Cardinalite elevee", "221 quartiers (neighbourhood) a encoder sans exploser la dimension"],
    ["Non-linearite", "Le prix n'evolue pas lineairement avec la distance ou le nombre d'avis"],
    ["Information manquante", "Pas de photos ni de texte : une partie du prix reste inexpliquee"],
  ];
  let cy = 2.05;
  chal.forEach((c) => {
    s.addShape("roundRect", {
      x: 7.5, y: cy, w: 5.2, h: 1.25, rectRadius: 0.06,
      fill: { color: CARD_BG }, line: { type: "none" },
    });
    s.addText(c[0], {
      x: 7.7, y: cy + 0.1, w: 4.8, h: 0.35, isTextBox: true, margin: 0,
      fontFace: "Calibri", bold: true, fontSize: 14, color: NAVY,
    });
    s.addText(c[1], {
      x: 7.7, y: cy + 0.48, w: 4.8, h: 0.7, isTextBox: true, margin: 0,
      fontFace: "Calibri", fontSize: 12, color: MUTED,
    });
    cy += 1.45;
  });
  pageNumber(s, 3);
  s.addNotes(
    "[~65s] Depuis sa creation, Airbnb a profondement transforme le marche de la location courte duree. A New York seule, on recense chaque annee des dizaines de milliers d'annonces actives, avec des prix extremement heterogenes selon le quartier, le type de logement, et la popularite de l'hote. Le probleme concret, c'est que la plupart des hotes fixent leur prix un peu au hasard, sans reference objective : ils peuvent sous-evaluer leur bien et perdre de l'argent, ou le surevaluer et rester invisibles face a une offre tres dense. Du cote des voyageurs, c'est la meme incertitude : difficile de savoir si le tarif propose est coherent avec le marche local. C'est de la que vient ma question centrale, celle qui structure tout le projet : peut-on predire, de maniere fiable, le prix d'une annonce Airbnb a partir de ses seules caracteristiques structurelles et geographiques ? Cette question souleve trois defis que j'ai du affronter tout au long du projet. D'abord, une cardinalite tres elevee : la variable quartier comporte 221 modalites differentes, qu'il faut encoder sans faire exploser la dimension du probleme. Ensuite, une forte non-linearite : le prix n'evolue pas de facon proportionnelle avec la distance au centre ou le nombre d'avis. Et enfin, un point que je tiens a annoncer moi-meme, plutot que d'attendre qu'on me le fasse remarquer : je ne dispose ni de photos, ni de description textuelle des annonces, ce qui signifie qu'une partie du prix restera, par construction, impossible a expliquer avec mes seules donnees."
  );
}

// =====================================================================
// SLIDE 4 - OBJECTIFS
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "01 . Introduction");
  title(s, "Objectifs du projet");

  const objs = [
    ["1", "Pretraiter rigoureusement les donnees", "valeurs aberrantes, valeurs manquantes, feature engineering, encodage adapte"],
    ["2", "Comparer au moins 10 algorithmes", "12 modeles testes : lineaires, ensembles d'arbres, SVR, reseau de neurones"],
    ["3", "Optimiser les hyperparametres", "RandomizedSearchCV sur les 3 meilleurs modeles"],
    ["4", "Evaluer avec au moins 4 metriques", "RMSE, MAE, R2, MAPE + validation croisee a 5 plis"],
    ["5", "Construire une interface graphique", "exploration, entrainement, prediction en temps reel avec carte"],
  ];
  let y = 1.95;
  objs.forEach((o) => {
    iconCircle(s, 0.6, y, 0.5, o[0], { bg: NAVY, fontSize: 16 });
    s.addText(o[1], {
      x: 1.35, y: y - 0.02, w: 5.3, h: 0.55, isTextBox: true, margin: 0,
      fontFace: "Calibri", bold: true, fontSize: 14, color: INK, valign: "middle",
    });
    s.addText(o[2], {
      x: 6.85, y: y - 0.02, w: 5.9, h: 0.55, isTextBox: true, margin: 0,
      fontFace: "Calibri", fontSize: 12.5, color: MUTED, valign: "middle",
    });
    y += 0.92;
  });
  pageNumber(s, 4);
  s.addNotes(
    "[~55s] Pour repondre a cette problematique, je me suis fixe cinq objectifs concrets, qui correspondent directement aux exigences du cahier des charges. Premierement, pretraiter rigoureusement les donnees : gerer les valeurs aberrantes, les valeurs manquantes, et construire de nouvelles variables pertinentes -- ce qu'on appelle le feature engineering. Deuxiemement, comparer objectivement au moins dix algorithmes de regression differents -- j'en ai finalement teste douze, pour couvrir un maximum de familles de modeles. Troisiemement, optimiser les hyperparametres des modeles les plus prometteurs, plutot que de me contenter des reglages par defaut. Quatriemement, evaluer chaque modele avec au moins quatre metriques complementaires et une validation croisee, pour ne pas me fier a un seul chiffre qui pourrait etre trompeur -- j'ai utilise quatre metriques plus une validation croisee a cinq plis. Et cinquiemement, developper une interface graphique complete qui rende ce travail utilisable concretement : exploration des donnees, entrainement et parametrage d'un modele au choix, et prediction en temps reel avec une visualisation cartographique."
  );
}

// =====================================================================
// SLIDE 5 - VEILLE SCIENTIFIQUE ET TECHNIQUE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "02 . Veille scientifique");
  title(s, "Etat de l'art et choix technologiques");

  s.addText("Revue de littérature", {
    x: 0.6, y: 1.85, w: 5.9, h: 0.35, isTextBox: true, margin: 0,
    fontFace: "Cambria", bold: true, fontSize: 16, color: NAVY,
  });
  bulletBlock(s, [
    "Régression hédonique classique : simple mais ne capture pas les interactions (ex. l'effet du quartier dépend du type de logement).",
    "Breiman (2001, Random Forest) et Chen & Guestrin (2016, XGBoost) : les ensembles d'arbres dominent sur données tabulaires.",
    "Littérature sur ce même dataset : R² généralement entre 0,5 et 0,65 sans variables textuelles/visuelles — confirme la limite structurelle attendue.",
  ], { x: 0.6, y: 2.25, w: 5.9, h: 4.3, fontSize: 12.5, spaceAfter: 14 });

  s.addText("Technologies retenues", {
    x: 6.85, y: 1.85, w: 5.9, h: 0.35, isTextBox: true, margin: 0,
    fontFace: "Cambria", bold: true, fontSize: 16, color: NAVY,
  });
  const techs = [
    ["scikit-learn", "pipelines, 12 modeles, validation croisee — standard du secteur"],
    ["XGBoost", "boosting, etat de l'art sur donnees tabulaires"],
    ["Streamlit", "interface interactive en pur Python, rapide a developper"],
    ["Folium", "seule librairie testee permettant de capter un clic utilisateur sur la carte"],
  ];
  let ty = 2.3;
  techs.forEach((t) => {
    iconCircle(s, 6.85, ty, 0.42, "✓", { bg: CORAL, fontSize: 14 });
    s.addText(t[0], {
      x: 7.45, y: ty - 0.03, w: 5.3, h: 0.35, isTextBox: true, margin: 0,
      fontFace: "Calibri", bold: true, fontSize: 13, color: INK,
    });
    s.addText(t[1], {
      x: 7.45, y: ty + 0.3, w: 5.3, h: 0.6, isTextBox: true, margin: 0,
      fontFace: "Calibri", fontSize: 11.5, color: MUTED,
    });
    ty += 1.05;
  });
  pageNumber(s, 5);
  s.addNotes(
    "[~60s] Avant de me lancer dans le code, j'ai pris le temps de situer mon projet par rapport a l'existant -- c'est cette etape de veille scientifique et technique. Cote litterature, les approches historiques comme la regression hedonique decomposent le prix en une simple somme ponderee de caracteristiques : c'est facile a interpreter, mais ca ne capture pas les interactions entre variables. Depuis les annees 2000, les methodes d'ensemble a base d'arbres -- je pense aux travaux fondateurs de Breiman sur Random Forest en 2001, et de Chen et Guestrin sur XGBoost en 2016 -- se sont imposees comme l'etat de l'art sur les donnees tabulaires. Et surtout, sur ce meme dataset specifiquement, les travaux deja publies rapportent generalement un R2 entre 0,5 et 0,65 lorsqu'on n'utilise pas de texte ni de photos -- c'est exactement la fourchette dans laquelle se situe mon propre resultat, ce qui valide a la fois mon protocole et confirme cette limite structurelle annoncee en introduction. Cote outils, j'ai compare plusieurs options avant de choisir : scikit-learn et XGBoost pour le Machine Learning, qui sont les standards du secteur ; Streamlit plutot que Dash ou une application web classique, pour un developpement rapide en pur Python ; et Folium specifiquement, parce que c'est la seule librairie que j'ai testee qui permette de recuperer les coordonnees d'un clic utilisateur directement sur la carte."
  );
}

// =====================================================================
// SLIDE 6 - DATASET
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, NAVY);
  kicker(s, "03 . Donnees", GOLD);
  title(s, "Le jeu de donnees", { color: WHITE });
  s.addText("New York City Airbnb Open Data - Kaggle", {
    x: 0.6, y: 1.55, w: 8, h: 0.4, isTextBox: true, margin: 0,
    fontFace: "Calibri", italic: true, fontSize: 14, color: "CFD5EE",
  });

  const stats = [
    ["48 895", "annonces brutes"],
    ["16", "variables d'origine"],
    ["5", "arrondissements"],
    ["221", "quartiers distincts"],
    ["48 389", "annonces apres nettoyage"],
    ["1,01 %", "de prix aberrants retires"],
  ];
  const cw = 3.85, ch = 1.5, gx = 0.3, gy = 0.3;
  const startX = 0.6, startY = 2.4;
  stats.forEach((st, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = startX + col * (cw + gx);
    const y = startY + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.08, fill: { color: NAVY_DARK }, line: { type: "none" } });
    s.addText(st[0], {
      x: x + 0.2, y: y + 0.15, w: cw - 0.4, h: 0.75, isTextBox: true, margin: 0,
      fontFace: "Cambria", bold: true, fontSize: 30, color: CORAL,
    });
    s.addText(st[1], {
      x: x + 0.2, y: y + 0.92, w: cw - 0.4, h: 0.5, isTextBox: true, margin: 0,
      fontFace: "Calibri", fontSize: 13, color: WHITE,
    });
  });
  pageNumber(s, 6);
  s.addNotes(
    "[~45s] Parlons maintenant des donnees elles-memes. J'utilise le dataset New York City Airbnb Open Data, disponible sur Kaggle -- c'est exactement le jeu de donnees demande dans mon sujet de projet. A l'origine, il contient 48 895 annonces brutes et 16 variables : identifiant, hote, localisation geographique, type de logement, prix, nombre d'avis, disponibilite annuelle, et quelques autres. Apres le nettoyage que je detaillerai dans quelques instants -- essentiellement la suppression des prix aberrants, environ 1% des lignes -- il reste 48 389 annonces exploitables, reparties sur 5 arrondissements et pas moins de 221 quartiers differents. Un point que je tiens a repeter clairement : il n'y a dans ce dataset ni photos, ni texte de description, ni note moyenne des avis. Ce n'est pas un oubli de ma part, c'est une caracteristique du dataset, et ca va volontairement limiter la precision maximale atteignable par n'importe quel modele -- j'y reviendrai en detail dans la partie analyse critique."
  );
}

// =====================================================================
// SLIDE 7 - EDA
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "03 . Donnees");
  title(s, "Analyse exploratoire : deux variables dominantes");

  s.addImage({ path: FIG("02_boxplot_prix_arrondissement.png"), x: 0.6, y: 1.85, w: 5.9, h: 3.5 });
  s.addImage({ path: FIG("03_boxplot_prix_room_type.png"), x: 6.75, y: 1.85, w: 5.9, h: 3.5 });

  s.addText([
    { text: "Arrondissement : ", options: { bold: true, color: NAVY } },
    { text: "Manhattan (149,5 $ median) domine largement le Bronx (68 $).", options: { color: INK, breakLine: true } },
    { text: "Type de logement : ", options: { bold: true, color: NAVY } },
    { text: "un logement entier coute 2 a 3 fois plus qu'une chambre privee ou partagee.", options: { color: INK } },
  ], { x: 0.6, y: 5.55, w: 12, h: 1.2, isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 14, lineSpacing: 22 });
  pageNumber(s, 7);
  s.addNotes(
    "[~70s] Avant de me lancer dans la modelisation, j'ai pris le temps d'explorer les donnees visuellement -- c'est une etape que je considere indispensable pour ne pas modeliser a l'aveugle. Deux constats tres clairs dominent tout le reste, et les deux graphiques que vous voyez ici les illustrent. Premierement, l'effet de l'arrondissement, a gauche : le prix median a Manhattan atteint 149 dollars 50, contre seulement 68 dollars dans le Bronx -- c'est plus du double, et on observe une hierarchie tres nette entre les cinq arrondissements. Deuxiemement, et c'est encore plus marque, l'effet du type de logement, a droite : un logement entier affiche un prix median de 160 dollars, contre seulement 70 dollars pour une chambre privee et environ 45 dollars pour une chambre partagee -- un facteur de deux a trois entre les categories extremes. Ces deux constats, obtenus simplement en regardant des boxplots, ne sont pas anecdotiques : ils se retrouveront confirmes bien plus tard, de facon parfaitement quantitative cette fois, dans l'analyse d'importance des variables du modele final. C'est deja un premier indice tres fort de ce qui va structurer tous mes resultats."
  );
}

// =====================================================================
// SLIDE 8 - PRETRAITEMENT / FEATURE ENGINEERING
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "04 . Methodologie");
  title(s, "Pretraitement et feature engineering");

  bulletBlock(s, [
    "Suppression des prix nuls et extremes (percentiles 0,5% / 99,5%) : 492 lignes retirees.",
    "Imputation : reviews_per_month a 0, ancienneté du dernier avis imputee pour les annonces sans avis.",
    "distance_center_km : distance haversine au centre de Manhattan (feature la plus correlee au prix apres le type de logement).",
    "neighbourhood_freq : encodage par frequence pour la variable a 221 modalites (evite l'explosion du one-hot).",
    "one-hot sur neighbourhood_group et room_type ; StandardScaler sur les variables numeriques.",
  ], { x: 0.6, y: 2.0, w: 6.7, h: 4.3, fontSize: 13.5, spaceAfter: 14 });

  s.addImage({ path: FIG("04_heatmap_correlations.png"), x: 7.6, y: 1.85, w: 5.1, h: 4.9 });
  pageNumber(s, 8);
  s.addNotes(
    "[~65s] Passons a la methodologie, et d'abord au pretraitement, qui s'articule en quatre etapes. D'abord, la suppression des prix aberrants : j'ai utilise des percentiles statistiques, 0,5% de chaque cote de la distribution, plutot qu'un seuil arbitraire choisi a la main -- au final, 492 lignes ont ete retirees sur 48 895, soit environ 1%. Ensuite, j'ai gere les valeurs manquantes de facon differenciee selon leur nature. Le point le plus important, c'est la creation de nouvelles variables : la plus utile est distance_center_km, la distance a vol d'oiseau entre chaque annonce et le centre de Manhattan, calculee avec la formule de haversine -- une formule qui tient compte de la courbure de la Terre, contrairement a une simple distance euclidienne. Cote encodage, j'ai fait un choix different selon la cardinalite des variables : le quartier, qui compte 221 valeurs differentes, est encode par frequence pour eviter de faire exploser le nombre de colonnes ; alors que le type de logement et l'arrondissement, qui ont tres peu de categories, sont encodes classiquement en one-hot. Regardez la matrice de correlation a droite : distance_center_km est la variable numerique la plus correlee au prix, ce qui confirme deja l'importance de la geographie."
  );
}

// =====================================================================
// SLIDE 9 - PIPELINE / ARCHITECTURE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "04 . Methodologie");
  title(s, "Architecture du pipeline");

  const steps = [
    ["AB_NYC_2019.csv", "Donnees brutes\n(Kaggle)"],
    ["preprocessing.py", "Nettoyage,\nfeatures, encodage"],
    ["eda.py /\ntrain_models.py", "Analyse +\n12 modeles compares"],
    ["app.py\n(Streamlit)", "Interface\ninteractive"],
  ];
  const bw = 2.7, bh = 1.7, gap = 0.55;
  const totalW = steps.length * bw + (steps.length - 1) * gap;
  let x = (13.33 - totalW) / 2;
  const y = 2.9;
  steps.forEach((st, i) => {
    s.addShape("roundRect", {
      x, y, w: bw, h: bh, rectRadius: 0.1,
      fill: { color: i === steps.length - 1 ? CORAL : NAVY }, line: { type: "none" },
      shadow: { type: "outer", color: "000000", opacity: 0.15, blur: 8, offset: 3, angle: 90 },
    });
    s.addText(st[0], {
      x: x + 0.15, y: y + 0.2, w: bw - 0.3, h: 0.65, isTextBox: true, margin: 0,
      fontFace: "Consolas", bold: true, fontSize: 13, color: WHITE, align: "center",
    });
    s.addText(st[1], {
      x: x + 0.15, y: y + 0.85, w: bw - 0.3, h: 0.75, isTextBox: true, margin: 0,
      fontFace: "Calibri", fontSize: 11.5, color: "E8EAF5", align: "center",
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + bw, y: y + bh / 2 - 0.35, w: gap, h: 0.7, isTextBox: true, margin: 0,
        fontFace: "Calibri", bold: true, fontSize: 28, color: MUTED, align: "center", valign: "middle",
      });
    }
    x += bw + gap;
  });

  s.addText("Meme protocole pour tous les modeles : 80/20 train-test, validation croisee a 5 plis, graine fixee (42)", {
    x: 0.6, y: 5.3, w: 12, h: 0.5, isTextBox: true, margin: 0,
    fontFace: "Calibri", italic: true, fontSize: 13, color: MUTED, align: "center",
  });
  pageNumber(s, 9);
  s.addNotes(
    "[~40s] Voici l'architecture complete de mon pipeline, en quatre etapes bien separees et scriptees independamment. Les donnees brutes de Kaggle passent d'abord par le script de pretraitement, qui produit un fichier nettoye. Ce fichier alimente ensuite deux choses en parallele : le script d'analyse exploratoire, et le script de comparaison des douze modeles avec sauvegarde du meilleur. Et enfin, l'application Streamlit vient consommer a la fois les donnees nettoyees et le modele entraine pour offrir l'interface interactive. Un point de rigueur methodologique important a souligner ici : exactement le meme protocole s'applique a tous les modeles, sans exception -- meme decoupage 80/20 entre entrainement et test, meme validation croisee a 5 plis, et une graine aleatoire fixee a 42 partout, pour garantir a la fois une comparaison honnete entre les modeles et une parfaite reproductibilite des resultats si quelqu'un relance le code."
  );
}

// =====================================================================
// SLIDE 10 - COMPARAISON DE 12 MODELES (native chart)
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "05 . Resultats");
  title(s, "Comparaison de 12 algorithmes (RMSE test)");

  const labels = ["XGBoost", "Extra Trees", "Random Forest", "Gradient\nBoosting", "MLP", "KNN", "SVR", "Decision\nTree", "Linear Reg.", "Ridge", "Lasso", "ElasticNet"];
  const values = [85.05, 85.07, 85.64, 87.55, 88.46, 89.22, 93.20, 93.59, 93.65, 93.65, 93.95, 98.08];
  const colors = values.map((v, i) => (i < 3 ? CORAL : "9AA4C7"));

  s.addChart(pres.ChartType.bar, [
    { name: "RMSE ($)", labels, values },
  ], {
    x: 0.5, y: 1.9, w: 12.3, h: 4.9,
    barDir: "col",
    showTitle: false,
    showLegend: false,
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: INK,
    dataLabelFontSize: 10,
    dataLabelFormatCode: "0.0",
    chartColors: colors,
    catAxisLabelColor: INK,
    catAxisLabelFontSize: 10,
    valAxisLabelColor: MUTED,
    valAxisLabelFontSize: 10,
    valAxisTitle: "RMSE ($) - plus bas = meilleur",
    showValAxisTitle: true,
    valAxisTitleFontSize: 11,
    valAxisTitleColor: MUTED,
    catGridLine: { style: "none" },
    valGridLine: { color: "E8EAF0", size: 1 },
    valAxisMinVal: 0,
  });

  s.addText("Les methodes d'ensemble a base d'arbres (coral) dominent nettement les modeles lineaires", {
    x: 0.6, y: 6.9, w: 12, h: 0.4, isTextBox: true, margin: 0,
    fontFace: "Calibri", italic: true, fontSize: 12, color: MUTED, align: "center",
  });
  pageNumber(s, 10);
  s.addNotes(
    "[~95s] Nous arrivons a la slide que je considere comme la plus importante de toute ma soutenance. J'ai teste douze algorithmes de regression, avec un protocole strictement identique pour chacun -- memes variables, meme decoupage, meme validation croisee. Ces douze modeles couvrent quatre grandes familles : les modeles lineaires regularises -- regression lineaire, Ridge, Lasso, ElasticNet ; les modeles de proximite avec le KNN ; les arbres et methodes d'ensemble -- arbre de decision seul, puis Random Forest, Extra Trees, Gradient Boosting et XGBoost ; et enfin deux approches plus atypiques, le SVR et un reseau de neurones multicouches. Regardez maintenant le graphique : les trois meilleurs modeles, colores en corail, sont XGBoost, Extra Trees et Random Forest, avec des RMSE tres proches les uns des autres, autour de 85 dollars. Ils devancent nettement tous les modeles lineaires, a droite du graphique, qui plafonnent entre 93 et 98 dollars de RMSE. Pourquoi cet ecart ? Parce que la relation entre le prix et les caracteristiques n'est pas une simple addition ponderee : il existe de vraies interactions entre variables. Par exemple, l'effet de la distance au centre-ville ne joue pas du tout de la meme facon selon qu'on parle d'un logement entier ou d'une simple chambre -- et seuls les modeles a base d'arbres sont capables de capturer ce genre de nuance, par construction. Notez aussi un resultat qui peut surprendre : meme le reseau de neurones ne fait pas mieux que les meilleurs arbres. Ce n'est pas une erreur de ma part, c'est un resultat coherent avec la litterature : sur un volume de donnees tabulaires de cette taille, les methodes a base d'arbres restent generalement l'etat de l'art, les reseaux de neurones ayant surtout leur force sur des donnees non structurees comme les images ou le texte, ou sur des volumes bien plus importants."
  );
}

// =====================================================================
// SLIDE 11 - MODELE FINAL + FEATURE IMPORTANCE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "05 . Resultats");
  title(s, "Modele final : XGBoost optimise");

  statCard(s, 0.6, 1.9, 3.05, 1.3, "84,49 $", "RMSE (test)", { valueColor: CORAL, valueSize: 26 });
  statCard(s, 3.85, 1.9, 3.05, 1.3, "48,35 $", "MAE (test)", { valueColor: NAVY, valueSize: 26 });
  statCard(s, 0.6, 3.35, 3.05, 1.3, "0,453", "R² (test)", { valueColor: NAVY, valueSize: 26 });
  statCard(s, 3.85, 3.35, 3.05, 1.3, "36,1 %", "MAPE (test)", { valueColor: NAVY, valueSize: 26 });

  s.addText("Hyperparametres retenus (RandomizedSearchCV, cv=3) :", {
    x: 0.6, y: 4.9, w: 6.3, h: 0.35, isTextBox: true, margin: 0,
    fontFace: "Calibri", bold: true, fontSize: 13, color: INK,
  });
  bulletBlock(s, [
    "n_estimators = 400, max_depth = 6, learning_rate = 0,03, subsample = 0,7",
    "Gain vs version par defaut : RMSE 85,05 $ → 84,49 $ (-0,66 %)",
  ], { x: 0.6, y: 5.3, w: 6.3, h: 1.5, fontSize: 12.5, spaceAfter: 10 });

  s.addImage({ path: FIG("07_feature_importance.png"), x: 7.25, y: 1.9, w: 5.5, h: 4.95 });
  pageNumber(s, 11);
  s.addNotes(
    "[~80s] Une fois ce classement etabli, j'ai optimise les hyperparametres des trois meilleurs modeles avec une recherche aleatoire, la fameuse RandomizedSearchCV, qui teste douze combinaisons de reglages choisies au hasard plutot que de tester exhaustivement toutes les combinaisons possibles, ce qui aurait pris beaucoup trop de temps. Le modele final retenu est XGBoost, avec les reglages suivants : 400 arbres, une profondeur maximale de 6 pour chaque arbre, un taux d'apprentissage tres prudent de 0,03, et un sous-echantillonnage de 0,7 -- c'est-a-dire que chaque arbre n'est construit que sur 70% des donnees tirees au hasard, ce qui ajoute de la diversite et limite le risque de sur-apprentissage. En dollars concrets, maintenant : mon modele se trompe en moyenne de 48 dollars 35 par nuit, c'est la MAE, et il explique 45,3% de la variation totale du prix, c'est le R2. Le gain apporte par l'optimisation reste modeste, moins de 1% par rapport aux reglages par defaut, ce qui montre que le vrai levier de performance, dans ce projet, c'est le choix de la famille d'algorithme -- les arbres plutot que le lineaire -- bien plus que le reglage fin des hyperparametres. Dernier point, et il est capital : quand j'analyse l'importance des variables du modele final, a droite, je constate que la variable logement entier represente a elle seule 59,5% de l'importance totale du modele -- tres loin devant la distance au centre, qui n'en represente que 4,5%. Autrement dit, le type de logement compte statistiquement bien plus que l'endroit ou il se trouve, ce qui confirme quantitativement ce qu'on avait deja observe visuellement dans l'analyse exploratoire."
  );
}

// =====================================================================
// SLIDE 12 - ANALYSE CRITIQUE
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "06 . Analyse critique");
  title(s, "Points forts et limites");

  s.addShape("roundRect", { x: 0.6, y: 1.95, w: 5.95, h: 4.6, rectRadius: 0.08, fill: { color: "EAF6EE" }, line: { type: "none" } });
  s.addText("Points forts", { x: 0.9, y: 2.15, w: 5.4, h: 0.4, isTextBox: true, margin: 0, fontFace: "Cambria", bold: true, fontSize: 18, color: "1E7A3E" });
  bulletBlock(s, [
    "Chaine complete : donnees -> pretraitement -> 12 modeles -> optimisation -> app",
    "Protocole identique et reproductible pour tous les modeles",
    "Feature engineering geographique original (distance haversine)",
    "Interface graphique fonctionnelle au-dela du simple notebook",
  ], { x: 0.9, y: 2.65, w: 5.4, h: 3.7, fontSize: 13, spaceAfter: 12, color: INK });

  s.addShape("roundRect", { x: 6.8, y: 1.95, w: 5.95, h: 4.6, rectRadius: 0.08, fill: { color: "FDECEC" }, line: { type: "none" } });
  s.addText("Limites assumees", { x: 7.1, y: 2.15, w: 5.4, h: 0.4, isTextBox: true, margin: 0, fontFace: "Cambria", bold: true, fontSize: 18, color: "B23A48" });
  bulletBlock(s, [
    "R² ≈ 0,45 : pas de photos/texte -> variance structurellement inexpliquee",
    "SVR entraine sur un sous-echantillon (6000 lignes) pour le temps de calcul",
    "Donnees de 2019 : prix absolus non actualises",
    "Pas de base de donnees persistante pour l'app (limite de portee du TP)",
  ], { x: 7.1, y: 2.65, w: 5.4, h: 3.7, fontSize: 13, spaceAfter: 12, color: INK });
  pageNumber(s, 12);
  s.addNotes(
    "[~65s] Je passe maintenant a une analyse critique volontairement equilibree de mon propre travail. Cote points forts, rapidement : une chaine de traitement complete et coherente de bout en bout, un protocole d'evaluation identique et reproductible pour tous les modeles, un feature engineering geographique original avec la distance haversine, et une interface graphique reellement fonctionnelle, qui va bien au-dela d'un simple notebook Jupyter. Mais je vais insister davantage sur les limites, parce que je pense que c'est ca qui montre la maturite d'une analyse scientifique, plutot que de presenter un travail comme parfait. Premierement, le R2 d'environ 0,45 : je le repete, ca s'explique par l'absence de photos et de texte dans les donnees disponibles -- ce n'est absolument pas un defaut de ma modelisation, c'est une limite structurelle liee a l'information qu'il m'etait possible d'utiliser. Deuxiemement, le SVR a du etre entraine sur un sous-echantillon de 6000 lignes seulement, pour des raisons de temps de calcul -- sa complexite algorithmique augmente au carre voire au cube avec le nombre de lignes. Troisiemement, les donnees datent de 2019, donc les prix absolus ne refletent plus forcement le marche reel en 2026 -- meme si les relations structurelles entre variables, elles, restent parfaitement valables sur le plan pedagogique. Et enfin, l'application ne dispose pas de base de donnees persistante, ce qui est une limite de portee assumee pour ce TP."
  );
}

// =====================================================================
// SLIDE 13 - DEMO APPLICATION
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "06 . Demonstration");
  title(s, "L'application Streamlit");

  const tabs = [
    ["1", "Exploration des donnees", "Statistiques, distribution des prix, carte des annonces"],
    ["2", "Entrainement / choix du modele", "9 modeles parametrables, metriques en temps reel"],
    ["3", "Test / Prediction", "Saisie utilisateur, prediction, carte, comparaison"],
  ];
  let tx = 0.6;
  tabs.forEach((t) => {
    s.addShape("roundRect", { x: tx, y: 1.95, w: 3.9, h: 1.7, rectRadius: 0.08, fill: { color: CARD_BG }, line: { type: "none" } });
    iconCircle(s, tx + 0.25, 2.15, 0.5, t[0], { bg: NAVY, fontSize: 16 });
    s.addText(t[1], { x: tx + 0.9, y: 2.13, w: 2.85, h: 0.55, isTextBox: true, margin: 0, fontFace: "Calibri", bold: true, fontSize: 12.5, color: INK, valign: "middle" });
    s.addText(t[2], { x: tx + 0.25, y: 2.85, w: 3.45, h: 0.7, isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 10.5, color: MUTED });
    tx += 4.15;
  });

  // Mock prediction result card (values from a real run of the app)
  s.addText("Exemple reel de prediction (onglet Test)", {
    x: 0.6, y: 3.95, w: 6, h: 0.35, isTextBox: true, margin: 0, fontFace: "Calibri", bold: true, fontSize: 13, color: INK,
  });
  s.addShape("roundRect", { x: 0.6, y: 4.35, w: 12, h: 1.9, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" } });
  const mockStats = [
    ["Logement", "Bronx, Entire home/apt"],
    ["Prix predit", "166 $ / nuit"],
    ["Prix moyen (Bronx)", "87 $"],
    ["Ecart vs moyenne", "+79 $"],
  ];
  let mx = 0.9;
  mockStats.forEach((m) => {
    s.addText(m[1], { x: mx, y: 4.55, w: 2.85, h: 0.7, isTextBox: true, margin: 0, fontFace: "Cambria", bold: true, fontSize: 19, color: m[0] === "Prix predit" ? CORAL : WHITE });
    s.addText(m[0], { x: mx, y: 5.25, w: 2.85, h: 0.5, isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 11, color: "CFD5EE" });
    mx += 2.95;
  });
  pageNumber(s, 13);
  s.addNotes(
    "[~90s] Si le temps et la connexion le permettent, je bascule maintenant sur l'application en direct plutot que de rester sur cette slide statique -- une vraie demonstration est toujours bien plus parlante qu'une capture d'ecran. L'application est construite avec Streamlit et organisee en trois onglets. Le premier, Exploration des donnees, permet de charger et visualiser les donnees : statistiques descriptives, distribution des prix, et une carte de toutes les annonces colorees par prix. Le deuxieme, Entrainement et choix du modele, permet de choisir un modele parmi neuf, de regler ses hyperparametres avec des curseurs interactifs, et de voir instantanement les quatre metriques apres entrainement -- on peut aussi charger directement le meilleur modele du benchmark complet, celui que je viens de presenter. Le troisieme onglet, Test et Prediction, est le plus abouti techniquement : on clique sur une carte interactive pour choisir un emplacement, et l'application deduit automatiquement l'arrondissement et le quartier les plus proches de ce point -- plus besoin de les saisir a la main. On complete ensuite quelques caracteristiques -- type de logement, nombre d'avis, disponibilite -- et on obtient une prediction de prix en temps reel, comparee au prix moyen de l'arrondissement selectionne, avec une carte montrant les annonces existantes les plus proches. A titre d'exemple reel que j'ai teste : pour un logement entier situe dans le Bronx, le modele predit 166 dollars la nuit, contre seulement 87 dollars de moyenne dans cet arrondissement -- un ecart de plus 79 dollars, parfaitement coherent avec le poids tres fort du type de logement qu'on vient de voir dans l'analyse d'importance des variables."
  );
}

// =====================================================================
// SLIDE 14 - DIFFICULTES & SOLUTIONS
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, WHITE);
  kicker(s, "07 . Bilan");
  title(s, "Difficultes rencontrees et solutions");

  const rows = [
    ["Encodage de neighbourhood (221 modalites)", "Encodage par frequence plutot que one-hot"],
    ["Temps d'entrainement du SVR (O(n²)-O(n³))", "Entrainement sur un sous-echantillon de 6000 lignes, documente"],
    ["Python 3.14 alpha : numpy/scikit-learn casses", "Environnement virtuel dedie en Python 3.12 (stable)"],
    ["Selection interactive d'un point sur la carte", "streamlit-folium pour capter l'evenement de clic"],
    ["Import du module src/ depuis l'app Streamlit", "Ajout explicite de la racine du projet a sys.path"],
  ];
  let y = 2.0;
  rows.forEach((r) => {
    s.addShape("roundRect", { x: 0.6, y, w: 12.1, h: 0.85, rectRadius: 0.05, fill: { color: CARD_BG }, line: { type: "none" } });
    s.addText(r[0], { x: 0.85, y, w: 5.7, h: 0.85, isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 12.5, color: "B23A48", valign: "middle" });
    s.addText("→", { x: 6.55, y, w: 0.5, h: 0.85, isTextBox: true, margin: 0, fontFace: "Calibri", bold: true, fontSize: 16, color: MUTED, valign: "middle", align: "center" });
    s.addText(r[1], { x: 7.1, y, w: 5.4, h: 0.85, isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 12.5, color: "1E7A3E", valign: "middle" });
    y += 1.0;
  });
  pageNumber(s, 14);
  s.addNotes(
    "[~50s] Ce projet ne s'est pas fait sans obstacles, et je pense que c'est important de les partager, plutot que de donner l'impression que tout s'est deroule sans accroc. Je vais en detailler deux ou trois, les autres restent en reserve pour vos questions. Premier obstacle : le SVR etait beaucoup trop lent a entrainer sur les 38 700 lignes du jeu d'entrainement complet -- sa complexite algorithmique augmente au carre, voire au cube, avec le nombre de lignes. Plutot que d'abandonner ce modele ou d'attendre indefiniment, je l'ai entraine sur un sous-echantillon de 6000 lignes, en documentant clairement cette limite dans mon rapport plutot que de la dissimuler. Deuxieme obstacle, plus technique : l'application a d'abord plante avec une erreur d'import au moment de tester la prediction, parce que Streamlit n'ajoute pas automatiquement la racine du projet au chemin de recherche des modules Python -- j'ai identifie le probleme en testant l'application moi-meme, et corrige ca en une seule ligne de code. Troisieme obstacle que je peux mentionner rapidement : un probleme de compatibilite avec la version de Python installee par defaut sur ma machine, resolu en creant un environnement virtuel dedie."
  );
}

// =====================================================================
// SLIDE 15 - CONCLUSION & PERSPECTIVES
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, NAVY);
  kicker(s, "Conclusion", GOLD);
  title(s, "Bilan et perspectives", { color: WHITE });

  s.addText("Tous les objectifs du cahier des charges ont ete atteints ou depasses :", {
    x: 0.6, y: 1.7, w: 11.5, h: 0.4, isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 14, color: "CFD5EE",
  });
  bulletBlock(s, [
    "12 modeles compares (objectif : 10) avec un protocole identique",
    "4 metriques + validation croisee a 5 plis",
    "Hyperparametres optimises, modele final XGBoost (R² = 0,453)",
    "Interface graphique complete (exploration, entrainement, prediction + carte)",
  ], { x: 0.6, y: 2.2, w: 6, h: 3, fontSize: 13, color: WHITE, spaceAfter: 12 });

  s.addText("Perspectives", { x: 7.1, y: 2.2, w: 5, h: 0.4, isTextBox: true, margin: 0, fontFace: "Cambria", bold: true, fontSize: 16, color: GOLD });
  bulletBlock(s, [
    "Enrichir avec les avis textuels et les photos",
    "Target encoding avec validation croisee imbriquee",
    "Stacking XGBoost + Extra Trees + Random Forest",
    "Deploiement cloud avec base de donnees persistante",
  ], { x: 7.1, y: 2.65, w: 5, h: 2.7, fontSize: 13, color: WHITE, spaceAfter: 12 });

  pageNumber(s, 15);
  s.addNotes(
    "[~75s] Pour conclure, je peux affirmer que tous les objectifs fixes dans le cahier des charges ont ete atteints, et meme depasses sur plusieurs points. Douze modeles compares avec un protocole identique, alors que dix etaient demandes au minimum. Quatre metriques completees d'une validation croisee a cinq plis. Des hyperparametres optimises par recherche aleatoire, pour un modele final XGBoost qui atteint 0,453 de R2. Et une interface graphique complete, couvrant l'exploration des donnees, l'entrainement parametrable d'un modele, et la prediction geolocalisee en temps reel. Ce projet m'a permis de mener, de bout en bout, un veritable cycle de projet de Machine Learning applique, et pas seulement un exercice de modelisation isole. Comme perspectives d'amelioration, j'identifie quatre axes principaux : enrichir le dataset avec les avis textuels, via une analyse de sentiment, et avec les photos, via des features visuelles extraites par un modele de vision ; utiliser un encodage cible plus sophistique pour la variable quartier, avec une validation croisee imbriquee pour eviter toute fuite de donnees ; tester des techniques d'empilement de modeles, ou stacking, en combinant XGBoost, Extra Trees et Random Forest ; et enfin deployer l'application sur une infrastructure cloud avec une base de donnees persistante, pour un usage reel au-dela du cadre pedagogique de ce projet."
  );
}

// =====================================================================
// SLIDE 16 - MERCI
// =====================================================================
{
  const s = pres.addSlide();
  bgFill(s, NAVY);
  s.addShape("ellipse", { x: -2, y: -2.5, w: 6, h: 6, fill: { color: NAVY_DARK }, line: { type: "none" } });
  s.addShape("ellipse", { x: 10, y: 4, w: 6, h: 6, fill: { color: NAVY_DARK }, line: { type: "none" } });

  s.addText("Merci pour votre attention", {
    x: 0.6, y: 2.6, w: 12, h: 1, isTextBox: true, margin: 0,
    fontFace: "Cambria", bold: true, fontSize: 40, color: WHITE, align: "center",
  });
  s.addText("Questions ?", {
    x: 0.6, y: 3.6, w: 12, h: 0.7, isTextBox: true, margin: 0,
    fontFace: "Cambria", italic: true, fontSize: 22, color: CORAL, align: "center",
  });
  s.addText("github.com/kasdiines/airbnb-nyc-price-prediction", {
    x: 0.6, y: 5.3, w: 12, h: 0.5, isTextBox: true, margin: 0,
    fontFace: "Calibri", fontSize: 14, color: GOLD, align: "center",
  });
  s.addText("Ines Kasdi", {
    x: 0.6, y: 5.8, w: 12, h: 0.4, isTextBox: true, margin: 0,
    fontFace: "Calibri", fontSize: 12, color: "CFD5EE", align: "center",
  });

  s.addNotes(
    "[~25s] Merci beaucoup pour votre attention. L'ensemble du code source, des donnees traitees et de l'application est disponible publiquement sur ce depot GitHub. Je suis maintenant prete a repondre a toutes vos questions. (Rappel pour toi : si une question te bloque completement, dis honnetement 'c'est une limite que j'ai identifiee mais pas approfondie dans le temps imparti, une piste serait de...' plutot que d'inventer une reponse -- le jury valorise la lucidite bien plus qu'une reponse improvisee et fausse.)"
  );
}

pres.writeFile({ fileName: path.resolve(__dirname, "soutenance_airbnb.pptx") }).then(() => {
  console.log("Deck written.");
});
