import {
  auth, db,
  onAuthStateChanged, signOut,
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, orderBy, where, serverTimestamp
} from "./firebase.js";

let currentUser = null;
let currentRole = "fan";
let selectedGameId = null;

function $(id){ return document.getElementById(id); }
function safeText(el, t){ if(el) el.textContent = t; }

async function getUserRole(uid){
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if(snap.exists()){
    const d = snap.data();
    return d.role || "fan";
  }
  return "fan";
}

async function loadRoster(){
  const list = $("rosterList") || $("adminRoster");
  if(!list) return;

  list.innerHTML = "";
  const q = query(collection(db, "players"), orderBy("number", "asc"));
  const snap = await getDocs(q);

  snap.forEach(docu=>{
    const p = docu.data();
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<div><b>#${p.number} ${p.name}</b><span>Player</span></div><span class="pill">ECC</span>`;
    list.appendChild(div);
  });

  // also fill playerSelect if on admin
  const ps = $("playerSelect");
  if(ps){
    ps.innerHTML = "";
    snap.forEach(docu=>{
      const p = docu.data();
      const opt = document.createElement("option");
      opt.value = docu.id;
      opt.textContent = `#${p.number} ${p.name}`;
      ps.appendChild(opt);
    });
  }
}

async function loadGames(){
  const gl = $("gameList");
  const gs = $("gameSelect");
  const snap = await getDocs(query(collection(db, "games"), orderBy("date", "desc")));

  if(gl){
    gl.innerHTML = "";
    snap.forEach(docu=>{
      const g = docu.data();
      const div = document.createElement("div");
      div.className = "item";
      const d = g.date || "";
      div.innerHTML = `<div><b>vs ${g.opponent}</b><span>${d} • ${g.status || "final"}</span></div><span class="pill">${g.scoreFor ?? "—"}-${g.scoreOpp ?? "—"}</span>`;
      div.onclick = ()=>selectGame(docu.id, g);
      gl.appendChild(div);
    });
  }

  if(gs){
    gs.innerHTML = "";
    snap.forEach(docu=>{
      const g = docu.data();
      const opt = document.createElement("option");
      opt.value = docu.id;
      opt.textContent = `${g.date || ""} vs ${g.opponent}`;
      gs.appendChild(opt);
    });
  }
}

async function selectGame(gameId, gData){
  selectedGameId = gameId;

  safeText($("gameTitle"), `Game Details • vs ${gData.opponent}`);
  safeText($("scoreFor"), gData.scoreFor ?? "—");
  safeText($("scoreOpp"), gData.scoreOpp ?? "—");
  safeText($("status"), gData.status || "final");

  const filmA = $("filmLink");
  const filmMsg = $("filmMsg");
  if(gData.filmUrl){
    if(filmA){
      filmA.style.display = "inline";
      filmA.href = gData.filmUrl;
      filmA.textContent = "Watch game film";
    }
    if(filmMsg) filmMsg.style.display = "none";
  }else{
    if(filmA) filmA.style.display = "none";
    if(filmMsg){
      filmMsg.style.display = "inline";
      filmMsg.textContent = "Film not added yet.";
    }
  }

  await loadStats(gameId);
}

