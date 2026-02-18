# Contributing to MCP Apps

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Adding a New Example Template](#adding-a-new-example-template)
- [Improving Existing Templates](#improving-existing-templates)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## Ways to Contribute

- **New example template** — Add a template for an API or service not yet covered
- **Improve an existing template** — Better UI, more data fields, dark mode fixes, accessibility
- **Base template improvements** — Improvements to `base-template` or `base-template-sdk`
- **Playground tooling** — Improvements to the local preview tools
- **Bug fixes** — Fix rendering bugs, protocol issues, or build problems
- **Documentation** — Improve README, guides, or inline comments

---

## Development Setup

**Prerequisites:** Node.js ≥ 18 (Node 22 recommended)

```bash
# Fork and clone
git clone https://github.com/<your-username>/mcp-apps.git
cd mcp-apps

# Install root dependencies
npm install

# Start the playground to verify setup
npm run dev
# Open http://localhost:4311
```

---

## Adding a New Example Template

### 1. Name your template

Use kebab-case matching `<service>-<operation>` — e.g. `stripe-list-charges`, `jira-search-issues`.

### 2. Copy the base template

```bash
cp -r examples/base-template-sdk examples/my-service-my-operation
cd examples/my-service-my-operation
```

### 3. Install and verify the build works

```bash
npm install
npm run build
# Should produce dist/mcp-app.html with no errors
```

### 4. Customize the template

**`src/mcp-app.ts`** (required):
- Set `APP_NAME` and `APP_VERSION`
- Implement `renderData(data)` — this is the core of your template
- Use `unwrapData(data)` for nested MCP payloads
- Use `escapeHtml(str)` for any user/API content inserted into the DOM

**`src/mcp-app.css`** (required):
- Add your template-specific styles
- Support `body.dark` for dark mode
- Do not modify `global.css`

**`mcp-app.html`** (required):
- Update `<title>` to match your template name

**`package.json`** (required):
- Update `name` and `description`

### 5. Add a `response.json`

Add a real (or realistic) API response at `examples/my-template/response.json`. This is used by the playground for local preview.

```json
{
  "results": [
    { "id": "1", "title": "Example Result", "url": "https://example.com" }
  ]
}
```

### 6. Test in the playground

```bash
cd ../..
npm run lab
# Open http://localhost:4311 and select your template from the dropdown
```

### 7. Build checklist

Before submitting a PR, verify:

- [ ] `npm run build` succeeds in your template directory
- [ ] Template renders correctly with `response.json` data in the playground
- [ ] Dark mode looks correct (toggle in playground)
- [ ] No `app.connect()` calls — keep manual message handling
- [ ] All user/API content uses `escapeHtml()`
- [ ] `ui/resource-teardown` handler is present and responds correctly
- [ ] No hardcoded credentials or API keys
- [ ] `node_modules/` and `dist/` are not committed (covered by `.gitignore`)

---

## Improving Existing Templates

When modifying an existing template:

1. Read the existing code thoroughly before changing anything
2. Keep the same visual style unless improving it meaningfully
3. Do not refactor working code just to match your personal style
4. Ensure the build still passes
5. Test with both the default mock data and real API responses if possible

---

## Pull Request Process

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/stripe-list-charges
   ```

2. **Make your changes** following the style guide below

3. **Test your changes** locally — run the playground and verify everything works

4. **Commit** with a clear, descriptive message:
   ```
   feat(examples): add stripe-list-charges template
   fix(base-template-sdk): handle empty tool result gracefully
   docs: update contributing guide with response.json example
   ```

5. **Open a Pull Request** against `main` with:
   - A clear title and description
   - What the template does / what the fix addresses
   - A screenshot or screen recording for visual changes (helpful but not required)

6. **Address review feedback** promptly

### Commit Message Format

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`
Scopes: `examples`, `base-template`, `base-template-sdk`, `playground`, `docs`, `bin`

---

## Style Guide

### TypeScript

- Prefer `const` over `let`; avoid `var`
- Use explicit types for function parameters and return values where clarity helps
- Keep `renderData()` focused — extract helpers for complex parsing
- No `any` casts without a comment explaining why

### CSS

- Use CSS custom properties (`var(--color-text-primary)`) from host style variables
- Support `body.dark` for dark mode
- Keep specificity low — avoid nesting more than 2 levels deep
- Use system font stack (already set in `global.css`)

### HTML

- Semantic elements (`<header>`, `<main>`, `<article>`, `<time>`, etc.)
- Always include `alt` attributes on `<img>` elements
- Avoid inline styles — use classes

### General

- No external dependencies in templates (no CDN scripts, no npm imports beyond `@modelcontextprotocol/ext-apps`)
- No hardcoded secrets, tokens, or API keys
- No `console.log` left in submitted code (use sparingly for debugging, remove before PR)

---

## Questions?

Open a [GitHub Discussion](https://github.com/apigene/mcp-apps/discussions) or file an [issue](https://github.com/apigene/mcp-apps/issues).
