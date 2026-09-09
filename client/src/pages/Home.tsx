import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Crosshair,
  Eye,
  Filter,
  Flame,
  Layers3,
  MapPin,
  Maximize2,
  Menu,
  Minus,
  MousePointer2,
  PanelRight,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Target,
  Thermometer,
  TrendingUp,
  Waves,
  X,
  Zap,
} from "lucide-react";

type RiskBand = "EXTREME" | "VERY HIGH" | "HIGH" | "MODERATE" | "LOW";

type District = {
  name: string;
  state: string;
  score: number;
  band: RiskBand;
  x: number;
  y: number;
  tone: string;
  note: string;
};

const districts: District[] = [
  { name: "Patna", state: "Bihar", score: 82, band: "VERY HIGH", x: 60, y: 33, tone: "#ff5a1f", note: "Peak thermal stress expected" },
  { name: "Gaya", state: "Bihar", score: 74, band: "VERY HIGH", x: 56, y: 39, tone: "#ff6a22", note: "Persistent heat window" },
  { name: "Lucknow", state: "Uttar Pradesh", score: 69, band: "HIGH", x: 49, y: 31, tone: "#ff8c2a", note: "High afternoon load" },
  { name: "Jaipur", state: "Rajasthan", score: 88, band: "EXTREME", x: 32, y: 34, tone: "#d83a24", note: "Escalate response readiness" },
  { name: "Delhi", state: "NCT Delhi", score: 76, band: "VERY HIGH", x: 43, y: 28, tone: "#ff5a1f", note: "Severe apparent temperature" },
  { name: "Ahmedabad", state: "Gujarat", score: 72, band: "VERY HIGH", x: 30, y: 55, tone: "#ff6a22", note: "High strain, low recovery" },
  { name: "Nagpur", state: "Maharashtra", score: 61, band: "HIGH", x: 47, y: 58, tone: "#ff8c2a", note: "Rising into peak" },
  { name: "Hyderabad", state: "Telangana", score: 48, band: "MODERATE", x: 49, y: 70, tone: "#ffc857", note: "Moderate thermal stress" },
  { name: "Kolkata", state: "West Bengal", score: 58, band: "HIGH", x: 70, y: 50, tone: "#ff8c2a", note: "Persistent humidity" },
  { name: "Chennai", state: "Tamil Nadu", score: 37, band: "MODERATE", x: 62, y: 84, tone: "#ffc857", note: "Elevated overnight load" },
  { name: "Mumbai", state: "Maharashtra", score: 28, band: "MODERATE", x: 32, y: 72, tone: "#ffc857", note: "Stable, watch humidity" },
  { name: "Srinagar", state: "Jammu & Kashmir", score: 18, band: "LOW", x: 39, y: 13, tone: "#58b98d", note: "Controlled conditions" },
  { name: "Bengaluru", state: "Karnataka", score: 22, band: "LOW", x: 45, y: 79, tone: "#58b98d", note: "Controlled conditions" },
  { name: "Bhopal", state: "Madhya Pradesh", score: 53, band: "HIGH", x: 43, y: 48, tone: "#ff8c2a", note: "Heat signal strengthening" },
];

const filters: { label: string; value: RiskBand | "ALL"; color?: string }[] = [
  { label: "All districts", value: "ALL" },
  { label: "Extreme", value: "EXTREME", color: "#d83a24" },
  { label: "Very high", value: "VERY HIGH", color: "#ff5a1f" },
  { label: "High", value: "HIGH", color: "#ff8c2a" },
  { label: "Moderate", value: "MODERATE", color: "#ffc857" },
  { label: "Low", value: "LOW", color: "#58b98d" },
];

const riskClass = (band: RiskBand) => band.toLowerCase().replace(" ", "-");

function StatusDot({ color = "#7bd6a8" }: { color?: string }) {
  return <span className="status-dot" style={{ background: color, boxShadow: `0 0 0 3px ${color}1c` }} />;
}

