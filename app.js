/**
 * ==========================================================================
 * APLECS - LOGICA PRINCIPAL (app.js)
 * Desenvolupament en JavaScript pur (ES6) amb algorismes d'optimització,
 * drag-and-drop natiu, i persistència amb localStorage.
 * ==========================================================================
 */

// --- ESTAT GLOBAL DE L'APLICACIÓ ---
const state = {
  students: [],          // Llista d'alumnes: { id, name, level: 'high'|'medium'|'low', incompatibilities: [id, id...] }
  groups: [],            // Grups actuals: { id, name, students: [student...] }
  cooccurrence: {},      // Matriu de repeticions: { "id1___id2": count }
  sessionHistoryCount: 0,// Nombre d'agrupacions guardades en la sessió
  activeTab: 'quick',    // Pestanya activa: 'quick' | 'advanced'
  darkMode: false        // Mode visual fosc
};

// --- CONFIGURACIÓ I CONSTANTS ---
const LEVEL_VALUES = {
  high: 'Alt',
  medium: 'Mitjà',
  low: 'Baix'
};

// --- INICIALITZACIÓ ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadStateFromLocalStorage();
  registerEventListeners();
  syncUI();
});

// --- ENREGISTRAMENT D'EVENTS ---
function registerEventListeners() {
  // Pestanyes
  document.getElementById('tab-quick').addEventListener('click', () => switchTab('quick'));
  document.getElementById('tab-advanced').addEventListener('click', () => switchTab('advanced'));
  
  // Canvi de Mode Fosc
  document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
  
  // Entrada d'alumnes (textarea)
  const textarea = document.getElementById('student-names');
  textarea.addEventListener('input', () => {
    syncStudentsFromTextarea();
    saveStateToLocalStorage();
  });
  
  // Carregar exemple
  document.getElementById('btn-load-demo').addEventListener('click', loadDemoData);
  
  // Sincronització de llista manual a Mode Avançat
  document.getElementById('btn-sync-quick-students').addEventListener('click', () => {
    syncStudentsFromTextarea();
    renderAdvancedStudentList();
    showNotification('Llista d\'alumnes sincronitzada correctament!', 'success');
  });

  // Inputs numèrics (Interconnexió intel·ligent)
  const inputCount = document.getElementById('input-group-count');
  const inputSize = document.getElementById('input-group-size');
  
  inputCount.addEventListener('input', () => {
    if (inputCount.value && state.students.length > 0) {
      const size = Math.ceil(state.students.length / parseInt(inputCount.value));
      inputSize.value = isFinite(size) ? size : '';
    }
  });
  
  inputSize.addEventListener('input', () => {
    if (inputSize.value && state.students.length > 0) {
      const count = Math.ceil(state.students.length / parseInt(inputSize.value));
      inputCount.value = isFinite(count) ? count : '';
    }
  });

  // Botons de generació
  document.getElementById('btn-quick-random').addEventListener('click', generateRandomGroups);
  document.getElementById('btn-quick-reshuffle').addEventListener('click', generateRandomGroups);
  document.getElementById('btn-quick-smart').addEventListener('click', generateSmartGroups);
  document.getElementById('btn-generate-advanced').addEventListener('click', generateAdvancedGroups);
  
  // Gestió de dades
  document.getElementById('btn-export-project').addEventListener('click', exportProjectJSON);
  document.getElementById('import-project-file').addEventListener('change', importProjectJSON);
  document.getElementById('btn-download-csv').addEventListener('click', downloadGroupsCSV);
  document.getElementById('btn-reset-history').addEventListener('click', resetSessionHistory);
  
  // Modal d'atributs
  document.getElementById('modal-close-btn').addEventListener('click', closeStudentModal);
  document.getElementById('modal-save-btn').addEventListener('click', saveStudentModalDetails);
  
  // Tanca modal si es clica a fora del contingut
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('student-modal');
    if (e.target === modal) closeStudentModal();
  });
}

// --- GESTIÓ DE PESTANYES ---
function switchTab(tabName) {
  state.activeTab = tabName;
  
  const quickTab = document.getElementById('tab-quick');
  const advTab = document.getElementById('tab-advanced');
  const quickPanel = document.getElementById('quick-panel');
  const advPanel = document.getElementById('advanced-panel');
  
  if (tabName === 'quick') {
    quickTab.classList.add('active');
    advTab.classList.remove('active');
    quickPanel.classList.remove('hidden');
    advPanel.classList.add('hidden');
    document.getElementById('conflict-warning-alert').classList.add('hidden');
  } else {
    quickTab.classList.remove('active');
    advTab.classList.add('active');
    quickPanel.classList.add('hidden');
    advPanel.classList.remove('hidden');
    
    // Al passar a avançat, sincronitzem la llista i la renderitzem
    syncStudentsFromTextarea();
    renderAdvancedStudentList();
    
    // Sincronitzem el nombre de grups
    document.getElementById('adv-group-count').value = document.getElementById('input-group-count').value;
  }
  
  saveStateToLocalStorage();
}

