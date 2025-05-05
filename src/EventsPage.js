// src/EventsPage.js
import React, { useState, useEffect } from "react";
import "./EventsPage.css";

/**
 * Hook pobierający równocześnie /api/events i /api/events2
 */
export function useEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/events2")
        ]);
        if (!r1.ok || !r2.ok) throw new Error("Błąd pobierania eventów");
        const [e1, e2] = await Promise.all([r1.json(), r2.json()]);
        // łączymy oba zestawy
        setEvents([...e1, ...e2]);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return [events, loading, error];
}

export function EventsTable({ events }) {
  return (
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
        {events.map(ev => (
          <tr key={ev.id}>
            <td>{ev.participants.join(" / ")}</td>
            <td>{ev.winner}</td>
            <td>{ev.gala}</td>
            <td>{ev.date}</td>
            <td>{ev.finishType}</td>
            <td>{ev.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EventsPage() {
  const [galas, setGalas]             = useState([]);
  const [form, setForm]               = useState({
    participants: "", winner: "", gala: "", date: "", finishType: "", duration: ""
  });
  const [error, setError]             = useState(null);
  const [events, loading, eventsError] = useEvents();

  // pobieramy listę gal
  useEffect(() => {
    fetch("/api/galas")
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setGalas)
      .catch(err => setError(err.message));
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
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Nie udało się dodać walki");
      // odświeżamy listę eventów
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  if (loading)      return <p>Ładuję walki…</p>;
  if (eventsError)  return <p className="error">Błąd: {eventsError}</p>;

  return (
    <div className="events-page">
      <h2>Lista walk</h2>
      <EventsTable events={events} />

      <div className="add-event-form">
        <h3>Dodaj walkę 1-vs-1</h3>
        {error && <p className="error">{error}</p>}
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
