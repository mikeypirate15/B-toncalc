import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Box, 
  Droplets, 
  ArrowLeftRight, 
  Construction, 
  Layers, 
  CircleDollarSign, 
  Landmark, 
  TowerControl as Crane, 
  BarChart3,
  CheckCircle2,
  Lock,
  ChevronRight,
  Info,
  ShoppingCart,
  ClipboardList,
  CalendarDays,
  Truck,
  History,
  FileText,
  Activity
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const PLANS = {
  free:   { label: "Gratuit", color: "#64748b", tabs: ["volume", "dosage", "conversion"] },
  pro:    { label: "Pro",     color: "#f97316", tabs: ["volume", "dosage", "conversion", "maconnerie", "armature", "dalle", "poutre", "escalier", "commande", "cout"] },
  expert: { label: "Expert",  color: "#a855f7", tabs: ["volume", "dosage", "conversion", "maconnerie", "armature", "dalle", "poutre", "escalier", "cout", "fondation", "poteau", "pression", "mur", "dalot", "curing", "commande", "stock", "jalons", "historique"] },
};

const ALL_TABS = [
  { id: "volume",     label: "Volume",     icon: Box,            plan: "free"   },
  { id: "dosage",     label: "Dosage",     icon: Droplets,       plan: "free"   },
  { id: "conversion", label: "Conversion", icon: ArrowLeftRight, plan: "free"   },
  { id: "maconnerie", label: "Maçonnerie", icon: Box,            plan: "pro"    },
  { id: "armature",   label: "Armature",   icon: Construction,   plan: "pro"    },
  { id: "dalle",      label: "Dalle BA",   icon: Layers,         plan: "pro"    },
  { id: "poutre",     label: "Poutre BA",  icon: Box,            plan: "pro"    },
  { id: "escalier",   label: "Escalier",   icon: Construction,   plan: "pro"    },
  { id: "cout",       label: "Coût Est.",   icon: CircleDollarSign, plan: "pro"  },
  { id: "commande",   label: "Matériaux",  icon: ShoppingCart,   plan: "pro"    },
  { id: "fondation",  label: "Fondation",  icon: Landmark,       plan: "expert" },
  { id: "poteau",     label: "Poteau BA",  icon: Crane,          plan: "expert" },
  { id: "dalot",      label: "Dalot / Pont", icon: FileText,      plan: "expert" },
  { id: "mur",        label: "Soutènement", icon: Landmark,       plan: "expert" },
  { id: "pression",   label: "Pression",   icon: BarChart3,      plan: "expert" },
  { id: "curing",     label: "Séchage",    icon: Droplets,       plan: "expert" },
  { id: "stock",      label: "Stock Site", icon: ClipboardList,   plan: "expert" },
  { id: "jalons",     label: "Planning",   icon: CalendarDays,   plan: "expert" },
  { id: "historique", label: "Rapports",   icon: History,        plan: "expert" },
] as const;

const DOSAGE_TYPES = {
  b25:    { label: "B25 – Courant",      ciment: 350, sable: 700, gravier: 1050 },
  b30:    { label: "B30 – Résistant",    ciment: 400, sable: 650, gravier: 1000 },
  b35:    { label: "B35 – Haute dureté", ciment: 450, sable: 600, gravier: 950  },
  maigre: { label: "Béton maigre",       ciment: 250, sable: 800, gravier: 1100 },
};

// ── Shared UI Components ──────────────────────────────────────────────────────