// --- MODE FOSC / CLAR ---
function initTheme() {
  const isDark = localStorage.getItem('dark-mode') === 'true';
  state.darkMode = isDark;
  
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  
  if (isDark) {
    document.body.classList.add('dark-mode');
    lightIcon.classList.remove('hidden');
    darkIcon.classList.add('hidden');
  } else {
    document.body.classList.remove('dark-mode');
    lightIcon.classList.add('hidden');
    darkIcon.classList.remove('hidden');
  }
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('dark-mode', state.darkMode);
  
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  
  if (state.darkMode) {
    document.body.classList.add('dark-mode');
    lightIcon.classList.remove('hidden');
    darkIcon.classList.add('hidden');
  } else {
    document.body.classList.remove('dark-mode');
    lightIcon.classList.add('hidden');
    darkIcon.classList.remove('hidden');
  }
  showNotification(state.darkMode ? "Mode fosc activat" : "Mode clar activat", "info");
}

// --- CARREGAR EXEMPLE D'ALUMNES (Demo) ---
function loadDemoData() {
  const demoStudentsText = [
    "Joan Amigó", "Maria Boix", "Pere Casals", "Anna Duran",
    "Jordi Ferrer", "Laura Gómez", "Albert Hernandez", "Sílvia Isern",
    "Carles Juncosa", "Neus Llopis", "Marc Marín", "Elena Nieto",
    "David Oliva", "Cristina Puig", "Ramon Rius", "Clara Sastre",
    "Miquel Torrent", "Eva Valldeperas"
  ].join("\n");
  
  document.getElementById('student-names').value = demoStudentsText;
  syncStudentsFromTextarea();
  
  // Assignem uns quants nivells i incompatibilitats per defecte per fer-ho ric
  const demoLevels = ['high', 'medium', 'low', 'medium', 'high', 'medium', 'low', 'medium', 'high', 'medium', 'low', 'medium', 'high', 'medium', 'low', 'medium', 'high', 'medium'];
  state.students.forEach((std, index) => {
    std.level = demoLevels[index] || 'medium';
  });
  
  // Alguna incompatibilitat clàssica
  const s0 = state.students[0]; // Joan
  const s1 = state.students[1]; // Maria
  const s2 = state.students[2]; // Pere
  const s3 = state.students[3]; // Anna
  
  if (s0 && s1) {
    s0.incompatibilities = [s1.id];
    s1.incompatibilities = [s0.id];
  }
  if (s2 && s3) {
    s2.incompatibilities = [s3.id];
    s3.incompatibilities = [s2.id];
  }
  
  saveStateToLocalStorage();
  syncUI();
  
  if (state.activeTab === 'advanced') {
    renderAdvancedStudentList();
  }
  
  showNotification("Dades de demostració carregades amb 18 alumnes!", "success");
}

// --- SINCRONITZACIÓ DE TEXTAREA A ESTAT ---
function syncStudentsFromTextarea() {
  const text = document.getElementById('student-names').value;
  const lines = text.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
  
  // Guardem temporals dels existents per no perdre nivell/incompatibilitat
  const existingMap = {};
  state.students.forEach(s => {
    existingMap[s.name.toLowerCase()] = s;
  });
  
  const newStudents = lines.map((name, index) => {
    const nameLower = name.toLowerCase();
    if (existingMap[nameLower]) {
      // Mantenim exactament l'id, nivell i restriccions, només actualitzem el format del nom
      return {
        id: existingMap[nameLower].id,
        name: name,
        level: existingMap[nameLower].level,
        incompatibilities: existingMap[nameLower].incompatibilities
      };
    } else {
      // Nou alumne creat
      return {
        id: 'std_' + Math.random().toString(36).substr(2, 9),
        name: name,
        level: 'medium',
        incompatibilities: []
      };
    }
  });
  
  // Netegem incompatibilitats d'IDs que s'hagin esborrat de la llista
  const activeIds = new Set(newStudents.map(s => s.id));
  newStudents.forEach(s => {
    s.incompatibilities = s.incompatibilities.filter(id => activeIds.has(id));
  });
  
  state.students = newStudents;
  
  // Actualitza comptadors visuals
  document.getElementById('student-counter').innerText = `${state.students.length} alumnes detectats`;
  document.getElementById('stat-total-students').innerText = `Alumnes: ${state.students.length}`;
  
  // Actualitzem les caixes numèriques d'entrada si cal
  const inputCount = document.getElementById('input-group-count');
  const inputSize = document.getElementById('input-group-size');
  if (inputCount.value) {
    const size = Math.ceil(state.students.length / parseInt(inputCount.value));
    inputSize.value = isFinite(size) && size > 0 ? size : '';
  }
}

// --- DIBUIXAR LLISTA MODE AVANÇAT ---
function renderAdvancedStudentList() {
  const container = document.getElementById('adv-student-list-container');
  container.innerHTML = '';
  
  if (state.students.length === 0) {
    container.innerHTML = `<p class="text-xs text-center py-6 text-slate-400 italic">Introdueix primer els noms dels alumnes al Mode Ràpid.</p>`;
    document.getElementById('badge-total-constraints').innerText = "0 Restriccions";
    return;
  }
  
  let totalConstraints = 0;
  
  state.students.forEach(student => {
    const card = document.createElement('div');
    card.className = "flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700 shadow-sm";
    
    // Nivell color classes
    let levelBadgeClass = "badge-mitja";
    if (student.level === 'high') levelBadgeClass = "badge-alt";
    if (student.level === 'low') levelBadgeClass = "badge-baix";
    
    // Incompatibilitats text curt
    const incCount = student.incompatibilities.length;
    totalConstraints += incCount;
    const incBadge = incCount > 0 
      ? `<span class="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-200 dark:border-rose-900">${incCount} Bloqueigs</span>`
      : '';
      
    card.innerHTML = `
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">${escapeHTML(student.name)}</span>
        <div class="flex gap-1.5 items-center mt-1">
          <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${levelBadgeClass}">${LEVEL_VALUES[student.level]}</span>
          ${incBadge}
        </div>
      </div>
      <button class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all" onclick="openStudentModal('${student.id}')">
        ⚙️ Configurar
      </button>
    `;
    container.appendChild(card);
  });
  
  // Nota: Les incompatibilitats són bidireccionals en el recompte físic de restriccions de cost,
  // dividim per 2 per mostrar les parelles úniques de restriccions.
  const uniqueConstraints = Math.ceil(totalConstraints / 2);
  document.getElementById('badge-total-constraints').innerText = `${uniqueConstraints} Restriccions`;
}

