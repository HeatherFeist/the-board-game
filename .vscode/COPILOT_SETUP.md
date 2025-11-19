# VS Code Copilot Setup Guide

This workspace has been configured to enable GitHub Copilot. If Copilot is still not working, follow these troubleshooting steps:

## Quick Fixes

### 1. Check if Copilot Extension is Installed
- Open VS Code Extensions panel (`Ctrl+Shift+X` or `Cmd+Shift+X` on Mac)
- Search for "GitHub Copilot"
- Install both:
  - **GitHub Copilot** (required)
  - **GitHub Copilot Chat** (recommended)

### 2. Verify Copilot Extension Version
- Ensure you have Copilot extension version **1.301.0 or newer**
- Older versions had a bug preventing workspace settings from working
- Update if needed: Click the extension → Click "Update"

### 3. Check User Settings Override
If Copilot is still disabled, your **User Settings** might be overriding the workspace settings.

**To fix this:**
1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Preferences: Open User Settings (JSON)"
3. Look for this line:
   ```json
   "github.copilot.enable": {
     "*": false
   }
   ```
4. If found, either:
   - Remove it entirely, OR
   - Change `false` to `true`

### 4. Verify Copilot Authentication
1. Click the Copilot icon in the status bar (bottom right)
2. If you see "Sign in to use GitHub Copilot", click it
3. Complete the authentication in your browser
4. Return to VS Code and verify the status bar shows Copilot is active

### 5. Restart VS Code
After making any changes:
1. Close VS Code completely
2. Reopen the workspace
3. Wait a few seconds for Copilot to initialize

## How to Test if Copilot is Working

1. Open any code file (e.g., `.ts`, `.js`, `.py`)
2. Start typing a comment or function
3. You should see gray inline suggestions from Copilot
4. Press `Tab` to accept suggestions

## Still Not Working?

If none of the above works, try these additional steps:

### Check for Extension Conflicts
Some extensions can interfere with Copilot:
1. Disable other AI/autocomplete extensions temporarily
2. Restart VS Code
3. Test if Copilot works

### Reinstall Copilot Extension
1. Uninstall GitHub Copilot extension
2. Restart VS Code
3. Reinstall GitHub Copilot extension
4. Sign in again

### Verify Your Copilot Subscription
- Make sure you have an active GitHub Copilot subscription
- Check at: https://github.com/settings/copilot

## Workspace Settings Applied

This workspace has the following Copilot settings in `.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": true,
    "markdown": true,
    "scminput": true
  },
  "github.copilot.editor.enableAutoCompletions": true
}
```

These settings explicitly enable Copilot for all file types in this workspace.