function SectionLabel({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return <div className="section-label"><span>{children}</span>{trailing}</div>;
}

function MapCanvas({ visibleDistricts, selected, onSelect }: { visibleDistricts: District[]; selected: District; onSelect: (d: District) => void }) {
  return (
    <div className="map-canvas">
      <div className="map-grid" />
      <div className="map-vignette" />
      <div className="map-topo topo-one" />
      <div className="map-topo topo-two" />
      <div className="map-title"><span className="live-kicker"><StatusDot />LIVE CHOROPLETH</span><strong>INDIA · DISTRICT RISK INDEX</strong></div>
      <div className="map-subtitle">RESQ SCORE · 06:00 IST FORECAST CYCLE</div>
      <svg className="india-map" viewBox="0 0 700 520" role="img" aria-label="Stylized India district risk map">
        <defs>
          <filter id="selectedGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="landFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#263d49"/><stop offset="1" stopColor="#162a32"/></linearGradient>
        </defs>
        <path className="india-outline" d="M171 35 218 21l53 16 36 34 57 8 55 33 30 53 54 51 22 42-11 32 26 48-42 43-19 40-45 12-31 37-60-8-32 22-52-22-36-38-39-20-10-46-34-22 1-39-34-32 17-40-12-32 32-39-15-31z" />
        <path className="india-river" d="M214 72c77 37 114 69 182 87 73 20 127 62 146 108" />
        <path className="india-river" d="M317 121c-9 53-3 107 28 144 26 31 31 73 30 144" />
        <path className="india-river" d="M181 214c47 21 87 19 135 3 50-17 90-10 150 29" />
        <path className="state-line" d="M177 115l91 14 60 45 66-13 34 58-36 42 31 78-76 7-60 45-48-45 19-57-52-42 39-46z" />
        <path className="state-line" d="M327 161l22 51 38 44-8 61 53 49 51-8 36 52" />
        <path className="state-line" d="M176 327l66-10 56 57-30 66-52-17-43-51z" />
        <path className="state-line" d="M409 252l82 10 39 48-39 42-44-13-44 17-39-48z" />
        {visibleDistricts.map((d) => {
          const px = d.x * 6.1 + 28;
          const py = d.y * 5.05 + 16;
          const isSelected = d.name === selected.name;
          return <g key={d.name} className={`map-point ${isSelected ? "selected" : ""}`} onClick={() => onSelect(d)} tabIndex={0} role="button" aria-label={`${d.name}, ${d.band}, score ${d.score}`}>
            <circle className="point-halo" cx={px} cy={py} r={isSelected ? 23 : 13} fill={d.tone} opacity={isSelected ? 0.23 : 0.1} />
            <circle className="point-ring" cx={px} cy={py} r={isSelected ? 9 : 6} fill={d.tone} filter={isSelected ? "url(#selectedGlow)" : undefined} />
            <circle className="point-core" cx={px} cy={py} r={isSelected ? 3 : 2} fill="#fff8ea" />
            {isSelected && <text x={px + 15} y={py - 11} className="selected-map-label">{d.name.toUpperCase()} · {d.score}</text>}
          </g>;
        })}
        <text x="113" y="383" className="geo-label">ARABIAN SEA</text><text x="552" y="436" className="geo-label">BAY OF BENGAL</text><text x="372" y="45" className="geo-label">HIMALAYAN RANGE</text>
      </svg>
      <div className="map-controls"><button aria-label="Zoom in"><Plus size={15} /></button><button aria-label="Zoom out"><Minus size={15} /></button><span className="control-rule" /><button aria-label="Recenter"><Crosshair size={15} /></button><button aria-label="Layers"><Layers3 size={15} /></button></div>
      <div className="map-legend"><div className="legend-header">RESQ SCORE <span>0—100</span></div><div className="legend-bar" /><div className="legend-scale"><span>LOW</span><span>MOD</span><span>HIGH</span><span>EXTREME</span></div></div>
      <div className="map-footnote"><MousePointer2 size={12} /> SELECT A DISTRICT FOR INTELLIGENCE</div>
    </div>
  );
}

function ForecastChart({ selected }: { selected: District }) {
  const [focus, setFocus] = useState(3);
  const points = [18, 24, 31, 44, 67, 82, 78, 63, 46, 29];
  const temps = [31, 33, 35, 38, 41, 43, 42, 39, 36, 33];
  const width = 530;
  const height = 144;
  const makePath = (values: number[], scale = 1) => values.map((value, i) => `${i === 0 ? "M" : "L"} ${i * 58 + 10} ${height - value * scale - 10}`).join(" ");
  return <div className="forecast-area">
    <div className="forecast-meta"><div><SectionLabel trailing={<span className="muted-inline">RISK TRAJECTORY · {selected.name.toUpperCase()}</span>}>WHEN WILL RISK PEAK?</SectionLabel><p className="forecast-note">Thermal stress builds through the afternoon window, with peak intensity at <strong>15:00 IST</strong>.</p></div><div className="peak-readout"><span>PEAK RESQ</span><strong>82</strong><small>15:00 IST</small></div></div>
    <div className="chart-shell">
      <div className="chart-ylabels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <svg className="forecast-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" onMouseLeave={() => setFocus(3)}>
        <defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5a1f" stopOpacity=".32"/><stop offset="1" stopColor="#ff5a1f" stopOpacity="0"/></linearGradient></defs>
        {[20, 50, 80, 110].map((y) => <line key={y} x1="0" x2="530" y1={y} y2={y} className="chart-grid" />)}
        <path d={`${makePath(points.map((p) => p * 1.1), 1)} L 532 134 L 10 134 Z`} fill="url(#riskFill)" />
        <path d={makePath(points.map((p) => p * 1.1), 1)} className="risk-line" />
        <path d={makePath(temps.map((p) => p * 2), .6)} className="temp-line" />
        <line x1={focus * 58 + 10} x2={focus * 58 + 10} y1="4" y2="136" className="focus-line" />
        {points.map((value, i) => <circle key={i} cx={i * 58 + 10} cy={height - value * 1.1 - 10} r={i === 5 ? 4.5 : 3} className={i === focus ? "chart-point active" : "chart-point"} onMouseEnter={() => setFocus(i)} />)}
        <text x="300" y="20" className="peak-label">PEAK WINDOW</text><text x="300" y="34" className="peak-label-small">15:00 · 82</text>
      </svg>
      <div className="chart-xlabels"><span>NOW<br /><b>06:00</b></span><span>RISING<br /><b>10:00</b></span><span>PEAK<br /><b>15:00</b></span><span>RECOVERY<br /><b>19:00</b></span><span>06:00<br /><b>10 SEP</b></span></div>
    </div>
    <div className="forecast-key"><span><i className="key-risk" /> RESQ SCORE</span><span><i className="key-temp" /> APPARENT TEMPERATURE</span><span className="forecast-window"><Zap size={12} /> DANGEROUS WINDOW · 13:00—17:00</span></div>
  </div>;
}

function Home() {
  const [selected, setSelected] = useState<District>(districts[0]);
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [activeNav, setActiveNav] = useState("RISK OVERVIEW");
  const [filter, setFilter] = useState<RiskBand | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [viewMode, setViewMode] = useState<"LIVE DATA" | "DEMO MODE">("DEMO MODE");
  const [notice, setNotice] = useState("");

  const visibleDistricts = useMemo(() => districts.filter((d) => (filter === "ALL" || d.band === filter) && d.name.toLowerCase().includes(search.toLowerCase())), [filter, search]);
  const selectDistrict = (d: District) => { setSelected(d); setShowMobilePanel(false); };
  const utility = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-block"><div className="brand-mark">r<span>e</span>sQ</div><div className="brand-divider" /><div className="brand-subtitle">HEAT RISK<br />INTELLIGENCE</div></div>
      <div className="cycle-block"><span className="eyebrow">FORECAST CYCLE</span><strong>09 SEP 2026 <span>·</span> 06:00 IST</strong><span className="pipeline"><StatusDot /> DATA PIPELINE OPERATIONAL</span></div>
      <div className="top-actions"><div className="monitored"><span className="eyebrow">NETWORK COVERAGE</span><strong>742 <small>DISTRICTS</small></strong></div><button className={`mode-toggle ${viewMode === "LIVE DATA" ? "live" : ""}`} onClick={() => setViewMode(viewMode === "LIVE DATA" ? "DEMO MODE" : "LIVE DATA")}><span className="mode-dot" /> {viewMode}</button><button className="icon-button" aria-label="Help" onClick={() => utility("Operator guide coming soon")}><CircleHelp size={17} /></button><button className="icon-button" aria-label="Open navigation" onClick={() => setShowMobilePanel(true)}><Menu size={17} /></button></div>
    </header>

    <div className="workspace">
      <aside className="left-rail">
        <div className="rail-top"><span className="eyebrow">COMMAND CENTER</span><button className="collapse-button" onClick={() => utility("Rail collapse is optimized for desktop review")}><PanelRight size={14} /></button></div>
        <nav className="primary-nav"><button className={`nav-item active ${activeNav === "RISK OVERVIEW" ? "selected" : ""}`} onClick={() => setActiveNav("RISK OVERVIEW")}><Activity size={15} /> RISK OVERVIEW <span className="nav-count">01</span></button><button className={`nav-item ${activeNav === "FORECAST CYCLES" ? "selected" : ""}`} onClick={() => setActiveNav("FORECAST CYCLES")}><TrendingUp size={15} /> FORECAST CYCLES</button><button className={`nav-item ${activeNav === "ALERT QUEUE" ? "selected" : ""}`} onClick={() => setActiveNav("ALERT QUEUE")}><ShieldAlert size={15} /> ALERT QUEUE <span className="alert-count">03</span></button></nav>
        <div className="rail-section"><SectionLabel>GEOGRAPHY</SectionLabel><button className="rail-select"><MapPin size={13} /> INDIA <ChevronDown size={13} /></button><button className="rail-select dim">ALL STATES <ChevronRight size={13} /></button><button className="rail-select dim">SELECTED STATE <ChevronRight size={13} /></button><button className="rail-select selected"><Target size={13} /> {selected.name.toUpperCase()} <span className="rail-score">{selected.score}</span></button></div>
        <div className="search-box"><Search size={14} /><input aria-label="Search district" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search district" />{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={13} /></button>}</div>
        <div className="rail-section risk-filter"><SectionLabel trailing={<SlidersHorizontal size={13} />}>RISK FILTER</SectionLabel>{filters.map((item) => <button key={item.value} className={`filter-item ${filter === item.value ? "active" : ""}`} onClick={() => setFilter(item.value)}><span className="filter-swatch" style={{ background: item.color || "#86aab1" }} />{item.label}<span className="filter-number">{item.value === "ALL" ? districts.length : districts.filter((d) => d.band === item.value).length}</span></button>)}</div>
        <div className="rail-footer"><div className="legend-mini"><span className="legend-mini-dot" /> SYSTEMS NOMINAL</div><span className="version">resQ / 0.9.4</span></div>
      </aside>

      <main className="main-stage">
        <div className="stage-heading"><div><span className="eyebrow">INDIA · NATIONAL VIEW</span><h1>Risk overview <span>/</span> {activeNav.toLowerCase()}</h1></div><div className="stage-tools"><button onClick={() => utility("Map layer controls opened")}><Filter size={14} /> LAYERS</button><button onClick={() => utility("Export is available in the full operations build")}><ArrowUpRight size={14} /> EXPORT</button></div></div>
        <div className="map-wrap"><MapCanvas visibleDistricts={visibleDistricts.length ? visibleDistricts : districts} selected={selected} onSelect={selectDistrict} /><div className="map-filter-note">{filter === "ALL" ? "ALL DISTRICTS" : filter} · {visibleDistricts.length} SHOWN</div></div>
        <div className="bottom-strip"><div className="strip-title"><span className="eyebrow">ANALYTICAL INTELLIGENCE</span><strong>OBSERVE <span>→</span> UNDERSTAND <span>→</span> PREDICT <span>→</span> ACT</strong></div><div className="strip-stat"><span className="strip-icon hot"><Flame size={14} /></span><span><b>18</b><small>EXTREME / VERY HIGH</small></span></div><div className="strip-stat"><span className="strip-icon cool"><Thermometer size={14} /></span><span><b>+5.8°C</b><small>TOP BASELINE ANOMALY</small></span></div><div className="strip-stat"><span className="strip-icon cyan"><Waves size={14} /></span><span><b>15:00</b><small>NEXT PEAK WINDOW</small></span></div><button className="strip-open" onClick={() => setShowMobilePanel(true)}>OPEN DISTRICT INTELLIGENCE <ChevronRight size={15} /></button></div>
      </main>

      <aside className={`right-panel ${showMobilePanel ? "mobile-open" : ""}`}><div className="panel-head"><div><span className="eyebrow">SELECTED DISTRICT</span><h2>{selected.name}</h2><p>{selected.state} <span>·</span> IN <span className="panel-live"><StatusDot /> SELECTED</span></p></div><button className="panel-close" onClick={() => setShowMobilePanel(false)}><X size={16} /></button></div><div className="panel-tabs">{["OVERVIEW", "DRIVERS", "ACTION"].map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>{activeTab === "OVERVIEW" && <>
        <section className="score-section"><div className="score-label">RESQ SCORE <span>CONFIDENCE 91%</span></div><div className="score-row"><strong>{selected.score}</strong><div className="score-band"><span className={`risk-tag ${riskClass(selected.band)}`}>{selected.band}</span><small>MODEL OUTPUT / 06:00 IST</small></div></div><div className="score-scale"><span style={{ width: `${selected.score}%`, background: selected.tone }} /><i style={{ left: `${selected.score}%` }} /></div><div className="score-scale-labels"><span>LOW</span><span>MODERATE</span><span>HIGH</span><span>EXTREME</span></div></section>
        <section className="priority-block"><div className="priority-top"><span><AlertTriangle size={13} /> CURRENT PRIORITY</span><b>P1</b></div><strong>Prepare heat-health response</strong><p>Peak thermal stress is expected during the afternoon window.</p></section>
        <section className="metric-section"><SectionLabel>THERMAL STRESS</SectionLabel><div className="metric-grid"><div className="metric"><span>UTCI <CircleHelp size={11} /></span><strong>46.2<span>°C</span></strong><small>VERY STRONG</small></div><div className="metric"><span>WBGT <CircleHelp size={11} /></span><strong>32.8<span>°C</span></strong><small>HIGH STRAIN</small></div><div className="metric"><span>HEAT INDEX <CircleHelp size={11} /></span><strong>51.4<span>°C</span></strong><small>DANGER</small></div></div></section>
        <section className="context-section"><SectionLabel trailing={<span className="delta">+5.8°C</span>}>HISTORICAL CONTEXT</SectionLabel><div className="context-row"><div className="sparkline"><span /><span /><span /><span /><span /><span /><span className="hot" /><span className="hot" /><span className="hot" /></div><p>ANOMALY FROM 1991—2020 BASELINE</p></div></section>
        <section className="drivers-section"><SectionLabel trailing={<button className="text-action" onClick={() => setActiveTab("DRIVERS")}>VIEW WHY <ChevronRight size={13} /></button>}>WHY IS {selected.name.toUpperCase()} AT RISK?</SectionLabel><ol><li><span>01</span>Extreme thermal stress</li><li><span>02</span>Persistent afternoon heat</li><li><span>03</span>Poor nighttime recovery</li></ol></section>
      </>}{activeTab === "DRIVERS" && <div className="tab-content"><SectionLabel>MODEL EXPLANATION</SectionLabel><div className="explain-hero"><Zap size={17} /><strong>Thermal stress is the lead signal.</strong><p>The forecast combines apparent temperature, humidity, nighttime recovery, exposure and vulnerability context.</p></div><div className="driver-list"><div><span>01</span><b>EXTREME THERMAL STRESS</b><strong>46.2°C UTCI</strong></div><div><span>02</span><b>PERSISTENT AFTERNOON HEAT</b><strong>+5.8°C ANOMALY</strong></div><div><span>03</span><b>POOR NIGHTTIME RECOVERY</b><strong>29.4°C MIN</strong></div></div></div>}{activeTab === "ACTION" && <div className="tab-content"><SectionLabel>RESPONSE PLAYBOOK</SectionLabel><div className="action-list"><div><span className="action-index">01</span><p><b>CITIZEN</b>Reduce prolonged outdoor exposure during peak window.</p></div><div><span className="action-index">02</span><p><b>WORKERS</b>Schedule high-exertion outdoor work outside peak heat.</p></div><div><span className="action-index">03</span><p><b>AUTHORITY</b>Prepare heat-health response measures.</p></div><div><span className="action-index">04</span><p><b>HEALTH SERVICES</b>Increase readiness during predicted peak window.</p></div></div></div>}
        <div className="panel-footer"><span><Eye size={13} /> PANEL SYNCHRONIZED</span><button onClick={() => utility("District watch added")}>ADD TO WATCHLIST <Plus size={13} /></button></div></aside>
    </div>
    <section className="forecast-strip"><ForecastChart selected={selected} /></section>
    <div className={`toast-note ${notice ? "visible" : ""}`}>{notice}</div>
  </div>;
}

export default Home;