// --- MODAL D'EDICIÓ DE DETALLS D'ALUMNE ---
let currentEditingStudentId = null;

window.openStudentModal = function(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;
  
  currentEditingStudentId = studentId;
  
  document.getElementById('modal-student-name').innerText = student.name;
  document.getElementById('modal-student-level').value = student.level;
  
  // Generar llista de checkboxes per a incompatibilitats amb altres alumnes
  const container = document.getElementById('modal-incompatibilities-container');
  container.innerHTML = '';
  
  const otherStudents = state.students.filter(s => s.id !== studentId);
  
  if (otherStudents.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 italic">Es necessiten més alumnes per fer incompatibilitats.</p>`;
  } else {
    otherStudents.forEach(other => {
      const isChecked = student.incompatibilities.includes(other.id);
      const row = document.createElement('label');
      row.className = "flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs text-slate-700 dark:text-slate-200";
      row.innerHTML = `
        <input type="checkbox" value="${other.id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500">
        <span class="font-medium">${escapeHTML(other.name)}</span>
      `;
      container.appendChild(row);
    });
  }
  
  document.getElementById('student-modal').classList.remove('hidden');
};

function closeStudentModal() {
  document.getElementById('student-modal').classList.add('hidden');
  currentEditingStudentId = null;
}

function saveStudentModalDetails() {
  if (!currentEditingStudentId) return;
  
  const student = state.students.find(s => s.id === currentEditingStudentId);
  if (!student) return;
  
  // Desa nivell
  student.level = document.getElementById('modal-student-level').value;
  
  // Desa incompatibilitats (Checked checkboxes)
  const checkboxes = document.querySelectorAll('#modal-incompatibilities-container input[type="checkbox"]');
  const selectedIds = [];
  checkboxes.forEach(cb => {
    if (cb.checked) selectedIds.push(cb.value);
  });
  
  // Fem que la relació d'incompatibilitat sigui recíproca (Bidireccional)
  // 1. Eliminem primer la referència bidireccional prèvia d'aquest alumne en els altres
  const previousIncompatibilities = student.incompatibilities;
  previousIncompatibilities.forEach(oldId => {
    const other = state.students.find(s => s.id === oldId);
    if (other) {
      other.incompatibilities = other.incompatibilities.filter(id => id !== student.id);
    }
  });
  
  // 2. Assignem les noves seleccionades a aquest alumne
  student.incompatibilities = selectedIds;
  
  // 3. Forcem que els altres alumnes també tinguin aquest a la seva llista d'incompatibles
  selectedIds.forEach(newId => {
    const other = state.students.find(s => s.id === newId);
    if (other && !other.incompatibilities.includes(student.id)) {
      other.incompatibilities.push(student.id);
    }
  });
  
  closeStudentModal();
  saveStateToLocalStorage();
  renderAdvancedStudentList();
  showNotification(`Dades de ${student.name} actualitzades correctament!`, "success");
}

// --- ALGORISME 1: GENERACIÓ SIMPLE A L'ATZAR ---
function generateRandomGroups() {
  syncStudentsFromTextarea();
  if (state.students.length === 0) {
    showNotification("Escriu algun alumne abans de generar grups!", "error");
    return;
  }
  
  const groupCount = getDesiredGroupCount();
  if (groupCount <= 0) {
    showNotification("Introdueix un nombre vàlid de grups!", "error");
    return;
  }
  
  // Fisher-Yates Shuffle simple
  const shuffled = [...state.students];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Repartim en grups
  const tempGroups = Array.from({ length: groupCount }, (_, index) => ({
    id: `grup_${index + 1}`,
    name: `Grup ${index + 1}`,
    students: []
  }));
  
  shuffled.forEach((student, index) => {
    tempGroups[index % groupCount].students.push(student);
  });
  
  state.groups = tempGroups;
  
  // Activem els botons complementaris
  document.getElementById('btn-quick-reshuffle').removeAttribute('disabled');
  document.getElementById('btn-download-csv').removeAttribute('disabled');
  
  saveStateToLocalStorage();
  renderGroupsGrid();
  showNotification(`S'han generat ${groupCount} grups a l'atzar!`, "success");
}

