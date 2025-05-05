// src/AddGala.js
import React, { useState } from "react";

export default function AddGala({ onGalaAdded }) {
  const [form, setForm]   = useState({ gala:"", date:"", venue:"", city:"", country:"" });
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    console.log("🔃 Wysyłam POST /api/galas:", form);
    try {
      const res = await fetch("/api/galas", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) {
        console.error("❌ Błąd serwera:", json);
        throw new Error(json.error || res.status);
      }
      console.log("🎉 Serwer odpowiedział:", json);
      onGalaAdded();
    } catch (err) {
      console.error("❌ AddGala error:", err);
      setError("Nie udało się dodać gali: " + err.message);
    }
  };

  return (
    <div className="add-gala-page">
      <h2>Dodaj nową galę</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="add-gala-form">
        {[
          ["gala","Gala"],
          ["date","Data (DD.MM.YYYY)"],
          ["venue","Hala"],
          ["city","Miasto"],
          ["country","Kraj"]
        ].map(([name,label])=>(
          <div key={name} className="field">
            <label>{label}:</label>
            <input 
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Dodaj galę</button>
      </form>
    </div>
  );
}
