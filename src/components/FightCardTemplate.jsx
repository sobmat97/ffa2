import React from "react";
import "./FightCardTemplate.css";

export default function FightCardTemplate({ slots, onSlotClick }) {
  return (
    <div className="fight-card">
      {/* === MAIN EVENT */}
      <div className="main-fight">
        <div
          className="fighter-box"
          onClick={() => onSlotClick("mainA")}
        >
          {slots.mainA ? (
            <img src={slots.mainA.photoUrl} alt={slots.mainA.name} />
          ) : (
            <div className="placeholder">zdjęcie</div>
          )}
          <div className="label">
            {slots.mainA ? (slots.mainA.nickname || slots.mainA.name) : ""}
          </div>
        </div>

        <div className="vs-label">VS</div>

        <div
          className="fighter-box"
          onClick={() => onSlotClick("mainB")}
        >
          {slots.mainB ? (
            <img src={slots.mainB.photoUrl} alt={slots.mainB.name} />
          ) : (
            <div className="placeholder">zdjęcie</div>
          )}
          <div className="label">
            {slots.mainB ? (slots.mainB.nickname || slots.mainB.name) : ""}
          </div>
        </div>
      </div>

      {/* === SUB FIGHTS */}
      <div className="sub-fights">
        {slots.fights.map((f, i) => (
          <div
            key={i}
            className="fighter-box"
            onClick={() => onSlotClick(`fight${i}`)}
          >
            {f ? (
              <img src={f.photoUrl} alt={f.name} />
            ) : (
              <div className="placeholder">zdjęcie</div>
            )}
            <div className="label">
              {f ? (f.nickname || f.name) : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