// --- ALGORISME 2: SMART SHUFFLE (Sense Repetir Companys de Sessió) ---
function generateSmartGroups() {
  syncStudentsFromTextarea();
  if (state.students.length === 0) {
    showNotification("Escriu algun alumne abans de generar grups!", "error");
    return;
  }
  
  const groupCount = getDesiredGroupCount();
  if (groupCount <= 0) {
    showNotification("Introdueix un nombre vàlid de grups!", "error");
    return;
  }
  
  // 1. Inicialització a l'atzar
  let bestShuffled = [...state.students];
  for (let i = bestShuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bestShuffled[i], bestShuffled[j]] = [bestShuffled[j], bestShuffled[i]];
  }
  
  // Funció per calcular el cost de co-ocurrència d'una agrupació
  const evaluateCooccurrenceCost = (studentsList) => {
    let cost = 0;
    const tempGroups = Array.from({ length: groupCount }, () => []);
    
    // Reparteix
    studentsList.forEach((std, idx) => {
      tempGroups[idx % groupCount].push(std);
    });
    
    // Suma co-ocurrències i penalitzacions de restriccions dins de cada grup
    tempGroups.forEach(g => {
      const studentIds = new Set(g.map(s => s.id));
      for (let i = 0; i < g.length; i++) {
        const std = g[i];
        
        // Penalització per incompatibilitats (s'intenta evitar sota mànega)
        std.incompatibilities.forEach(incId => {
          if (studentIds.has(incId)) {
            cost += 500; // Penalització alta sota mànega per evitar-ho
          }
        });
        
        for (let j = i + 1; j < g.length; j++) {
          const key = [std.id, g[j].id].sort().join('___');
          if (state.cooccurrence[key]) {
            cost += state.cooccurrence[key];
          }
        }
      }
    });
    return cost;
  };
  
  // 2. Hill Climbing / Cerca Local
  let bestCost = evaluateCooccurrenceCost(bestShuffled);
  let currentList = [...bestShuffled];
  
  // Executem 3000 iteracions (menys de 5ms en JS)
  const maxIterations = 3000;
  for (let iter = 0; iter < maxIterations; iter++) {
    // Escull dues posicions aleatòries i intercanvia els alumnes
    const idxA = Math.floor(Math.random() * currentList.length);
    const idxB = Math.floor(Math.random() * currentList.length);
    if (idxA === idxB) continue;
    
    // Fes intercanvi temporal
    const swapped = [...currentList];
    [swapped[idxA], swapped[idxB]] = [swapped[idxB], swapped[idxA]];
    
    const cost = evaluateCooccurrenceCost(swapped);
    if (cost < bestCost) {
      bestCost = cost;
      currentList = swapped;
    }
  }
  
  // Repartim en grups finals
  const tempGroups = Array.from({ length: groupCount }, (_, index) => ({
    id: `grup_${index + 1}`,
    name: `Grup ${index + 1}`,
    students: []
  }));
  
  currentList.forEach((student, index) => {
    tempGroups[index % groupCount].students.push(student);
  });
  
  state.groups = tempGroups;
  
  // Guardem l'agrupació generada dins de l'historial (co-ocurrència)
  saveGroupSetToHistory(tempGroups);
  
  // Activem botons
  document.getElementById('btn-quick-reshuffle').removeAttribute('disabled');
  document.getElementById('btn-download-csv').removeAttribute('disabled');
  
  saveStateToLocalStorage();
  renderGroupsGrid();
  
  if (bestCost > 0) {
    showNotification(`Grups generats! S'ha aconseguit minimitzar les repeticions (Grau de repetició: ${bestCost}).`, "info");
  } else {
    showNotification("Genial! Grups generats sense cap parella de companys repetida d'anteriors sessions!", "success");
  }
}

