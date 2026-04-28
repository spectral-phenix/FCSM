const API = 'api';
let currentUser = null;

function updateUserBox(user) {
  currentUser = user;
  document.getElementById('user-avatar').textContent = initiales(user.nom, user.prenom);
  document.getElementById('user-name').textContent = `${user.prenom} ${user.nom}`;
  document.getElementById('user-sub').textContent = `BUT1 R&T — ${user.groupe}`;
}

async function checkAuth() {
  const r = await fetchJSON(`${API}/auth.php?action=me`);
  if (r.connected) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateUserBox(r.user);
    loadAccueil();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = await fetchJSON(`${API}/auth.php`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: fd.get('email'),
      password: fd.get('password')
    })
  });
  if (r.success) {
    updateUserBox(r.user);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    toast('Connexion réussie.');
    loadAccueil();
  } else {
    toast(r.error || 'Connexion impossible', true);
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetchJSON(`${API}/auth.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'logout' })
  });
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
});


// ── Navigation ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const page = document.getElementById('page-' + item.dataset.page);
    page.classList.add('active');
    // Charge les données à chaque navigation
    if (item.dataset.page === 'accueil')   loadAccueil();
    if (item.dataset.page === 'rejoindre') loadRejoindre();
    if (item.dataset.page === 'vehicule')  loadVehicules();
    if (item.dataset.page === 'profil')    loadProfil();
    if (item.dataset.page === 'creer')     loadCreerForm();
  });
});

// ── Toast ──
function toast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isError ? '#8a1a1a' : '#1a1917';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Helpers ──
function initiales(nom, prenom) {
  return (prenom[0] + nom[0]).toUpperCase();
}

function badgeDistance(km) {
  if (km === null || km === undefined) return `<span class="badge badge-gray">Distance inconnue</span>`;
  if (km <= 2) return `<span class="badge badge-green">${km} km — Très proche</span>`;
  if (km <= 5) return `<span class="badge badge-blue">${km} km — Proche</span>`;
  if (km <= 10) return `<span class="badge badge-amber">${km} km</span>`;
  return `<span class="badge badge-gray">${km} km</span>`;
}

function joliJour(j) {
  return j.charAt(0).toUpperCase() + j.slice(1);
}

function joliHeure(h) {
  return h ? h.substring(0, 5) : '';
}

function placesRestantes(nb_membres, nb_places) {
  if (!nb_places) return null;
  return Math.max(0, nb_places - nb_membres);
}

async function fetchJSON(url, opts = {}) {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (r.status === 401) {
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  }
  return r.json();
}

// ── ACCUEIL ──
async function loadAccueil() {
  const matchDiv = document.getElementById('matches-list');
  const trajetDiv = document.getElementById('mes-trajets-list');
  matchDiv.innerHTML = '<div class="loading">Chargement...</div>';
  trajetDiv.innerHTML = '<div class="loading">Chargement...</div>';

  const [matches, trajets] = await Promise.all([
    fetchJSON(`${API}/matches.php`),
    fetchJSON(`${API}/trajets.php?type=mes`)
  ]);

  // Matches
  if (!matches.length) {
    matchDiv.innerHTML = '<div class="empty-state">Aucun étudiant compatible trouvé pour vos horaires.</div>';
  } else {
    matchDiv.innerHTML = matches.map(m => `
      <div class="card">
        <div class="card-row">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="avatar">${initiales(m.nom, m.prenom)}</div>
            <div>
              <div class="card-title">${m.prenom} ${m.nom}</div>
              <div class="card-detail">${joliJour(m.jour)} · Cours à ${joliHeure(m.heure_debut)} · ${m.groupe || ''}</div>
              <div class="card-meta">${badgeDistance(m.distance_km)}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Mes trajets
  if (!trajets.length) {
    trajetDiv.innerHTML = '<div class="empty-state">Vous n\'êtes inscrit à aucun trajet.</div>';
  } else {
    trajetDiv.innerHTML = trajets.map(t => {
      const dispo = placesRestantes(t.nb_membres, t.nb_places);
      const pct = t.nb_places ? Math.round((t.nb_membres / t.nb_places) * 100) : 0;
      const isConducteur = t.role === 'conducteur';
      return `
        <div class="card">
          <div class="card-row">
            <div>
              <div class="card-title">${t.lieu_depart_nom} → ${t.lieu_arrivee_nom}</div>
              <div class="card-detail">
                ${joliJour(new Date(t.date_trajet).toLocaleDateString('fr-FR', {weekday:'long'}))}
                · Départ ${joliHeure(t.heure_depart)}
                ${t.marque ? `· ${t.marque} ${t.modele || ''}` : ''}
              </div>
              <div class="card-meta">
                <span class="badge ${isConducteur ? 'badge-green' : 'badge-blue'}">${isConducteur ? 'Conducteur' : 'Passager'}</span>
                ${dispo !== null ? `<span class="badge badge-gray">${dispo} place${dispo > 1 ? 's' : ''} dispo</span>` : ''}
                ${t.participation ? `<span class="mono">${t.participation}</span>` : ''}
              </div>
            </div>
            <div class="btn-group">
              ${isConducteur
                ? `<button class="btn btn-danger" onclick="supprimerTrajet(${t.id})">Supprimer</button>`
                : `<button class="btn" onclick="quitterTrajet(${t.id})">Quitter</button>`}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

async function supprimerTrajet(id) {
  if (!confirm('Supprimer ce trajet et retirer tous les membres ?')) return;
  const r = await fetchJSON(`${API}/trajets.php?id=${id}`, { method: 'DELETE' });
  if (r.success) { toast('Trajet supprimé.'); loadAccueil(); }
  else toast(r.error || 'Erreur', true);
}

async function quitterTrajet(id) {
  const r = await fetchJSON(`${API}/trajets.php`, { method: 'POST', body: JSON.stringify({ action: 'quitter', id_trajet: id }) });
  if (r.success) { toast('Vous avez quitté le trajet.'); loadAccueil(); }
  else toast(r.error || 'Erreur', true);
}

// ── REJOINDRE ──
async function loadRejoindre() {
  const div = document.getElementById('rejoindre-list');
  div.innerHTML = '<div class="loading">Chargement...</div>';
  const trajets = await fetchJSON(`${API}/trajets.php?type=disponibles`);

  if (!trajets.length) {
    div.innerHTML = '<div class="empty-state">Aucun trajet disponible pour le moment.</div>';
    return;
  }

  div.innerHTML = trajets.map(t => {
    const dispo = placesRestantes(t.nb_membres, t.nb_places);
    const complet = dispo !== null && dispo <= 0;
    return `
      <div class="card${complet ? ' opacity-50' : ''}">
        <div class="card-row">
          <div>
            <div class="card-title">${t.lieu_depart_nom} → ${t.lieu_arrivee_nom}</div>
            <div class="card-detail">
              ${new Date(t.date_trajet).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}
              · Départ ${joliHeure(t.heure_depart)}
              · ${t.prenom_createur || t.createur_prenom} ${t.nom_createur || t.createur_nom}
              ${t.marque ? `· ${t.marque} ${t.modele || ''}` : ''}
            </div>
            <div class="card-meta">
              ${complet
                ? `<span class="badge badge-gray">Complet</span>`
                : `<span class="badge badge-green">${dispo} place${dispo > 1 ? 's' : ''} disponible${dispo > 1 ? 's' : ''}</span>`}
              ${t.participation ? `<span class="mono">${t.participation}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-primary" ${complet ? 'disabled' : ''} onclick="rejoindreTr(${t.id})">
            ${complet ? 'Complet' : 'Rejoindre'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function rejoindreTr(id) {
  const r = await fetchJSON(`${API}/trajets.php`, { method: 'POST', body: JSON.stringify({ action: 'rejoindre', id_trajet: id }) });
  if (r.success) { toast('Vous avez rejoint le trajet !'); loadRejoindre(); }
  else toast(r.error || 'Erreur', true);
}

// ── CRÉER ANNONCE ──
let lieuxData = [];
let vehiculesData = [];

async function loadCreerForm() {
  const [lieux, vehicules] = await Promise.all([
    fetchJSON(`${API}/profil.php?action=lieux`),
    fetchJSON(`${API}/vehicules.php`)
  ]);
  lieuxData = lieux;
  vehiculesData = vehicules;

  const selDepart = document.getElementById('f-lieu-depart');
  const selArrivee = document.getElementById('f-lieu-arrivee');
  const selVehicule = document.getElementById('f-vehicule');

  const optLieux = lieux.map(l => `<option value="${l.id}">${l.nom} — ${l.ville}</option>`).join('');
  selDepart.innerHTML = optLieux;
  selArrivee.innerHTML = optLieux;

  selVehicule.innerHTML = '<option value="">— Pas de véhicule (passager) —</option>'
    + vehicules.map(v => `<option value="${v.id}">${v.marque || ''} ${v.modele || ''} — ${v.immatriculation} (${v.nb_places} places)</option>`).join('');
}

document.getElementById('form-creer').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    action: 'create',
    date_trajet: fd.get('date_trajet'),
    heure_depart: fd.get('heure_depart'),
    heure_arrivee_estimee: fd.get('heure_arrivee_estimee') || null,
    type: fd.get('type'),
    id_lieu_depart: fd.get('id_lieu_depart'),
    id_lieu_arrivee: fd.get('id_lieu_arrivee'),
    id_vehicule: fd.get('id_vehicule') || null,
    participation: fd.get('participation') || null,
    remarques: fd.get('remarques') || null
  };
  const r = await fetchJSON(`${API}/trajets.php`, { method: 'POST', body: JSON.stringify(body) });
  if (r.success) {
    toast('Trajet publié avec succès !');
    e.target.reset();
  } else {
    toast(r.error || 'Erreur lors de la création', true);
  }
});

// ── VÉHICULES ──
let editVehiculeId = null;

async function loadVehicules() {
  const div = document.getElementById('vehicules-list');
  div.innerHTML = '<div class="loading">Chargement...</div>';
  const vehicules = await fetchJSON(`${API}/vehicules.php`);

  if (!vehicules.length) {
    div.innerHTML = '<div class="empty-state">Aucun véhicule enregistré.</div>';
    return;
  }

  div.innerHTML = vehicules.map(v => `
    <div class="card">
      <div class="card-row">
        <div>
          <div class="card-title">${v.marque || ''} ${v.modele || ''}</div>
          <div class="card-detail">
            <span class="mono">${v.immatriculation}</span>
            · ${v.nb_places} places
          </div>
          <div class="card-meta">
            ${v.date_ct ? `<span class="badge badge-green">CT : ${new Date(v.date_ct).toLocaleDateString('fr-FR')}</span>` : ''}
            ${v.date_assurance ? `<span class="badge badge-blue">Assurance : ${new Date(v.date_assurance).toLocaleDateString('fr-FR')}</span>` : ''}
          </div>
        </div>
        <div class="btn-group">
          <button class="btn" onclick="ouvrirEditVehicule(${JSON.stringify(v).replace(/"/g, '&quot;')})">Modifier</button>
          <button class="btn btn-danger" onclick="supprimerVehicule(${v.id})">Supprimer</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function supprimerVehicule(id) {
  if (!confirm('Supprimer ce véhicule ?')) return;
  const r = await fetchJSON(`${API}/vehicules.php?id=${id}`, { method: 'DELETE' });
  if (r.success) { toast('Véhicule supprimé.'); loadVehicules(); }
  else toast(r.error || 'Erreur', true);
}

function ouvrirEditVehicule(v) {
  editVehiculeId = v.id;
  document.getElementById('modal-marque').value = v.marque || '';
  document.getElementById('modal-modele').value = v.modele || '';
  document.getElementById('modal-immat').value = v.immatriculation || '';
  document.getElementById('modal-places').value = v.nb_places || 5;
  document.getElementById('modal-ct').value = v.date_ct ? v.date_ct.substring(0,10) : '';
  document.getElementById('modal-assurance').value = v.date_assurance ? v.date_assurance.substring(0,10) : '';
  document.getElementById('modal-overlay').classList.add('show');
}

document.getElementById('modal-cancel').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('show');
  editVehiculeId = null;
});

document.getElementById('modal-save').addEventListener('click', async () => {
  if (!editVehiculeId) return;
  const body = {
    id: editVehiculeId,
    marque: document.getElementById('modal-marque').value,
    modele: document.getElementById('modal-modele').value,
    immatriculation: document.getElementById('modal-immat').value,
    nb_places: document.getElementById('modal-places').value,
    date_ct: document.getElementById('modal-ct').value || null,
    date_assurance: document.getElementById('modal-assurance').value || null
  };
  const r = await fetchJSON(`${API}/vehicules.php`, { method: 'PUT', body: JSON.stringify(body) });
  if (r.success) {
    toast('Véhicule mis à jour.');
    document.getElementById('modal-overlay').classList.remove('show');
    editVehiculeId = null;
    loadVehicules();
  } else toast(r.error || 'Erreur', true);
});

document.getElementById('form-vehicule').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    marque: fd.get('marque'),
    modele: fd.get('modele'),
    immatriculation: fd.get('immatriculation'),
    nb_places: fd.get('nb_places'),
    date_ct: fd.get('date_ct') || null,
    date_assurance: fd.get('date_assurance') || null
  };
  const r = await fetchJSON(`${API}/vehicules.php`, { method: 'POST', body: JSON.stringify(body) });
  if (r.success) {
    toast('Véhicule ajouté !');
    e.target.reset();
    loadVehicules();
  } else toast(r.error || 'Erreur', true);
});

