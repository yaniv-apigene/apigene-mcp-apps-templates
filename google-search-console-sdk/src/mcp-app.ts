/* ============================================
   Google Search Console MCP App (SDK Version)
   Uses @modelcontextprotocol/ext-apps SDK
   ============================================ */

import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import Chart from "chart.js/auto";

import "./global.css";
import "./mcp-app.css";

const APP_NAME = "Google Search Console";
const APP_VERSION = "1.0.0";

const CHART_COLORS = [
  "#4285f4", "#34a853", "#fbbc04", "#ea4335",
  "#8ab4f8", "#81c995", "#fdd663", "#f28b82",
  "#669df6", "#66bb6a", "#ffc107", "#ef5350",
];

function unwrapData(data: any): any {
  if (!data) return null;
  if (data.columns || (Array.isArray(data.rows) && data.rows.length > 0) ||
      (typeof data === "object" && !data.message)) {
    return data;
  }
  if (data.message?.template_data) return data.message.template_data;
  if (data.message?.response_content) return data.message.response_content;
  if (data.data?.results) return data.data.results;
  if (data.data?.items) return data.data.items;
  if (data.data?.records) return data.data.records;
  if (data.results) return data.results;
  if (data.items) return data.items;
  if (data.records) return data.records;
  if (Array.isArray(data.rows)) return data;
  if (Array.isArray(data)) return { rows: data };
  return data;
}