// --- ALGORISME 3: AVANÇAT (Equilibri Acadèmic + Incompatibilitats Estrictes) ---
function generateAdvancedGroups() {
  syncStudentsFromTextarea();
  if (state.students.length === 0) {
    showNotification("Escriu algun alumne al Mode Ràpid primer!", "error");
    return;
  }
  
  const groupCount = parseInt(document.getElementById('adv-group-count').value);
  if (isNaN(groupCount) || groupCount <= 0) {
    showNotification("Introdueix un nombre vàlid de grups!", "error");
    return;
  }
  
  // Recollim l'estructura per a l'optimització
  const students = [...state.students];
  const n = students.length;
  
  // Calcular distribució esperada de nivells per grup per equilibrar
  const totalHigh = students.filter(s => s.level === 'high').length;
  const totalMed = students.filter(s => s.level === 'medium').length;
  const totalLow = students.filter(s => s.level === 'low').length;
  
  const expHigh = totalHigh / groupCount;
  const expMed = totalMed / groupCount;
  const expLow = totalLow / groupCount;
  
  // Funció d'avaluació de cost total
  const evaluateAdvancedCost = (assignment) => {
    // assignment: { studentId: groupId }
    let incompatibilityViolations = 0;
    
    // Comptadors de nivells per grup
    const levelCounts = Array.from({ length: groupCount }, () => ({ high: 0, medium: 0, low: 0 }));
    const groupStudentsMap = Array.from({ length: groupCount }, () => []);
    
    // Llegeix l'assignació
    students.forEach(student => {
      const gIdx = assignment[student.id];
      levelCounts[gIdx][student.level]++;
      groupStudentsMap[gIdx].push(student.id);
    });
    
    // 1. Penalització de restriccions d'incompatibilitat dures (Bidireccionals)
    students.forEach(student => {
      const gIdx = assignment[student.id];
      student.incompatibilities.forEach(incId => {
        if (assignment[incId] === gIdx) {
          incompatibilityViolations++;
        }
      });
    });
    // Nota: Cada parella incompatible es compta dues vegades ja que s'itera per cadascun d'ells
    const rawViolations = incompatibilityViolations / 2;
    
    // 2. Penalització de desequilibri de nivells
    let balanceCost = 0;
    levelCounts.forEach(counts => {
      balanceCost += Math.pow(counts.high - expHigh, 2);
      balanceCost += Math.pow(counts.medium - expMed, 2);
      balanceCost += Math.pow(counts.low - expLow, 2);
    });
    
    // 3. Penalització d'equilibri de capacitat total del grup
    let sizeCost = 0;
    const avgSize = n / groupCount;
    for (let g = 0; g < groupCount; g++) {
      sizeCost += Math.pow(groupStudentsMap[g].length - avgSize, 2);
    }
    
    // Pesos: Incompatibilitats (Dura) = 10000, Nivells (Suau) = 10, Mida (Suau) = 50
    return {
      violations: rawViolations,
      cost: (rawViolations * 10000) + (balanceCost * 10) + (sizeCost * 50)
    };
  };
  
  // Algorisme de cerca: Hill Climbing amb múltiples reinicis (Random Restarts)
  let bestAssignment = null;
  let bestEval = { violations: Infinity, cost: Infinity };
  
  const restarts = 15; // Reiniciem 15 vegades des d'estats aleatoris per esquivar mínims locals
  const maxIters = 1200;
  
  for (let r = 0; r < restarts; r++) {
    // Genera assignació aleatòria inicial
    const currentAssignment = {};
    
    // Per a la mida, els col·loquem uniformement
    const shuffledIds = students.map(s => s.id).sort(() => Math.random() - 0.5);
    shuffledIds.forEach((id, index) => {
      currentAssignment[id] = index % groupCount;
    });
    
    let currentEval = evaluateAdvancedCost(currentAssignment);
    
    // Bucle d'optimització local
    for (let iter = 0; iter < maxIters; iter++) {
      // Tria dos alumnes
      const stdA = students[Math.floor(Math.random() * n)];
      const stdB = students[Math.floor(Math.random() * n)];
      
      if (stdA.id === stdB.id) continue;
      
      const gA = currentAssignment[stdA.id];
      const gB = currentAssignment[stdB.id];
      
      if (gA === gB) continue;
      
      // Prova intercanvi de grups
      currentAssignment[stdA.id] = gB;
      currentAssignment[stdB.id] = gA;
      
      const newEval = evaluateAdvancedCost(currentAssignment);
      
      if (newEval.cost < currentEval.cost) {
        // Millora aconseguida
        currentEval = newEval;
      } else {
        // Desfés l'intercanvi
        currentAssignment[stdA.id] = gA;
        currentAssignment[stdB.id] = gB;
      }
      
      // Si hem assolit cost 0 de violacions i un cost molt baix, podem aturar-nos abans
      if (currentEval.violations === 0 && currentEval.cost < 2) {
        break;
      }
    }
    
    // Mantenim la millor de totes les passades de reinicis
    if (currentEval.cost < bestEval.cost) {
      bestEval = currentEval;
      bestAssignment = { ...currentAssignment };
    }
    
    // Si tenim zero conflictes de violació, no cal fer més reinicis
    if (bestEval.violations === 0) {
      break;
    }
  }
  
  // Convertim l'assignació guanyadora a l'estructura de grups
  const tempGroups = Array.from({ length: groupCount }, (_, index) => ({
    id: `grup_${index + 1}`,
    name: `Grup ${index + 1}`,
    students: []
  }));
  
  students.forEach(student => {
    const assignedGroupIdx = bestAssignment[student.id];
    tempGroups[assignedGroupIdx].students.push(student);
  });
  
  // Guardem els resultats al model de dades
  state.groups = tempGroups;
  saveGroupSetToHistory(tempGroups);
  
  document.getElementById('btn-download-csv').removeAttribute('disabled');
  
  saveStateToLocalStorage();
  renderGroupsGrid();
  
  // Gestionar alerta de conflictes visuals
  const alertWidget = document.getElementById('conflict-warning-alert');
  const alertText = document.getElementById('conflict-warning-text');
  
  if (bestEval.violations > 0) {
    alertWidget.classList.remove('hidden');
    alertText.innerHTML = `No s'ha pogut trobar una distribució perfecta que respecti el 100% de les incompatibilitats. Hi ha <strong>${bestEval.violations} incompatibilitats actives</strong> (marcades en vermell). Revisa-les i ajusta-les manualment arrossegant els alumnes.`;
    showNotification(`S'han generat grups amb ${bestEval.violations} incompatibilitats residuals no resoltes.`, "warning");
  } else {
    alertWidget.classList.add('hidden');
    showNotification("Grups generats amb èxit! Totes les restriccions d'incompatibilitat s'han respectat al 100% i els nivells s'han equilibrat de forma òptima.", "success");
  }
}

