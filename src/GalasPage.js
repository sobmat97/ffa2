// src/GalasPage.js
import React, { useState, useEffect } from "react";
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./GalasPage.css";

export default function GalasPage() {
  const [events, setEvents]     = useState([]);
  const [grouped, setGrouped]   = useState([]);
  const [selected, setSelected] = useState(null);

  // 1) Fetch all events
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setEvents)
      .catch(console.error);
  }, []);

  // 2) Group by galaName (full), sort each group by date descending,
  //    then sort the groups by their newest date descending
  useEffect(() => {
    const parseDate = s => {
      if (!s) return null;
      const [d,m,y] = s.split(".");
      const dt = new Date(+y, +m-1, +d);
      return isNaN(dt) ? null : dt;
    };

    // grupowanie
    const groups = events.reduce((acc, ev) => {
      const galaName = ev.gala.trim();
      acc[galaName] = acc[galaName] || [];
      acc[galaName].push(ev);
      return acc;
    }, {});

    // przygotowanie tablicy
    const arr = Object.entries(groups).map(([galaName, fights]) => {
      const withDates = fights.map(f => ({ ...f, dateValue: parseDate(f.date) }));
      // w grupie sort od najnowszej
      withDates.sort((a,b) => {
        if (a.dateValue && b.dateValue) return b.dateValue - a.dateValue;
        if (a.dateValue)              return -1;
        if (b.dateValue)              return 1;
        return 0;
      });
      return { galaName, events: withDates };
    });

    // sort samych grup: najnowsze na początku
    arr.sort((a,b) => {
      const da = a.events[0]?.dateValue;
      const db = b.events[0]?.dateValue;
      if (da && db) return db - da;
      if (da)       return -1;
      if (db)       return 1;
      return 0;
    });

    setGrouped(arr);
  }, [events]);

  // 3) ustawienia karuzeli: 2 rzędy × 3 kolumny
  const settings = {
    infinite:     false,
    rows:         2,
    slidesPerRow: 3,
    arrows:       true,
    responsive: [
      { breakpoint: 900, settings: { rows:2, slidesPerRow:2 } },
      { breakpoint: 600, settings: { rows:1, slidesPerRow:1 } },
    ],
  };

  return (
    <div className="galas-page">
      <h2>Lista Gal</h2>

      {grouped.length === 0
        ? <p>Ładuję…</p>
        : (
          <div className="slider-container">
            <Slider {...settings}>
              {grouped.map(group => {
                const prefix = group.galaName.split(" ")[0].toUpperCase();
                // wybieramy pełną nazwę z pierwszego eventu w grupie
                const fullName = group.events[0].gala; 

                // próbujemy dynamicznie załadować ikonę prefix + ".png"
                let logoSrc;
                try {
                  logoSrc = require(`./images/${prefix}.png`);
                } catch {
                  logoSrc = require(`./images/default.png`);
                }

                return (
                  <div
                    key={group.galaName}
                    className="gala-card"
                    onClick={() => setSelected(group)}
                  >
                    <img src={logoSrc} alt={prefix} />
                    <h3>{fullName}</h3>
                    <p>{group.events[0].date || "—"}</p>
                  </div>
                );
              })}
            </Slider>
          </div>
        )
      }

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            <h3>Walki na gali {selected.galaName}</h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th><th>Fighter 1</th><th>Fighter 2</th>
                  <th>Zwycięzca</th><th>Finish</th><th>Czas</th>
                </tr>
              </thead>
              <tbody>
                {selected.events.map(ev => (
                  <tr key={ev.rowNumber}>
                    <td>{ev.date || "—"}</td>
                    <td>{ev.fighter1}</td>
                    <td>{ev.fighter2}</td>
                    <td>{ev.winner}</td>
                    <td>{ev.finishType}</td>
                    <td>{ev.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
