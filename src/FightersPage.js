// src/FightersPage.js
import React, { useState, useEffect } from "react";
import "./FightersPage.css";

export default function FightersPage() {
  const [fighters, setFighters]         = useState([]);
  const [filterOrg, setFilterOrg]       = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [editingRow, setEditingRow]     = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortAsc, setSortAsc]           = useState(true);

  const [showNickname, setShowNickname] = useState(true);
  const [showPhone, setShowPhone]       = useState(true);
  const [showEmail, setShowEmail]       = useState(true);

  // Pobierz listę zawodników
  const loadFighters = () => {
    setLoading(true);
    fetch("/api/fighters")
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        setFighters(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(loadFighters, []);

  // Rozpocznij edycję wiersza
  const startEdit = f => {
    setEditingRow(f.rowNumber);
    setEditFormData({ ...f });
  };
  const cancelEdit = () => setEditingRow(null);

  // Zapisz edytowanego zawodnika
  const saveEdit = () => {
    fetch(`/api/fighters/${editingRow}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(editFormData),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(() => {
        setEditingRow(null);
        loadFighters();
      })
      .catch(err => setError(err.message));
  };

  // Usuń zawodnika
  const deleteFighter = rowNumber => {
    if (!window.confirm("Usunąć tego zawodnika?")) return;
    fetch(`/api/fighters/${rowNumber}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(() => loadFighters())
      .catch(err => setError(err.message));
  };

  // Przełącz sortowanie po nazwisku
  const toggleSort = () => setSortAsc(prev => !prev);

  if (loading) return <p>Ładuję zawodników…</p>;
  if (error)   return <p className="error">Błąd: {error}</p>;

  // Filtrowanie
  const filtered = fighters.filter(f =>
    f.organization.toLowerCase().includes(filterOrg.toLowerCase())
  );

  // Sortowanie
  const sorted = [...filtered].sort((a, b) =>
    sortAsc
      ? a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      : b.name.localeCompare(a.name, undefined, { sensitivity: "base" })
  );

  return (
    <div className="fighters-page">
      <div className="inner">
        <h2>Lista zawodników</h2>

        <div className="controls-panel">
          <div className="column-toggles">
            <label>
              <input
                type="checkbox"
                checked={showNickname}
                onChange={e => setShowNickname(e.target.checked)}
              />{" "}
              Pseudonim
            </label>
            <label>
              <input
                type="checkbox"
                checked={showPhone}
                onChange={e => setShowPhone(e.target.checked)}
              />{" "}
              Telefon
            </label>
            <label>
              <input
                type="checkbox"
                checked={showEmail}
                onChange={e => setShowEmail(e.target.checked)}
              />{" "}
              E‑mail
            </label>
          </div>
          <div className="filter">
            <label>Filtruj po organizacji:&nbsp;</label>
            <input
              type="text"
              placeholder="np. FAME"
              value={filterOrg}
              onChange={e => setFilterOrg(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th onClick={toggleSort} className="sortable">
                Imię i nazwisko {sortAsc ? "▲" : "▼"}
              </th>
              {showNickname && <th>Pseudonim</th>}
              {showPhone    && <th>Telefon</th>}
              <th>Organizacja</th>
              <th>Ostatnia walka</th>
              <th>Waga</th>
              {showEmail && <th>E‑mail</th>}
              <th colSpan="2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(f => (
              <tr key={f.rowNumber}>
                {editingRow === f.rowNumber ? (
                  <>
                    <td>
                      <input
                        value={editFormData.name}
                        onChange={e =>
                          setEditFormData({ ...editFormData, name: e.target.value })
                        }
                      />
                    </td>
                    {showNickname && (
                      <td>
                        <input
                          value={editFormData.nickname}
                          onChange={e =>
                            setEditFormData({ ...editFormData, nickname: e.target.value })
                          }
                        />
                      </td>
                    )}
                    {showPhone && (
                      <td>
                        <input
                          value={editFormData.phone}
                          onChange={e =>
                            setEditFormData({ ...editFormData, phone: e.target.value })
                          }
                        />
                      </td>
                    )}
                    <td>
                      <input
                        value={editFormData.organization}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            organization: e.target.value
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={editFormData.lastFight}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            lastFight: e.target.value
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={editFormData.weight}
                        onChange={e =>
                          setEditFormData({ ...editFormData, weight: e.target.value })
                        }
                      />
                    </td>
                    {showEmail && (
                      <td>
                        <input
                          value={editFormData.email}
                          onChange={e =>
                            setEditFormData({ ...editFormData, email: e.target.value })
                          }
                        />
                      </td>
                    )}
                    <td>
                      <button onClick={saveEdit}>Zapisz</button>
                    </td>
                    <td>
                      <button onClick={cancelEdit}>Anuluj</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{f.name}</td>
                    {showNickname && <td>{f.nickname}</td>}
                    {showPhone    && <td>{f.phone}</td>}
                    <td>{f.organization}</td>
                    <td>{f.lastFight}</td>
                    <td>{f.weight}</td>
                    {showEmail && <td>{f.email}</td>}
                    <td>
                      <button onClick={() => startEdit(f)}>Edytuj</button>
                    </td>
                    <td>
                      <button onClick={() => deleteFighter(f.rowNumber)}>Usuń</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
