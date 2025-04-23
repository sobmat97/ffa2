// freak-fight-server/index.js

const express            = require("express");
const path               = require("path");
const cors               = require("cors");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds              = require("./credentials.json"); // Twój plik z poświadczeniami

const app      = express();
const PORT     = process.env.PORT || 3001;
const SHEET_ID = "1qUPE8PXticebtACDkqPK7xBf1c-NZKzeQtx7db-fAAM";

const basicAuth = require("express-basic-auth");

// wymagaj logowania na każdy request:
app.use(basicAuth({
  users: { "admin": "hasło123" },
  challenge: true
}));

// — middleware —
app.use(cors());
app.use(express.json());

// — helper do arkuszy —
async function getSheet(title) {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return title
    ? doc.sheetsByTitle[title]
    : doc.sheetsByIndex[0];
}

// ─── Fighters API ────────────────────────────────────────────────

// GET /api/fighters — lista
app.get("/api/fighters", async (req, res) => {
  console.log("🔔 [API] GET /api/fighters");
  try {
    const sheet   = await getSheet();
    const rows    = await sheet.getRows();
    const fighters = rows.map(r => ({
      rowNumber:    r._rowNumber,
      name:         r["IMIĘ I NAZWISKO"] || "",
      nickname:     r["PSEUDONIM"]        || "",
      phone:        r["NR TELEFONU"]      || "",
      organization: r["ORGANIZACJA"]      || "",
      lastFight:    r["OSTATNIA WALKA"]   || "",
      weight:       r["WAGA"]             || "",
      email:        r["E-MAIL"]           || ""
    }));
    res.json(fighters);
  } catch (err) {
    console.error("❌ [API] GET /api/fighters error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fighters — dodaj nowego
app.post("/api/fighters", async (req, res) => {
  console.log("📥 [API] POST /api/fighters", req.body);
  try {
    const sheet = await getSheet();
    await sheet.addRow({
      "IMIĘ I NAZWISKO": req.body.name,
      "PSEUDONIM":       req.body.nickname,
      "NR TELEFONU":     req.body.phone,
      "ORGANIZACJA":     req.body.organization,
      "OSTATNIA WALKA":  req.body.lastFight,
      "WAGA":            req.body.weight,
      "E-MAIL":          req.body.email
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ [API] POST /api/fighters error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/fighters/:rowNumber — edytuj
app.put("/api/fighters/:rowNumber", async (req, res) => {
  const rowNum = parseInt(req.params.rowNumber, 10);
  console.log(`🔄 [API] PUT /api/fighters/${rowNum}`, req.body);
  try {
    const sheet = await getSheet();
    const rows  = await sheet.getRows();
    const row   = rows.find(r => r._rowNumber === rowNum);
    if (!row) return res.status(404).json({ error: "Nie znaleziono wiersza" });
    Object.assign(row, {
      "IMIĘ I NAZWISKO": req.body.name,
      "PSEUDONIM":       req.body.nickname,
      "NR TELEFONU":     req.body.phone,
      "ORGANIZACJA":     req.body.organization,
      "OSTATNIA WALKA":  req.body.lastFight,
      "WAGA":            req.body.weight,
      "E-MAIL":          req.body.email
    });
    await row.save();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ [API] PUT /api/fighters error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/fighters/:rowNumber — usuń
app.delete("/api/fighters/:rowNumber", async (req, res) => {
  const rowNum = parseInt(req.params.rowNumber, 10);
  console.log(`🗑️ [API] DELETE /api/fighters/${rowNum}`);
  try {
    const sheet = await getSheet();
    const rows  = await sheet.getRows();
    const row   = rows.find(r => r._rowNumber === rowNum);
    if (!row) return res.status(404).json({ error: "Nie znaleziono wiersza" });
    await row.delete();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ [API] DELETE /api/fighters error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── Events API ──────────────────────────────────────────────────

// GET /api/events — lista eventów
app.get("/api/events", async (req, res) => {
  console.log("🔔 [API] GET /api/events");
  try {
    const sheet = await getSheet("Events");
    const rows  = await sheet.getRows();
    const events = rows.map(r => ({
      id:         r._rowNumber,
      fighter1:   r["Zawodnik 1"]         || "",
      fighter2:   r["Zawodnik 2"]         || "",
      winner:     r["Zwycięzca"]          || "",
      gala:       r["Gala"]               || "",
      date:       r["Data"]               || "",
      finishType: r["Rodzaj skończenia"]  || "",
      duration:   r["Czas trwania walki"] || ""
    }));
    res.json(events);
  } catch (err) {
    console.error("❌ [API] GET /api/events error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events — dodaj event
app.post("/api/events", async (req, res) => {
  console.log("📥 [API] POST /api/events", req.body);
  try {
    const sheet = await getSheet("Events");
    await sheet.addRow({
      "Zawodnik 1":        req.body.fighter1,
      "Zawodnik 2":        req.body.fighter2,
      "Zwycięzca":         req.body.winner,
      "Gala":              req.body.gala,
      "Data":              req.body.date,
      "Rodzaj skończenia": req.body.finishType,
      "Czas trwania walki":req.body.duration
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ [API] POST /api/events error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── Statyczne serwowanie Reacta + catch-all ────────────────────

app.use(express.static(path.join(__dirname, "..", "build")));

// *Każde* żądanie niezwiązane z /api/* puść do front-endu:
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});


// ─── Start serwera ────────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serwer działa na http://0.0.0.0:${PORT}`);
});