function NumInput({ label, value, onChange, unit, placeholder }: { label: string, value: string, onChange: (v: string) => void, unit?: string, placeholder?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative flex rounded-xl shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-orange-500 transition-all bg-white overflow-hidden">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0.00"}
          className="block flex-1 border-0 bg-transparent py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
          min="0"
          step="any"
        />
        {unit && (
          <span className="flex items-center px-4 bg-slate-50 border-l border-slate-200 text-slate-500 text-sm font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function SelInput({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: { v: string, l: string }[] }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-orange-500 transition-all sm:text-sm bg-white"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, accent = "#f97316" }: { label: string, value: string | number, unit?: string, accent?: string, key?: any }) {
  const displayValue = typeof value === 'number' ? value : value || "0";
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-2xl shadow-sm border-l-4 overflow-hidden"
      style={{ borderLeftColor: accent }}
    >
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 opacity-70">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-display" style={{ color: accent }}>
          {displayValue}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-slate-800 mt-6 mb-4 flex items-center gap-2">{children}</h3>;
}

// ── Tab Components ────────────────────────────────────────────────────────────

function ShapeVisualizer({ shape, l, w, h }: { shape: string, l: number, w: number, h: number }) {
  return (
    <div className="w-full h-32 bg-slate-50 rounded-xl mb-6 flex items-center justify-center border border-slate-100 overflow-hidden">
      <svg width="120" height="100" viewBox="0 0 120 100" className="text-orange-500 drop-shadow-sm">
        {shape === "rect" && (
          <g fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2">
            <rect x="20" y="20" width="80" height="40" rx="4" />
            <path d="M20 20 L40 5 M100 20 L120 5 M100 60 L120 45" fill="none" strokeDasharray="2" opacity="0.5" />
            <rect x="40" y="5" width="80" height="40" rx="4" opacity="0.3" />
          </g>
        )}
        {shape === "cyl" && (
          <g fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2">
            <ellipse cx="60" cy="20" rx="40" ry="15" />
            <path d="M20 20 L20 70 A40 15 0 0 0 100 70 L100 20" />
            <ellipse cx="60" cy="70" rx="40" ry="15" fillOpacity="0.2" />
          </g>
        )}
        {shape === "tri" && (
          <g fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2">
            <path d="M60 10 L10 80 L110 80 Z" />
            <path d="M60 10 L80 20 L130 90 L110 80" fill="none" strokeDasharray="2" opacity="0.4" />
          </g>
        )}
      </svg>
      <div className="flex flex-col gap-1 pr-6">
        <div className="text-[10px] text-slate-400 font-bold uppercase">Aperçu Schématique</div>
        <div className="text-xs font-mono text-slate-500">
          {l || 0}m × {w || 0}m × {h || 0}m
        </div>
      </div>
    </div>
  );
}

function VolumeTab() {
  const [shape, setShape] = useState("rect");
  const [l, setL] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");

  let vol = 0;
  const lf = parseFloat(l) || 0;
  const wf = parseFloat(w) || 0;
  const hf = parseFloat(h) || 0;

  if (shape === "rect") vol = lf * wf * hf;
  else if (shape === "cyl") vol = Math.PI * Math.pow(lf / 2, 2) * hf;
  else if (shape === "tri") vol = 0.5 * lf * wf * hf;

  const ok = !isNaN(vol) && vol > 0;

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm mb-6 font-medium">Calculez le volume exact de béton nécessaire et sa masse selon la géométrie.</p>
      
      <ShapeVisualizer shape={shape} l={lf} w={wf} h={hf} />
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Forme de l'ouvrage</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "rect", label: "Rectangulaire", icon: "⬜" },
            { id: "cyl", label: "Cylindre", icon: "⭕" },
            { id: "tri", label: "Triangle", icon: "🔺" }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setShape(s.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                shape === s.id 
                ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-105 z-10" 
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="text-[10px] font-bold uppercase">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <NumInput label={shape === "cyl" ? "Diamètre" : "Longueur"} value={l} onChange={setL} unit="m" />
      {shape !== "cyl" && <NumInput label="Largeur" value={w} onChange={setW} unit="m" />}
      <NumInput label="Hauteur / Épaisseur" value={h} onChange={setH} unit="m" />

      {ok ? (
        <div className="pt-4 space-y-4">
          <SectionTitle>📐 Résultats</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Volume total" value={vol.toFixed(3)} unit="m³" accent="#f97316" />
            <ResultCard label="Volume en litres" value={(vol * 1000).toLocaleString()} unit="L" accent="#3b82f6" />
            <ResultCard label="Masse estimée (BA)" value={(vol * 2500).toLocaleString()} unit="kg" accent="#10b981" />
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-2xl p-8 text-center text-slate-400 mt-10 border-2 border-dashed border-slate-200">
          Entrez les dimensions pour calculer le volume.
        </div>
      )}
    </div>
  );
}

function DosageTab() {
  const [type, setType] = useState<keyof typeof DOSAGE_TYPES>("b25");
  const [vol, setVol] = useState("");
  
  const v = parseFloat(vol);
  const r = DOSAGE_TYPES[type];
  const ok = !isNaN(v) && v > 0;

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm mb-6">Quantités de matériaux (ciment, sable, gravier) selon la formulation choisie.</p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Classe de béton</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(DOSAGE_TYPES).map(([k, d]) => (
            <button
              key={k}
              onClick={() => setType(k as any)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                type === k 
                ? "border-orange-500 bg-orange-50 text-orange-700 font-bold" 
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="text-sm">{d.label}</div>
              <div className="text-[10px] opacity-60 font-mono mt-1">{d.ciment}kg ciment/m³</div>
            </button>
          ))}
        </div>
      </div>

      <NumInput label="Volume total à couler" value={vol} onChange={setVol} unit="m³" placeholder="Ex: 2.5" />

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mt-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Composition standard (1 m³)</h4>
          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold text-slate-500 uppercase tracking-tighter">Référence</span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between text-sm"><span className="text-slate-400">Ciment</span><span className="font-bold text-slate-700">{r.ciment} kg</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-400">Sable</span><span className="font-bold text-slate-700">{r.sable} kg</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-400">Gravier</span><span className="font-bold text-slate-700">{r.gravier} kg</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-400">Eau</span><span className="font-bold text-slate-700">{Math.round(r.ciment * 0.5)} L</span></div>
        </div>
      </div>

      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>🏗️ Matériaux pour {v} m³</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Ciment total" value={(r.ciment * v).toFixed(0)} unit="kg" accent="#a78bfa" />
            <ResultCard label="Sacs (50kg)" value={Math.ceil(r.ciment * v / 50)} unit="sacs" accent="#ec4899" />
            <ResultCard label="Sable" value={(r.sable * v).toFixed(0)} unit="kg" accent="#f59e0b" />
            <ResultCard label="Gravier" value={(r.gravier * v).toFixed(0)} unit="kg" accent="#6b7280" />
            <ResultCard label="Eau nécessaire" value={(r.ciment * 0.5 * v).toFixed(0)} unit="L" accent="#3b82f6" />
          </div>
        </div>
      )}
    </div>
  );
}