async function loadStats(gameId){
  const list = $("statsList");
  if(!list) return;
  list.innerHTML = "";

  const snap = await getDocs(query(collection(db, "gameStats"), where("gameId","==",gameId)));
  if(snap.empty){
    list.innerHTML = `<div class="small">No stats entered yet.</div>`;
    return;
  }

  // join with players for display
  const playerMap = {};
  const pSnap = await getDocs(collection(db, "players"));
  pSnap.forEach(d=>playerMap[d.id]=d.data());

  snap.forEach(d=>{
    const s = d.data();
    const p = playerMap[s.playerId] || {name:"Unknown", number:"?"};
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div>
        <b>#${p.number} ${p.name}</b>
        <span>${s.pts||0} PTS • ${s.reb||0} REB • ${s.ast||0} AST • ${s.stl||0} STL • ${s.blk||0} BLK • ${s.foul||0} FOUL</span>
      </div>
      <span class="pill">Final</span>
    `;
    list.appendChild(div);
  });
}

/* ---------- Admin actions ---------- */

async function addPlayer(){
  const name = $("pName")?.value.trim();
  const number = parseInt($("pNum")?.value.trim() || "0", 10);

  if(!name || isNaN(number)){
    safeText($("pMsg"), "Add a valid name and jersey number.");
    return;
  }
  await addDoc(collection(db, "players"), { name, number, createdAt: serverTimestamp() });
  safeText($("pMsg"), `Added #${number} ${name}`);
  $("pName").value = "";
  $("pNum").value = "";
  await loadRoster();
}

async function createGame(){
  const opponent = $("gOpp")?.value.trim();
  const date = $("gDate")?.value;
  const scoreFor = parseInt($("gFor")?.value.trim() || "0", 10);
  const scoreOpp = parseInt($("gOppScore")?.value.trim() || "0", 10);
  const filmUrl = $("gFilm")?.value.trim();

  if(!opponent || !date){
    safeText($("gMsg"), "Opponent and date are required.");
    return;
  }
  await addDoc(collection(db, "games"), {
    opponent, date,
    scoreFor: isNaN(scoreFor) ? 0 : scoreFor,
    scoreOpp: isNaN(scoreOpp) ? 0 : scoreOpp,
    filmUrl: filmUrl || "",
    status: "final",
    createdAt: serverTimestamp()
  });

  safeText($("gMsg"), `Game created: vs ${opponent} (${date})`);
  $("gOpp").value = "";
  $("gDate").value = "";
  $("gFor").value = "";
  $("gOppScore").value = "";
  $("gFilm").value = "";
  await loadGames();
}

async function saveStat(){
  const gameId = $("gameSelect")?.value;
  const playerId = $("playerSelect")?.value;

  if(!gameId || !playerId){
    safeText($("sMsg"), "Pick a game and a player.");
    return;
  }

  const payload = {
    gameId, playerId,
    pts: parseInt($("sPts").value || "0",10) || 0,
    reb: parseInt($("sReb").value || "0",10) || 0,
    ast: parseInt($("sAst").value || "0",10) || 0,
    stl: parseInt($("sStl").value || "0",10) || 0,
    blk: parseInt($("sBlk").value || "0",10) || 0,
    foul: parseInt($("sFoul").value || "0",10) || 0,
    updatedAt: serverTimestamp()
  };

  // Simple approach: add new stat doc each time (works for MVP).
  // Later we can "upsert" one doc per player per game.
  await addDoc(collection(db, "gameStats"), payload);

  safeText($("sMsg"), "Saved stat line.");
  ["sPts","sReb","sAst","sStl","sBlk","sFoul"].forEach(id=>$(id).value="");
}

/* ---------- Boot ---------- */

function wireButtons(){
  $("logoutBtn")?.addEventListener("click", ()=>signOut(auth));

  // Admin-only buttons
  $("addPlayerBtn")?.addEventListener("click", addPlayer);
  $("createGameBtn")?.addEventListener("click", createGame);
  $("saveStatBtn")?.addEventListener("click", saveStat);
}

onAuthStateChanged(auth, async (user)=>{
  if(!user){
    // if on app/admin, bounce to login
    const onProtected = location.pathname.endsWith("app.html") || location.pathname.endsWith("admin.html");
    if(onProtected) location.href = "index.html";
    return;
  }
  currentUser = user;
  currentRole = await getUserRole(user.uid);

  wireButtons();

  // show Admin link if staff
  const adminLink = $("adminLink");
  if(adminLink && currentRole === "staff") adminLink.style.display = "inline-block";

  // lock admin page if not staff
  if(location.pathname.endsWith("admin.html") && currentRole !== "staff"){
    alert("Admin access only.");
    location.href = "app.html";
    return;
  }

  await loadRoster();
  await loadGames();
});

