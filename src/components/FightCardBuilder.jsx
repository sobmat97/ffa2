// src/components/FightCardBuilder.jsx
import React, { useState, useEffect } from "react";
import SlotPickerModal from "./SlotPickerModal";
import "./FightCardBuilder.css";

export default function FightCardBuilder() {
  const [orgs, setOrgs] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [gridSize, setGridSize] = useState(3); // siatka gridSize x gridSize
  const totalFights = gridSize * gridSize;

  const [fights, setFights] = useState(
    Array(totalFights).fill(null).map(() => ({ left: null, right: null }))
  );

  const [modal, setModal] = useState({ isOpen: false, slot: 0, side: "left" });

  // Pobierz organizacje i fighterów
  useEffect(() => {
    async function load() {
      try {
        const [galasRes, fightersRes] = await Promise.all([
          fetch("/api/galas"),
          fetch("/api/fighters")
        ]);
        const galasData = await galasRes.json();
        const fightersData = await fightersRes.json();
        setFighters(fightersData);
        const uniqueOrgs = Array.from(
          new Set(galasData.map(g => g.gala.split(" ")[0].toUpperCase()))
        );
        setOrgs(uniqueOrgs);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // Resetuj fights przy zmianie rozmiaru siatki
  useEffect(() => {
    setFights(
      Array(totalFights).fill(null).map(() => ({ left: null, right: null }))
    );
  }, [totalFights]);

  const openPicker = (idx, side) => setModal({ isOpen: true, slot: idx, side });
  const closePicker = () => setModal(modal => ({ ...modal, isOpen: false }));
  const handleSelect = fighter => {
    setFights(prev =>
      prev.map((f, i) =>
        i === modal.slot ? { ...f, [modal.side]: fighter } : f
      )
    );
    closePicker();
  };

  return (
    <div className="fcb-container">
      <div className="fcb-controls">
        <label>
          Organizacja:
          <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)}>
            <option value="">— wybierz organizację —</option>
            {orgs.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Data:
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>
        <label>
          Rozmiar siatki:
          <select value={gridSize} onChange={e => setGridSize(+e.target.value)}>
            {[3,4,5].map(n => (
              <option key={n} value={n}>{n}×{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="card-preview">
        {/* Tło ustawione w CSS */}
        <div className="fcb-main-event">
          {['left','right'].map((side, i) => (
            <div
              key={side}
              className="fcb-slot main"
              onClick={() => openPicker(0, side)}
            >
              {fights[0][side]?.photoUrl
                ? <img src={fights[0][side].photoUrl} alt="" />
                : <span className="fcb-plus">+</span>
              }
              <div className="label">
                {fights[0][side]?.nickname || fights[0][side]?.name || ''}
              </div>
            </div>
          ))}
          <div className="fcb-vs main"></div>
        </div>

        <div className="fcb-grid">
          {fights.slice(1).map((f, i) => (
            <div key={i+1} className="fcb-grid-cell">
              <div className="fcb-slot small" onClick={()=>openPicker(i+1,'left')}>
         {f.left?.photoUrl
           ? <img src={f.left.photoUrl} alt="" />
           : <span className="fcb-plus">+</span>
         }
         <div className="label">
           {f.left ? (f.left.nickname || f.left.name) : ""}
         </div>
       </div>
       <div className="fcb-vs small">vs</div>

       <div className="fcb-slot small" onClick={()=>openPicker(i+1,'right')}>
         {f.right?.photoUrl
           ? <img src={f.right.photoUrl} alt="" />
          : <span className="fcb-plus">+</span>
         }
         <div className="label">
           {f.right ? (f.right.nickname || f.right.name) : ""}
         </div>
       </div>
       </div>
          ))}
        </div>
      </div>

      <SlotPickerModal
        isOpen={modal.isOpen}
        fighters={fighters}
        onSelect={handleSelect}
        onClose={closePicker}
      />
    </div>
  );
}