function ConversionTab() {
  const [val, setVal] = useState("");
  const [from, setFrom] = useState<keyof typeof CONVERSIONS>("m3");
  
  const CONVERSIONS = {
    m3:    { label: "Mètres cubes (m³)", f: 1 },
    litres: { label: "Litres (L)", f: 0.001 },
    tonnes: { label: "Tonnes (béton)", f: 1 / 2.4 },
    ft3:   { label: "Pieds cubes (ft³)", f: 0.0283168 },
    yd3:   { label: "Yards cubes (yd³)", f: 0.764555 },
    sacs50: { label: "Sacs (Ciment 50kg)", f: 0.033 }, // 1 sac 50kg ~ 33L de ciment pur
  };

  const v = parseFloat(val);
  const ok = !isNaN(v) && v > 0;
  const toM3 = ok ? v * CONVERSIONS[from].f : 0;

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm mb-6">Convertissez vos mesures entre les différentes unités de volume et de masse.</p>
      
      <SelInput 
        label="Unité source" 
        value={from} 
        onChange={(v) => setFrom(v as any)} 
        options={Object.entries(CONVERSIONS).map(([k, u]) => ({ v: k, l: u.label }))} 
      />
      
      <NumInput label="Valeur à convertir" value={val} onChange={setVal} unit={from} />

      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>⇄ Résultats</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(CONVERSIONS).filter(([k]) => k !== from).map(([k, u]) => (
              <ResultCard 
                key={k} 
                label={u.label} 
                value={(toM3 / u.f).toLocaleString("fr-FR", { maximumFractionDigits: 3 })} 
                accent="#6366f1"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArmatureTab() {
  const [diam, setDiam] = useState("");
  const [esp, setEsp] = useState("");
  const [lon, setLon] = useState("");
  const [lar, setLar] = useState("");

  const d = parseFloat(diam);
  const e = parseFloat(esp) / 100;
  const L = parseFloat(lon);
  const W = parseFloat(lar);

  const ok = !isNaN(d) && !isNaN(e) && !isNaN(L) && !isNaN(W) && d > 0 && e > 0 && L > 0 && W > 0;

  const sec = Math.PI * Math.pow(d / 2000, 2);
  const nL = Math.ceil(W / e) + 1;
  const nW = Math.ceil(L / e) + 1;
  const poids = (nL * W + nW * L) * sec * 7850;
  const ratio = ok ? (poids / (L * W * 0.2) * 1000).toFixed(0) : 0; // Estimation sur dalle 20cm

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm mb-6">Calcul du ferraillage pour dalles et radiers (nappe de treillis ou barres HA).</p>
      
      <div className="grid grid-cols-2 gap-4">
        <SelInput label="Diamètre HA" value={diam} onChange={setDiam} options={[
          { v: "", l: "Choisir..." }, { v: "6", l: "6 mm" }, { v: "8", l: "8 mm" }, { v: "10", l: "10 mm" },
          { v: "12", l: "12 mm" }, { v: "14", l: "14 mm" }, { v: "16", l: "16 mm" }
        ]} />
        <NumInput label="Espacement" value={esp} onChange={setEsp} unit="cm" placeholder="Ex: 15" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Longueur" value={lon} onChange={setLon} unit="m" />
        <NumInput label="Largeur" value={lar} onChange={setLar} unit="m" />
      </div>

      {ok ? (
        <div className="pt-4 space-y-4">
          <SectionTitle>🔩 Résultats Armature</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Poids total acier" value={poids.toFixed(1)} unit="kg" accent="#ec4899" />
            <ResultCard label="Ratio d'armature" value={ratio} unit="kg/m³" accent="#10b981" />
            <ResultCard label="Barres Sens Long" value={nL} unit="unités" accent="#f97316" />
            <ResultCard label="Barres Sens Larg" value={nW} unit="unités" accent="#f97316" />
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-2xl p-8 text-center text-slate-400 mt-10">
          Paramètres requis pour calculer l'armature.
        </div>
      )}
    </div>
  );
}

function DalleTab() {
  const [ep, setEp] = useState("");
  const [por, setPor] = useState("");
  const [chg, setChg] = useState("");
  const [fc, setFc] = useState("25");

  const e = parseFloat(ep) / 100;
  const l = parseFloat(por);
  const q = parseFloat(chg);
  const ok = !isNaN(e) && !isNaN(l) && !isNaN(q) && e > 0 && l > 0 && q > 0;

  const pp = e * 25; // Poids propre béton armé ~25kN/m³
  const qt = pp + q;
  const Mmax = (qt * l * l) / 8;
  const Vmax = (qt * l) / 2;
  const epMin = (l / 25 * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <SectionTitle>🏗️ Pré-dimensionnement Dalle</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="Épaisseur dalle" value={ep} onChange={setEp} unit="cm" placeholder="Ex: 15" />
        <NumInput label="Portée libre (L)" value={por} onChange={setPor} unit="m" placeholder="Ex: 4.5" />
        <NumInput label="Charge (Q)" value={chg} onChange={setChg} unit="kN/m²" placeholder="Ex: 2.5" />
        <SelInput label="Résistance fck" value={fc} onChange={setFc} options={[
          { v: "20", l: "C20/25" }, { v: "25", l: "C25/30" }, { v: "30", l: "C30/37" }
        ]} />
      </div>

      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>📊 Vérifications</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Épaisseur min (L/25)" value={epMin} unit="cm" accent={parseFloat(ep) >= parseFloat(epMin) ? "#10b981" : "#ef4444"} />
            <ResultCard label="Charge totale (G+Q)" value={qt.toFixed(2)} unit="kN/m²" accent="#6366f1" />
            <ResultCard label="Moment de flexion (ELU)" value={(Mmax * 1.45).toFixed(2)} unit="kNm/ml" accent="#a855f7" />
            <ResultCard label="Effort tranchant max" value={(Vmax * 1.45).toFixed(2)} unit="kN/ml" accent="#ec4899" />
          </div>
          {parseFloat(ep) < parseFloat(epMin) && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex gap-3 italic">
              <Info className="w-5 h-5 flex-shrink-0" />
              L'épaisseur est inférieure au ratio L/25 recommandé pour limiter les flèches.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CoutTab() {
  const [vol, setVol] = useState("");
  const [reg, setReg] = useState("maghreb");
  const [mo, setMo] = useState("true");

  const PRIX = {
    maghreb: { ciment: 12, sable: 3, gravier: 4, mo_: 25, pompe: 100 },
    europe:  { ciment: 20, sable: 12, gravier: 15, mo_: 80, pompe: 250 },
    afrique: { ciment: 15, sable: 5, gravier: 6, mo_: 15, pompe: 70 },
    central_africa: { ciment: 16, sable: 7, gravier: 8, mo_: 20, pompe: 80 },
  };

  const CURRENCIES = {
    maghreb: "MAD/DZD",
    europe: "€",
    afrique: "XOF",
    central_africa: "XAF",
  };

  const v = parseFloat(vol);
  const p = PRIX[reg as keyof typeof PRIX];
  const currency = CURRENCIES[reg as keyof typeof CURRENCIES];
  const ok = !isNaN(v) && v > 0;

  // Calculs simplifiés
  const cC = ok ? v * 350 * p.ciment / 50 : 0;
  const cS = ok ? v * 700 * p.sable / 1000 : 0;
  const cG = ok ? v * 1050 * p.gravier / 1000 : 0;
  const cM = ok && mo === "true" ? v * p.mo_ : 0;
  const total = cC + cS + cG + cM;

  return (
    <div className="space-y-4">
      <SectionTitle>💰 Estimation Budgétaire</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelInput label="Marché / Région" value={reg} onChange={setReg} options={[
          { v: "maghreb", l: "Maghreb / Moyen-Orient (MAD/DZD)" },
          { v: "europe",  l: "Europe / OCDE (€)" },
          { v: "afrique", l: "Afrique de l'Ouest (XOF)" },
          { v: "central_africa", l: "Afrique Centrale / Gabon (XAF)" }
        ]} />
        <NumInput label="Volume total" value={vol} onChange={setVol} unit="m³" />
        <SelInput label="Main d'œuvre" value={mo} onChange={setMo} options={[{ v: "true", l: "Inclure" }, { v: "false", l: "Exclure" }]} />
      </div>

      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>Récapitulatif ({currency})</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Fourniture Matériaux" value={Math.round(cC+cS+cG).toLocaleString()} unit={currency} accent="#f97316" />
            <ResultCard label="Coût Main d'œuvre" value={Math.round(cM).toLocaleString()} unit={currency} accent="#3b82f6" />
            <div className="md:col-span-2 bg-emerald-50 border-2 border-emerald-500/20 p-6 rounded-3xl text-center space-y-1 mt-2">
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest">Total Estimé</span>
              <div className="text-4xl font-bold text-emerald-700 font-display">{Math.round(total).toLocaleString()} <span className="text-xl">{currency}</span></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic text-center">Prix indicatifs basés sur les moyennes régionales. Consultez vos fournisseurs locaux.</p>
        </div>
      )}
    </div>
  );
}

function FondationTab() {
  const [chg, setChg] = useState("");
  const [sig, setSig] = useState("");
  const [typ, setTyp] = useState("filante");
  const [lar, setLar] = useState("");

  const q = parseFloat(chg);
  const s = parseFloat(sig);
  const b = parseFloat(lar);
  const ok1 = !isNaN(q) && !isNaN(s) && q > 0 && s > 0;
  const ok2 = ok1 && !isNaN(b) && b > 0;
  const Smin = ok1 ? (q / s).toFixed(2) : "";
  const Lmin = (ok2 && typ === "filante") ? (q / (s * b)).toFixed(2) : "";
  const sigCalc = (ok2 && typ === "isolee") ? (q / (b * b)).toFixed(0) : "";

  return (
    <div className="space-y-4">
      <SectionTitle>🏛️ Fondation Superficielle</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelInput label="Type" value={typ} onChange={setTyp} options={[
          { v: "filante", l: "Semelle filante" }, { v: "isolee", l: "Semelle isolée" }
        ]} />
        <NumInput label="Charge de service N" value={chg} onChange={setChg} unit="kN" />
        <NumInput label="Contrainte du sol σ" value={sig} onChange={setSig} unit="kPa" />
        <NumInput label={typ === "filante" ? "Largeur Semelle" : "Côté Semelle B"} value={lar} onChange={setLar} unit="m" />
      </div>

      {ok1 && (
        <div className="pt-4 space-y-4">
          <SectionTitle>🔍 Analyse Statique</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Surface d'assise min" value={Smin || "0"} unit="m²" accent="#f97316" />
            {typ === "isolee" && ok2 && <ResultCard label="Pression réelle" value={sigCalc || "0"} unit="kPa" accent={parseFloat(sigCalc || "0") <= s ? "#10b981" : "#ef4444"} />}
            {typ === "filante" && ok2 && <ResultCard label="Lé de répartition" value={Lmin || "0"} unit="m" accent="#3b82f6" />}
          </div>
        </div>
      )}
    </div>
  );
}

function PoteauTab() {
  const [Nu, setNu] = useState(""); 
  const [l0, setL0] = useState("");
  const n = parseFloat(Nu), l = parseFloat(l0);
  const ok = !isNaN(n) && !isNaN(l) && n > 0 && l > 0;
  
  const Ac = ok ? (n * 1000 / (0.8 * 25 / 1.5 * 1000)).toFixed(4) : "";
  const cote = ok ? (Math.sqrt(parseFloat(Ac)) * 100).toFixed(1) : "";
  const elan = ok ? (l / (parseFloat(cote) / 100 / Math.sqrt(12))).toFixed(1) : "";

  return (
    <div className="space-y-4">
      <SectionTitle>🏗️ Descente de Charge : Poteau</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="Effort Normal Nu" value={Nu} onChange={setNu} unit="kN" />
        <NumInput label="Hauteur libre l0" value={l0} onChange={setL0} unit="m" />
      </div>

      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>📐 Dimensionnement</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Côté min (carré)" value={cote || "0"} unit="cm" accent="#a855f7" />
            <ResultCard label="Section béton min" value={(parseFloat(String(Ac)) * 10000).toFixed(0)} unit="cm²" accent="#f97316" />
            <ResultCard label="Élancement λ" value={elan || "0"} accent={parseFloat(String(elan)) < 70 ? "#10b981" : "#ef4444"} />
          </div>
          {parseFloat(elan) > 70 && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold ring-1 ring-red-200">
              RISQUE DE FLAMBEMENT ! Augmentez la section du poteau.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PressionTab() {
  const [h, setH] = useState(""); 
  const [rho, setRho] = useState("1000"); 
  const [k, setK] = useState("1.0");

  const hf = parseFloat(h);
  const dens = parseFloat(rho);
  const kf = parseFloat(k);
  const ok = !isNaN(hf) && hf > 0;

  const Pb = ok ? dens * 9.81 * hf * kf / 1000 : 0;
  const Fm = ok ? Pb / 2 * hf : 0;
  const Me = ok ? dens * 9.81 * Math.pow(hf, 3) * kf / 6000 : 0;

  return (
    <div className="space-y-4">
      <SectionTitle>📊 Poussières & Pressions</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelInput label="Matériau" value={rho} onChange={setRho} options={[
          { v: "1000", l: "Eau (1000 kg/m³)" }, { v: "1800", l: "Terre Sèche (1800)" }, { v: "2400", l: "Béton Frais (2400)" }
        ]} />
        <NumInput label="Hauteur h" value={h} onChange={setH} unit="m" />
        <SelInput label="Coefficient K" value={k} onChange={setK} options={[
          { v: "1.0", l: "K = 1.0 (Liquide)" }, { v: "0.5", l: "K = 0.5 (Terre)" }, { v: "0.3", l: "K = 0.3 (Terre compacte)" }
        ]} />
      </div>

      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>🏁 Résultats Mécaniques</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Pression à la base" value={Pb.toFixed(2)} unit="kN/m²" accent="#f97316" />
            <ResultCard label="Poussée Totale" value={Fm.toFixed(2)} unit="kN/ml" accent="#a855f7" />
            <ResultCard label="Moment d'encastrement" value={Me.toFixed(2)} unit="kNm/ml" accent="#ec4899" />
            <ResultCard label="Centre de poussée" value={(hf/3).toFixed(2)} unit="m" accent="#3b82f6" />
          </div>
        </div>
      )}
    </div>
  );
}

function MaconnerieTab() {
  const [surf, setSurf] = useState("");
  const [format, setFormat] = useState("20x20x40");
  const [mortier, setMortier] = useState("350");

  const s = parseFloat(surf);
  const ok = !isNaN(s) && s > 0;

  // Calculs simplifiés (format standard parpaing ~ 10 blocs/m²)
  const nbBlocs = ok ? Math.ceil(s * 10 * 1.05) : 0; // +5% perte
  const volMortier = ok ? s * 0.02 : 0; // ~20L par m²
  const ciment = volMortier * parseFloat(mortier);
  const sable = volMortier * 1200; // ~1.2t de sable/m³ mortier

  return (
    <div className="space-y-4">
      <SectionTitle>🧱 Calcul de Maçonnerie (Parpaings)</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="Surface du mur" value={surf} onChange={setSurf} unit="m²" />
        <SelInput label="Format Parpaing" value={format} onChange={setFormat} options={[
          { v: "20x20x40", l: "Standard (20x20x40)" },
          { v: "15x20x40", l: "Cloison (15x20x40)" },
          { v: "10x20x40", l: "Doublage (10x20x40)" }
        ]} />
        <SelInput label="Dosage Mortier" value={mortier} onChange={setMortier} options={[
          { v: "300", l: "300 kg/m³ (Maçonnerie légère)" },
          { v: "350", l: "350 kg/m³ (Standard)" },
          { v: "400", l: "400 kg/m³ (Murs porteurs)" }
        ]} />
      </div>
      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>🛒 Matériaux requis</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Nombre de Blocs" value={nbBlocs} unit="unités" accent="#f97316" />
            <ResultCard label="Ciment (Mortier)" value={ciment.toFixed(0)} unit="kg" accent="#a78bfa" />
            <ResultCard label="Sable (Mortier)" value={sable.toFixed(0)} unit="kg" accent="#f59e0b" />
            <ResultCard label="Volume Mortier" value={(volMortier*1000).toFixed(0)} unit="L" accent="#3b82f6" />
          </div>
        </div>
      )}
    </div>
  );
}

function SteelBarHelper({ targetAs }: { targetAs: string }) {
  const as = parseFloat(targetAs);
  if (isNaN(as) || as <= 0) return null;

  const barTypes = [
    { diam: 6, sec: 0.28 }, { diam: 8, sec: 0.50 }, { diam: 10, sec: 0.79 },
    { diam: 12, sec: 1.13 }, { diam: 14, sec: 1.54 }, { diam: 16, sec: 2.01 },
    { diam: 20, sec: 3.14 }
  ];

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sélecteur de Barres (Aproximation)</p>
      <div className="flex flex-wrap gap-2">
        {barTypes.map(b => {
          const count = Math.ceil(as / b.sec);
          return (
            <div key={b.diam} className="px-3 py-2 bg-white rounded-lg border border-slate-100 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-700">{count} HA{b.diam}</span>
              <span className="text-[9px] text-slate-400">{(count * b.sec).toFixed(2)} cm²</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PoutreTab() {
  const [b, setB] = useState("");
  const [h, setH] = useState("");
  const [l, setL] = useState("");
  const [q, setQ] = useState("");

  const bf = parseFloat(b) / 100;
  const hf = parseFloat(h) / 100;
  const lf = parseFloat(l);
  const qf = parseFloat(q);

  const ok = !isNaN(bf) && !isNaN(hf) && !isNaN(lf) && !isNaN(qf) && bf > 0 && hf > 0 && lf > 0;
  const pp = bf * hf * 25; // kN/m
  const qu = (pp * 1.35) + (qf * 1.5);
  const Mu = (qu * lf * lf) / 8;
  const d = 0.9 * hf;
  const fcd = 25 / 1.5;
  const fyd = 435; // MPa
  const mu = Mu / (bf * d * d * fcd * 1000); // division par 1000 pour les unités
  const alpha = mu < 0.372 ? 1.25 * (1 - Math.sqrt(1 - 2 * mu)) : 0;
  const z = mu < 0.372 ? d * (1 - 0.4 * alpha) : 0;
  const AsValue = (mu > 0 && mu < 0.372) ? (Mu / (z * fyd * 1000) * 10000).toFixed(2) : "0";

  return (
    <div className="space-y-4">
      <SectionTitle>📏 Dimensionnement Poutre BA</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Largeur b" value={b} onChange={setB} unit="cm" placeholder="Ex: 20" />
        <NumInput label="Hauteur h" value={h} onChange={setH} unit="cm" placeholder="Ex: 40" />
        <NumInput label="Portée L" value={l} onChange={setL} unit="m" placeholder="Ex: 5" />
        <NumInput label="Charge Q" value={q} onChange={setQ} unit="kN/m" placeholder="Ex: 10" />
      </div>
      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>💎 Calcul des Aciers</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Poids propre" value={pp.toFixed(2)} unit="kN/ml" accent="#64748b" />
            <ResultCard label="Moment ELU" value={Mu.toFixed(2)} unit="kNm" accent="#f97316" />
            <ResultCard label="Section Acier As" value={AsValue} unit="cm²" accent="#10b981" />
            <ResultCard label="Volume béton" value={(bf * hf * lf).toFixed(2)} unit="m³" accent="#3b82f6" />
          </div>
          <SteelBarHelper targetAs={AsValue} />
        </div>
      )}
    </div>
  );
}

function EscalierTab() {
  const [h, setH] = useState("");
  const [l, setL] = useState("");
  const [emmar, setEmmar] = useState("");

  const hf = parseFloat(h);
  const lf = parseFloat(l);
  const ef = parseFloat(emmar);

  const ok = hf > 0 && lf > 0 && ef > 0;
  const n = Math.ceil(hf / 0.17); // Nombre de marches
  const h_marche = hf / n;
  const giron = lf / (n - 1);
  const blondel = (2 * h_marche + giron).toFixed(2);
  const vol = (ef * lf * hf * 0.5) + (ef * 0.15 * Math.sqrt(hf*hf + lf*lf)); // Volume approx marches + paillasse 15cm

  return (
    <div className="space-y-4">
      <SectionTitle>🪜 Calcul d'Escalier Droit</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="H. à franchir" value={h} onChange={setH} unit="m" />
        <NumInput label="Reculée totale" value={l} onChange={setL} unit="m" />
        <NumInput label="Emmarchement" value={emmar} onChange={setEmmar} unit="m" />
      </div>
      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>📏 Géométrie</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Nb Marches" value={n} accent="#a855f7" />
            <ResultCard label="H. Marche" value={(h_marche*100).toFixed(1)} unit="cm" accent="#f97316" />
            <ResultCard label="Giron" value={(giron*100).toFixed(1)} unit="cm" accent="#f97316" />
            <ResultCard label="Pas de Blondel" value={blondel} unit="m" accent={parseFloat(blondel) >= 0.60 && parseFloat(blondel) <= 0.64 ? "#10b981" : "#ef4444"} />
            <ResultCard label="Volume Béton" value={vol.toFixed(3)} unit="m³" accent="#3b82f6" />
          </div>
        </div>
      )}
    </div>
  );
}

function CuringTab() {
  const [temp, setTemp] = useState("20");
  const [cement, setCement] = useState("N");

  const t = parseFloat(temp) || 0;
  const ok = !isNaN(t);

  // Estimation simplifiée de la maturité du béton
  const daysTo25MPa = ok ? (cement === "R" ? 3 : cement === "N" ? 7 : 14) * (20 / Math.max(t, 5)) : 0;
  const daysToFull = daysTo25MPa * 4;

  return (
    <div className="space-y-4">
      <SectionTitle>🌡️ Estimation du Séchage (Maturométrie)</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="Température moyenne" value={temp} onChange={setTemp} unit="°C" />
        <SelInput label="Type de Ciment" value={cement} onChange={setCement} options={[
          { v: "R", l: "Prise Rapide (CEM I)" },
          { v: "N", l: "Normal (CEM II)" },
          { v: "L", l: "Lent (CEM III/V)" }
        ]} />
      </div>
      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>📅 Délais estimatifs</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Décoffrage (25% fck)" value={Math.ceil(daysTo25MPa/2)} unit="jours" accent="#3b82f6" />
            <ResultCard label="Pleine Charge (100% fck)" value={Math.ceil(daysToFull)} unit="jours" accent="#10b981" />
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 italic border border-blue-100 uppercase tracking-tight font-bold">
            Les basses températures (&lt; 10°C) ralentissent considérablement la prise. Protégez le béton du gel.
          </div>
        </div>
      )}
    </div>
  );
}

