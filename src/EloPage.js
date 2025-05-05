// src/EloPage.js
import React, { useState, useEffect } from "react";
import { expectedScore, updateRatings } from "./elo";
import { useEvents, EventsTable } from "./EventsPage";
import "./EloPage.css";

export default function EloPage() {
  // fighters z API
  const [fighters, setFighters] = useState([]);
  const [loadingF, setLoadingF] = useState(true);
  const [errorF, setErrorF]     = useState(null);

  // eventy z hooka
  const [events, loadingE, errorE] = useEvents();

  // baselineId — maksymalny id historyczny, ustalamy raz
  const [baselineId, setBaselineId] = useState(null);

  // mapa finalnych ratingów
  const [eloMap, setEloMap] = useState({});

  // 1) Wczytujemy fighterów
  useEffect(() => {
    fetch("/api/fighters")
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(setFighters)
      .catch(e => setErrorF(e.message))
      .finally(() => setLoadingF(false));
  }, []);

  // 2) Gdy po raz pierwszy załadują się eventy, ustawiamy baselineId
  useEffect(() => {
    if (!loadingE && baselineId === null && events.length) {
      const maxId = Math.max(...events.map(ev => ev.id));
      setBaselineId(maxId);
      // EloMap na razie puste — nikt nie liczy
    }
  }, [loadingE, events, baselineId]);

  // helper normalizacji
  const norm = s => s.trim().toLowerCase();

  // 3) Główne obliczenie ELO — tylko eventy z id > baselineId
  useEffect(() => {
    if (
      loadingF || loadingE ||
      errorF   || errorE   ||
      baselineId === null
    ) return;

    // standardowy 1200
    const ratings = {};
    fighters.forEach(f => { ratings[f.id] = 1200; });

    // wybieramy tylko nowe eventy 1v1 (participants array len=2) z id>baseline
    const toCount = events
      .filter(ev =>
        ev.id > baselineId &&
        Array.isArray(ev.participants) &&
        ev.participants.length === 2
      )
      // sort według daty
      .sort((a,b) => {
        const [d1,m1,y1] = a.date.split(".");
        const [d2,m2,y2] = b.date.split(".");
        return new Date(+y1,+m1-1,+d1) - new Date(+y2,+m2-1,+d2);
      });

    console.log(`⚔️ Nowych walk do liczenia Elo: ${toCount.length}`);

    toCount.forEach(ev => {
      const [pA,pB] = ev.participants;
      const nameA = pA.trim(), nameB = pB.trim();
      const fA = fighters.find(f=>norm(f.name)===norm(nameA));
      const fB = fighters.find(f=>norm(f.name)===norm(nameB));
      if (!fA||!fB) return;

      let scoreA = 0.5;
      if (ev.winner && norm(ev.winner)===norm(nameA)) scoreA = 1;
      else if (ev.winner && norm(ev.winner)===norm(nameB)) scoreA = 0;

      const [newA,newB] = updateRatings(ratings[fA.id], ratings[fB.id], scoreA);
      ratings[fA.id] = newA;
      ratings[fB.id] = newB;
    });

    setEloMap(ratings);
  }, [baselineId, fighters, events, loadingF, loadingE, errorF, errorE]);

  // 4) Symulator
  const [selA, setSelA]   = useState("");
  const [selB, setSelB]   = useState("");
  const [res, setRes]     = useState("A");
  const [sim, setSim]     = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSimulate = e => {
    e.preventDefault();
    const a = fighters.find(f=>f.id===selA);
    const b = fighters.find(f=>f.id===selB);
    if (!a||!b) return;
    const scoreA = res==="A"?1:res==="B"?0:0.5;
    const rA = eloMap[a.id] ?? 1200;
    const rB = eloMap[b.id] ?? 1200;
    const [newA,newB] = updateRatings(rA, rB, scoreA);
    const E_A = expectedScore(rA, rB);
    setSim({ a,b,rA,rB,newA,newB,E_A });
  };

  const handleSave = async () => {
    if (!sim) return;
    setSaving(true);
    await Promise.all([
      fetch(`/api/fighters/${sim.a.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ rating: sim.newA })
      }),
      fetch(`/api/fighters/${sim.b.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ rating: sim.newB })
      })
    ]);
    const r = await fetch("/api/fighters");
    setFighters(await r.json());
    setSaving(false);
  };

  if (loadingF||loadingE) return <p>Ładuję dane…</p>;
  if (errorF||errorE)   return <p className="error">Błąd: {errorF||errorE}</p>;
  if (baselineId === null) return <p>Inicjalizuję bazę walk…</p>;

  // 5) Ranking wszystkich (zaktualizowanymi Elo)
  const ranking = fighters
    .map(f=>({ ...f, elo: eloMap[f.id] ?? 1200 }))
    .sort((a,b)=>b.elo - a.elo);

  return (
    <div className="elo-page">
      <h2>Aktualne ELO (Tylko Twoje nowe walki)</h2>
      <table className="elo-table">
        <thead><tr><th>#</th><th>Fighter</th><th>ELO</th></tr></thead>
        <tbody>
          {ranking.map((f,i)=>(
            <tr key={f.id}>
              <td>{i+1}</td>
              <td>{f.name}</td>
              <td>{f.elo.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr/>

      <h2>Symulator pojedynku</h2>
      <form className="elo-form" onSubmit={handleSimulate}>
        <label>
          A:<br/>
          <select value={selA} onChange={e=>setSelA(e.target.value)} required>
            <option value="">— wybierz —</option>
            {ranking.map(f=>(
              <option key={f.id} value={f.id}>
                {f.name} (ELO: {f.elo.toFixed(0)})
              </option>
            ))}
          </select>
        </label>
        <label>
          B:<br/>
          <select value={selB} onChange={e=>setSelB(e.target.value)} required>
            <option value="">— wybierz —</option>
            {ranking.map(f=>(
              <option key={f.id} value={f.id}>
                {f.name} (ELO: {f.elo.toFixed(0)})
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Wynik</legend>
          <label><input type="radio" name="res" value="A"
            checked={res==="A"} onChange={()=>setRes("A")}/> A wins</label>
          <label><input type="radio" name="res" value="B"
            checked={res==="B"} onChange={()=>setRes("B")}/> B wins</label>
          <label><input type="radio" name="res" value="draw"
            checked={res==="draw"} onChange={()=>setRes("draw")}/> Draw</label>
        </fieldset>
        <button type="submit">Symuluj</button>
      </form>

      {sim && (
        <div className="elo-result">
          <h3>Wynik symulacji</h3>
          <p>
            {sim.a.name} ({sim.rA.toFixed(0)}) → <strong>{sim.newA.toFixed(0)}</strong><br/>
            {sim.b.name} ({sim.rB.toFixed(0)}) → <strong>{sim.newB.toFixed(0)}</strong>
          </p>
          <p>Expected A: {(sim.E_A*100).toFixed(1)} %</p>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Zapis…" : "Zapisz ratingi"}
          </button>
        </div>
      )}

      <hr/>
      <h2>Lista wszystkich walk</h2>
      <EventsTable events={events} />
    </div>
  );
}
