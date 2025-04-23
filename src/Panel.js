import React, { useEffect, useState } from "react";
import AddFighter from "./AddFighter";

function Panel() {
  const [fighters, setFighters] = useState([]);
  const [filter, setFilter] = useState("");

  const fetchFighters = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/fighters");
      const data = await response.json();
      setFighters(data);
      console.log("🔁 Lista zawodników po dodaniu:", data);
    } catch (error) {
      console.error("Błąd podczas pobierania zawodników:", error);
    }
  };

  const handleDelete = async (index) => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tego zawodnika?");
    if (!confirmed) return;
  
    try {
      const response = await fetch(`http://localhost:3001/api/delete-fighter/${index}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("✅ Zawodnik usunięty");
        fetchFighters(); // odśwież listę
      } else {
        alert("❌ Nie udało się usunąć zawodnika");
      }
    } catch (err) {
      console.error("❌ Błąd podczas usuwania:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    fetchFighters();
  }, []);

  // funkcja czyszcząca i normalizująca organizację
  const normalize = (text) =>
    (text || "").toUpperCase().replace(/\s/g, "").replace(/[^A-Z/]/g, "");

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎯 Panel Zarządzania Zawodnikami</h1>

      <AddFighter onFighterAdded={fetchFighters} />

      <div style={{ margin: "20px 0" }}>
        <label>Filtruj po organizacji:&nbsp;</label>
        <select onChange={handleFilterChange} value={filter}>
          <option value="">Wszystkie</option>
          <option value="FAME">FAME</option>
          <option value="HIGH">HIGH</option>
          <option value="PRIME">PRIME</option>
          <option value="CLOUT">CLOUT</option>
        </select>
        <p>Aktywny filtr: <strong>{filter || "brak"}</strong></p>
      </div>

      <h2>👊 Lista zawodników</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Imię i nazwisko</th>
            <th>Pseudonim</th>
            <th>Telefon</th>
            <th>Organizacja</th>
            <th>Ostatnia walka</th>
            <th>Waga</th>
            <th>Email</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
        {fighters
  .filter((f) => {
    if (!filter) return true;
    const org = normalize(f.organization);
    const val = normalize(filter);
    return org.includes(val);
  })
  .map((fighter, index) => (
    <tr key={fighter.rowIndex}>
      <td>{fighter.name}</td>
      <td>{fighter.nickname}</td>
      <td>{fighter.phone}</td>
      <td>{fighter.organization}</td>
      <td>{fighter.lastFight}</td>
      <td>{fighter.weight}</td>
      <td>{fighter.email}</td>
      <td>
    <button onClick={() => handleDelete(fighter.rowIndex)}>🗑️ Usuń</button>
  </td>
    </tr>
))}
        </tbody>
      </table>
    </div>
  );
}

export default Panel;
