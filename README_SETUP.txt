FLORA TOOLS TRELLO BRIDGE R06
================================

FIXES
-----
- Fixes the Trello REST API client initialization. Current Trello returns a Promise from t.getRestApi(), so R06 waits for it before calling isAuthorized(), authorize(), getToken() or clearToken().
- Adds Show / Hide Token.
- Keeps Copy Token and Re-authorize Account.
- Settings-only workflow; no board button.

SAFE UPDATE
-----------
If js/config.js in GitHub already contains your real API Key, use the R06 PATCH zip. It does not include config.js.

Replace:
- dashboard.html
- js/client.js
- js/dashboard.js
- css/style.css
- README_SETUP.txt

TRELLO FLOW
-----------
Power-Ups -> Flora Tools Trello Bridge -> Settings -> View Power-Up

The panel should show:
- Authorize Flora Tools
- Generate / Show Token
- Show / Hide Token
- Copy Token
- Re-authorize Account (after authorization)

CAPABILITIES
------------
ON: show-settings, authorization-status, show-authorization
OPTIONAL: card-badges
OFF: board-buttons, on-enable
