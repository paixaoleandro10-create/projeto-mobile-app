"use strict";

const API_BASE = "/api/v1/mobile";
const LOAD_TIMEOUT_MS = 6000;
const LABELS = window.WEB_LABELS;

const FALLBACK = {
  dashboard: {
    overview: {
      weighted_gpa: "-",
      progress_percent: 0,
      class_rank: "Sem dados"
    },
    tasks: [],
    performance: []
  },
  subjects: {
    subjects: []
  },
  schedule: {
    month_label: "Sem agenda",
    default_day: 1,
    events: []
  },
  report: {
    student: {
      name: "Sem estudante",
      class_name: "-",
      student_id: "-"
    },
    summary: {
      overall: "-",
      status: "Em andamento"
    },
    lines: []
  }
};

const summaryCards = document.getElementById("summary-cards");
const tasksContent = document.getElementById("tasks-content");
const performanceContent = document.getElementById("performance-content");
const reportContent = document.getElementById("report-content");
const sourceChip = document.getElementById("web-source");
const statusMessage = document.getElementById("status-message");
const subtitle = document.getElementById("web-subtitle");
const skipLink = document.getElementById("web-skip-link");
const mobileAction = document.getElementById("web-mobile-action");
const shortcutsLinks = document.getElementById("web-shortcuts-links");
const PT_BR_VISIBLE_REPLACEMENTS = [
  ["Mid-term Test", "Prova intermediária"],
  ["Essay Due", "Entrega de redação"],
  ["Study Group", "Grupo de estudo"],
  ["Senior year", "Último ano"],
  ["History", "História"],
  ["vs avg", "em relação à média"],
  ["Loading", "Carregando"],
  ["Error", "Erro"],
  ["Submit", "Enviar"],
  ["Cancel", "Cancelar"],
  ["Save", "Salvar"],
  ["Edit", "Editar"],
  ["Delete", "Excluir"],
  ["Open", "Abrir"],
  ["Close", "Fechar"],
  ["Report", "Relatório"],
  ["Schedule", "Agenda"],
  ["Subjects", "Disciplinas"],
  ["Subject", "Disciplina"],
  ["grade", "nota"],
  ["term", "período"],
];

function applyStaticLabels() {
  document.title = LABELS.pageTitle;
  skipLink.textContent = LABELS.skipToMain;
  document.getElementById("web-eyebrow").textContent = LABELS.headerEyebrow;
  document.getElementById("web-title").textContent = LABELS.headerTitle;
  mobileAction.textContent = LABELS.mobileAction;
  document.getElementById("web-hero-title").textContent = LABELS.heroTitle;
  document.getElementById("web-section-tasks-title").textContent = LABELS.sections.tasks;
  document.getElementById("web-section-performance-title").textContent = LABELS.sections.performance;
  document.getElementById("web-section-report-title").textContent = LABELS.sections.report;
  document.getElementById("web-section-shortcuts-title").textContent = LABELS.sections.shortcuts;
}

function renderShortcuts() {
  shortcutsLinks.innerHTML = LABELS.shortcuts
    .map((shortcut) => `<a href="${escapeHtml(shortcut.href)}">${escapeHtml(shortcut.label)}</a>`)
    .join("");
}

function localizeVisibleText(value) {
  return PT_BR_VISIBLE_REPLACEMENTS.reduce((text, [source, target]) => {
    const pattern = new RegExp(source, "gi");
    return text.replace(pattern, target);
  }, String(value));
}

function normalizeError(rawMessage) {
  if (rawMessage === "timeout") {
    return LABELS.errors.timeout;
  }
  if (rawMessage === "unknown error") {
    return LABELS.errors.unknown;
  }
  if (rawMessage === "Failed to fetch" || rawMessage === "fetch failed") {
    return LABELS.errors.fetch;
  }
  if (String(rawMessage).startsWith("HTTP ")) {
    return LABELS.errors.http(rawMessage);
  }
  return rawMessage;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function translateStatus(status) {
  return LABELS.statusMap[status] || String(status);
}

function withTimeout(endpoint) {
  return Promise.race([
    fetch(endpoint, { headers: { Accept: "application/json" } }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
    })
  ]);
}

