/* ============================================
   ONTOPO MCP APP (STANDALONE MODE)
   ============================================

   Restaurant availability results display.
   Uses the official @modelcontextprotocol/ext-apps SDK
   in standalone mode with app.connect().
   ============================================ */

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
    const inner = d.data as Record<string, unknown>;
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
  const appEl = document.getElementById("app");
  if (appEl) appEl.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

function showEmpty(message: string = "לא נמצאו תוצאות") {
  const appEl = document.getElementById("app");
  if (appEl) appEl.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

/* --- Render --- */

function renderData(data: unknown) {
  const appEl = document.getElementById("app");
  if (!appEl) return;

  if (!data) {
    showEmpty("לא התקבלו נתונים");
    return;
  }

  try {
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

    appEl.innerHTML = `
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

    const container = appEl.querySelector(".ontopo-container");
    if (container) {
      container.addEventListener("click", (e: Event) => {
        const target = (e.target as HTMLElement).closest(".details-toggle");
        if (!target) return;
        const idx = (target as HTMLElement).getAttribute("data-index");
        if (idx == null) return;
        const details = appEl.querySelector(`#details-${idx}`);
        const expanded = (target as HTMLElement).getAttribute("aria-expanded") === "true";
        if (details) {
          details.classList.toggle("hidden", expanded);
          (target as HTMLElement).setAttribute("aria-expanded", String(!expanded));
          (target as HTMLElement).textContent = expanded ? "פרטים נוספים" : "תראו לי פחות";
        }
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    app.sendLog({ level: "error", data: `Render error: ${errorMessage}`, logger: APP_NAME });
    showError(`שגיאה בהצגת הנתונים: ${errorMessage}`);
  }
}

/* ============================================
   HOST CONTEXT HANDLER
   ============================================ */

function handleHostContextChanged(ctx: Record<string, unknown> | null) {
  if (!ctx) return;

  if (ctx.theme) {
    applyDocumentTheme(ctx.theme as string);
    if (ctx.theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }

  if ((ctx.styles as Record<string, unknown>)?.css) {
    const css = (ctx.styles as Record<string, unknown>).css as Record<string, unknown>;
    if (css.fonts) {
      applyHostFonts(css.fonts as string);
    }
  }

  if ((ctx.styles as Record<string, unknown>)?.variables) {
    applyHostStyleVariables((ctx.styles as Record<string, unknown>).variables as Record<string, string>);
  }

  if (ctx.displayMode === "fullscreen") {
    document.body.classList.add("fullscreen-mode");
  } else {
    document.body.classList.remove("fullscreen-mode");
  }
}

/* ============================================
   SDK APP INSTANCE (STANDALONE MODE)
   ============================================ */

const app = new App(
  { name: APP_NAME, version: APP_VERSION },
  { availableDisplayModes: ["inline", "fullscreen"] }
);

app.onteardown = async () => {
  app.sendLog({ level: "info", data: "Resource teardown requested", logger: APP_NAME });
  return {};
};

app.ontoolinput = (params) => {
  app.sendLog({ level: "info", data: `Tool input received: ${JSON.stringify(params.arguments)}`, logger: APP_NAME });
};

app.ontoolresult = (params) => {
  app.sendLog({ level: "info", data: "Tool result received", logger: APP_NAME });

  // Check for tool execution errors
  if (params.isError) {
    app.sendLog({ level: "error", data: `Tool execution failed: ${JSON.stringify(params.content)}`, logger: APP_NAME });
    const errorText =
      params.content?.map((c: { text?: string }) => c.text || "").join("\n") ||
      "Tool execution failed";
    showError(errorText);
    return;
  }

  const data = params.structuredContent || params.content;
  if (data !== undefined) {
    renderData(data);
  } else {
    app.sendLog({ level: "warning", data: `Tool result received but no data found: ${JSON.stringify(params)}`, logger: APP_NAME });
    showEmpty("לא התקבלו נתונים");
  }
};

app.ontoolcancelled = (params) => {
  const reason = params.reason || "Unknown reason";
  app.sendLog({ level: "info", data: `Tool cancelled: ${reason}`, logger: APP_NAME });
  showError(`הפעולה בוטלה: ${reason}`);
};

app.onerror = (error) => {
  app.sendLog({ level: "error", data: `App error: ${JSON.stringify(error)}`, logger: APP_NAME });
};

app.onhostcontextchanged = (ctx) => {
  app.sendLog({ level: "info", data: `Host context changed: ${JSON.stringify(ctx)}`, logger: APP_NAME });
  handleHostContextChanged(ctx as Record<string, unknown> | null);
};

/* ============================================
   CONNECT TO HOST
   ============================================ */

app
  .connect()
  .then(() => {
    app.sendLog({ level: "info", data: "MCP App connected to host", logger: APP_NAME });
    const ctx = app.getHostContext();
    if (ctx) {
      handleHostContextChanged(ctx as Record<string, unknown> | null);
    }
  })
  .catch((error) => {
    app.sendLog({ level: "error", data: `Failed to connect to MCP host: ${JSON.stringify(error)}`, logger: APP_NAME });
  });

export {};
