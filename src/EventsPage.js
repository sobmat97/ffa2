import React, { useState, useEffect } from "react";
import "./EventsPage.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm]     = useState({
    fighter1: "",
    fighter2: "",
    winner: "",
    gala: "",
    date: "",
    finishType: "",
    duration: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // pobranie eventów
  const load = () => {
    setLoading(true);
    fetch("/api/events")
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e);
        setLoading(false);
      });
  };
  useEffect(load, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(() => {
        setForm({
          fighter1: "",
          fighter2: "",
          winner: "",
          gala: "",
          date: "",
          finishType: "",
          duration: ""
        });
        load();
      })
      .catch(e => setError(e.message));
  };

  if (loading) return <p>Ładuję walki…</p>;
  if (error)   return <p className="error">Błąd: {error}</p>;

  return (
    <div className="events-page">
      <div className="inner">
        <h2>Gale i walki</h2>

        <div className="controls-panel">
          <form onSubmit={handleSubmit} className="add-event-form">
            {[
              "fighter1",
              "fighter2",
              "winner",
              "gala",
              "date",
              "finishType",
              "duration"
            ].map(field => (
              <div key={field}>
                <label>{field.replace(/([A-Z])/g, " $1")}:</label>
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required={field !== "winner"}
                />
              </div>
            ))}
            <button type="submit">Dodaj walkę</button>
          </form>
        </div>

        <table className="events-table">
          <thead>
            <tr>
              <th>Wiersz</th>
              <th>Fighter 1</th>
              <th>Fighter 2</th>
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
                <td>{ev.id}</td>
                <td>{ev.fighter1}</td>
                <td>{ev.fighter2}</td>
                <td>{ev.winner}</td>
                <td>{ev.gala}</td>
                <td>{ev.date}</td>
                <td>{ev.finishType}</td>
                <td>{ev.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
