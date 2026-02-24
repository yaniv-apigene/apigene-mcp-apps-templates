## Summary

<!-- What does this PR do? Brief description. -->

## Type of change

- [ ] New example template (`feat(examples): add <service>-<operation>`)
- [ ] Base template improvement (`feat(base-template-sdk):` or `feat(base-template):`)
- [ ] Playground / tooling (`feat(playground):`)
- [ ] Bug fix (`fix:`)
- [ ] Documentation (`docs:`)
- [ ] Other: <!-- describe -->

## Checklist

### For new example templates

- [ ] Template named in kebab-case: `<service>-<operation>` (e.g. `stripe-list-charges`)
- [ ] Copied from `examples/base-template-sdk`
- [ ] `APP_NAME` and `APP_VERSION` set in `src/mcp-app.ts`
- [ ] `renderData()` implemented
- [ ] `response.json` added with realistic mock data
- [ ] `npm run build` succeeds (`dist/mcp-app.html` produced)
- [ ] Renders correctly in the playground (`npm run lab`)
- [ ] Dark mode looks correct
- [ ] All user/API data uses `escapeHtml()`
- [ ] No `app.connect()` calls
- [ ] `ui/resource-teardown` handler present
- [ ] No hardcoded credentials or API keys
- [ ] `node_modules/` and `dist/` not committed

### For all PRs

- [ ] Tested locally
- [ ] No `console.log` left in code

## Screenshots / recording

<!-- For visual changes, attach a screenshot or screen recording. Helpful but not required. -->
