"use strict";

window.WEB_LABELS = Object.freeze({
  pageTitle: "Visão Web Acadêmica | Fundação Web de Dados",
  skipToMain: "Pular para o conteúdo principal",
  headerEyebrow: "Experiência Web",
  headerTitle: "Resumo Acadêmico",
  mobileAction: "Abrir Experiência Mobile",
  heroTitle: "Visão geral da turma",
  heroSubtitleLoading: "Carregando dados acadêmicos...",
  sourceUpdated: "Fonte: dados atualizados do sistema",
  sourceFallback(count) {
    return `Fonte: dados de segurança locais (${count}/4)`;
  },
  loadingStatus: "Carregando dados da página...",
  loadedStatus: "Página carregada com dados atualizados do sistema.",
  fallbackLoadedStatus(count) {
    return `Página carregada com dados de segurança em ${count} área(s).`;
  },
  loadingFailure(message) {
    return `Não foi possível carregar a página: ${message}`;
  },
  summaryCards: {
    weightedAverage: "Média ponderada",
    progress: "Progresso",
    classRank: "Posição na turma",
    overallAverage: "Média geral",
    eventsInMonth: "Eventos no mês",
    activeSubjects: "Disciplinas ativas",
  },
  sections: {
    tasks: "Tarefas em destaque",
    performance: "Desempenho recente",
    report: "Boletim resumido",
    shortcuts: "Navegação rápida",
  },
  shortcuts: [
    { href: "/web", label: "Visão Web" },
    { href: "/mobile", label: "Experiência Mobile" },
    { href: "/mobile/subjects", label: "Disciplinas" },
    { href: "/mobile/schedule", label: "Agenda" },
    { href: "/mobile/report", label: "Relatório" },
  ],
  emptyStates: {
    tasks: "Sem tarefas registradas no momento.",
    performance: "Sem lançamentos de desempenho recente.",
    report: "Sem dados de boletim para exibir.",
  },
  warnings: {
    panel(detail) {
      return `Dados de segurança ativos no painel: ${detail}`;
    },
    performance(detail) {
      return `Dados de segurança ativos no desempenho: ${detail}`;
    },
    report(detail) {
      return `Dados de segurança ativos no boletim: ${detail}`;
    },
  },
  studentLabels: {
    student: "Estudante",
    className: "Turma",
    enrollment: "Matrícula",
  },
  table: {
    subject: "Disciplina",
    term1: "P1",
    term2: "P2",
    term3: "P3",
    term4: "P4",
    average: "Média",
    status: "Situação",
  },
  sourceSubtitleLoaded: "Resumo acadêmico carregado com dados atualizados do sistema.",
  sourceSubtitleFallback:
    "Parte dos dados foi carregada com informações de segurança. A atualização automática será retomada em seguida.",
  errors: {
    timeout: "tempo limite excedido",
    unknown: "erro desconhecido",
    fetch: "falha de conexão com o sistema",
    http(status) {
      return `erro ${status}`;
    },
  },
  statusMap: {
    Approved: "Aprovado",
    Exam: "Exame",
    "In Progress": "Em andamento",
  },
});
