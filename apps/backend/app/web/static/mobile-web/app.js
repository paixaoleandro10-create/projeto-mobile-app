"use strict";

const API_BASE = "/api/v1/mobile";
const LOAD_TIMEOUT_MS = 6000;
const FORCE_FALLBACK = new URLSearchParams(window.location.search).get("forceFallback") === "1";

const FALLBACK_DATA = {
  dashboard: {
    overview: {
      weighted_gpa: "3.84",
      progress_percent: 92,
      class_rank: "Entre os 5% melhores da turma de 2024"
    },
    tasks: [
      {
        id: "t1",
        title: "Revisão de literatura",
        subtitle: "Entrega em 2 dias - Inglês Avançado",
        progress: 66
      },
      {
        id: "t2",
        title: "Relatório de laboratório de química",
        subtitle: "Amanhã - Química",
        progress: 25
      },
      {
        id: "t3",
        title: "Prova intermediária de cálculo",
        subtitle: "Sexta-feira - Cálculo Avançado",
        priority: "high"
      }
    ],
    performance: [
      {
        id: "p1",
        subject: "História das civilizações",
        detail: "Quiz da unidade 3 - 12 Out",
        score: "96/100",
        delta: "+2.4% vs média",
        gradeLabel: "A",
        tone: "primary"
      },
      {
        id: "p2",
        subject: "Ciência da computação",
        detail: "Projeto de fluxo lógico - 10 Out",
        score: "89/100",
        delta: "-0.5% vs média",
        gradeLabel: "B+",
        tone: "secondary"
      }
    ]
  },
  subjects: {
    subjects: [
      {
        id: "s1",
        subject: "Matemática",
        teacher: "Prof. Alan Turing",
        grade: "A+",
        average: 94,
        accent: "primary",
        students: 12
      },
      {
        id: "s2",
        subject: "Física",
        teacher: "Dr. Marie Curie",
        grade: "B",
        average: 82,
        accent: "tertiary",
        students: 8
      },
      {
        id: "s3",
        subject: "História",
        teacher: "Prof. Howard Zinn",
        grade: "A",
        average: 89,
        accent: "primary",
        students: 24
      }
    ]
  },
  schedule: {
    month_label: "Outubro de 2024",
    default_day: 10,
    events: [
      {
        id: "e1",
        day: 10,
        time: "09:00",
        meridiem: "AM",
        title: "Prova intermediária de química",
        place: "Sala 402",
        detail: "90 min",
        priority: "high"
      },
      {
        id: "e2",
        day: 10,
        time: "11:30",
        meridiem: "AM",
        title: "Entrega da redação de literatura",
        place: "Portal online",
        detail: "2.500 palavras",
        priority: "normal"
      },
      {
        id: "e3",
        day: 14,
        time: "02:00",
        meridiem: "PM",
        title: "Grupo de estudo de matemática",
        place: "Biblioteca B",
        detail: "Opcional",
        priority: "normal"
      }
    ]
  },
  report: {
    student: {
      name: "Gabriel Silva",
      class_name: "3º ano do ensino médio",
      student_id: "402839-2"
    },
    summary: {
      overall: "8.4",
      status: "Approved"
    },
    lines: [
      {
        id: "r1",
        subject: "Matemática",
        terms: ["8.5", "7.0", "9.0", "8.0"],
        average: "8.1",
        status: "Approved"
      },
      {
        id: "r2",
        subject: "Física",
        terms: ["6.5", "8.0", "7.5", "6.0"],
        average: "7.0",
        status: "Approved"
      },
      {
        id: "r3",
        subject: "Química",
        terms: ["5.5", "6.0", "7.0", "4.5"],
        average: "5.7",
        status: "Exam"
      }
    ]
  }
};

const SCREENS = {
  dashboard: {
    title: "Painel",
    subtitle: "Visão acadêmica com dados do backend",
    endpoint: `${API_BASE}/dashboard`
  },
  subjects: {
    title: "Matérias",
    subtitle: "Disciplinas e progresso atual",
    endpoint: `${API_BASE}/subjects`
  },
  schedule: {
    title: "Agenda",
    subtitle: "Agenda de eventos acadêmicos",
    endpoint: `${API_BASE}/schedule`
  },
  report: {
    title: "Boletim",
    subtitle: "Boletim e resumo de desempenho",
    endpoint: `${API_BASE}/report`
  }
};

