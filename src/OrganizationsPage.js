import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import defaultLogo from "./images/default.png";
import "./OrganizationsPage.css";

export default function OrganizationsPage() {
  const [events, setEvents]         = useState([]);
  const [orgGroups, setOrgGroups]   = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [galaGroups, setGalaGroups] = useState([]);
  const [selectedGala, setSelectedGala] = useState(null);

  // 1) Pobierz wszystkie eventy
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setEvents)
      .catch(console.error);
  }, []);

  // 2) Grupuj eventy po organizacji (prefix gala), sortuj w każdej grupie malejąco wg daty,
  //    a same grupy też po najnowszej dacie
  useEffect(() => {
    const parseDate = s => {
      if (!s) return null;
      const [d, m, y] = s.split(".");
      const dt = new Date(+y, +m - 1, +d);
      return isNaN(dt) ? null : dt;
    };

    const groups = events.reduce((acc, ev) => {
      const org = ev.gala.split(" ")[0].toUpperCase();
      if (!acc[org]) acc[org] = [];
      acc[org].push({
        ...ev,
        dateValue: parseDate(ev.date)
      });
      return acc;
    }, {});

    const arr = Object.entries(groups).map(([org, list]) => {
      // sortuj eventy w grupie malejąco
      list.sort((a, b) => {
        if (a.dateValue && b.dateValue) return b.dateValue - a.dateValue;
        if (a.dateValue) return -1;
        if (b.dateValue) return 1;
        return 0;
      });
      return { org, events: list };
    });

    // sortuj grupy po najnowszej dacie (pierwszy element listy)
    arr.sort((a, b) => {
      const da = a.events[0]?.dateValue;
      const db = b.events[0]?.dateValue;
      if (da && db) return db - da;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });

    setOrgGroups(arr);
  }, [events]);

  // 3) Jak wybierzesz organizację, przygotuj listę gal (po pełnej nazwie)
  useEffect(() => {
    if (!selectedOrg) {
      setGalaGroups([]);
      setSelectedGala(null);
      return;
    }
    const groups = selectedOrg.events.reduce((acc, ev) => {
      if (!acc[ev.gala]) acc[ev.gala] = [];
      acc[ev.gala].push(ev);
      return acc;
    }, {});
    const arr = Object.entries(groups).map(([galaName, list]) => ({
      galaName,
      events: list
    }));
    setGalaGroups(arr);
  }, [selectedOrg]);

  // ustawienia karuzeli
  const orgSliderSettings = {
    infinite: false,
    rows: 3,
    slidesPerRow: 3,
    arrows: true,
    responsive: [
      { breakpoint: 900, settings: { slidesPerRow: 3, rows: 3 } },
      { breakpoint: 600, settings: { slidesPerRow: 3, rows: 3 } },
    ],
  };
  const galaSliderSettings = {
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: true,
    responsive: [
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="organizations-page">
      <h2>Organizacje</h2>

      {/* Karuzela organizacji */}
      {orgGroups.length === 0 ? (
        <p>Ładuję organizacje…</p>
      ) : (
        <Slider {...orgSliderSettings}>
          {orgGroups.map(g => {
            // spróbuj załadować logo, w razie błędu fallback na defaultLogo
            let logoSrc;
            try {
              logoSrc = require(`./images/${g.org}.png`);
            } catch {
              logoSrc = defaultLogo;
            }
            return (
              <div
                key={g.org}
                className="org-card"
                onClick={() => {
                  setSelectedOrg(g);
                  setSelectedGala(null);
                }}
              >
                <img src={logoSrc} alt={g.org} />
                <h3>{g.org}</h3>
              </div>
            );
          })}
        </Slider>
      )}

      {/* Modal z galami danej organizacji */}
      {selectedOrg && (
        <div className="modal-overlay" onClick={() => setSelectedOrg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedOrg(null)}>×</button>
            <h3>Gale: {selectedOrg.org}</h3>
            {galaGroups.length === 0 ? (
              <p>Ładuję gale…</p>
            ) : (
              <Slider {...galaSliderSettings}>
                {galaGroups.map(g => {
                  let logoSrc;
                  try {
                    logoSrc = require(`./images/${selectedOrg.org}.png`);
                  } catch {
                    logoSrc = defaultLogo;
                  }
                  return (
                    <div
                      key={g.galaName}
                      className="gala-card"
                      onClick={() => setSelectedGala(g)}
                    >
                      <img src={logoSrc} alt={g.galaName} />
                      <h4>{g.galaName}</h4>
                      <p>{g.events[0].date || "—"}</p>
                    </div>
                  );
                })}
              </Slider>
            )}
          </div>
        </div>
      )}

      {/* Modal z listą walk danej gali */}
      {selectedGala && (
        <div className="modal-overlay" onClick={() => setSelectedGala(null)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedGala(null)}>×</button>
            <h4>Walki na gali {selectedGala.galaName}</h4>
            <table className="fights-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Fighter 1</th>
                  <th>Fighter 2</th>
                  <th>Zwycięzca</th>
                  <th>Finish</th>
                  <th>Czas</th>
                </tr>
              </thead>
              <tbody>
                {selectedGala.events.map(ev => (
                  <tr key={ev.id}>
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
