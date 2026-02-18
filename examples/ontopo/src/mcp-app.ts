/* Ontopo MCP App – restaurant availability results */

import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";

import "./global.css";
import "./mcp-app.css";

const APP_NAME = "Ontopo";
const APP_VERSION = "1.0.0";

/* --- Types (Ontopo API response) --- */

interface FormattedRequest {
  date?: string;
  mediumDate?: string;
  shortDate?: string;
  time?: string;
  size?: string;
  service?: string;
}

interface TimeOption {
  time: string;
  method: string;
  text?: string;
  score?: number;
}

interface Area {
  id: string;
  icon?: string;
  name: string;
  text?: string;
  options: TimeOption[];
  score?: number;
}

interface RecommendedSlot {
  id: string;
  time: string;
  method: string;
  text: string;
}

interface Availability {
  page?: {
    title?: string;
    showLess?: string;
    showMore?: string;
    subtitle?: string;
    generalError?: string;
  };
  areas?: Area[];
  recommended?: RecommendedSlot[];
  method?: string;
  formattedRequest?: FormattedRequest;
  venue?: { slug?: string; campaign?: unknown };
  availability_id?: string;
}

interface PostItem {
  post: {
    slug: string;
    version?: number;
    venue_name: string;
    page_slug?: string;
    availability_search?: number;
  };
  availability: Availability;
}

interface OntopoResponse {
  timer?: unknown[];
  posts?: PostItem[];
  total?: number;
}

/* --- Helpers --- */

function unwrapData(data: unknown): OntopoResponse | null {
  if (!data) return null;
  const d = data as Record<string, unknown>;
  if (d.posts && Array.isArray(d.posts)) return d as OntopoResponse;
  if (d.message && typeof d.message === "object") {
    const msg = d.message as Record<string, unknown>;
    if (msg.template_data) return msg.template_data as OntopoResponse;
    if (msg.response_content) return msg.response_content as OntopoResponse;
  }
  if (d.data && typeof d.data === "object") {
    const inner = (d.data as Record<string, unknown>);
    if (inner.posts && Array.isArray(inner.posts)) return inner as OntopoResponse;
  }
  return d as OntopoResponse;
}

