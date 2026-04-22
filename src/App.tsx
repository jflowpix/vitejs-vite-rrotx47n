import { useState, useEffect } from "react";

const CATEGORIES: string[] = ["All", "YouTube / Long Format", "Short Form", "Event Recaps", "Talking Head", "Documentaries", "Production"];
const YOUTUBE_SUBCATEGORIES: string[] = ["All", "Vlog", "Podcast", "Talking Head"];
const ADMIN_PASSWORD = "jflowpix2026";
const STORAGE_KEY = "jflowpix-videos";

interface Video {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  youtubeId: string;
  description: string;
}

const DEFAULT_VIDEOS: Video[] = [
  { id: 1, title: "A Day In The Life", category: "YouTube / Long Format", subcategory: "Vlog", youtubeId: "dQw4w9WgXcQ", description: "Behind the scenes vlog" },
  { id: 2, title: "The Business Podcast Ep.1", category: "YouTube / Long Format", subcategory: "Podcast", youtubeId: "ScMzIvxBSi4", description: "Full podcast episode" },
  { id: 3, title: "Founder Thoughts", category: "YouTube / Long Format", subcategory: "Talking Head", youtubeId: "3JZ_D3ELwOQ", description: "Talking head series" },
  { id: 4, title: "60-Second Hook Reel", category: "Short Form", subcategory: null, youtubeId: "9bZkp7q19f0", description: "Instagram Reel" },
  { id: 5, title: "Annual Gala Recap", category: "Event Recaps", subcategory: null, youtubeId: "OPf0YbXqDm0", description: "Full event highlight reel" },
  { id: 6, title: "CEO Interview Series", category: "Talking Head", subcategory: null, youtubeId: "YykjpeuMNEk", description: "Executive brand content" },
  { id: 7, title: "The Grind Documentary", category: "Documentaries", subcategory: null, youtubeId: "kJQP7kiw5Fk", description: "Feature-length doc" },
  { id: 8, title: "Behind The Lens", category: "Production", subcategory: null, youtubeId: "fJ9rUzIMcZQ", description: "Production reel" },
];

const PAGE_SIZE = 12;

function extractYouTubeId(input: string): string | null {
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of regexes) {
    const m = input.match(re);
    if (m) return m[1];
  }
  return null;
}

interface StorageAPI {
  get: (key: string) => Promise<{ value: string } | null>;
  set: (key: string, value: string) => Promise<void>;
}

declare global {
  interface Window {
    storage: StorageAPI;
  }
}

