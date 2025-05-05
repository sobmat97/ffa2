// src/AddFighter.js
import React, { useState } from "react";

export default function AddFighter({ onFighterAdded }) {
  const [formData, setFormData] = useState({
    name:        "",
    nickname:    "",
    phone:       "",
    organization:"",
    lastFight:   "",
    weight:      "",
    email:       ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError]           = useState(null);

  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = e => {
    setAvatarFile(e.target.files[0] || null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      // 1) Dodaj fightera
      const res = await fetch("/api/fighters", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const created = await res.json();
      const id = created.id;

      // 2) Jeśli mamy avatar, wrzuć go
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const uploadRes = await fetch(`/api/fighters/${id}/avatar`, {
          method: "POST",
          body:    fd
        });
        if (!uploadRes.ok) throw new Error(`Upload awataru: ${uploadRes.status}`);
      }

      // 3) Powiadom rodzica i wyczyść formę
      onFighterAdded();
      setFormData({
        name:        "",
        nickname:    "",
        phone:       "",
        organization:"",
        lastFight:   "",
        weight:      "",
        email:       ""
      });
      setAvatarFile(null);
    } catch (err) {
      console.error("[AddFighter] error:", err);
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h2>Dodaj zawodnika</h2>
      {error && <p style={{ color: "red" }}>Błąd: {error}</p>}

      {[
        { name: "name",        label: "Imię i nazwisko" },
        { name: "nickname",    label: "Pseudonim" },
        { name: "phone",       label: "Telefon" },
        { name: "organization",label: "Organizacja" },
        { name: "lastFight",   label: "Ostatnia walka" },
        { name: "weight",      label: "Waga" },
        { name: "email",       label: "E-mail" }
      ].map(field => (
        <div key={field.name} style={{ marginBottom: 8 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            {field.label}:
          </label>
          <input
            type="text"
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Avatar:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>

      <button type="submit">Dodaj zawodnika</button>
    </form>
  );
}
