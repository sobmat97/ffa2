import React, { useState, useEffect } from "react";
import "./FightersPage.css";

// Parsuje „DD.MM.YYYY” → Date
function parseDate(s) {
  if (!s) return null;
  const [d, m, y] = s.split(".");
  const dt = new Date(+y, +m - 1, +d);
  return isNaN(dt) ? null : dt;
}

export default function FightersPage() {
  const [fighters, setFighters]         = useState([]);
  const [events, setEvents]             = useState([]);
  const [fightsByName, setFightsByName] = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedF, setSelectedF]       = useState(null);
  const defaultAvatar = "avatars/default.png";

  // filtry
  const [filterOrg, setFilterOrg]   = useState("");
  const [filterName, setFilterName] = useState("");

  // upload
  const [avatarFile, setAvatarFile]   = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onAvatarChange = e => {
    setAvatarFile(e.target.files[0] || null);
    setUploadError(null);
  };
  const uploadAvatar = async () => {
    if (!avatarFile || !selectedF) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res = await fetch(`/api/fighters/${selectedF.id}/avatar`, {
        method: "POST",
        body: fd
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { photoUrl } = await res.json();
      setFighters(fs =>
        fs.map(f => f.id === selectedF.id ? { ...f, photoUrl } : f)
      );
      setSelectedF(f => ({ ...f, photoUrl }));
      setAvatarFile(null);
    } catch(err) {
      console.error(err);
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // fetchujemy fighters, Events i Events2
        const [fRes, e1Res, e2Res] = await Promise.all([
          fetch("/api/fighters"),
          fetch("/api/events"),
          fetch("/api/events2"),
        ]);
        if (!fRes.ok || !e1Res.ok || !e2Res.ok) throw new Error("Fetch error");
        const [fData, e1, e2] = await Promise.all([
          fRes.json(), e1Res.json(), e2Res.json()
        ]);
        setFighters(fData);

        // scal wszystkie eventy
        const allEv = [...e1, ...e2];
        setEvents(allEv);

        // budujemy mapę { nazwaKlucza: [ev,ev...] }
        const map = {};
        allEv.forEach(ev => {
          const parts = Array.isArray(ev.participants)
            ? ev.participants
            : [];
          parts.forEach(name => {
            const key = name.trim().toLowerCase();
            if (!key) return;
            if (!map[key]) map[key] = [];
            map[key].push(ev);
          });
        });
        setFightsByName(map);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Ładuję zawodników…</p>;
  if (error)   return <p className="error">Błąd: {error}</p>;

  const norm = s => s.trim().toLowerCase();

  // Bilans i liczba wygranych
  const getRecord = name => {
    const key = norm(name);
    const fights = fightsByName[key] || [];
    let w=0,l=0,d=0;
    fights.forEach(ev => {
      const winners = (ev.winner||"")
        .split(/[,;/]+/).map(s=>norm(s)).filter(Boolean);
      if (!winners.length || winners.includes("remis")) d++;
      else if (winners.includes(key)) w++;
      else l++;
    });
    return `${w}-${l}-${d}`;
  };
  const getWins = name => parseInt(getRecord(name).split("-")[0], 10);

  // Federacje
  const getOrgs = name => {
    const key = norm(name);
    const fights = fightsByName[key] || [];
    const setOrgs = new Set();
    fights.forEach(ev => {
      const prefix = (ev.gala||"").split(" ")[0].toUpperCase();
      if (prefix) setOrgs.add(prefix);
    });
    return Array.from(setOrgs).join(" / ");
  };

  // Ostatnia walka
  const getLastFight = name => {
    const key = norm(name);
    const fights = fightsByName[key] || [];
    if (!fights.length) return { text:"—", result:"draw" };
    const latest = fights
      .map(ev=>({ ...ev, dateValue: parseDate(ev.date) }))
      .sort((a,b)=>(b.dateValue||0)-(a.dateValue||0))[0];
    const opps = Array.isArray(latest.participants)
      ? latest.participants.filter(p=>norm(p)!==key)
      : [];
    const opponent = opps.join(" / ")||"—";
    const winners = (latest.winner||"")
      .split(/[,;/]+/).map(s=>norm(s)).filter(Boolean);
    let result="draw";
    if (winners.includes(key)) result="win";
    else if (winners.length)   result="loss";
    const letter = result==="win"?"W":result==="loss"?"L":"D";
    return { text:`${latest.gala}, ${opponent}, ${letter}`, result };
  };

  // filtry + sort
  const filtered = fighters.filter(f=>{
    const inOrg  = getOrgs(f.name).toLowerCase().includes(filterOrg.toLowerCase());
    const inName = f.name.toLowerCase().includes(filterName.toLowerCase());
    return inOrg && inName;
  });
  const sorted = [...filtered].sort((a,b)=>getWins(b.name)-getWins(a.name));

  return (
    <div className="fighters-page">
      <h2>Lista zawodników</h2>

      <div className="controls-panel">
        <label>
          Filtruj po organizacji:&nbsp;
          <input
            type="text"
            placeholder="np. FAME"
            value={filterOrg}
            onChange={e=>setFilterOrg(e.target.value)}
          />
        </label>
        <label>
          Filtruj po nazwisku:&nbsp;
          <input
            type="text"
            placeholder="np. Adamek"
            value={filterName}
            onChange={e=>setFilterName(e.target.value)}
          />
        </label>
      </div>

      <table className="fighters-table">
        <thead>
          <tr>
            <th>Imię i nazwisko</th>
            <th>Pseudonim</th>
            <th>Bilans</th>
            <th>Federacje</th>
            <th>Ostatnia walka</th>
            <th>Waga</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(f=>{
            const last = getLastFight(f.name);
            return (
              <tr
                key={f.id}
                className="clickable-row"
                onClick={()=>setSelectedF(f)}
              >
                <td>{f.name}</td>
                <td>{f.nickname||"—"}</td>
                <td>{getRecord(f.name)}</td>
                <td>{getOrgs(f.name)||"—"}</td>
                <td className={`last-fight-${last.result}`}>{last.text}</td>
                <td>{f.weight||"—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedF && (
        <div className="modal-overlay" onClick={()=>setSelectedF(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setSelectedF(null)}>×</button>
            <div className="profile-header">
              <img
                src={selectedF.photoUrl||defaultAvatar}
                alt={selectedF.name}
                className="profile-avatar"
              />
              <div className="profile-details">
                <h3>{selectedF.name}</h3>
                {!selectedF.photoUrl && (
                  <div className="avatar-upload">
                    <label>Dodaj zdjęcie:</label>
                    <input type="file" accept="image/*" onChange={onAvatarChange}/>
                    {uploadError && <p className="error">Błąd: {uploadError}</p>}
                    <button onClick={uploadAvatar} disabled={!avatarFile||uploading}>
                      {uploading?"Wysyłanie…":"Wyślij zdjęcie"}
                    </button>
                  </div>
                )}
                <div className="profile-info">
                  {[
                    ["Pseudonim:", selectedF.nickname||"—"],
                    ["Bilans:",    getRecord(selectedF.name)],
                    ["Federacje:", getOrgs(selectedF.name)||"—"],
                    ["Ostatnia walka:", getLastFight(selectedF.name).text],
                    ["Waga:",      selectedF.weight||"—"]
                  ].map(([label,value])=>{
                    const lf = getLastFight(selectedF.name);
                    const cls = label==="Ostatnia walka:"?`last-fight-${lf.result}`:"";
                    return (
                      <div className="profile-field" key={label}>
                        <span className="profile-label">{label}</span>
                        <span className={`profile-value ${cls}`}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <h4>Lista walk</h4>
            <table className="modal-table">
              <thead>
                <tr><th>Data</th><th>Gala</th><th>Przeciwnik</th><th>Wynik</th></tr>
              </thead>
              <tbody>
                {(fightsByName[norm(selectedF.name)]||[]).map(ev=>{
                  const key = norm(selectedF.name);
                  const opps = Array.isArray(ev.participants)
                    ? ev.participants.filter(p=>norm(p)!==key)
                    : [];
                  const opponent = opps.join(" / ")||"—";
                  let result="draw";
                  const winners = (ev.winner||"").split(/[,;/]+/).map(s=>norm(s));
                  if (winners.includes(key)) result="win";
                  else if (winners.length)   result="loss";
                  const letter = result==="win"?"W":result==="loss"?"L":"D";
                  return (
                    <tr key={ev.id} className={`row-${result}`}>
                      <td>{ev.date||"—"}</td>
                      <td>{ev.gala||"—"}</td>
                      <td>{opponent}</td>
                      <td>{letter}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