const ROUTE_TO_SCREEN = {
  "/mobile": "dashboard",
  "/mobile/subjects": "subjects",
  "/mobile/schedule": "schedule",
  "/mobile/report": "report",
  "/mobile-web": "dashboard"
};

const SCREEN_TO_ROUTE = {
  dashboard: "/mobile",
  subjects: "/mobile/subjects",
  schedule: "/mobile/schedule",
  report: "/mobile/report"
};

function normalizePath(pathname) {
  const trimmed = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return trimmed || "/mobile";
}

function getScreenFromPath(pathname) {
  const normalized = normalizePath(pathname);
  return ROUTE_TO_SCREEN[normalized] || "dashboard";
}

function getRouteForScreen(screen) {
  return SCREEN_TO_ROUTE[screen] || "/mobile";
}

const state = {
  activeScreen: getScreenFromPath(window.location.pathname),
  screenCache: {},
  selectedDay: null
};

const screenTitle = document.getElementById("screen-title");
const screenSubtitle = document.getElementById("screen-subtitle");
const screenContent = document.getElementById("screen-content");
const statusMessage = document.getElementById("status-message");
const dataSourceBadge = document.getElementById("data-source-badge");
const dataSourceDetail = document.getElementById("data-source-detail");
const dataWarning = document.getElementById("data-warning");
const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const installButton = document.getElementById("install-app-button");
let deferredInstallPrompt = null;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasStringField(obj, field) {
  return typeof obj[field] === "string" && obj[field].length > 0;
}

function translateClassRank(rankText) {
  return String(rankText).replace(" of ", " de ");
}

function translateDelta(deltaText) {
  return String(deltaText)
    .replace(" pts vs avg", " pts vs média")
    .replace(" vs avg", " vs média");
}

function translateMonthLabel(monthLabel) {
  const monthMap = {
    January: "Janeiro",
    February: "Fevereiro",
    March: "Março",
    April: "Abril",
    May: "Maio",
    June: "Junho",
    July: "Julho",
    August: "Agosto",
    September: "Setembro",
    October: "Outubro",
    November: "Novembro",
    December: "Dezembro"
  };

  return Object.entries(monthMap).reduce(
    (text, [englishMonth, portugueseMonth]) => text.replace(englishMonth, portugueseMonth),
    String(monthLabel)
  );
}

function translateReportStatus(status) {
  if (status === "Approved") {
    return "Aprovado";
  }
  if (status === "Exam") {
    return "Exame";
  }
  if (status === "In Progress") {
    return "Em andamento";
  }
  return String(status);
}

function translateFallbackReason(reasonKey) {
  if (reasonKey === "forced") {
    return "modo de contingência forçado para teste";
  }
  if (reasonKey === "contract") {
    return "incompatibilidade de contrato";
  }
  return "falha de rede/tempo limite";
}

function translateMeridiem(meridiem) {
  if (meridiem === "AM") {
    return "manhã";
  }
  if (meridiem === "PM") {
    return "tarde";
  }
  return String(meridiem);
}

function translateErrorDetail(errorText) {
  if (!errorText) {
    return "";
  }
  if (errorText === "contract mismatch") {
    return "incompatibilidade de contrato";
  }
  if (errorText === "unknown error") {
    return "erro desconhecido";
  }
  if (errorText === "timeout") {
    return "tempo limite excedido";
  }
  return String(errorText);
}

function showWarning(type, message) {
  dataWarning.className = "container warning-box";
  dataWarning.classList.add(type === "error" ? "warning-error" : "warning-fallback");
  dataWarning.innerHTML = message;
}