function escapeHtml(str: unknown): string {
  if (str == null) return "";
  const s = String(str);
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

/** "1900" -> "19:00", "1830" -> "18:30" */
function formatTime(t: string): string {
  if (!t || t.length < 3) return t;
  const h = t.slice(0, 2);
  const m = t.slice(2, 4) || "00";
  return `${h}:${m}`;
}

function methodLabel(method: string, text?: string): string {
  if (text) return text;
  switch (method) {
    case "seat": return "אישור מיידי";
    case "standby": return "רשימת המתנה";
    case "phone": return "תיאום טלפוני";
    case "callback": return "בקשה להזמנה";
    case "disabled": return "לא זמין";
    default: return method;
  }
}

function showError(message: string) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

function showEmpty(message: string) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

/* --- Render --- */

function renderData(data: unknown) {
  const app = document.getElementById("app");
  if (!app) return;

  const payload = unwrapData(data);
  if (!payload || !Array.isArray(payload.posts) || payload.posts.length === 0) {
    showEmpty("לא נמצאו תוצאות");
    return;
  }

  const posts = payload.posts;
  const first = posts[0];
  const req = first?.availability?.formattedRequest;
  const title = first?.availability?.page?.title ?? "מצאנו מקומות פנויים עבורך";
  const subtitle = req
    ? `ל${escapeHtml(req.date ?? "")} בסביבות ${escapeHtml(req.time ?? "")} עבור ${escapeHtml(req.size ?? "")}`
    : "";

  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.setAttribute("lang", "he");

  const cardsHtml = posts
    .map((item, index) => {
      const name = escapeHtml((item.post?.venue_name ?? "").trim());
      const rec = item.availability?.recommended ?? [];
      const areas = item.availability?.areas ?? [];
      const recChips = rec.slice(0, 4).map((r) => {
        const timeStr = formatTime(r.time);
        const label = methodLabel(r.method, r.text);
        return `<span class="chip">${escapeHtml(r.text)} · ${timeStr} · ${escapeHtml(label)}</span>`;
      }).join("");
      const areasList = areas.slice(0, 3).map((a) => {
        const best = a.options.find((o) => o.method === "seat" && o.text);
        const timeStr = best ? formatTime(best.time) : "";
        const label = best ? methodLabel(best.method, best.text) : "";
        return timeStr
          ? `<span class="area-chip">${escapeHtml(a.name)} ${timeStr} · ${escapeHtml(label)}</span>`
          : `<span class="area-chip">${escapeHtml(a.name)}</span>`;
      }).join("");

      const detailsRows = (areas ?? []).map((a) => {
        const areaDesc = a.text ? ` <span class="area-desc">${escapeHtml(a.text)}</span>` : "";
        const opts = (a.options ?? []).map((o) => {
          const t = formatTime(o.time);
          const lbl = o.method === "disabled" ? "לא זמין" : methodLabel(o.method, o.text);
          return `<tr><td class="detail-time">${escapeHtml(t)}</td><td class="detail-method">${escapeHtml(lbl)}</td></tr>`;
        }).join("");
        return `
          <div class="detail-area-block">
            <div class="detail-area-name">${escapeHtml(a.name)}${areaDesc}</div>
            <table class="detail-table"><tbody>${opts}</tbody></table>
          </div>`;
      }).join("");

      return `
        <article class="venue-card" data-index="${index}">
          <h3 class="venue-name">${name}</h3>
          <div class="chips">${recChips}</div>
          ${areasList ? `<div class="areas">${areasList}</div>` : ""}
          <button type="button" class="details-toggle" aria-expanded="false" data-index="${index}">פרטים נוספים</button>
          <div class="venue-details hidden" id="details-${index}">${detailsRows}</div>
        </article>`;
    })
    .join("");

  const totalNote = payload.total != null
    ? `<p class="total-note">${escapeHtml(String(payload.total))} מקומות בסך הכול</p>`
    : "";

  app.innerHTML = `
    <div class="ontopo-container">
      <header class="ontopo-header">
        <h1 class="ontopo-title">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="ontopo-subtitle">${subtitle}</p>` : ""}
        <div class="segmented">
          <span class="segmented-item active">${escapeHtml(req?.size ?? "")}</span>
          <span class="segmented-item">${escapeHtml(req?.shortDate ?? req?.date ?? "")}</span>
          <span class="segmented-item">${escapeHtml(req?.time ?? "")}</span>
        </div>
      </header>
      <div class="venue-list">${cardsHtml}</div>
      ${totalNote}
    </div>`;

  const container = app.querySelector(".ontopo-container");
  if (container) {
    container.addEventListener("click", (e: Event) => {
      const target = (e.target as HTMLElement).closest(".details-toggle");
      if (!target) return;
      const idx = (target as HTMLElement).getAttribute("data-index");
      if (idx == null) return;
      const details = app.querySelector(`#details-${idx}`);
      const expanded = (target as HTMLElement).getAttribute("aria-expanded") === "true";
      if (details) {
        details.classList.toggle("hidden", expanded);
        (target as HTMLElement).setAttribute("aria-expanded", String(!expanded));
        (target as HTMLElement).textContent = expanded ? "פרטים נוספים" : "תראו לי פחות";
      }
    });
  }
}

/* --- SDK & message handling --- */

const app = new App({ name: APP_NAME, version: APP_VERSION });

window.addEventListener("message", (event: MessageEvent) => {
  const msg = event.data;
  if (!msg) return;

  if (msg.jsonrpc === "2.0") {
    if (msg.method === "ui/notifications/tool-result" && msg.params) {
      const data = msg.params.structuredContent ?? msg.params;
      renderData(data);
      return;
    }

    if (msg.method === "ui/notifications/host-context-changed" && msg.params) {
      if (msg.params.theme) applyDocumentTheme(msg.params.theme);
      if (msg.params.styles?.css?.fonts) applyHostFonts(msg.params.styles.css.fonts);
      if (msg.params.styles?.variables) applyHostStyleVariables(msg.params.styles.variables);
      if (msg.params.displayMode === "fullscreen") {
        document.body.classList.add("fullscreen-mode");
      } else {
        document.body.classList.remove("fullscreen-mode");
      }
      return;
    }

    if (msg.method === "ui/notifications/tool-cancelled") {
      showError("הפעולה בוטלה");
      return;
    }

    if (msg.id !== undefined && msg.method === "ui/resource-teardown") {
      window.parent.postMessage({ jsonrpc: "2.0", id: msg.id, result: {} }, "*");
      return;
    }
  }
});

const cleanupResize = app.setupSizeChangedNotifications();
window.addEventListener("beforeunload", () => cleanupResize());

console.info("Ontopo MCP App initialized");
