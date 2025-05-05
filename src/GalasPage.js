// src/GalasPage.js
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./GalasPage.css";
import defaultLogo from "./images/default.png";

// parseDate: "DD.MM.YYYY" → Date
function parseDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split(".");
  return new Date(+y, +m - 1, +d);
}

// Modal do wyświetlania i edycji gali + walk
function GalaModal({
  gala,
  events,
  onClose,
  onSaveGala,
  onDeleteGala,
  onSaveEvent,
  onDeleteEvent
}) {
  const [isEditingGala, setIsEditingGala] = useState(false);
  const [galaForm, setGalaForm] = useState({ ...gala });
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    number: "",
    participants: "",
    winner: "",
    date: "",
    finishType: "",
    duration: ""
  });

  useEffect(() => {
    setGalaForm({ ...gala });
    setIsEditingGala(false);
    setEditingEvent(null);
    setEventForm({
      number: "",
      participants: "",
      winner: "",
      date: "",
      finishType: "",
      duration: ""
    });
  }, [gala]);

  // wybór loga
  const prefix = gala.gala.split(" ")[0].toUpperCase();
  let modalLogo;
  try {
    modalLogo = require(`./images/${prefix}.png`);
  } catch {
    modalLogo = defaultLogo;
  }

  const fmtParticipants = p =>
    Array.isArray(p) ? p.join(" / ") : p;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img src={modalLogo} alt={gala.gala} className="modal-logo" />

        {/* — Szczegóły gali — */}
        {!isEditingGala && editingEvent === null && (
          <>
            <h2>{gala.gala}</h2>
            <ul className="gala-details-list">
              <li><strong>Data:</strong> {gala.date}</li>
              <li><strong>Hala:</strong> {gala.venue}</li>
              <li><strong>Miasto:</strong> {gala.city}</li>
              <li><strong>Kraj:</strong> {gala.country}</li>
            </ul>
            <div className="modal-actions">
              <button onClick={() => setIsEditingGala(true)}>✏️ Edytuj galę</button>
              <button onClick={() => onDeleteGala(gala.id)}>🗑️ Usuń galę</button>
              <button onClick={() => setEditingEvent({})}>➕ Dodaj walkę</button>
            </div>

            <h3>Walki</h3>
            {events.length === 0 ? (
              <p>Brak zapisanych walk.</p>
            ) : (
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Nr</th><th>Data</th><th>Uczestnicy</th>
                    <th>Zwycięzca</th><th>Finish</th><th>Czas</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => {
                    const num = ev.number ?? (events.length - i);
                    return (
                      <tr key={ev.id}>
                        <td>{num}</td>
                        <td>{ev.date}</td>
                        <td>{fmtParticipants(ev.participants)}</td>
                        <td>{ev.winner}</td>
                        <td>{ev.finishType}</td>
                        <td>{ev.duration}</td>
                        <td className="row-actions">
                          <button onClick={() => {
                            setEditingEvent(ev);
                            setEventForm({
                              number: ev.number ?? "",
                              participants: Array.isArray(ev.participants)
                                ? ev.participants.join(";")
                                : ev.participants,
                              winner: ev.winner,
                              date: ev.date,
                              finishType: ev.finishType,
                              duration: ev.duration
                            });
                          }}>✏️</button>
                          <button onClick={() => onDeleteEvent(ev.id)}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* — Edycja gali — */}
        {isEditingGala && (
          <>
            <h2>Edytuj galę</h2>
            <form className="form-grid" onSubmit={e => {
              e.preventDefault();
              onSaveGala(gala.id, galaForm);
              setIsEditingGala(false);
            }}>
              {["gala", "date", "venue", "city", "country"].map(f => (
                <label key={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}:<br/>
                  <input
                    name={f}
                    value={galaForm[f] || ""}
                    onChange={e => setGalaForm(g => ({ ...g, [f]: e.target.value }))}
                    required
                  />
                </label>
              ))}
              <div className="form-actions">
                <button type="submit">Zapisz</button>
                <button type="button" onClick={() => setIsEditingGala(false)}>Anuluj</button>
              </div>
            </form>
          </>
        )}

        {/* — Edycja/Dodawanie walki — */}
        {editingEvent !== null && (
          <>
            <h2>{editingEvent.id ? "Edytuj walkę" : "Nowa walka"}</h2>
            <form className="form-grid" onSubmit={e => {
              e.preventDefault();
              const payload = {
                ...eventForm,
                gala: gala.gala,
                participants: eventForm.participants.split(";").map(s => s.trim())
              };
              onSaveEvent(editingEvent.id, payload);
              setEditingEvent(null);
            }}>
              <label>
                Nr walki:<br/>
                <input
                  name="number"
                  type="number"
                  min="1"
                  value={eventForm.number || ""}
                  onChange={e => setEventForm(f => ({ ...f, number: +e.target.value }))}
                  required
                />
              </label>
              <label>
                Data:<br/>
                <input
                  name="date"
                  value={eventForm.date || ""}
                  onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </label>
              <label>
                Uczestnicy (oddziel „;”):<br/>
                <input
                  name="participants"
                  value={eventForm.participants}
                  onChange={e => setEventForm(f => ({ ...f, participants: e.target.value }))}
                  required
                />
              </label>
              <label>
                Zwycięzca:<br/>
                <input
                  name="winner"
                  value={eventForm.winner}
                  onChange={e => setEventForm(f => ({ ...f, winner: e.target.value }))}
                />
              </label>
              <label>
                Finish:<br/>
                <input
                  name="finishType"
                  value={eventForm.finishType}
                  onChange={e => setEventForm(f => ({ ...f, finishType: e.target.value }))}
                />
              </label>
              <label>
                Czas:<br/>
                <input
                  name="duration"
                  value={eventForm.duration}
                  onChange={e => setEventForm(f => ({ ...f, duration: e.target.value }))}
                />
              </label>
              <div className="form-actions">
                <button type="submit">Zapisz</button>
                <button type="button" onClick={() => setEditingEvent(null)}>Anuluj</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function GalasPage() {
  const [galas, setGalas]         = useState([]);
  const [events, setEvents]       = useState([]);
  const [activeGala, setActiveGala] = useState(null);

  useEffect(() => {
    fetch("/api/galas").then(r => r.json()).then(setGalas);
    fetch("/api/events").then(r => r.json()).then(setEvents);
  }, []);

  // CRUD galer
  const saveGala = async (id, data) => {
    const url    = id ? `/api/galas/${id}` : "/api/galas";
    const method = id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const updated = await fetch("/api/galas").then(r => r.json());
    setGalas(updated);
    if (!id) setActiveGala(updated.slice(-1)[0]);
  };
  const deleteGala = async id => {
    await fetch(`/api/galas/${id}`, { method: "DELETE" });
    setActiveGala(null);
    setGalas(await fetch("/api/galas").then(r => r.json()));
  };

  // CRUD walk
  const saveEvent = async (id, data) => {
    const url    = id ? `/api/events/${id}` : "/api/events";
    const method = id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setEvents(await fetch("/api/events").then(r => r.json()));
  };
  const deleteEvent = async id => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setEvents(await fetch("/api/events").then(r => r.json()));
  };

  // 1) sortujemy gale malejąco po dacie
  const sorted = [...galas]
    .map(g => ({ ...g, dateValue: parseDate(g.date) }))
    .sort((a, b) => (b.dateValue || 0) - (a.dateValue || 0));

  // 2) łączymy walki z galami
  const grouped = sorted.map(g => ({
    ...g,
    events: events.filter(ev => ev.gala.trim() === g.gala.trim())
  }));

  // 3) dzielimy na strony po 6 galer
  const pageSize = 6;
  const pages = [];
  for (let i = 0; i < grouped.length; i += pageSize) {
    pages.push(grouped.slice(i, i + pageSize));
  }

  // 4) slider: jeden page = 6 kart jako jeden slide
  const settings = {
    infinite: false,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="galas-page">
      <h1>
        Lista Gal{" "}
        <button className="btn-add" onClick={() => setActiveGala({})}>
          ➕ Nowa
        </button>
      </h1>

      <div className="galas-slider">
        <Slider {...settings}>
          {pages.map((page, idx) => (
            <div key={idx}>
              <div className="galas-grid-slide">
                {page.map(g => {
                  const prefix = g.gala.split(" ")[0].toUpperCase();
                  let logo;
                  try { logo = require(`./images/${prefix}.png`); }
                  catch { logo = defaultLogo; }
                  return (
                    <div
                      key={g.id}
                      className="gala-card"
                      onClick={() => setActiveGala(g)}
                    >
                      <img src={logo} alt={g.gala} className="gala-logo" />
                      <h3 className="gala-title">{g.gala}</h3>
                      <p className="gala-date">{g.date}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {activeGala && (
        <GalaModal
          gala={activeGala}
          events={grouped.find(x => x.id === activeGala.id)?.events || []}
          onClose={() => setActiveGala(null)}
          onSaveGala={saveGala}
          onDeleteGala={deleteGala}
          onSaveEvent={saveEvent}
          onDeleteEvent={deleteEvent}
        />
      )}
    </div>
  );
}