function hideWarning() {
  dataWarning.className = "container hidden";
  dataWarning.innerHTML = "";
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButtonVisibility() {
  if (!installButton) {
    return;
  }

  if (isStandaloneMode()) {
    installButton.hidden = true;
    installButton.classList.add("hidden");
    return;
  }

  const shouldShow = deferredInstallPrompt !== null;
  installButton.hidden = !shouldShow;
  installButton.classList.toggle("hidden", !shouldShow);
}

function registerMobileServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/mobile/sw.js", { scope: "/mobile/" }).catch((error) => {
      const errorText = error instanceof Error ? error.message : "falha ao registrar service worker";
      setStatus(`PWA indispon?vel: ${errorText}`);
    });
  });
}

function setupInstallPrompt() {
  if (!installButton) {
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtonVisibility();
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();

    if (outcome === "accepted") {
      setStatus("Instala??o iniciada. Verifique o sistema do celular.");
      return;
    }

    setStatus("Instala??o cancelada.");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();
    setStatus("Aplicativo instalado com sucesso.");
  });
}

function sendTelemetry(event, screen, reason) {
  const payload = {
    event,
    screen,
    reason: reason || null
  };
  const request = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };

  fetch("/api/v1/mobile/telemetry", request).catch(() => undefined);
}

function setDataSourceMeta(screen, result) {
  const sourceLabel = result.source === "api" ? "API real" : "contingência local";
  dataSourceBadge.textContent = `Fonte: ${sourceLabel}`;
  dataSourceBadge.classList.remove("chip-api", "chip-fallback", "chip-error");

  if (result.source === "api") {
    dataSourceBadge.classList.add("chip-api");
    dataSourceDetail.textContent = `${SCREENS[screen].endpoint} respondeu com contrato válido.`;
    hideWarning();
    return;
  }

  const reasonText =
    result.fallbackReason === "forced"
      ? "modo de contingência forçado para teste local."
      : result.fallbackReason === "contract"
        ? "resposta da API fora do contrato esperado."
        : "falha de rede ou tempo limite ao acessar a API.";

  dataSourceBadge.classList.add(result.fallbackReason === "forced" ? "chip-fallback" : "chip-error");
  dataSourceDetail.textContent = `${SCREENS[screen].endpoint} não foi usado em tempo real: ${reasonText}`;

  const warningPrefix = result.fallbackReason === "forced" ? "Modo de teste:" : "Atenção:";
  const warningType = result.fallbackReason === "forced" ? "fallback" : "error";
  const translatedDetail = translateErrorDetail(result.error);
  const warningMessage = `<strong>${warningPrefix}</strong> ${escapeHtml(reasonText)} ${
    translatedDetail ? `Detalhe: ${escapeHtml(translatedDetail)}.` : ""
  }`;
  showWarning(warningType, warningMessage);
  const telemetryEvent = result.fallbackReason === "contract" ? "contract_error" : "fallback_used";
  sendTelemetry(telemetryEvent, screen, result.error || reasonText);
}

