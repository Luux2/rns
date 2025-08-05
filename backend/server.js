const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { nanoid } = require("nanoid");

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ tournaments: [] }).write();

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

const broadcast = (data) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// API routes
app.get("/api/tournaments", (req, res) => {
  const tournaments = db.get("tournaments").value();
  res.json(tournaments);
});

app.post("/api/tournaments", (req, res) => {
  const newTournament = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    players: req.body.players,
    status: "active",
    currentRound: 1,
    history: [], // Initialize history
  };
  db.get("tournaments").push(newTournament).write();
  broadcast({ type: "NEW_TOURNAMENT", payload: newTournament });
  res.status(201).json(newTournament);
});

app.get("/api/tournaments/:id", (req, res) => {
  const tournament = db.get("tournaments").find({ id: req.params.id }).value();
  if (tournament) {
    res.json(tournament);
  } else {
    res.status(404).send("Tournament not found");
  }
});

app.put("/api/tournaments/:id", (req, res) => {
  const updatedTournament = db
    .get("tournaments")
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  broadcast({ type: "UPDATE_TOURNAMENT", payload: updatedTournament });
  res.json(updatedTournament);
});

app.post("/api/tournaments/:id/finish", (req, res) => {
  const finishedTournament = db
    .get("tournaments")
    .find({ id: req.params.id })
    .assign({ status: "finished" })
    .write();
  broadcast({ type: "FINISH_TOURNAMENT", payload: finishedTournament });
  res.json(finishedTournament);
});

const port = process.env.PORT || 8081;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
