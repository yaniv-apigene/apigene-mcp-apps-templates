/**
 * Generate a Cursor deeplink for sharing the base-template
 * 
 * Usage:
 *   npx tsx generate-deeplink.ts
 * 
 * This creates a prompt deeplink that helps users get started
 * with the base-template when creating new MCP apps.
 */

const IS_WEB = false; // Set to true for web format

function generatePromptDeeplink(promptText: string): string {
  const baseUrl = IS_WEB
    ? 'https://cursor.com/link/prompt'
    : 'cursor://anysphere.cursor-deeplink/prompt';
  const url = new URL(baseUrl);
  url.searchParams.set('text', promptText);
  return url.toString();
}

const promptText = `Create a new MCP app using the base template. Copy the base-template directory from apigene-mcp-apps-templates/base-template to a new directory with your app name. Then:

1. Update APP_NAME, APP_VERSION in src/mcp-app.ts
2. Update the HTML title in mcp-app.html
3. Implement the renderData() function in src/mcp-app.ts
4. Add your custom styles in src/mcp-app.css
5. Review CRITICAL_MUST_REQUIREMENTS.md to ensure spec compliance

See the README.md in the base-template for detailed instructions and examples.`;

const deeplink = generatePromptDeeplink(promptText);

// Generate web format
const IS_WEB_SAVED = IS_WEB;
const webDeeplink = (() => {
  const baseUrl = 'https://cursor.com/link/prompt';
  const url = new URL(baseUrl);
  url.searchParams.set('text', promptText);
  return url.toString();
})();

console.log('\n📋 Base Template Deeplink (Cursor App):\n');
console.log(deeplink);
console.log('\n📋 Web Format (cursor.com):\n');
console.log(webDeeplink);
console.log('\n📋 Prompt Text:\n');
console.log(promptText);
console.log('\n');