function setActiveButton(screen) {
  navButtons.forEach((button) => {
    const active = button.dataset.screen === screen;
    button.classList.toggle("nav-link-active", active);
    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function validateDashboardPayload(payload) {
  if (!isObject(payload) || !isObject(payload.overview)) {
    return false;
  }
  if (!Array.isArray(payload.tasks) || !Array.isArray(payload.performance)) {
    return false;
  }
  return hasStringField(payload.overview, "weighted_gpa") && hasStringField(payload.overview, "class_rank");
}

function validateSubjectsPayload(payload) {
  return isObject(payload) && Array.isArray(payload.subjects);
}

function validateSchedulePayload(payload) {
  return isObject(payload) && Array.isArray(payload.events) && typeof payload.default_day === "number";
}

function validateReportPayload(payload) {
  return (
    isObject(payload) &&
    isObject(payload.student) &&
    isObject(payload.summary) &&
    Array.isArray(payload.lines)
  );
}

const CONTRACT_VALIDATORS = {
  dashboard: validateDashboardPayload,
  subjects: validateSubjectsPayload,
  schedule: validateSchedulePayload,
  report: validateReportPayload
};

async function fetchWithFallback(screen, endpoint, fallbackData) {
  if (FORCE_FALLBACK) {
    return {
      data: fallbackData,
      source: "fallback",
      endpoint,
      fallbackReason: "forced",
      error: "forceFallback=1"
    };
  }

  try {
    const response = await Promise.race([
      fetch(endpoint, { headers: { Accept: "application/json" } }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
      })
    ]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const validator = CONTRACT_VALIDATORS[screen];
    if (typeof validator === "function" && !validator(data)) {
      throw new Error("contract mismatch");
    }

    return { data, source: "api", endpoint };
  } catch (error) {
    const rawError = error instanceof Error ? error.message : "unknown error";
    const fallbackReason = rawError === "contract mismatch" ? "contract" : "network";
    return {
      data: fallbackData,
      source: "fallback",
      endpoint,
      fallbackReason,
      error: rawError
    };
  }
}

function renderFallbackHint(meta, endpointPath) {
  if (meta.source === "fallback") {
    const reason = translateFallbackReason(meta.fallbackReason);
    return `<p class="hint hint-warning">Contingência ativa (${escapeHtml(reason)}). Endpoint: <code>${escapeHtml(
      endpointPath
    )}</code>.</p>`;
  }

  return `<p class="hint">Dados carregados da API: <code>${escapeHtml(endpointPath)}</code>.</p>`;
}

function renderDashboard(result) {
  const overview = result.data.overview;
  const tasks = result.data.tasks;
  const performance = result.data.performance;

  const tasksHtml = tasks
    .map((task) => {
      const taskProgress = typeof task.progress === "number" ? task.progress : null;
      const progressHtml =
        taskProgress !== null
          ? `<div class="progress-track"><div class="progress-fill" style="width:${taskProgress}%"></div></div>`
          : "";
      const priorityHtml =
        task.priority === "high" ? `<span class="pill-danger">Prioridade alta</span>` : "";

      return `<article class="section">
          <div class="score-row">
            <h4 class="card-title">${escapeHtml(task.title)}</h4>
            ${priorityHtml}
          </div>
          <p class="tiny">${escapeHtml(task.subtitle)}</p>
          ${progressHtml}
        </article>`;
    })
    .join("");

  const performanceHtml = performance
    .map((item) => {
      const toneClass = item.tone === "primary" ? "score-primary" : "score-secondary";
      return `<article class="section score-row">
          <div>
            <h4 class="card-title">${escapeHtml(item.subject)}</h4>
            <p class="tiny">${escapeHtml(item.detail)}</p>
            <p class="tiny">${escapeHtml(translateDelta(item.delta))}</p>
          </div>
          <div class="score-badge ${toneClass}">${escapeHtml(item.gradeLabel)}</div>
        </article>`;
    })
    .join("");

  return `
    <section class="section hero-grid">
      <div>
        <p class="subtitle">Média ponderada</p>
        <p class="hero-value">${escapeHtml(overview.weighted_gpa)}</p>
        <p class="hero-small">${escapeHtml(translateClassRank(overview.class_rank))}</p>
      </div>
      <div class="ring">
        <div class="ring-inner">
          ${escapeHtml(overview.progress_percent)}%
          <small>Progresso</small>
        </div>
      </div>
    </section>
    <section class="container">
      <h3 class="screen-title">Tarefas</h3>
      <div class="card-grid">${tasksHtml}</div>
    </section>
    <section class="container">
      <h3 class="screen-title">Desempenho recente</h3>
      <div class="card-grid">${performanceHtml}</div>
      ${renderFallbackHint(result, "/api/v1/mobile/dashboard")}
    </section>
  `;
}

function renderSubjects(result) {
  const subjects = result.data.subjects;
  const subjectsHtml = subjects
    .map((subject) => {
      const accentClass =
        subject.accent === "primary" ? "subject-accent-primary" : "subject-accent-tertiary";
      return `<article class="section subject-card" data-subject-card>
          <h4 class="card-title">${escapeHtml(subject.subject)}</h4>
          <p class="tiny">${escapeHtml(subject.teacher)}</p>
          <p class="tiny">Nota ${escapeHtml(subject.grade)} - ${subject.students} alunos</p>
          <div class="bar ${accentClass}">
            <span style="width:${subject.average}%"></span>
          </div>
          <p class="tiny"><strong class="${accentClass}">${subject.average}% média</strong></p>
        </article>`;
    })
    .join("");

  return `
    <section class="section">
      <label for="subject-search" class="subtitle">Buscar matéria</label>
      <div class="input-wrap">
        <span aria-hidden="true">🔎</span>
        <input id="subject-search" type="search" placeholder="Ex: Matemática" />
      </div>
    </section>
    <section class="container">
      <div id="subject-list" class="card-grid">${subjectsHtml}</div>
      ${renderFallbackHint(result, "/api/v1/mobile/subjects")}
    </section>
  `;
}

function renderSchedule(result) {
  const events = result.data.events;
  const uniqueDays = [...new Set(events.map((event) => event.day))].sort((a, b) => a - b);
  const defaultDay = state.selectedDay ?? result.data.default_day;
  state.selectedDay = defaultDay;

  const dayButtons = uniqueDays
    .map((day) => {
      const activeClass = day === state.selectedDay ? "day-button-active" : "";
      return `<button class="day-button ${activeClass}" data-day="${day}" type="button">${day}</button>`;
    })
    .join("");

  const filteredEvents = events.filter((event) => event.day === state.selectedDay);
  const eventsHtml =
    filteredEvents.length > 0
      ? filteredEvents
          .map((event) => {
            const priorityPill =
              event.priority === "high" ? `<span class="meta-pill meta-danger">Urgente</span>` : "";
            return `<article class="section event-card">
              <div class="event-time">${escapeHtml(event.time)}<br />${escapeHtml(translateMeridiem(event.meridiem))}</div>
              <div>
                <h4 class="card-title">${escapeHtml(event.title)}</h4>
                <p class="tiny">${escapeHtml(event.place)}</p>
                <div class="event-meta">
                  <span class="meta-pill">${escapeHtml(event.detail)}</span>
                  ${priorityPill}
                </div>
              </div>
            </article>`;
          })
          .join("")
      : `<article class="section"><p class="tiny">Sem eventos para o dia selecionado.</p></article>`;

  return `
    <section class="section">
      <p class="subtitle">${escapeHtml(translateMonthLabel(result.data.month_label))}</p>
      <div class="calendar-row" role="listbox" aria-label="Selecionar dia da agenda">
        ${dayButtons}
      </div>
    </section>
    <section class="container event-grid">${eventsHtml}</section>
    <section class="container">${renderFallbackHint(result, "/api/v1/mobile/schedule")}</section>
  `;
}

function renderReport(result) {
  const student = result.data.student;
  const summary = result.data.summary;
  const lines = result.data.lines;

  const statusClass =
    summary.status === "Approved"
      ? "status-approved"
      : summary.status === "Exam"
        ? "status-exam"
        : "status-progress";

  const rowsHtml = lines
    .map((line) => {
      const lineStatusClass =
        line.status === "Approved"
          ? "status-approved"
          : line.status === "Exam"
            ? "status-exam"
            : "status-progress";

      return `<tr>
          <td>${escapeHtml(line.subject)}</td>
          <td class="right">${escapeHtml(line.terms[0])}</td>
          <td class="right">${escapeHtml(line.terms[1])}</td>
          <td class="right">${escapeHtml(line.terms[2])}</td>
          <td class="right">${escapeHtml(line.terms[3])}</td>
          <td class="right">${escapeHtml(line.average)}</td>
          <td class="right ${lineStatusClass}">${escapeHtml(translateReportStatus(line.status))}</td>
        </tr>`;
    })
    .join("");

  return `
    <section class="section report-header">
      <div>
        <p class="subtitle">Estudante</p>
        <h3 class="screen-title">${escapeHtml(student.name)}</h3>
        <p class="tiny">Turma ${escapeHtml(student.class_name)} - Matrícula ${escapeHtml(student.student_id)}</p>
      </div>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <div class="stat-box">
          <span class="stat-label">Média geral</span>
          <span class="stat-value">${escapeHtml(summary.overall)}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Situação</span>
          <span class="stat-value ${statusClass}">${escapeHtml(translateReportStatus(summary.status))}</span>
        </div>
      </div>
    </section>
    <section class="section table-wrap">
      <table>
        <thead>
          <tr>
            <th>Matéria</th>
            <th class="right">T1</th>
            <th class="right">T2</th>
            <th class="right">T3</th>
            <th class="right">T4</th>
            <th class="right">Média</th>
            <th class="right">Situação</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </section>
    <section class="container">${renderFallbackHint(result, "/api/v1/mobile/report")}</section>
  `;
}

function bindScreenEvents(screen) {
  if (screen === "subjects") {
    const searchInput = document.getElementById("subject-search");
    const subjectCards = Array.from(document.querySelectorAll("[data-subject-card]"));

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        subjectCards.forEach((card) => {
          const text = (card.textContent || "").toLowerCase();
          card.hidden = query.length > 0 && !text.includes(query);
        });
      });
    }
  }

  if (screen === "schedule") {
    const dayButtons = Array.from(document.querySelectorAll("[data-day]"));
    dayButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const day = Number(button.dataset.day || "0");
        if (day > 0) {
          state.selectedDay = day;
          renderCurrentScreen();
        }
      });
    });
  }
}

