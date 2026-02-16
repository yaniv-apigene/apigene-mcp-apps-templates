# GitHub Commit Diff Viewer MCP App

A beautiful GitHub-style commit diff viewer that displays file changes with syntax highlighting, line numbers, and GitHub's exact styling.

## Features

- **GitHub-style UI**: Matches GitHub's commit diff page look and feel exactly
- **Comparison Header**: Shows base and head commits with author info
- **File Diffs**: Displays all changed files with status badges
- **Unified Diff Rendering**: Properly parses and renders unified diff format
- **Line Numbers**: Shows old and new line numbers side-by-side
- **Syntax Highlighting**: Color-coded additions (green) and deletions (red)
- **File Stats**: Shows additions/deletions per file and total
- **Dark Mode**: Full dark mode support matching GitHub's dark theme
- **Responsive**: Works on mobile and desktop

## Data Format

The app expects GitHub API compare/commits response format:

```json
{
  "body": {
    "base_commit": {
      "sha": "...",
      "commit": { "author": {...}, "message": "..." },
      "author": {...}
    },
    "commits": [...],
    "files": [
      {
        "filename": "path/to/file.py",
        "status": "modified",
        "additions": 10,
        "deletions": 5,
        "patch": "@@ -1,5 +1,10 @@\n ..."
      }
    ],
    "total_commits": 1,
    "ahead_by": 1
  }
}
```

The app also handles:
- Direct object with `files` array
- Nested in `body` property
- Standard table format with `rows` array

## Usage

1. Ensure your MCP server returns GitHub compare API response format
2. The app will automatically render the diff in GitHub style
3. Click on file names to view on GitHub
4. Hover over lines to see highlight effects

## Features

### File Status Badges
- **A** (Added): Green badge
- **D** (Deleted): Red badge
- **M** (Modified): Yellow badge
- **R** (Renamed): Blue badge

### Diff Rendering
- Parses unified diff format (`@@` hunk headers)
- Shows old and new line numbers
- Color codes:
  - Green background for additions
  - Red background for deletions
  - White/gray for context lines

### Comparison Info
- Shows base and head commits side-by-side
- Displays commit messages, authors, and timestamps
- Shows total commits, ahead/behind counts

## Styling

The app uses GitHub's exact color scheme:
- Light mode: `#ffffff` background, `#24292f` text
- Dark mode: `#0d1117` background, `#c9d1d9` text
- Additions: `#dafbe1` (light) / `#1c6b48` (dark)
- Deletions: `#ffebe9` (light) / `#8e1519` (dark)
- Links: `#0969da` (light) / `#58a6ff` (dark)

## CSP Configuration

If using external avatar images, ensure CSP is configured:

```typescript
resourceDomains: [
  "https://avatars.githubusercontent.com",
  "https://ui-avatars.com"
]
```

## Files

- `mcp-app.html` - Main HTML file
- `src/mcp-app.ts` - TypeScript logic with diff parsing
- `src/mcp-app.css` - GitHub-style diff styles
- `src/global.css` - Base styles (from template)