// --- DIBUIXAR GRAELLA DE GRUPS EN ELS RESULTATS (UX WOW) ---
function renderGroupsGrid() {
  const grid = document.getElementById('groups-grid');
  const emptyState = document.getElementById('empty-groups-state');
  
  grid.innerHTML = '';
  
  if (state.groups.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    document.getElementById('stat-total-groups').innerText = "Grups: 0";
    document.getElementById('stat-conflict-count').classList.add('hidden');
    return;
  }
  
  grid.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  document.getElementById('stat-total-groups').innerText = `Grups: ${state.groups.length}`;
  
  // Comptem conflictes totals (Només en pestanya Avançat)
  let totalConflicts = 0;
  const isQuickTab = state.activeTab === 'quick';
  
  // Comprovar conflictes dins de cada grup en temps real
  const groupConflicts = state.groups.map(group => {
    const studentIds = new Set(group.students.map(s => s.id));
    const conflictedStudentIds = new Set();
    
    if (!isQuickTab) {
      group.students.forEach(student => {
        student.incompatibilities.forEach(incId => {
          if (studentIds.has(incId)) {
            conflictedStudentIds.add(student.id);
            conflictedStudentIds.add(incId);
          }
        });
      });
      totalConflicts += conflictedStudentIds.size;
    }
    
    return conflictedStudentIds;
  });
  
  // Estadístiques de conflictes
  const conflictBadge = document.getElementById('stat-conflict-count');
  if (totalConflicts > 0 && !isQuickTab) {
    conflictBadge.innerText = `Conflictes: ${Math.ceil(totalConflicts / 2)}`;
    conflictBadge.classList.remove('hidden');
  } else {
    conflictBadge.classList.add('hidden');
  }
  
  state.groups.forEach((group, gIndex) => {
    const groupCard = document.createElement('div');
    // Animació de cascada
    const delayClass = `delay-${gIndex % 9}`;
    
    // Si hi ha conflictes en aquest grup, hi posem una vora vermella suau
    const hasConflict = groupConflicts[gIndex].size > 0;
    const borderClass = hasConflict 
      ? 'border-rose-450 dark:border-rose-800 ring-2 ring-rose-500/10 bg-rose-50/20 dark:bg-rose-950/5' 
      : 'border-glass';
      
    groupCard.className = `glass-panel p-5 flex flex-col gap-4 animate-group ${delayClass} ${borderClass}`;
    groupCard.setAttribute('data-group-id', group.id);
    
    // Títol del grup amb comptador de membres
    const titleArea = document.createElement('div');
    titleArea.className = "flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2";
    titleArea.innerHTML = `
      <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-indigo-500"></span> ${escapeHTML(group.name)}
      </h3>
      <span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
        ${group.students.length} membres
      </span>
    `;
    groupCard.appendChild(titleArea);
    
    // Àrea Drop Zone per a Drag and Drop
    const dropZone = document.createElement('div');
    dropZone.className = "drop-zone flex-grow flex flex-col gap-2.5 p-1";
    dropZone.setAttribute('data-group-id', group.id);
    
    // Esdeveniments Drag and Drop per a la zona
    dropZone.addEventListener('dragover', dragOver);
    dropZone.addEventListener('dragenter', dragEnter);
    dropZone.addEventListener('dragleave', dragLeave);
    dropZone.addEventListener('drop', dragDrop);
    
    if (group.students.length === 0) {
      dropZone.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-450 dark:text-slate-650 italic text-[10px]">
          Buit (Arrossega un alumne aquí)
        </div>
      `;
    } else {
      group.students.forEach(student => {
        const isConflicted = groupConflicts[gIndex].has(student.id);
        const card = createStudentDragCard(student, isConflicted);
        dropZone.appendChild(card);
      });
    }
    
    groupCard.appendChild(dropZone);
    
    // Afegir resum de nivells (Extra premium per a avançat)
    if (state.activeTab === 'advanced') {
      const counts = { high: 0, medium: 0, low: 0 };
      group.students.forEach(s => counts[s.level]++);
      
      const balanceBar = document.createElement('div');
      balanceBar.className = "flex gap-2 items-center text-[9px] font-bold border-t border-slate-100 dark:border-slate-800 pt-2.5 text-slate-400 mt-auto";
      balanceBar.innerHTML = `
        <span class="text-emerald-500">Alt: ${counts.high}</span> • 
        <span class="text-amber-500">Mitjà: ${counts.medium}</span> • 
        <span class="text-rose-500">Baix: ${counts.low}</span>
      `;
      groupCard.appendChild(balanceBar);
    }
    
    grid.appendChild(groupCard);
  });
}

// --- CREAR TARGETA D'ALUMNE ARROSSEGABLE ---
function createStudentDragCard(student, isConflicted) {
  const card = document.createElement('div');
  
  // Vora vermella i icona d'alerta si té incompatibilitat activa al grup
  const borderClass = isConflicted 
    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm ring-1 ring-rose-500/10'
    : 'border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-800 shadow-sm';
    
  card.className = `student-card flex justify-between items-center p-2.5 rounded-lg border ${borderClass} text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all`;
  card.setAttribute('draggable', 'true');
  card.setAttribute('data-student-id', student.id);
  
  // Icones i indicadors
  const conflictIcon = isConflicted 
    ? `<span class="text-rose-500" title="Incompatibilitat activa en aquest grup! Conflueix amb un alumne no desitjat.">⚠️</span>` 
    : '';
    
  let levelIndicator = '';
  if (state.activeTab === 'advanced') {
    let dotColor = 'bg-slate-350';
    if (student.level === 'high') dotColor = 'bg-emerald-500';
    if (student.level === 'low') dotColor = 'bg-rose-500';
    levelIndicator = `<span class="w-1.5 h-1.5 rounded-full ${dotColor}" title="Nivell: ${LEVEL_VALUES[student.level]}"></span>`;
  }
  
  card.innerHTML = `
    <div class="flex items-center gap-2 max-w-[80%] truncate">
      ${levelIndicator}
      <span class="truncate">${escapeHTML(student.name)}</span>
    </div>
    <div class="flex items-center gap-1.5 flex-shrink-0">
      ${conflictIcon}
      <span class="text-[10px] text-slate-300 dark:text-slate-700 hover:text-slate-500 cursor-grab">⋮⋮</span>
    </div>
  `;
  
  // Connectar esdeveniments Drag n' Drop
  card.addEventListener('dragstart', dragStart);
  card.addEventListener('dragend', dragEnd);
  
  return card;
}

// --- CODI D'IMPLEMENTACIÓ DRAG AND DROP NATIU ---
let draggedElement = null;
let sourceGroupId = null;

function dragStart(e) {
  draggedElement = this;
  sourceGroupId = this.closest('[data-group-id]').getAttribute('data-group-id');
  this.classList.add('dragging');
  
  // Estableix l'efecte
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.getAttribute('data-student-id'));
}

function dragEnd() {
  this.classList.remove('dragging');
  draggedElement = null;
  sourceGroupId = null;
  
  // Netejar possibles overlays de drag-over
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => zone.classList.remove('drag-over'));
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function dragEnter(e) {
  this.classList.add('drag-over');
}

function dragLeave() {
  this.classList.remove('drag-over');
}

function dragDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  const studentId = e.dataTransfer.getData('text/plain');
  const targetGroupId = this.getAttribute('data-group-id');
  
  if (!studentId || !targetGroupId) return;
  if (sourceGroupId === targetGroupId) return; // Drop al mateix lloc
  
  // Executar l'intercanvi de grup en l'estat
  moveStudentInState(studentId, sourceGroupId, targetGroupId);
}

function moveStudentInState(studentId, fromGroupId, toGroupId) {
  const fromGroup = state.groups.find(g => g.id === fromGroupId);
  const toGroup = state.groups.find(g => g.id === toGroupId);
  
  if (!fromGroup || !toGroup) return;
  
  // Cerca l'alumne a moure
  const studentIndex = fromGroup.students.findIndex(s => s.id === studentId);
  if (studentIndex === -1) return;
  
  // Treu-lo del grup vell i insereix-lo al nou
  const [student] = fromGroup.students.splice(studentIndex, 1);
  toGroup.students.push(student);
  
  // Recalcular i redibuixar
  saveStateToLocalStorage();
  renderGroupsGrid();
  showNotification(`S'ha mogut a ${student.name} al ${toGroup.name}.`, "info");
}

// --- DESAR I CARREGAR HISTORIAL DE LA SESSIÓ (Companys) ---
function saveGroupSetToHistory(groupsList) {
  // Per a cada grup, agafem totes les parelles úniques de companys
  groupsList.forEach(group => {
    const ids = group.students.map(s => s.id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join('___');
        // Incrementem les vegades que han anat junts
        state.cooccurrence[key] = (state.cooccurrence[key] || 0) + 1;
      }
    }
  });
  
  state.sessionHistoryCount++;
  updateHistoryWidget();
}

function resetSessionHistory() {
  if (confirm("Segur que vols esborrar l'historial d'agrupacions anteriors? Aquesta acció reiniciarà la memòria d'alumnes que han treballat junts.")) {
    state.cooccurrence = {};
    state.sessionHistoryCount = 0;
    saveStateToLocalStorage();
    updateHistoryWidget();
    showNotification("S'ha reiniciat completament l'historial de repeticions de la sessió.", "success");
  }
}

function updateHistoryWidget() {
  const widget = document.getElementById('session-history-widget');
  const text = document.getElementById('history-text');
  
  if (state.sessionHistoryCount > 0) {
    widget.classList.remove('hidden');
    text.innerText = `S'estan registrant els companys per evitar repetir-los (S'han memoritzat ${state.sessionHistoryCount} agrupacions).`;
  } else {
    widget.classList.add('hidden');
  }
}

// --- EXPORTACIÓ I IMPORTACIÓ D'ARXIUS (.json i .csv) ---

// 1. Exportar projecte complet a JSON
function exportProjectJSON() {
  syncStudentsFromTextarea();
  
  const payload = {
    appName: "Aplecs",
    version: "1.0",
    date: new Date().toISOString(),
    students: state.students,
    groups: state.groups,
    cooccurrence: state.cooccurrence,
    sessionHistoryCount: state.sessionHistoryCount
  };
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `aplecs_projecte_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification("S'ha descarregat correctament el fitxer del projecte (.json)!", "success");
}

// 2. Importar projecte complet des de JSON
function importProjectJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      
      if (!data.students) {
        throw new Error("L'arxiu no sembla tenir un format de projecte vàlid.");
      }
      
      // Carregar a l'estat
      state.students = data.students || [];
      state.groups = data.groups || [];
      state.cooccurrence = data.cooccurrence || {};
      state.sessionHistoryCount = data.sessionHistoryCount || 0;
      
      // Sincronitzar el Textarea de la UI amb els noms
      const textarea = document.getElementById('student-names');
      textarea.value = state.students.map(s => s.name).join('\n');
      
      // Actualitzar elements numèrics
      if (state.groups.length > 0) {
        document.getElementById('input-group-count').value = state.groups.length;
        document.getElementById('input-group-size').value = Math.ceil(state.students.length / state.groups.length);
      }
      
      saveStateToLocalStorage();
      syncUI();
      
      if (state.activeTab === 'advanced') {
        renderAdvancedStudentList();
      }
      
      showNotification("S'ha importat el projecte de manera excel·lent!", "success");
    } catch (err) {
      showNotification("Error en llegir el fitxer JSON: " + err.message, "error");
    }
  };
  reader.readAsText(file);
  // Reseteja l'input perquè es pugui tornar a pujar el mateix fitxer si cal
  e.target.value = '';
}

// 3. Exportar a CSV compatible amb Excel / Imprimir
function downloadGroupsCSV() {
  if (state.groups.length === 0) {
    showNotification("Genera els grups primer abans de descarregar la graella!", "error");
    return;
  }
  
  // Trobar el nombre màxim d'alumnes en qualsevol grup per dimensionar la graella
  const maxMembres = Math.max(...state.groups.map(g => g.students.length));
  
  // Capçaleres de columnes: Nom del Grup
  const headers = state.groups.map(g => `"${g.name.replace(/"/g, '""')}"`);
  let csvRows = [headers.join(',')];
  
  // Omplim fila per fila amb els alumnes de cada grup
  for (let r = 0; r < maxMembres; r++) {
    const row = state.groups.map(group => {
      const std = group.students[r];
      return std ? `"${std.name.replace(/"/g, '""')}"` : '""';
    });
    csvRows.push(row.join(','));
  }
  
  // Afegim suport per a caràcters UTF-8 BOM perquè Excel el llegeixi correctament en català
  const csvContent = "\uFEFF" + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `graella_grups_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification("S'ha generat i descarregat la taula neta (.csv)!", "success");
}

// --- PERSISTÈNCIA A LOCAL STORAGE ---
function saveStateToLocalStorage() {
  localStorage.setItem('antigravity_students', JSON.stringify(state.students));
  localStorage.setItem('antigravity_groups', JSON.stringify(state.groups));
  localStorage.setItem('antigravity_cooccurrence', JSON.stringify(state.cooccurrence));
  localStorage.setItem('antigravity_history_count', state.sessionHistoryCount);
  localStorage.setItem('antigravity_active_tab', state.activeTab);
}

function loadStateFromLocalStorage() {
  try {
    const st = localStorage.getItem('antigravity_students');
    const gr = localStorage.getItem('antigravity_groups');
    const co = localStorage.getItem('antigravity_cooccurrence');
    const hc = localStorage.getItem('antigravity_history_count');
    const tab = localStorage.getItem('antigravity_active_tab');
    
    if (st) state.students = JSON.parse(st);
    if (gr) state.groups = JSON.parse(gr);
    if (co) state.cooccurrence = JSON.parse(co);
    if (hc) state.sessionHistoryCount = parseInt(hc) || 0;
    if (tab) state.activeTab = tab;
    
    // Omplim el textarea inicial si ja tenim alumnes
    if (state.students.length > 0) {
      document.getElementById('student-names').value = state.students.map(s => s.name).join('\n');
    }
  } catch (e) {
    console.error("Error en llegir de localStorage", e);
  }
}

// --- SINCRONITZAR LA UI AMB L'ESTAT ---
function syncUI() {
  // Ajustar la pestanya activa
  switchTab(state.activeTab);
  
  // Comptadors d'alumnes i grups
  document.getElementById('student-counter').innerText = `${state.students.length} alumnes detectats`;
  document.getElementById('stat-total-students').innerText = `Alumnes: ${state.students.length}`;
  
  // Si hi ha grups, els renderitza directament
  if (state.groups.length > 0) {
    document.getElementById('btn-quick-reshuffle').removeAttribute('disabled');
    document.getElementById('btn-download-csv').removeAttribute('disabled');
    renderGroupsGrid();
  } else {
    document.getElementById('btn-quick-reshuffle').setAttribute('disabled', 'true');
    document.getElementById('btn-download-csv').setAttribute('disabled', 'true');
    
    // Netejar la graella
    document.getElementById('groups-grid').classList.add('hidden');
    document.getElementById('empty-groups-state').classList.remove('hidden');
  }
  
  updateHistoryWidget();
}

// --- UTILITATS GENERALS ---

// Otenir comptador de grups indicat pel docent en Mode Ràpid
function getDesiredGroupCount() {
  const countInput = document.getElementById('input-group-count').value;
  const sizeInput = document.getElementById('input-group-size').value;
  const n = state.students.length;
  
  if (countInput) {
    return parseInt(countInput);
  } else if (sizeInput) {
    const size = parseInt(sizeInput);
    return Math.ceil(n / size);
  }
  
  // Valor per defecte si no hi ha res
  return 4;
}

// Escapa caràcters per evitar XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Mostra una notificació visual emergent dinàmica
function showNotification(message, type = 'info') {
  // Elimina notificacions anteriors per evitar acumulació
  const existing = document.querySelectorAll('.app-notification');
  existing.forEach(n => n.remove());
  
  const container = document.createElement('div');
  
  // Colors de la notificació
  let bgClass = 'bg-slate-900 text-white';
  if (type === 'success') bgClass = 'bg-emerald-600 text-white shadow-emerald-500/10';
  if (type === 'error') bgClass = 'bg-rose-600 text-white shadow-rose-500/10';
  if (type === 'warning') bgClass = 'bg-amber-500 text-slate-900 shadow-amber-500/10';
  
  container.className = `app-notification fixed bottom-6 right-6 ${bgClass} z-50 px-5 py-3.5 rounded-xl font-semibold shadow-2xl flex items-center gap-2.5 max-w-sm transition-all duration-300 transform translate-y-12 opacity-0 text-xs`;
  
  // Icones
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';
  
  container.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
  document.body.appendChild(container);
  
  // Forçar reflow per aplicar l'animació d'entrada
  setTimeout(() => {
    container.classList.remove('translate-y-12', 'opacity-0');
  }, 10);
  
  // Programar la desaparició
  setTimeout(() => {
    container.classList.add('translate-y-12', 'opacity-0');
    setTimeout(() => container.remove(), 300);
  }, 4000);
}