function escapeHtml(str: any): string {
  if (typeof str !== "string") return String(str);
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showError(message: string) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

function showEmpty(message: string = "No data available.") {
  const app = document.getElementById("app");
  if (app) app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function showChartError(container: Element | null | undefined, message: string) {
  if (!container) return;
  const wrapper = container.querySelector(".chart-wrapper");
  if (wrapper) {
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? "#9aa0a6" : "#5f6368";
    const bgColor = isDark ? "#2a2d35" : "#f8f9fa";
    wrapper.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;padding:40px;background:${bgColor};border-radius:8px;color:${textColor};text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">📊</div>
        <div style="font-size:14px;font-weight:500;">${escapeHtml(message)}</div>
      </div>
    `;
  }
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return num.toLocaleString();
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return (num * 100).toFixed(2) + "%";
}

function calculateTrend(current: number, previous: number): { value: number; percentage: number; direction: "up" | "down" | "neutral" } {
  if (!previous || previous === 0) return { value: 0, percentage: 0, direction: "neutral" };
  const change = current - previous;
  const percentage = (change / previous) * 100;
  return {
    value: change,
    percentage: Math.abs(percentage),
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

function animateCounter(element: HTMLElement, start: number, end: number, duration: number = 1000) {
  const startTime = performance.now();
  const isPercentage = element.textContent?.includes("%");
  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = start + (end - start) * easeOutQuart;
    element.textContent = isPercentage ? current.toFixed(2) + "%" : formatNumber(Math.floor(current));
    if (progress < 1) requestAnimationFrame(update);
    else element.textContent = isPercentage ? formatPercentage(end) : formatNumber(end);
  }
  requestAnimationFrame(update);
}

function createSparkline(container: HTMLElement, data: number[], color: string) {
  if (!data || data.length === 0) return;
  container.innerHTML = "";
  const width = container.offsetWidth || 100;
  const height = 32;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  path.setAttribute("points", points);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  container.appendChild(svg);
}

function exportToCSV(tableData: any, filename: string = "search-console-data.csv") {
  if (!tableData?.columns || !tableData?.rows) return;
  const headers = tableData.columns.join(",");
  const rows = tableData.rows.map((row: any[]) =>
    row.map((cell: any) => {
      const str = String(cell ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(",")
  ).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function exportToJSON(data: any, filename: string = "search-console-data.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function normalizeTableData(data: any) {
  const unwrapped = unwrapData(data);
  if (!unwrapped) return null;
  if (Array.isArray(unwrapped.columns) && Array.isArray(unwrapped.rows)) {
    return { columns: unwrapped.columns, rows: unwrapped.rows };
  }
  if (Array.isArray(unwrapped.rows) && unwrapped.rows.length > 0) {
    const firstRow = unwrapped.rows[0];
    if (typeof firstRow === "object" && !Array.isArray(firstRow)) {
      const columns: string[] = [];
      const rows: any[] = [];
      if (firstRow.keys && Array.isArray(firstRow.keys)) {
        columns.push("Date");
        Object.keys(firstRow).forEach((key) => {
          if (key !== "keys") columns.push(key.charAt(0).toUpperCase() + key.slice(1));
        });
        unwrapped.rows.forEach((row: any) => {
          const rowArray = [row.keys?.[0] ?? ""];
          Object.keys(row).forEach((key) => {
            if (key !== "keys") rowArray.push(row[key]);
          });
          rows.push(rowArray);
        });
      } else {
        Object.keys(firstRow).forEach((key) =>
          columns.push(key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "))
        );
        unwrapped.rows.forEach((row: any) =>
          rows.push(Object.keys(firstRow).map((key) => row[key]))
        );
      }
      return { columns, rows };
    }
  }
  return null;
}

function calculateSummary(tableData: any) {
  if (!tableData?.columns || !tableData?.rows || tableData.rows.length === 0) return null;
  const columns = tableData.columns;
  const rows = tableData.rows;
  const summary: Record<string, { total: number; average: number; max: number; min: number; count: number }> = {};
  for (let i = 1; i < columns.length; i++) {
    const colName = columns[i];
    const values = rows.map((row: any[]) => {
      const val = row[i];
      return typeof val === "number" ? val : parseFloat(val) || 0;
    }).filter((v: number) => !isNaN(v));
    if (values.length > 0) {
      const sum = values.reduce((a: number, b: number) => a + b, 0);
      summary[colName] = {
        total: sum,
        average: sum / values.length,
        max: Math.max(...values),
        min: Math.min(...values),
        count: values.length,
      };
    }
  }
  return summary;
}

function normalizeLineChartData(tableData: any) {
  if (!tableData?.columns || !tableData?.rows || tableData.rows.length === 0) return null;
  const columns = tableData.columns;
  const rows = tableData.rows;
  const labels = rows.map((row: any[]) => String(row[0] ?? ""));
  const series: { name: string; data: number[] }[] = [];
  for (let i = 1; i < columns.length; i++) {
    series.push({
      name: String(columns[i] ?? `Series ${i}`),
      data: rows.map((row: any[]) => {
        const val = row[i];
        return typeof val === "number" ? val : parseFloat(val) || 0;
      }),
    });
  }
  return { labels, series };
}

function normalizePieChartData(tableData: any) {
  if (!tableData?.columns || !tableData?.rows || tableData.rows.length === 0) return null;
  const columns = tableData.columns;
  const rows = tableData.rows;
  const labels = rows.map((row: any[]) => String(row[0] ?? ""));
  let valueColumnIndex = 1;
  for (let i = 1; i < columns.length; i++) {
    const sampleValue = rows[0]?.[i];
    if (typeof sampleValue === "number" || !isNaN(parseFloat(sampleValue))) {
      valueColumnIndex = i;
      break;
    }
  }
  const values = rows.map((row: any[]) => {
    const val = row[valueColumnIndex];
    return typeof val === "number" ? val : parseFloat(val) || 0;
  });
  return { labels, values };
}

const iconGoogleSearchConsole = () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
const iconClick = () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 9V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-4 4v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2M9 9h6m-6 6h6"/></svg>`;
const iconImpression = () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s5-8 11-8 11 8 11 8-5 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const iconPosition = () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>`;
const iconCTR = () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7l5 5-5 5"/><path d="M6 7l5 5-5 5"/></svg>`;
const iconDownload = () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const iconTable = () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`;
const iconChart = () => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
const iconTrendUp = () => `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
const iconTrendDown = () => `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`;

let lineChartInstance: Chart | null = null;
let pieChartInstance: Chart | null = null;

function getChartColors() {
  const isDark = document.body.classList.contains("dark");
  return {
    gridColor: isDark ? "rgba(95, 99, 104, 0.2)" : "rgba(218, 220, 224, 0.5)",
    textColor: isDark ? "#9aa0a6" : "#5f6368",
    backgroundColor: isDark ? "#202124" : "#ffffff",
    tooltipBg: isDark ? "rgba(32, 33, 36, 0.95)" : "rgba(255, 255, 255, 0.98)",
    tooltipBorder: isDark ? "rgba(66, 133, 244, 0.3)" : "rgba(66, 133, 244, 0.2)",
  };
}

function createGradient(ctx: CanvasRenderingContext2D, color: string, height: number): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const isDark = document.body.classList.contains("dark");
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${isDark ? 0.25 : 0.15})`);
  gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${isDark ? 0.15 : 0.08})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  return gradient;
}

function renderLineChart(canvas: HTMLCanvasElement, chartData: { labels: string[]; series: { name: string; data: number[] }[] }, visibleSeries: Set<number> | null = null) {
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }
  const { labels, series } = chartData;
  if (!labels?.length || !series?.length || !canvas?.getContext) return;
  const activeSeries = visibleSeries ? series.filter((_, i) => visibleSeries.has(i)) : series;
  const colors = getChartColors();
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const datasets = activeSeries.map((s, index) => {
    const originalIndex = series.indexOf(s);
    const baseColor = CHART_COLORS[originalIndex % CHART_COLORS.length];
    const gradient = createGradient(ctx, baseColor, canvas.height);
    return {
      label: s.name,
      data: s.data,
      borderColor: baseColor,
      backgroundColor: gradient,
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
      spanGaps: true,
    };
  });
  lineChartInstance = new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1500 },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: colors.tooltipBg,
          titleColor: colors.textColor,
          bodyColor: colors.textColor,
          borderColor: colors.tooltipBorder,
          borderWidth: 2,
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, maxRotation: 45 },
          border: { display: false },
        },
        y: {
          grid: { color: colors.gridColor },
          ticks: {
            color: colors.textColor,
            callback: (value: unknown) => {
              const v = Number(value);
              if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
              if (v >= 1e3) return (v / 1e3).toFixed(1) + "k";
              return String(v);
            },
          },
          border: { display: false },
          beginAtZero: false,
        },
      },
      interaction: { mode: "index", intersect: false },
    },
  });
}

function renderPieChart(canvas: HTMLCanvasElement, values: number[], labels: string[] | null = null) {
  if (pieChartInstance) {
    pieChartInstance.destroy();
    pieChartInstance = null;
  }
  if (!values?.length || !canvas?.getContext) return;
  const chartColors = getChartColors();
  const isDark = document.body.classList.contains("dark");
  const pieColors = values.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
  pieChartInstance = new Chart(canvas, {
    type: "pie",
    data: {
      labels: labels ?? values.map((_, i) => `Item ${i + 1}`),
      datasets: [{
        data: values,
        backgroundColor: pieColors,
        borderColor: isDark ? "rgba(26, 29, 36, 0.8)" : "#ffffff",
        borderWidth: 3,
        hoverOffset: 12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chartColors.tooltipBg,
          titleColor: chartColors.textColor,
          bodyColor: chartColors.textColor,
          borderColor: chartColors.tooltipBorder,
          borderWidth: 2,
          callbacks: {
            label: (ctx: any) => {
              const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : "0";
              return `${ctx.label}: ${formatNumber(ctx.parsed)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function sortTable(table: HTMLTableElement, columnIndex: number) {
  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const header = table.querySelector(`th[data-column="${columnIndex}"]`);
  if (!header) return;
  const isAscending = header.classList.contains("sort-asc");
  table.querySelectorAll("th").forEach((th) => th.classList.remove("sort-asc", "sort-desc"));
  header.classList.add(isAscending ? "sort-desc" : "sort-asc");
  rows.sort((a, b) => {
    const aCell = a.cells[columnIndex]?.textContent ?? "";
    const bCell = b.cells[columnIndex]?.textContent ?? "";
    const aNum = parseFloat(String(aCell).replace(/[^0-9.-]/g, ""));
    const bNum = parseFloat(String(bCell).replace(/[^0-9.-]/g, ""));
    if (!isNaN(aNum) && !isNaN(bNum)) return isAscending ? bNum - aNum : aNum - bNum;
    return isAscending ? (bCell as string).localeCompare(aCell as string) : (aCell as string).localeCompare(bCell as string);
  });
  rows.forEach((row) => tbody.appendChild(row));
}

function setupToolbarInteractions(tableData: any) {
  document.querySelectorAll(".date-preset-btn").forEach((btn) => {
    btn.addEventListener("click", function (this: HTMLElement) {
      document.querySelectorAll(".date-preset-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });
  document.querySelectorAll(".view-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", function (this: HTMLElement) {
      const view = this.dataset.view;
      document.querySelectorAll(".view-toggle-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const chartsContainer = document.querySelector(".charts-grid");
      const tableContainer = document.getElementById("data-table-container");
      if (view === "table") {
        if (chartsContainer) (chartsContainer as HTMLElement).style.display = "none";
        if (tableContainer) tableContainer.style.display = "block";
      } else {
        if (chartsContainer) (chartsContainer as HTMLElement).style.display = "grid";
        if (tableContainer) tableContainer.style.display = "none";
      }
    });
  });
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", function (this: HTMLElement) {
      if (this.dataset.filter === "all") {
        document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        this.classList.add("active");
      } else {
        document.querySelectorAll(".filter-chip").forEach((c) => { if (c.dataset.filter === "all") c.classList.remove("active"); });
        this.classList.toggle("active");
      }
    });
  });
  document.querySelectorAll(".data-table th.sortable").forEach((th) => {
    const col = th.getAttribute("data-column");
    if (col != null) {
      th.addEventListener("click", () => {
        const table = document.querySelector(".data-table") as HTMLTableElement;
        if (table) sortTable(table, parseInt(col, 10));
      });
    }
  });
}

function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;
  if (!data) {
    showEmpty("No data received");
    return;
  }
  try {
    const tableData = normalizeTableData(data);
    if (!tableData?.rows?.length) {
      showEmpty("No valid data available");
      return;
    }
    const summary = calculateSummary(tableData);
    const lineChartData = normalizeLineChartData(tableData);
    const pieChartData = normalizePieChartData(tableData);

    const container = document.createElement("div");
    container.className = "dashboard-container";

    container.innerHTML = `
      <div class="gsc-header">
        <div class="gsc-logo">
          <div class="gsc-logo-icon"><span class="icon-inline">${iconGoogleSearchConsole()}</span></div>
          <span class="gsc-title"><span class="gsc-google">Google</span> <span class="gsc-search-console">Search Console</span></span>
        </div>
      </div>
      <div class="dashboard-header">
        <h1>Performance</h1>
        <div class="meta">
          <span>${tableData.rows.length} data points</span>
          <span>${tableData.columns.length - 1} metrics</span>
          <span>Last updated: ${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      <div class="dashboard-toolbar">
        <div class="toolbar-left">
          <div class="date-presets">
            <button class="date-preset-btn active" data-preset="7d">Last 7 days</button>
            <button class="date-preset-btn" data-preset="30d">Last 30 days</button>
            <button class="date-preset-btn" data-preset="90d">Last 90 days</button>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="view-toggle">
            <button class="view-toggle-btn active" data-view="chart"><span class="icon-inline">${iconChart()}</span> Charts</button>
            <button class="view-toggle-btn" data-view="table"><span class="icon-inline">${iconTable()}</span> Table</button>
          </div>
          <button class="action-btn" data-export="csv"><span class="icon-inline">${iconDownload()}</span> Export CSV</button>
          <button class="action-btn" data-export="json"><span class="icon-inline">${iconDownload()}</span> Export JSON</button>
        </div>
      </div>
      <div class="quick-filters">
        <span style="font-size:12px;color:var(--google-grey-600);font-weight:500;margin-right:8px;">Quick filters:</span>
        <button class="filter-chip active" data-filter="all">All</button>
        <button class="filter-chip" data-filter="top">Top Performers</button>
        <button class="filter-chip" data-filter="trending">Trending</button>
        <button class="filter-chip" data-filter="declining">Declining</button>
      </div>
    `;

    if (summary && Object.keys(summary).length > 0) {
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "summary-cards";
      const summaryKeys = Object.keys(summary);
      const clickKey = summaryKeys.find((k) => k.toLowerCase().includes("click") && !k.toLowerCase().includes("ctr"));
      const impressionKey = summaryKeys.find((k) => k.toLowerCase().includes("impression"));
      const positionKey = summaryKeys.find((k) => k.toLowerCase().includes("position"));
      const ctrKey = summaryKeys.find((k) => k.toLowerCase().includes("ctr") || k.toLowerCase() === "click-through rate");
      const hasSpecialMetrics = clickKey && impressionKey && positionKey && ctrKey;

      const getIcon = (type: string) => {
        if (type === "click") return iconClick();
        if (type === "impression") return iconImpression();
        if (type === "position") return iconPosition();
        if (type === "ctr") return iconCTR();
        return "";
      };
      const createMetricItem = (key: string, stat: { total: number; average: number }, type: string) => {
        const div = document.createElement("div");
        div.className = `metric-item ${type}`;
        let displayValue = formatNumber(stat.total);
        let displayChange = `Avg: ${formatNumber(Number(stat.average.toFixed(2)))}`;
        if (type === "ctr") {
          displayValue = formatPercentage(stat.average);
          displayChange = `Total: ${formatNumber(stat.total)}`;
        }
        const rows = tableData.rows;
        const colIdx = tableData.columns.indexOf(key);
        let trend = { direction: "neutral" as const, percentage: 0 };
        let sparklineData: number[] = [];
        if (colIdx >= 0 && rows.length >= 2) {
          const mid = Math.floor(rows.length / 2) || 1;
          const firstHalf = rows.slice(0, mid).reduce((s: number, row: any[]) => s + (parseFloat(row[colIdx]) || 0), 0) / mid;
          const secondHalf = rows.slice(mid).reduce((s: number, row: any[]) => s + (parseFloat(row[colIdx]) || 0), 0) / Math.max(rows.length - mid, 1);
          trend = calculateTrend(secondHalf, firstHalf);
          sparklineData = rows.map((row: any[]) => parseFloat(row[colIdx]) || 0);
        }
        const trendIcon = trend.direction === "up" ? iconTrendUp() : trend.direction === "down" ? iconTrendDown() : "";
        const trendClass = trend.direction === "up" ? "trend-up" : trend.direction === "down" ? "trend-down" : "trend-neutral";
        div.innerHTML = `
          <div class="metric-icon"><span class="icon-inline">${getIcon(type)}</span></div>
          <div class="metric-content">
            <div class="metric-label">${escapeHtml(key)}</div>
            <div class="metric-value" data-value="${stat.total}">${displayValue}</div>
            <div class="metric-change">${displayChange}${trend.percentage ? `<span class="trend-indicator ${trendClass}"><span class="trend-icon icon-inline">${trendIcon}</span>${trend.percentage.toFixed(1)}%</span>` : ""}</div>
            <div class="sparkline-container" data-sparkline="${sparklineData.join(",")}" data-color="${type === "click" ? "#4285f4" : type === "impression" ? "#34a853" : type === "position" ? "#fbbc04" : "#8ab4f8"}"></div>
          </div>
        `;
        const valueEl = div.querySelector(".metric-value") as HTMLElement;
        const sparkEl = div.querySelector(".sparkline-container") as HTMLElement;
        if (valueEl) setTimeout(() => animateCounter(valueEl, 0, type === "ctr" ? stat.average * 100 : stat.total, 1000), 100);
        if (sparkEl && sparklineData.length) setTimeout(() => createSparkline(sparkEl, sparklineData, sparkEl.dataset.color || "#4285f4"), 100);
        return div;
      };

      if (hasSpecialMetrics) {
        const horizontalCard = document.createElement("div");
        horizontalCard.className = "summary-card horizontal-card";
        horizontalCard.appendChild(createMetricItem(clickKey, summary[clickKey], "click"));
        horizontalCard.appendChild(createMetricItem(impressionKey, summary[impressionKey], "impression"));
        horizontalCard.appendChild(createMetricItem(positionKey, summary[positionKey], "position"));
        horizontalCard.appendChild(createMetricItem(ctrKey, summary[ctrKey], "ctr"));
        cardsContainer.appendChild(horizontalCard);
        cardsContainer.classList.add("horizontal-layout");
      }
      summaryKeys.filter((k) => !hasSpecialMetrics || ![clickKey, impressionKey, positionKey, ctrKey].includes(k)).slice(0, 4).forEach((key) => {
        const stat = summary[key];
        const card = document.createElement("div");
        card.className = "summary-card";
        card.innerHTML = `
          <div class="card-label">${escapeHtml(key)}</div>
          <div class="card-value">${formatNumber(stat.total)}</div>
          <div class="card-change">Avg: ${formatNumber(Number(stat.average.toFixed(2)))}</div>
          <div class="card-details"><div>Max: ${formatNumber(stat.max)}</div><div>Min: ${formatNumber(stat.min)}</div><div>Count: ${stat.count}</div></div>
        `;
        card.addEventListener("click", () => card.classList.toggle("active"));
        cardsContainer.appendChild(card);
      });
      container.appendChild(cardsContainer);
    }

    const chartsContainer = document.createElement("div");
    chartsContainer.className = "charts-grid";

    if (lineChartData?.series?.length) {
      const lineCard = document.createElement("div");
      lineCard.className = "chart-card";
      const chartWrapper = document.createElement("div");
      chartWrapper.className = "chart-wrapper";
      const canvas = document.createElement("canvas");
      canvas.id = "linechart";
      chartWrapper.appendChild(canvas);
      const legend = document.createElement("div");
      legend.className = "chart-legend";
      legend.id = "linechart-legend";
      const visibleSeries = new Set(lineChartData.series.map((_, i) => i));
      lineChartData.series.forEach((s, i) => {
        const item = document.createElement("div");
        item.className = "legend-item";
        item.dataset.seriesIndex = String(i);
        item.innerHTML = `<span class="legend-color" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span><span>${escapeHtml(s.name)}</span>`;
        item.addEventListener("click", () => {
          if (visibleSeries.has(i)) {
            visibleSeries.delete(i);
            item.classList.add("disabled");
          } else {
            visibleSeries.add(i);
            item.classList.remove("disabled");
          }
          renderLineChart(canvas, lineChartData, visibleSeries);
        });
        legend.appendChild(item);
      });
      chartWrapper.appendChild(legend);
      const title = document.createElement("div");
      title.className = "chart-title";
      title.textContent = "Trend Over Time";
      lineCard.appendChild(title);
      lineCard.appendChild(chartWrapper);
      chartsContainer.appendChild(lineCard);
    }

    if (pieChartData?.values?.length) {
      const pieCard = document.createElement("div");
      pieCard.className = "chart-card";
      const chartWrapper = document.createElement("div");
      chartWrapper.className = "chart-wrapper";
      const canvas = document.createElement("canvas");
      canvas.id = "piechart";
      chartWrapper.appendChild(canvas);
      const legend = document.createElement("div");
      legend.className = "chart-legend";
      pieChartData.labels.forEach((label, i) => {
        const value = pieChartData.values[i];
        const total = pieChartData.values.reduce((a, b) => a + b, 0);
        const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `<span class="legend-color" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span><span>${escapeHtml(String(label))}</span><span style="margin-left:auto;color:var(--google-grey-600);font-weight:600;">${formatNumber(value)} (${pct}%)</span>`;
        legend.appendChild(item);
      });
      chartWrapper.appendChild(legend);
      const title = document.createElement("div");
      title.className = "chart-title";
      title.textContent = "Distribution";
      pieCard.appendChild(title);
      pieCard.appendChild(chartWrapper);
      chartsContainer.appendChild(pieCard);
    }
    container.appendChild(chartsContainer);

    const tableContainer = document.createElement("div");
    tableContainer.className = "data-table-container";
    tableContainer.id = "data-table-container";
    tableContainer.style.display = "none";
    const table = document.createElement("table");
    table.className = "data-table";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    tableData.columns.forEach((col: string, index: number) => {
      const th = document.createElement("th");
      th.className = index > 0 ? "sortable" : "";
      th.textContent = col;
      th.dataset.column = String(index);
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    tableData.rows.forEach((row: any[]) => {
      const tr = document.createElement("tr");
      row.forEach((cell: any) => {
        const td = document.createElement("td");
        td.textContent = typeof cell === "number" ? formatNumber(cell) : String(cell ?? "");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    app.innerHTML = "";
    app.appendChild(container);

    (window as any).currentTableData = tableData;
    setupToolbarInteractions(tableData);

    document.querySelectorAll(".action-btn[data-export]").forEach((btn) => {
      btn.addEventListener("click", function (this: HTMLElement) {
        const format = this.getAttribute("data-export") as "csv" | "json";
        const t = (window as any).currentTableData;
        if (!t) return;
        if (format === "csv") exportToCSV(t);
        else exportToJSON(t);
      });
    });

    setTimeout(() => {
      if (lineChartData?.series?.length) {
        const lineCanvas = document.getElementById("linechart") as HTMLCanvasElement;
        if (lineCanvas) {
          try {
            renderLineChart(lineCanvas, lineChartData, new Set(lineChartData.series.map((_, i) => i)));
          } catch (e) {
            showChartError(lineCanvas.closest(".chart-card"), (e as Error).message);
          }
        }
      }
      if (pieChartData?.values?.length) {
        const pieCanvas = document.getElementById("piechart") as HTMLCanvasElement;
        if (pieCanvas) {
          try {
            renderPieChart(pieCanvas, pieChartData.values, pieChartData.labels);
          } catch (e) {
            showChartError(pieCanvas.closest(".chart-card"), (e as Error).message);
          }
        }
      }
    }, 100);
  } catch (error: any) {
    console.error("Render error:", error);
    showError(`Error rendering data: ${error.message}`);
  }
}

const app = new App({ name: APP_NAME, version: APP_VERSION });

app.ontoolresult = (result: CallToolResult) => {
  const data = result.structuredContent ?? result;
  renderData(data);
};

app.ontoolinput = () => {};

app.onhostcontextchanged = (ctx: McpUiHostContext) => {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.displayMode === "fullscreen") document.body.classList.add("fullscreen-mode");
  else document.body.classList.remove("fullscreen-mode");
  const lineCanvas = document.getElementById("linechart") as HTMLCanvasElement;
  const pieCanvas = document.getElementById("piechart") as HTMLCanvasElement;
  if (lineCanvas && lineChartInstance) {
    const chartData = (lineChartInstance as any).data;
    const visibleSeries = new Set<number>();
    document.querySelectorAll(".legend-item:not(.disabled)").forEach((el) => {
      const i = (el as HTMLElement).dataset.seriesIndex;
      if (i != null) visibleSeries.add(parseInt(i, 10));
    });
    const series = chartData.datasets?.map((d: any) => ({ name: d.label, data: d.data })) ?? [];
    if (series.length) renderLineChart(lineCanvas, { labels: chartData.labels ?? [], series }, visibleSeries);
  }
  if (pieCanvas && pieChartInstance) {
    const chartData = (pieChartInstance as any).data;
    renderPieChart(pieCanvas, chartData.datasets?.[0]?.data ?? [], chartData.labels ?? []);
  }
};

app.ontoolcancelled = (params) => {
  showError(`Operation cancelled: ${params.reason ?? "Unknown reason"}`);
};

app.onteardown = async () => {
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }
  if (pieChartInstance) {
    pieChartInstance.destroy();
    pieChartInstance = null;
  }
  return {};
};

app.onerror = (error) => {
  showError(error.message ?? "An error occurred");
};

app
  .connect()
  .then(() => {
    const ctx = app.getHostContext();
    if (ctx) {
      if (ctx.theme) applyDocumentTheme(ctx.theme);
      if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
      if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to host:", err);
    showError("Failed to connect to MCP host");
  });

const cleanupResize = app.setupSizeChangedNotifications();
window.addEventListener("beforeunload", () => cleanupResize());

export { app };