function CommandeTab({ projectName }: { projectName: string }) {
  const [items, setItems] = useState([
    { id: 1, label: "Ciment CPJ 45", qty: 0, unit: "Sacs" },
    { id: 2, label: "Sable 0/5", qty: 0, unit: "m³" },
    { id: 3, label: "Gravier 15/25", qty: 0, unit: "m³" },
    { id: 4, label: "Acier HA 12", qty: 0, unit: "Barres" },
  ]);

  const updateQty = (id: number, val: string) => {
    setItems(items.map(i => i.id === id ? { ...i, qty: parseFloat(val) || 0 } : i));
  };

  return (
    <div className="space-y-4">
      <SectionTitle>🛒 Bon de Commande Provisoire</SectionTitle>
      <p className="text-xs text-slate-500 mb-6 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
        Saisissez les quantités nécessaires pour générer une liste de commande compacte.
      </p>
      
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{item.unit}</span>
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
            </div>
            <input 
              type="number" 
              placeholder="0"
              className="w-24 bg-slate-100 border-0 rounded-xl px-3 py-2 text-right font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => updateQty(item.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          const text = items.filter(i => i.qty > 0).map(i => `${i.label}: ${i.qty} ${i.unit}`).join("\n");
          alert(`Commande pour Projet: ${projectName || "Sans Nom"}\n\n${text || "Aucun article séléctionné"}`);
        }}
        className="mt-8 w-full py-4 bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg active:scale-95"
      >
        <Truck size={18} />
        Générer Liste d'Achat
      </button>
    </div>
  );
}

