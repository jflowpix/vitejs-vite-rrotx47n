import { useState } from "react";

const CATEGORIES: string[] = ["All", "YouTube / Long Format", "Short Form", "Event Recaps", "Talking Head", "Documentaries", "Production"];
const YOUTUBE_SUBCATEGORIES: string[] = ["All", "Vlog", "Podcast", "Talking Head"];

interface Video {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  videoUrl: string;
  description: string;
}

const VIDEOS: Video[] = [
  { id: 1, title: "From Target Employee to MILLIONAIRE at only 30 Years Old!", category: "YouTube / Long Format", subcategory: "Vlog", videoUrl: "https://www.youtube.com/watch?v=xAfQTDoXlAY", description: "" },
  { id: 2, title: "My RICH FRIENDS are worth over a HUNDRED MILLION DOLLARS | World's Largest Lambo Rally", category: "YouTube / Long Format", subcategory: "Vlog", videoUrl: "https://www.youtube.com/watch?v=UVyU07CqywQ", description: "" },
  { id: 3, title: "Inner Circle Mastermind: How to Build Community and Network in Business", category: "Event Recaps", subcategory: null, videoUrl: "https://www.youtube.com/watch?v=DPuktVmEmw8", description: "" },
  { id: 4, title: "Eric Spofford's Miami Mastermind: Achieving Entrepreneurial Success", category: "Event Recaps", subcategory: null, videoUrl: "https://www.youtube.com/watch?v=-Yd64vAqi7c", description: "" },
  { id: 5, title: "How to Invest in Section 8 Housing for Financial Freedom", category: "YouTube / Long Format", subcategory: "Talking Head", videoUrl: "https://www.youtube.com/watch?v=NjswfV1fuLw", description: "" },
  { id: 6, title: "Eric Spofford's Limitless Arena 2024 Keynote", category: "Event Recaps", subcategory: null, videoUrl: "https://www.youtube.com/watch?v=lg7n2Qd9QQA", description: "" },
  { id: 7, title: "VIP Access with Birdman: Drake and Lil Wayne Concert", category: "YouTube / Long Format", subcategory: "Vlog", videoUrl: "https://www.youtube.com/watch?v=qHNAnXuP55A", description: "" },
  { id: 8, title: "Network with Like-Minded Entrepreneurs in Miami with Eric Spofford's Inner Circle", category: "Event Recaps", subcategory: null, videoUrl: "https://www.youtube.com/watch?v=PgAhAnHDK6c", description: "" },
  { id: 9, title: "Featured Video", category: "YouTube / Long Format", subcategory: "Vlog", videoUrl: "https://www.youtube.com/watch?v=fZwy0-sHjOA", description: "" },
  { id: 10, title: "Featured Video 2", category: "YouTube / Long Format", subcategory: "Vlog", videoUrl: "https://www.youtube.com/watch?v=nCNv6xvj460", description: "Appearance" },
  { id: 11, title: "Featured Video 3", category: "YouTube / Long Format", subcategory: "Vlog", videoUrl: "https://www.youtube.com/watch?v=pQdiT16ZCDM", description: "" },
];