function renderScreen(screen, result) {
  if (screen === "dashboard") {
    return renderDashboard(result);
  }
  if (screen === "subjects") {
    return renderSubjects(result);
  }
  if (screen === "schedule") {
    return renderSchedule(result);
  }
  return renderReport(result);
}

async function loadScreenData(screen) {
  if (!FORCE_FALLBACK && state.screenCache[screen]) {
    return state.screenCache[screen];
  }

  const screenConfig = SCREENS[screen];
  const result = await fetchWithFallback(screen, screenConfig.endpoint, FALLBACK_DATA[screen]);

  if (result.source === "api") {
    state.screenCache[screen] = result;
  } else {
    delete state.screenCache[screen];
  }

  return result;
}

function renderFatalError(message) {
  dataSourceBadge.classList.remove("chip-api", "chip-fallback");
  dataSourceBadge.classList.add("chip-error");
  dataSourceBadge.textContent = "Fonte: erro de renderização";
  dataSourceDetail.textContent = "A interface alternativa encontrou erro de renderização.";
  showWarning("error", `<strong>Erro:</strong> ${escapeHtml(message)}`);
  screenContent.innerHTML = `<section class="section"><p class="tiny">${escapeHtml(message)}</p></section>`;
  sendTelemetry("query_error", state.activeScreen, message);
}

