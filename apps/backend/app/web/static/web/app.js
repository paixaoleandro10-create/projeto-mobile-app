"use strict";

const API_BASE = "/api/v1/mobile";
const LOAD_TIMEOUT_MS = 6000;

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
      status: "In Progress"
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function translateStatus(status) {
  if (status === "Approved") return "Aprovado";
  if (status === "Exam") return "Exame";
  if (status === "In Progress") return "Em andamento";
  return String(status);
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
    const message = error instanceof Error ? error.message : "unknown error";
    return { source: "fallback", data: fallbackData, endpoint, error: message };
  }
}

function renderSummary(dashboard, subjects, schedule, report) {
  const cards = [
    { label: "Media ponderada", value: dashboard.data.overview.weighted_gpa },
    { label: "Progresso", value: `${dashboard.data.overview.progress_percent}%` },
    { label: "Posicao na turma", value: dashboard.data.overview.class_rank },
    { label: "Media geral", value: report.data.summary.overall },
    { label: "Eventos no mes", value: String(schedule.data.events.length) },
    { label: "Matérias ativas", value: String(subjects.data.subjects.length) }
  ];

  summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <h3>${escapeHtml(card.label)}</h3>
          <div class="summary-value">${escapeHtml(card.value)}</div>
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
  const warning =
    result.source === "fallback"
      ? `<p class="warning-note">Modo contingência ativo no painel: ${escapeHtml(result.error || "falha na API")}</p>`
      : "";

  renderList(
    tasksContent,
    result.data.tasks,
    (task) => `
      <li class="item">
        <p class="item-title">${escapeHtml(task.title)}</p>
        <p class="item-subtitle">${escapeHtml(task.subtitle)}</p>
      </li>
    `,
    "Sem tarefas registradas no momento."
  );

  tasksContent.insertAdjacentHTML("beforeend", warning);
}

function renderPerformance(result) {
  const warning =
    result.source === "fallback"
      ? `<p class="warning-note">Modo contingência ativo no desempenho: ${escapeHtml(result.error || "falha na API")}</p>`
      : "";

  renderList(
    performanceContent,
    result.data.performance,
    (item) => `
      <li class="item">
        <p class="item-title">${escapeHtml(item.subject)} (${escapeHtml(item.gradeLabel)})</p>
        <p class="item-subtitle">${escapeHtml(item.detail)} - ${escapeHtml(item.delta)}</p>
      </li>
    `,
    "Sem lancamentos de desempenho recente."
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
          <td>${escapeHtml(line.subject)}</td>
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
    '<tr><td colspan="7" class="empty">Sem dados de boletim para exibir.</td></tr>';

  const warning =
    result.source === "fallback"
      ? `<p class="warning-note">Modo contingência ativo no boletim: ${escapeHtml(result.error || "falha na API")}</p>`
      : "";

  reportContent.innerHTML = `
    <p class="item-subtitle">
      Estudante: <strong>${escapeHtml(result.data.student.name)}</strong> | Turma ${escapeHtml(
    result.data.student.class_name
  )} | Matrícula ${escapeHtml(result.data.student.student_id)}
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Matéria</th>
            <th class="right">T1</th>
            <th class="right">T2</th>
            <th class="right">T3</th>
            <th class="right">T4</th>
            <th class="right">Media</th>
            <th class="right">Situação</th>
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
    sourceChip.textContent = "Fonte: API real";
    sourceChip.classList.remove("source-fallback");
    return;
  }

  sourceChip.textContent = `Fonte: contingência local (${fallbackCount}/4)`;
  sourceChip.classList.add("source-fallback");
}

async function bootstrap() {
  statusMessage.textContent = "Carregando consolidado web...";

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
    subtitle.textContent = "Consolidado acadêmico carregado com dados reais da API.";
    statusMessage.textContent = "Página web carregada com API real.";
  } else {
    subtitle.textContent =
      "Parte dos dados está em contingência local. Verifique backend e endpoints mobile.";
    statusMessage.textContent = `Página web carregada com contingência em ${fallbackCount} endpoint(s).`;
  }
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : "erro inesperado";
  statusMessage.textContent = `Falha ao carregar pagina web: ${message}`;
  sourceChip.textContent = "Fonte: erro";
  sourceChip.classList.add("source-fallback");
});
