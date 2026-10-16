FLORA TOOLS TRELLO BRIDGE R04
==============================

NEW IN R04
----------
- Adds separate "Authorize Flora Tools" and "Generate / Show Token" buttons inside the Trello Power-Up.
- Each artist authorizes with their own Trello account.
- After authorization, the Power-Up can show that user's personal Token and provides a Copy Token button.
- The artist pastes that Token into Trello Credentials in Unity, 3ds Max or Blender.
- Adds Trello authorization-status / show-authorization support.

IMPORTANT ADMIN SETUP - ONE TIME
--------------------------------
1. Open:
   Trello Apps Admin -> Flora Tools Trello Bridge -> Trello Auth
2. Copy the API Key (NOT the API Secret and NOT a Token).
3. Open:
   js/config.js
4. Replace:
   PASTE_TRELLO_API_KEY_HERE
   with your real API Key.
5. Upload/commit the R03 files to the same GitHub Pages repo.
6. Keep the existing Iframe Connector URL pointing to:
   https://rcsan2-dev.github.io/flora-trello-powerup/index.html

SECURITY
--------
The API Key is intended to be publicly accessible and can be stored in this
public GitHub Pages repository.

NEVER put any of these in the public repository:
- Trello user Token
- API Secret
- passwords

USER FLOW
---------
Each artist:
1. Opens the Trello board.
2. Opens Flora Tools.
3. Clicks "Authorize Flora Tools" (first time only).
4. Clicks Allow in Trello.
5. Clicks "Generate / Show Token".
6. Clicks "Copy Token".
7. Pastes the token locally into:
   - Unity -> Trello Credentials...
   - 3ds Max -> Trello Credentials...
   - Blender -> Trello Credentials...

The API Key is shared by the app.
The Token is private and different for each Trello user.

ATTACHMENTS
-----------
Unity:
  <challenge>_gamepreview.jpg

3ds Max:
  <challenge>_background.jpg
  <challenge>_spwnners.jpg
  <challenge>_spawners.jpg

VERSION
-------
Flora Tools Trello Bridge R04