export default function JFlowpix() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcat, setActiveSubcat] = useState("All");
  const [modalVideo, setModalVideo] = useState<Video | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [addForm, setAddForm] = useState({ title: "", category: "YouTube / Long Format", subcategory: "Vlog", youtubeUrl: "", description: "" });
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [adminKeySeq, setAdminKeySeq] = useState("");

  const isYoutubeCat = activeCategory === "YouTube / Long Format";

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) setVideos(JSON.parse(result.value));
        else {
          setVideos(DEFAULT_VIDEOS);
          await window.storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_VIDEOS));
        }
      } catch { setVideos(DEFAULT_VIDEOS); }
    }
    load();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const seq = (adminKeySeq + e.key).slice(-5);
      setAdminKeySeq(seq);
      if (seq === "admin") setShowAdmin(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adminKeySeq]);

  async function saveVideos(updated: Video[]) {
    setVideos(updated);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }

  const filteredByCategory = activeCategory === "All" ? videos : videos.filter((v) => v.category === activeCategory);
  const filtered = isYoutubeCat && activeSubcat !== "All"
    ? filteredByCategory.filter((v) => v.subcategory === activeSubcat)
    : filteredByCategory;
  const visible = filtered.slice(0, visibleCount);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setActiveSubcat("All");
    setVisibleCount(PAGE_SIZE);
  }

  function handleAdminLogin() {
    if (adminPass === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminError(""); }
    else setAdminError("Incorrect password.");
  }

  async function handleAddVideo() {
    const { title, category, subcategory, youtubeUrl, description } = addForm;
    if (!title.trim()) return setAddError("Please enter a title.");
    const ytId = extractYouTubeId(youtubeUrl.trim());
    if (!ytId) return setAddError("Invalid YouTube link or ID.");
    const newVideo: Video = {
      id: Date.now(), title: title.trim(), category,
      subcategory: category === "YouTube / Long Format" ? subcategory : null,
      youtubeId: ytId, description: description.trim()
    };
    await saveVideos([newVideo, ...videos]);
    setAddForm({ title: "", category: "YouTube / Long Format", subcategory: "Vlog", youtubeUrl: "", description: "" });
    setAddError("");
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
  }

  async function handleDelete(id: number) {
    await saveVideos(videos.filter((v) => v.id !== id));
    setDeleteConfirm(null);
  }

  const categoryCount = (cat: string) => cat === "All" ? videos.length : videos.filter((v) => v.category === cat).length;
  const subcatCount = (sub: string) => sub === "All"
    ? videos.filter((v) => v.category === "YouTube / Long Format").length
    : videos.filter((v) => v.category === "YouTube / Long Format" && v.subcategory === sub).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0d0d0d", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #CC0000; }
        input, textarea, select, button { font-family: 'DM Sans', sans-serif; }
        .nav { position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; padding:20px 48px; background:rgba(13,13,13,0.97); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.06); }
        .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:3px; }
        .nav-logo span { color:#CC0000; }
        .nav-instagram { display:flex; align-items:center; gap:8px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#666; text-decoration:none; transition:color 0.2s; }
        .nav-instagram:hover { color:#fff; }
        .hero { padding:100px 48px 80px; position:relative; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.06); }
        .hero-bg { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 85% 10%, rgba(204,0,0,0.14) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(204,0,0,0.07) 0%, transparent 45%); }
        .hero-tag { display:inline-flex; align-items:center; gap:8px; font-size:10px; letter-spacing:4px; text-transform:uppercase; color:#CC0000; margin-bottom:28px; }
        .hero-tag::before { content:''; width:24px; height:1px; background:#CC0000; }
        .hero-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(72px,12vw,160px); line-height:0.85; }
        .hero-title .dim { color:#222; }
        .hero-title .red { color:#CC0000; }
        .hero-desc { margin-top:28px; font-size:13px; color:#555; max-width:400px; line-height:1.7; }
        .hero-stats { margin-top:40px; display:flex; gap:48px; flex-wrap:wrap; padding-top:32px; border-top:1px solid rgba(255,255,255,0.05); }
        .hero-stat label { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#444; display:block; margin-bottom:6px; }
        .hero-stat span { font-family:'Bebas Neue',sans-serif; font-size:36px; color:#fff; }
        .filters { padding:0 48px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; overflow-x:auto; scrollbar-width:none; }
        .filters::-webkit-scrollbar { display:none; }
        .filter-tab { padding:20px 22px; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#444; cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; display:flex; align-items:center; gap:8px; }
        .filter-tab:hover { color:#aaa; }
        .filter-tab.active { color:#fff; border-bottom-color:#CC0000; }
        .filter-count { background:rgba(255,255,255,0.06); color:#555; font-size:10px; padding:2px 7px; border-radius:10px; }
        .filter-tab.active .filter-count { background:rgba(204,0,0,0.15); color:#CC0000; }
        .subcat-bar { padding:0 48px; background:rgba(204,0,0,0.03); border-bottom:1px solid rgba(204,0,0,0.08); display:flex; align-items:center; overflow-x:auto; scrollbar-width:none; }
        .subcat-bar::-webkit-scrollbar { display:none; }
        .subcat-label { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#CC0000; margin-right:20px; white-space:nowrap; flex-shrink:0; }
        .subcat-btn { padding:14px 18px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#444; cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; display:flex; align-items:center; gap:7px; }
        .subcat-btn:hover { color:#ccc; }
        .subcat-btn.active { color:#CC0000; border-bottom-color:#CC0000; }
        .subcat-count { background:rgba(204,0,0,0.08); color:#CC0000; font-size:9px; padding:1px 6px; border-radius:8px; }
        .grid-section { padding:48px; }
        .video-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:2px; }
        .video-card { position:relative; cursor:pointer; overflow:hidden; background:#111; }
        .video-card:hover .card-overlay { opacity:1; }
        .video-card:hover .thumb { transform:scale(1.06); }
        .thumb-wrap { position:relative; aspect-ratio:16/9; overflow:hidden; }
        .thumb { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; display:block; }
        .card-overlay { position:absolute; inset:0; opacity:0; transition:opacity 0.3s; background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(204,0,0,0.3) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:20px; }
        .overlay-play { position:absolute; top:50%; left:50%; transform:translate(-50%,-60%); width:56px; height:56px; border:2px solid rgba(255,255,255,0.8); border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .overlay-info { position:relative; }
        .overlay-subcat { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:4px; }
        .overlay-title { font-size:15px; font-weight:600; color:#fff; line-height:1.3; }
        .overlay-cat { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#CC0000; margin-top:4px; }
        .load-more-wrap { text-align:center; margin-top:64px; }
        .load-more-btn { padding:16px 48px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:#666; font-size:11px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; border-radius:2px; transition:all 0.2s; }
        .load-more-btn:hover { border-color:#CC0000; color:#fff; }
        .empty-state { text-align:center; padding:100px 24px; }
        .empty-state p { font-size:13px; margin-top:12px; color:#444; }
        .modal-overlay { position:fixed; inset:0; z-index:999; background:rgba(0,0,0,0.96); display:flex; align-items:center; justify-content:center; padding:24px; }
        .modal-box { width:100%; max-width:980px; position:relative; }
        .modal-close { position:absolute; top:-44px; right:0; background:none; border:none; color:#666; font-size:11px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:color 0.2s; }
        .modal-close:hover { color:#fff; }
        .modal-frame { width:100%; aspect-ratio:16/9; border:none; border-radius:3px; display:block; }
        .modal-meta { margin-top:14px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .modal-cat { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#CC0000; }
        .modal-subcat { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#555; background:rgba(255,255,255,0.04); padding:2px 8px; border-radius:2px; }
        .modal-title-text { font-size:14px; color:#777; }
        .admin-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.92); display:flex; align-items:flex-start; justify-content:flex-end; }
        .admin-panel { width:100%; max-width:560px; height:100vh; overflow-y:auto; background:#111; border-left:1px solid rgba(255,255,255,0.08); padding:40px 32px; }
        .admin-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
        .admin-header h2 { font-family:'Bebas Neue',sans-serif; font-size:36px; }
        .admin-close { background:none; border:none; color:#555; font-size:22px; cursor:pointer; }
        .admin-close:hover { color:#fff; }
        .field-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#555; display:block; margin-bottom:8px; }
        .field-input, .field-select { width:100%; padding:12px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:3px; color:#fff; font-size:13px; outline:none; transition:border-color 0.2s; }
        .field-input:focus, .field-select:focus { border-color:#CC0000; }
        .field-select option { background:#1a1a1a; }
        .form-field { margin-bottom:16px; }
        .field-error { color:#CC0000; font-size:12px; margin-top:6px; }
        .field-success { color:#22c55e; font-size:12px; margin-top:6px; }
        .btn-red { padding:12px 24px; background:#CC0000; border:none; color:#fff; font-size:11px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:background 0.2s; font-weight:600; }
        .btn-red:hover { background:#aa0000; }
        .btn-ghost { padding:10px 18px; background:transparent; border:1px solid rgba(255,255,255,0.1); color:#666; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all 0.2s; }
        .btn-ghost:hover { border-color:#CC0000; color:#fff; }
        .divider { width:100%; height:1px; background:rgba(255,255,255,0.06); margin:28px 0; }
        .video-list { display:flex; flex-direction:column; gap:8px; }
        .video-row { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:10px 12px; }
        .video-row-thumb { width:72px; height:40px; object-fit:cover; border-radius:2px; flex-shrink:0; background:#0a0a0a; }
        .video-row-info { flex:1; min-width:0; }
        .video-row-title { font-size:12px; font-weight:500; color:#ccc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .video-row-tags { display:flex; gap:6px; margin-top:3px; }
        .video-row-cat { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#CC0000; }
        .video-row-subcat { font-size:9px; letter-spacing:1px; text-transform:uppercase; color:#444; background:rgba(255,255,255,0.04); padding:1px 5px; border-radius:2px; }
        .btn-delete { padding:5px 10px; background:transparent; border:1px solid rgba(204,0,0,0.15); color:#666; font-size:10px; cursor:pointer; border-radius:2px; transition:all 0.2s; flex-shrink:0; }
        .btn-delete:hover { border-color:#CC0000; color:#CC0000; }
        .confirm-box { position:fixed; inset:0; z-index:999; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; padding:24px; }
        .confirm-inner { background:#1a1a1a; border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:32px; max-width:340px; width:100%; text-align:center; }
        .confirm-inner h4 { font-size:17px; margin-bottom:8px; }
        .confirm-inner p { font-size:13px; color:#555; margin-bottom:24px; }
        .confirm-btns { display:flex; gap:10px; justify-content:center; }
        .footer { border-top:1px solid rgba(255,255,255,0.06); padding:32px 48px; display:flex; justify-content:space-between; align-items:center; }
        .footer-logo { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; }
        .footer-logo span { color:#CC0000; }
        .footer-right { display:flex; align-items:center; gap:24px; }
        .footer-copy { font-size:11px; color:#2a2a2a; }
        .footer-ig { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#444; text-decoration:none; transition:color 0.2s; }
        .footer-ig:hover { color:#CC0000; }
        @media(max-width:768px){
          .nav { padding:16px 20px; }
          .hero { padding:64px 20px 48px; }
          .filters, .subcat-bar { padding:0 20px; }
          .grid-section { padding:24px 20px; }
          .video-grid { grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); }
          .footer { padding:20px; flex-direction:column; gap:12px; text-align:center; }
          .admin-panel { max-width:100%; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-logo">J<span>Flow</span>pix</div>
        <a className="nav-instagram" href="https://instagram.com/jflowpix" target="_blank" rel="noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          @jflowpix
        </a>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <p className="hero-tag">Content Creation Studio</p>
        <h1 className="hero-title"><span className="dim">J</span>Flow<span className="red">pix</span></h1>
        <p className="hero-desc">Visual stories that stop the scroll. Long format, short form, events, documentaries & production.</p>
        <div className="hero-stats">
          {CATEGORIES.slice(1).map((cat) => (
            <div className="hero-stat" key={cat}>
              <label>{cat}</label>
              <span>{categoryCount(cat)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="filters">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`filter-tab ${activeCategory === cat ? "active" : ""}`} onClick={() => handleCategoryChange(cat)}>
            {cat} <span className="filter-count">{categoryCount(cat)}</span>
          </button>
        ))}
      </div>

      {isYoutubeCat && (
        <div className="subcat-bar">
          <span className="subcat-label">Type</span>
          {YOUTUBE_SUBCATEGORIES.map((sub) => (
            <button key={sub} className={`subcat-btn ${activeSubcat === sub ? "active" : ""}`} onClick={() => { setActiveSubcat(sub); setVisibleCount(PAGE_SIZE); }}>
              {sub} <span className="subcat-count">{subcatCount(sub)}</span>
            </button>
          ))}
        </div>
      )}

      <section className="grid-section">
        {visible.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p>No videos in this category yet.</p>
          </div>
        ) : (
          <div className="video-grid">
            {visible.map((video) => (
              <div key={video.id} className="video-card" onClick={() => setModalVideo(video)}>
                <div className="thumb-wrap">
                  <img className="thumb" src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} alt={video.title} />
                  <div className="card-overlay">
                    <div className="overlay-play">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                    <div className="overlay-info">
                      {video.subcategory && <p className="overlay-subcat">{video.subcategory}</p>}
                      <p className="overlay-title">{video.title}</p>
                      <p className="overlay-cat">{video.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {filtered.length > visibleCount && (
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
              Load More · {filtered.length - visibleCount} remaining
            </button>
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="footer-logo">J<span>Flow</span>pix</div>
        <div className="footer-right">
          <a className="footer-ig" href="https://instagram.com/jflowpix" target="_blank" rel="noreferrer">@jflowpix</a>
          <span className="footer-copy">© 2026 JFlowpix</span>
        </div>
      </footer>

      {modalVideo && (
        <div className="modal-overlay" onClick={() => setModalVideo(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalVideo(null)}>✕ Close</button>
            <iframe className="modal-frame"
              src={`https://www.youtube.com/embed/${modalVideo.youtubeId}?autoplay=1`}
              allow="autoplay; encrypted-media" allowFullScreen title={modalVideo.title} />
            <div className="modal-meta">
              <span className="modal-cat">{modalVideo.category}</span>
              {modalVideo.subcategory && <span className="modal-subcat">{modalVideo.subcategory}</span>}
              <span style={{color:"#2a2a2a"}}>—</span>
              <span className="modal-title-text">{modalVideo.title}</span>
            </div>
          </div>
        </div>
      )}

      {showAdmin && (
        <div className="admin-overlay" onClick={() => setShowAdmin(false)}>
          <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-header">
              <h2>Admin Panel</h2>
              <button className="admin-close" onClick={() => setShowAdmin(false)}>✕</button>
            </div>
            {!adminAuthed ? (
              <>
                <div className="form-field">
                  <label className="field-label">Password</label>
                  <input className="field-input" type="password" placeholder="Enter admin password"
                    value={adminPass} onChange={(e) => setAdminPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} />
                  {adminError && <p className="field-error">{adminError}</p>}
                </div>
                <button className="btn-red" onClick={handleAdminLogin}>Unlock →</button>
              </>
            ) : (
              <>
                <div className="form-field">
                  <label className="field-label">Video Title *</label>
                  <input className="field-input" placeholder="e.g. Day In The Life Vlog"
                    value={addForm.title} onChange={(e) => setAddForm({...addForm, title: e.target.value})} />
                </div>
                <div className="form-field">
                  <label className="field-label">Category *</label>
                  <select className="field-select" value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value, subcategory: "Vlog"})}>
                    {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {addForm.category === "YouTube / Long Format" && (
                  <div className="form-field">
                    <label className="field-label">Sub-Type</label>
                    <select className="field-select" value={addForm.subcategory}
                      onChange={(e) => setAddForm({...addForm, subcategory: e.target.value})}>
                      {YOUTUBE_SUBCATEGORIES.slice(1).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-field">
                  <label className="field-label">YouTube Link or Video ID *</label>
                  <input className="field-input" placeholder="Paste YouTube URL or video ID"
                    value={addForm.youtubeUrl} onChange={(e) => setAddForm({...addForm, youtubeUrl: e.target.value})} />
                </div>
                <div className="form-field">
                  <label className="field-label">Description (optional)</label>
                  <input className="field-input" placeholder="Short description"
                    value={addForm.description} onChange={(e) => setAddForm({...addForm, description: e.target.value})} />
                </div>
                {addError && <p className="field-error" style={{marginBottom:"12px"}}>{addError}</p>}
                {addSuccess && <p className="field-success" style={{marginBottom:"12px"}}>✓ Video added!</p>}
                <button className="btn-red" onClick={handleAddVideo}>Add to Portfolio</button>
                <div className="divider" />
                <p style={{fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", color:"#555", marginBottom:"16px"}}>All Videos ({videos.length})</p>
                <div className="video-list">
                  {videos.map((v) => (
                    <div key={v.id} className="video-row">
                      <img className="video-row-thumb" src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt={v.title} />
                      <div className="video-row-info">
                        <p className="video-row-title">{v.title}</p>
                        <div className="video-row-tags">
                          <span className="video-row-cat">{v.category}</span>
                          {v.subcategory && <span className="video-row-subcat">{v.subcategory}</span>}
                        </div>
                      </div>
                      <button className="btn-delete" onClick={() => setDeleteConfirm(v.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="confirm-box">
          <div className="confirm-inner">
            <h4>Remove this video?</h4>
            <p>It will be removed from your portfolio.</p>
            <div className="confirm-btns">
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-red" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}