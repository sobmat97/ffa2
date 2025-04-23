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
  const [error, setError] = useState(null);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError(null);
    fetch("/api/add-fighter", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(() => {
        alert("Zawodnik dodany!");
        onFighterAdded();
      })
      .catch(err => {
        console.error("[CLIENT] add-fighter error:", err);
        setError(err.message);
      });
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
        { name: "email",       label: "E‑mail" }
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
      <button type="submit">Wyślij</button>
    </form>
  );
}
