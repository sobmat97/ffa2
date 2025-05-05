// src/EventsPage.js
import React, { useState, useEffect } from "react";
import "./EventsPage.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [galas, setGalas] = useState([]);
  const [form, setForm] = useState({
    participants: "",
    winner:       "",
    gala:         "",
    date:         "",
    finishType:   "",
    duration:     ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // załaduj events, events2 i galas
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [r1, r2, rg] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/events2"),
          fetch("/api/galas")
        ]);
        if (!r1.ok || !r2.ok || !rg.ok) throw new Error("Błąd z serwera");
        const [e1, e2, g] = await Promise.all([r1.json(), r2.json(), rg.json()]);

        // normalizacja events2 → dorzucamy brakujące finishType/duration
        const norm2 = e2.map(ev => ({
          id:           ev.id,
          participants: ev.participants,
          winner:       ev.winner || "",
          gala:         ev.gala   || "",
          date:         ev.date   || "",
          finishType:   "",
          duration:     ""
        }));

        setEvents([ ...e1, ...norm2 ]);
        setGalas(g);
      } catch(err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Nie udało się dodać walki");
      // odśwież tylko 1v1 events
      const fresh = await fetch("/api/events").then(r=> {
        if (!r.ok) throw new Error("Błąd przy odświeżaniu");
        return r.json();
      });
      // ponownie doklej norm2
      const current2 = events.filter(ev=> ev.finishType==="" && ev.duration==="" && ev.id);
      setEvents([ ...fresh, ...current2 ]);
      // wyczyść formularz
      setForm({
        participants: "",
        winner:       "",
        gala:         "",
        date:         "",
        finishType:   "",
        duration:     ""
      });
    } catch(err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (loading) return <p>Ładuję dane…</p>;
  if (error)   return <p className="error">Błąd: {error}</p>;

  return (
    <div className="events-page">
      <h2>Lista walk</h2>

      <table className="events-table">
        <thead>
          <tr>
            <th>Uczestnicy</th>
            <th>Zwycięzca</th>
            <th>Gala</th>
            <th>Data</th>
            <th>Finish</th>
            <th>Czas</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, i) => (
            <tr key={`${ev.id}-${i}`}>
              <td>{(ev.participants||[]).join(" / ")}</td>
              <td>{ev.winner    || "—"}</td>
              <td>{ev.gala      || "—"}</td>
              <td>{ev.date      || "—"}</td>
              <td>{ev.finishType|| "—"}</td>
              <td>{ev.duration  || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="add-event-form">
        <h3>Dodaj walkę 1v1</h3>
        {error && <p className="error">Błąd: {error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Uczestnicy (oddziel „;”):<br/>
            <input
              name="participants"
              value={form.participants}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Zwycięzca:<br/>
            <input
              name="winner"
              value={form.winner}
              onChange={handleChange}
            />
          </label>
          <label>
            Gala:<br/>
            <select
              name="gala"
              value={form.gala}
              onChange={handleChange}
              required
            >
              <option value="">— wybierz galę —</option>
              {galas.map(g => (
                <option key={g.id} value={g.gala}>
                  {g.gala} ({g.date})
                </option>
              ))}
            </select>
          </label>
          <label>
            Data (DD.MM.YYYY):<br/>
            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Finish:<br/>
            <input
              name="finishType"
              value={form.finishType}
              onChange={handleChange}
            />
          </label>
          <label>
            Czas:<br/>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Dodaj walkę</button>
        </form>
      </div>
    </div>
  );
}