async function fetchEndpoint(endpoint, fallbackData) {
  try {
    const response = await withTimeout(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { source: "api", data, endpoint };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "unknown error";
    const message = normalizeError(rawMessage);
    return { source: "fallback", data: fallbackData, endpoint, error: message };
  }
}

function renderSummary(dashboard, subjects, schedule, report) {
  const cards = [
    { label: LABELS.summaryCards.weightedAverage, value: dashboard.data.overview.weighted_gpa },
    { label: LABELS.summaryCards.progress, value: `${dashboard.data.overview.progress_percent}%` },
    { label: LABELS.summaryCards.classRank, value: dashboard.data.overview.class_rank },
    { label: LABELS.summaryCards.overallAverage, value: report.data.summary.overall },
    { label: LABELS.summaryCards.eventsInMonth, value: String(schedule.data.events.length) },
    { label: LABELS.summaryCards.activeSubjects, value: String(subjects.data.subjects.length) },
  ];

  summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <h3>${escapeHtml(card.label)}</h3>
          <div class="summary-value">${escapeHtml(localizeVisibleText(card.value))}</div>
        </article>
      `
    )
    .join("");
}

function renderList(container, items, mapFn, emptyMessage) {
  if (!items.length) {
    container.innerHTML = `<p class="empty">${escapeHtml(emptyMessage)}</p>`;
    return;
  }

  container.innerHTML = `<ul class="item-list">${items.map(mapFn).join("")}</ul>`;
}

function renderTasks(result) {
  const detail = result.error || LABELS.errors.fetch;
  const warning =
    result.source === "fallback"
      ? `<p class="warning-note">${escapeHtml(LABELS.warnings.panel(detail))}</p>`
      : "";

  renderList(
    tasksContent,
    result.data.tasks,
    (task) => `
      <li class="item">
        <p class="item-title">${escapeHtml(localizeVisibleText(task.title))}</p>
        <p class="item-subtitle">${escapeHtml(localizeVisibleText(task.subtitle))}</p>
      </li>
    `,
    LABELS.emptyStates.tasks
  );

  tasksContent.insertAdjacentHTML("beforeend", warning);
}

function renderPerformance(result) {
  const detail = result.error || LABELS.errors.fetch;
  const warning =
    result.source === "fallback"
      ? `<p class="warning-note">${escapeHtml(LABELS.warnings.performance(detail))}</p>`
      : "";

  renderList(
    performanceContent,
    result.data.performance,
    (item) => `
      <li class="item">
        <p class="item-title">${escapeHtml(localizeVisibleText(item.subject))} (${escapeHtml(localizeVisibleText(item.gradeLabel))})</p>
        <p class="item-subtitle">${escapeHtml(localizeVisibleText(item.detail))} - ${escapeHtml(localizeVisibleText(item.delta))}</p>
      </li>
    `,
    LABELS.emptyStates.performance
  );

  performanceContent.insertAdjacentHTML("beforeend", warning);
}

function renderReport(result) {
  const rows = result.data.lines
    .map((line) => {
      const status = translateStatus(line.status);
      const statusClass = status === "Aprovado" ? "badge-ok" : "badge-warning";
      return `
        <tr>
          <td>${escapeHtml(localizeVisibleText(line.subject))}</td>
          <td class="right">${escapeHtml(line.terms[0])}</td>
          <td class="right">${escapeHtml(line.terms[1])}</td>
          <td class="right">${escapeHtml(line.terms[2])}</td>
          <td class="right">${escapeHtml(line.terms[3])}</td>
          <td class="right">${escapeHtml(line.average)}</td>
          <td class="right ${statusClass}">${escapeHtml(status)}</td>
        </tr>
      `;
    })
    .join("");

  const emptyRow =
    rows ||
    `<tr><td colspan="7" class="empty">${escapeHtml(LABELS.emptyStates.report)}</td></tr>`;

  const detail = result.error || LABELS.errors.fetch;
  const warning =
    result.source === "fallback"
      ? `<p class="warning-note">${escapeHtml(LABELS.warnings.report(detail))}</p>`
      : "";

  reportContent.innerHTML = `
    <p class="item-subtitle">
      ${escapeHtml(LABELS.studentLabels.student)}: <strong>${escapeHtml(result.data.student.name)}</strong> | ${escapeHtml(
    LABELS.studentLabels.className
  )} ${escapeHtml(
    localizeVisibleText(result.data.student.class_name)
  )} | ${escapeHtml(LABELS.studentLabels.enrollment)} ${escapeHtml(localizeVisibleText(result.data.student.student_id))}
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(LABELS.table.subject)}</th>
            <th class="right">${escapeHtml(LABELS.table.term1)}</th>
            <th class="right">${escapeHtml(LABELS.table.term2)}</th>
            <th class="right">${escapeHtml(LABELS.table.term3)}</th>
            <th class="right">${escapeHtml(LABELS.table.term4)}</th>
            <th class="right">${escapeHtml(LABELS.table.average)}</th>
            <th class="right">${escapeHtml(LABELS.table.status)}</th>
          </tr>
        </thead>
        <tbody>${emptyRow}</tbody>
      </table>
    </div>
    ${warning}
  `;
}

function setSourceState(results) {
  const fallbackCount = results.filter((result) => result.source === "fallback").length;
  if (fallbackCount === 0) {
    sourceChip.textContent = LABELS.sourceUpdated;
    sourceChip.classList.remove("source-fallback");
    return;
  }

  sourceChip.textContent = LABELS.sourceFallback(fallbackCount);
  sourceChip.classList.add("source-fallback");
}

async function bootstrap() {
  applyStaticLabels();
  renderShortcuts();
  subtitle.textContent = LABELS.heroSubtitleLoading;
  sourceChip.textContent = LABELS.sourceUpdated;
  statusMessage.textContent = LABELS.loadingStatus;

  const [dashboard, subjects, schedule, report] = await Promise.all([
    fetchEndpoint(`${API_BASE}/dashboard`, FALLBACK.dashboard),
    fetchEndpoint(`${API_BASE}/subjects`, FALLBACK.subjects),
    fetchEndpoint(`${API_BASE}/schedule`, FALLBACK.schedule),
    fetchEndpoint(`${API_BASE}/report`, FALLBACK.report)
  ]);

  renderSummary(dashboard, subjects, schedule, report);
  renderTasks(dashboard);
  renderPerformance(dashboard);
  renderReport(report);
  setSourceState([dashboard, subjects, schedule, report]);

  const fallbackCount = [dashboard, subjects, schedule, report].filter(
    (result) => result.source === "fallback"
  ).length;

  if (fallbackCount === 0) {
    subtitle.textContent = LABELS.sourceSubtitleLoaded;
    statusMessage.textContent = LABELS.loadedStatus;
  } else {
    subtitle.textContent = LABELS.sourceSubtitleFallback;
    statusMessage.textContent = LABELS.fallbackLoadedStatus(fallbackCount);
  }
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : "erro inesperado";
  statusMessage.textContent = LABELS.loadingFailure(message);
  sourceChip.textContent = "Fonte: erro";
  sourceChip.classList.add("source-fallback");
});