function StockModule() {
  const [stock, setStock] = useState([
    { label: "Ciment", recu: 100, utilise: 45, unit: "Sacs" },
    { label: "Sable", recu: 20, utilise: 8, unit: "m³" },
    { label: "Barres HA10", recu: 50, utilise: 30, unit: "Unité" },
  ]);

  return (
    <div className="space-y-6">
      <SectionTitle>📋 Inventaire Terrain</SectionTitle>
      <div className="space-y-4">
        {stock.map((item, idx) => {
          const reste = item.recu - item.utilise;
          const percent = Math.min(100, (item.utilise / item.recu) * 100);
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="font-bold text-slate-800">{item.label}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">En cours d'utilisation</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-600">{reste}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1">{item.unit}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className="h-full bg-orange-500"
                />
              </div>
              <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400 uppercase">
                <span>Reçu: {item.recu}</span>
                <span>{percent.toFixed(0)}% consommé</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100 flex gap-3 italic">
        <Activity className="w-4 h-4 shrink-0" />
        Suivi en temps réel des consommations matières pour éviter les ruptures.
      </div>
    </div>
  );
}

function DalotTab() {
  const [h, setH] = useState("");
  const [l, setL] = useState("");
  const [ep, setEp] = useState("");

  const hf = parseFloat(h);
  const lf = parseFloat(l);
  const ef = parseFloat(ep) / 100;
  const ok = hf > 0 && lf > 0 && ef > 0;

  const vol = ok ? (lf + 2*ef) * (hf + 2*ef) - (lf * hf) : 0; // Volume / ml

  return (
    <div className="space-y-4">
      <SectionTitle>🌉 Dalot cadre (Ouvrage d'Art)</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="Ouverture (Largeur)" value={l} onChange={setL} unit="m" />
        <NumInput label="Hauteur utile" value={h} onChange={setH} unit="m" />
        <NumInput label="Épaisseur voiles/dalle" value={ep} onChange={setEp} unit="cm" />
      </div>
      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>📏 Résultats Structurels</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Volume Béton / ml" value={vol.toFixed(3)} unit="m³" accent="#3b82f6" />
            <ResultCard label="Poids Propre / ml" value={(vol * 25).toFixed(1)} unit="kN/ml" accent="#64748b" />
            <ResultCard label="Section Passage" value={(lf * hf).toFixed(2)} unit="m²" accent="#10b981" />
          </div>
        </div>
      )}
    </div>
  );
}

function JalonsTab() {
  const phases = [
    { label: "Décapage & Terrassement", status: "Terminé", color: "text-emerald-500", date: "01/05" },
    { label: "Coulage Fondations", status: "En cours", color: "text-orange-500", date: "05/05" },
    { label: "Élévation Mur NW", status: "À venir", color: "text-slate-400", date: "12/05" },
    { label: "Coulage Dalle RDC", status: "À venir", color: "text-slate-400", date: "20/05" },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle>📅 Jalons de Chantier</SectionTitle>
      <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {phases.map((p, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[26px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ring-2 ${p.status === "Terminé" ? "ring-emerald-500 bg-emerald-500" : p.status === "En cours" ? "ring-orange-500 bg-orange-500 animate-pulse" : "ring-slate-300 bg-white"}`} />
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-bold ${p.status === "À venir" ? "text-slate-400" : "text-slate-800"}`}>{p.label}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${p.color}`}>{p.status}</p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold">{p.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MurSoutenementTab() {
  const [h, setH] = useState("");
  const [e, setE] = useState("");
  const [rho, setRho] = useState("1800");

  const hf = parseFloat(h);
  const ef = parseFloat(e) / 100;
  const rf = parseFloat(rho);

  const ok = hf > 0 && ef > 0 && rf > 0;
  
  const Ka = 0.33; // Coeff poussée active
  const Pa = 0.5 * Ka * rf * 9.81 * hf * hf / 1000; // kN/ml
  const Ms = (ef * hf * 25) * (ef / 2); // Moment stabilisant (poids mur)
  const Mr = Pa * (hf / 3); // Moment renversant
  const ratio = ok ? (Ms / Mr).toFixed(2) : "0";

  return (
    <div className="space-y-4">
      <SectionTitle>🧱 Mur de Soutènement (Poids)</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumInput label="Hauteur du mur" value={h} onChange={setH} unit="m" />
        <NumInput label="Épaisseur" value={e} onChange={setE} unit="cm" />
        <SelInput label="Type de remblai" value={rho} onChange={setRho} options={[
          { v: "1600", l: "Sable (1600)" }, { v: "1800", l: "Terre (1800)" }, { v: "2000", l: "Gravier (2000)" }
        ]} />
      </div>
      {ok && (
        <div className="pt-4 space-y-4">
          <SectionTitle>⚖️ Stabilité au Renversement</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Facteur de Sécurité" value={ratio} accent={parseFloat(ratio) > 1.5 ? "#10b981" : "#ef4444"} />
            <ResultCard label="Poussée Active" value={Pa.toFixed(2)} unit="kN/ml" accent="#f97316" />
            <ResultCard label="Volume béton / ml" value={(ef * hf).toFixed(2)} unit="m³/ml" accent="#3b82f6" />
          </div>
          {parseFloat(ratio) < 1.5 && (
            <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              STABILITÉ INSUFFISANTE ! Augmentez l'épaisseur ou ajoutez une semelle. (Cible min: 1.5)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function HistoriqueTab({ history, clearHistory }: { history: any[], clearHistory: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle>📋 Historique des Calculs</SectionTitle>
        {history.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="text-[10px] bg-slate-900 text-white font-black uppercase tracking-widest px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <span>Imprimer Report</span>
            </button>
            <button 
              onClick={clearHistory}
              className="text-[10px] bg-red-50 text-red-500 font-black uppercase tracking-widest px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
            >
              Effacer Tout
            </button>
          </div>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="text-center p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">Aucun calcul récent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-500 uppercase font-mono">{item.module}</span>
                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-400">{new Date(item.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-900">{item.result}</span>
                <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
              </div>
            </div>
          )).reverse()}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [plan, setPlan] = useState<keyof typeof PLANS>("free");
  const [activeTab, setActiveTab] = useState("volume");
  const [projectName, setProjectName] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("betoncalc_history");
    const savedName = localStorage.getItem("betoncalc_project");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    if (savedName) setProjectName(savedName);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("betoncalc_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("betoncalc_project", projectName);
  }, [projectName]);

  const addToHistory = (item: { module: string, name: string, result: string, unit: string }) => {
    const newItem = { ...item, name: projectName || item.name, date: new Date().toISOString() };
    setHistory(prev => [...prev, newItem].slice(-20)); // Keep last 20
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("betoncalc_history");
  };

  const availableTabs = ALL_TABS.filter(t => PLANS[plan].tabs.includes(t.id));

  // Auto-switch tab if current one becomes unavailable after plan downgrade
  useEffect(() => {
    if (!availableTabs.find(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || "volume");
    }
  }, [plan, availableTabs, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Left Panel */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        
        {/* Branding */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Construction size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-800">BétonCalc</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Engineering Suite</p>
            </div>
          </div>

          {/* Plan Selector */}
          <div className="p-1.5 bg-slate-100 rounded-xl flex gap-1">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  plan === p 
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                {PLANS[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div className="mb-4 px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">Modules Disponibles</p>
          </div>
          <div className="space-y-1">
            {ALL_TABS.map((tab) => {
              const isAvailable = PLANS[plan].tabs.includes(tab.id);
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  disabled={!isAvailable}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                    activeTab === tab.id 
                    ? "bg-orange-50 text-orange-700" 
                    : isAvailable 
                      ? "text-slate-600 hover:bg-slate-50 hover:translate-x-1" 
                      : "opacity-40 grayscale cursor-not-allowed"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="active-indicator" 
                      className="absolute left-0 w-1 h-6 bg-orange-500 rounded-full" 
                    />
                  )}
                  <Icon size={20} className={activeTab === tab.id ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"} />
                  <span className="text-sm font-semibold">{tab.label}</span>
                  {!isAvailable && <Lock size={12} className="ml-auto text-slate-400" />}
                  {isAvailable && activeTab !== tab.id && (
                    <ChevronRight size={14} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-6 bg-slate-50 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan {PLANS[plan].label} Actif</span>
          </div>
          <p className="text-[10px] text-slate-400">© 2026 BétonCalc Pro. Tous droits réservés. Outil de calcul ingénierie v.3.4</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 justify-center md:justify-start"
              >
                <h2 className="text-3xl font-extrabold font-display text-slate-900 leading-tight">
                  {ALL_TABS.find(t => t.id === activeTab)?.label}
                </h2>
              </motion.div>
              <p className="text-slate-400 text-sm mt-1 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                Utilisez les champs ci-dessous pour effectuer vos calculs techniques.
              </p>
            </div>
            
            <div className="shrink-0">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">Identifiant Projet / Chantier</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Villa Libreville..."
                className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all shadow-sm outline-none w-full md:w-56"
              />
            </div>
          </header>

          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 overflow-hidden relative">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 -mr-16 -mt-16 rounded-full blur-3xl opacity-50 select-none pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 -ml-16 -mb-16 rounded-full blur-3xl opacity-50 select-none pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {activeTab === "volume" && <VolumeTab />}
                {activeTab === "dosage" && <DosageTab />}
                {activeTab === "conversion" && <ConversionTab />}
                {activeTab === "maconnerie" && <MaconnerieTab />}
                {activeTab === "armature" && <ArmatureTab />}
                {activeTab === "dalle" && <DalleTab />}
                {activeTab === "poutre" && <PoutreTab />}
                {activeTab === "escalier" && <EscalierTab />}
                {activeTab === "cout" && <CoutTab />}
                {activeTab === "commande" && <CommandeTab projectName={projectName} />}
                {activeTab === "fondation" && <FondationTab />}
                {activeTab === "poteau" && <PoteauTab />}
                {activeTab === "dalot" && <DalotTab />}
                {activeTab === "mur" && <MurSoutenementTab />}
                {activeTab === "pression" && <PressionTab />}
                {activeTab === "curing" && <CuringTab />}
                {activeTab === "stock" && <StockModule />}
                {activeTab === "jalons" && <JalonsTab />}
                {activeTab === "historique" && <HistoriqueTab history={history} clearHistory={clearHistory} />}

                {/* Add Global Save button for modules with results */}
                {activeTab !== "historique" && (
                  <button 
                    onClick={() => {
                      const activeLabel = ALL_TABS.find(t => t.id === activeTab)?.label || "";
                      addToHistory({
                        module: activeTab.toUpperCase(),
                        name: `Calcul ${activeLabel}`,
                        result: "Consulter",
                        unit: ""
                      });
                    }}
                    className="mt-8 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    <CheckCircle2 size={18} />
                    Enregistrer au Rapport
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-12 p-6 bg-orange-50 rounded-3xl flex items-start gap-4 border border-orange-100 shadow-sm shadow-orange-100/50">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100/50 shrink-0">
              <Info size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-600/50 uppercase tracking-[0.2em] mb-1 leading-none">Conseil d'Expert</p>
              <p className="text-sm text-orange-900 leading-relaxed font-medium">
                Les résultats de pré-dimensionnement sont donnés à titre indicatif. 
                Une étude structurelle complète par un bureau d'études (BET) est obligatoire pour toute construction majeure.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