// ── PROFIL ──
async function loadProfil() {
  const data = await fetchJSON(`${API}/profil.php?action=profil`);
  if (!data) return;
  document.getElementById('p-nom').value = data.nom || '';
  document.getElementById('p-prenom').value = data.prenom || '';
  document.getElementById('p-email').value = data.email || '';
  document.getElementById('p-groupe').value = data.groupe || '';
  document.getElementById('p-adresse').value = data.adresse || '';
  document.getElementById('p-ville').value = data.ville || '';
  document.getElementById('p-cp').value = data.code_postal || '';
  document.getElementById('p-domicile-type').value = data.domicile_type || 'principale';
}

document.getElementById('form-profil').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = await fetchJSON(`${API}/profil.php`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update_profil',
      nom: fd.get('nom'),
      prenom: fd.get('prenom'),
      email: fd.get('email'),
      groupe: fd.get('groupe')
    })
  });
  if (r.success) toast('Profil mis à jour.');
  else toast(r.error || 'Erreur', true);
});

document.getElementById('form-domicile').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = await fetchJSON(`${API}/profil.php`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update_domicile',
      adresse: fd.get('adresse'),
      ville: fd.get('ville'),
      code_postal: fd.get('code_postal')
    })
  });
  if (r.success) toast('Domicile mis à jour.');
  else toast(r.error || 'Erreur', true);
});

document.getElementById('form-mdp').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  if (fd.get('new_mdp') !== fd.get('confirm_mdp')) {
    toast('Les mots de passe ne correspondent pas.', true);
    return;
  }
  const r = await fetchJSON(`${API}/profil.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'update_mdp', password: fd.get('new_mdp') })
  });
  if (r.success) { toast('Mot de passe mis à jour.'); e.target.reset(); }
  else toast(r.error || 'Erreur', true);
});

// ── Init ──
checkAuth();