async function renderCurrentScreen() {
  const screen = state.activeScreen;
  const screenConfig = SCREENS[screen];

  screenTitle.textContent = screenConfig.title;
  screenSubtitle.textContent = `${screenConfig.subtitle} (${screenConfig.endpoint})`;
  setStatus(`Carregando ${screenConfig.title}...`);

  try {
    const result = await loadScreenData(screen);
    setDataSourceMeta(screen, result);
    screenContent.innerHTML = renderScreen(screen, result);
    bindScreenEvents(screen);
    const sourceLabel = result.source === "api" ? "API real" : "contingência local";
    setStatus(`Tela ${screenConfig.title} carregada com ${sourceLabel}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro inesperado";
    renderFatalError(message);
    setStatus(`Falha ao carregar ${screenConfig.title}.`);
  }
}

function initNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const screen = button.dataset.screen;
      if (!screen || screen === state.activeScreen || !SCREENS[screen]) {
        return;
      }

      state.activeScreen = screen;
      if (screen !== "schedule") {
        state.selectedDay = null;
      }
      history.pushState({ screen }, "", getRouteForScreen(screen));
      setActiveButton(screen);
      renderCurrentScreen();
    });
  });

  window.addEventListener("popstate", () => {
    const routeScreen = getScreenFromPath(window.location.pathname);
    state.activeScreen = routeScreen;
    if (routeScreen !== "schedule") {
      state.selectedDay = null;
    }
    setActiveButton(routeScreen);
    renderCurrentScreen();
  });
}

if (FORCE_FALLBACK) {
  showWarning(
    "fallback",
    "<strong>Modo de teste ativo:</strong> forceFallback=1. A UI usará contingência local mesmo com API disponível."
  );
}

initNavigation();
setActiveButton(state.activeScreen);
renderCurrentScreen();

