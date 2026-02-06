# Vercel Deployments MCP App

A Vercel-style deployments viewer app built on the MCP Apps base template.

## Overview

This app displays Vercel deployment information in a clean, card-based interface similar to Vercel's dashboard. It supports:

- Deployment cards with status badges
- Filtering by state and source
- Sorting (newest/oldest)
- Git commit information display
- Direct links to deployments and inspector
- Dark mode support
- Responsive grid layout

## Data Format

The app expects Vercel API deployments response format:

```json
{
  "body": {
    "deployments": [
      {
        "uid": "dpl_...",
        "name": "project-name",
        "url": "project-name.vercel.app",
        "created": 1770311837455,
        "state": "READY",
        "readyState": "READY",
        "source": "git",
        "target": "production",
        "creator": {
          "username": "user",
          "email": "user@example.com"
        },
        "meta": {
          "githubCommitMessage": "Commit message",
          "githubCommitRef": "main",
          "githubCommitSha": "abc123..."
        },
        "inspectorUrl": "https://vercel.com/..."
      }
    ],
    "pagination": {
      "count": 10
    }
  }
}
```

## Features

- **Card-based Layout**: Clean deployment cards with all key information
- **Status Badges**: Color-coded badges (Ready, Staged, Building, Error)
- **Filtering**: Filter by deployment state and source
- **Sorting**: Sort by newest or oldest deployments
- **Git Integration**: Display branch, commit SHA, and commit message
- **Direct Links**: Quick access to deployment URLs and Vercel inspector
- **Dark Mode**: Full dark mode support matching Vercel's dark theme
- **Responsive**: Works on mobile and desktop

## Customization

To customize the app:

1. **Colors**: Edit CSS variables in `src/mcp-app.css`
2. **Layout**: Modify the grid columns in `.deployments-grid`
3. **Card Content**: Adjust `renderDeployment()` function
4. **Filters**: Add more filter options in `setupFilters()`

## Usage

This app is designed to work with Vercel API deployments responses. The data should be passed via the MCP protocol `ui/notifications/tool-result` message.