const PAGE_SIZE = 12;

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return m ? m[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=CC0000&title=0&byline=0&portrait=0`;
  return null;
}

function getThumbnail(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}

function getPlatform(url: string): "youtube" | "vimeo" | "other" {
  if (getYouTubeId(url)) return "youtube";
  if (getVimeoId(url)) return "vimeo";
  return "other";
}

export default function JFlowpix() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcat, setActiveSubcat] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  const isYoutubeCat = activeCategory === "YouTube / Long Format";

  const filteredByCategory = activeCategory === "All" ? VIDEOS : VIDEOS.filter((v) => v.category === activeCategory);
  const filtered = isYoutubeCat && activeSubcat !== "All"
    ? filteredByCategory.filter((v) => v.subcategory === activeSubcat)
    : filteredByCategory;
  const visible = filtered.slice(0, visibleCount);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setActiveSubcat("All");
    setVisibleCount(PAGE_SIZE);
  }

  function handleCardClick(video: Video) {
    const platform = getPlatform(video.videoUrl);
    if (platform === "youtube" || platform === "vimeo") {
      setModalVideo(video);
    } else {
      window.open(video.videoUrl, "_blank");
    }
  }

  const categoryCount = (cat: string) => cat === "All" ? VIDEOS.length : VIDEOS.filter((v) => v.category === cat).length;
  const subcatCount = (sub: string) => sub === "All"
    ? VIDEOS.filter((v) => v.category === "YouTube / Long Format").length
    : VIDEOS.filter((v) => v.category === "YouTube / Long Format" && v.subcategory === sub).length;

  function VideoCard({ video }: { video: Video }) {
    const thumb = getThumbnail(video.videoUrl);
    const platform = getPlatform(video.videoUrl);
    return (
      <div className="video-card" onClick={() => handleCardClick(video)}>
        <div className="thumb-wrap">
          {thumb ? (
            <img className="thumb" src={thumb} alt={video.title} />
          ) : (
            <div className="thumb-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(204,0,0,0.4)" strokeWidth="1.5">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              <span>{video.title}</span>
            </div>
          )}
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
          {platform === "vimeo" && <div className="platform-tag"><span className="ptag vimeo-tag">Vimeo</span></div>}
        </div>
      </div>
    );
  }

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
        .thumb-placeholder { width:100%; height:100%; background:linear-gradient(135deg, #1c1c1c 0%, #111 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:20px; text-align:center; }
        .thumb-placeholder span { font-size:12px; font-weight:600; color:#333; line-height:1.3; max-width:180px; }
        .card-overlay { position:absolute; inset:0; opacity:0; transition:opacity 0.3s; background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(204,0,0,0.25) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:20px; }
        .overlay-play { position:absolute; top:50%; left:50%; transform:translate(-50%,-60%); width:60px; height:60px; border:2px solid rgba(255,255,255,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(204,0,0,0.2); backdrop-filter:blur(4px); }
        .overlay-info { position:relative; }
        .overlay-subcat { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:4px; }
        .overlay-title { font-size:14px; font-weight:600; color:#fff; line-height:1.3; }
        .overlay-cat { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#CC0000; margin-top:4px; }
        .platform-tag { position:absolute; top:10px; left:10px; }
        .ptag { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; padding:3px 8px; border-radius:2px; font-weight:600; }
        .vimeo-tag { background:rgba(26,183,234,0.15); color:#1ab7ea; border:1px solid rgba(26,183,234,0.2); }

        .load-more-wrap { text-align:center; margin-top:64px; }
        .load-more-btn { padding:16px 48px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:#666; font-size:11px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; border-radius:2px; transition:all 0.2s; }
        .load-more-btn:hover { border-color:#CC0000; color:#fff; }

        .empty-state { text-align:center; padding:100px 24px; }
        .empty-state p { font-size:13px; margin-top:12px; color:#444; }

        .modal-overlay { position:fixed; inset:0; z-index:999; background:rgba(0,0,0,0.96); display:flex; align-items:center; justify-content:center; padding:24px; }
        .modal-box { width:100%; max-width:980px; position:relative; }
        .modal-close { position:absolute; top:-44px; right:0; background:none; border:none; color:#666; font-size:11px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:color 0.2s; }
        .modal-close:hover { color:#fff; }
        .modal-frame { width:100%; aspect-ratio:16/9; border:none; border-radius:4px; display:block; background:#000; }
        .modal-meta { margin-top:14px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .modal-cat { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#CC0000; }
        .modal-subcat { font-size:10px; color:#555; background:rgba(255,255,255,0.04); padding:2px 8px; border-radius:2px; }
        .modal-title-text { font-size:14px; color:#777; }

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
            {visible.map((video) => <VideoCard key={video.id} video={video} />)}
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
            <iframe
              className="modal-frame"
              src={getEmbedUrl(modalVideo.videoUrl) || ""}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={modalVideo.title}
            />
            <div className="modal-meta">
              <span className="modal-cat">{modalVideo.category}</span>
              {modalVideo.subcategory && <span className="modal-subcat">{modalVideo.subcategory}</span>}
              <span style={{color:"#2a2a2a"}}>—</span>
              <span className="modal-title-text">{modalVideo.title}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}