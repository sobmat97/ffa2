import React, { useState, useEffect } from "react";
import defaultAvatar from "../images/avatars/default.png";
import "./SlotPickerModal.css";

export default function SlotPickerModal({ 
  isOpen, 
  fighters = [], 
  onSelect, 
  onClose 
}) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(fighters);

  useEffect(() => {
    setFiltered(
      fighters.filter(f =>
        (f.nickname || f.name)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, fighters]);

  if (!isOpen) return null;

  return (
    <div className="spm-overlay" onClick={onClose}>
      <div className="spm-content" onClick={e => e.stopPropagation()}>
        <button className="spm-close" onClick={onClose}>×</button>
        <input
          className="spm-search"
          type="text"
          placeholder="Wyszukaj zawodnika..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="spm-list">
          {filtered.map(f => (
            <div
              key={f.id}
              className="spm-item"
              onClick={() => {
                onSelect(f);
                onClose();
              }}
            >
              <img
                src={f.photoUrl || defaultAvatar}
                alt={f.name}
                className="spm-avatar"
              />
              <div className="spm-label">
                {f.name || f.nickname}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="spm-empty">Brak wyników</p>}
        </div>
      </div>
    </div>
  );
}
