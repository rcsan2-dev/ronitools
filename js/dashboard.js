/* Flora Tools Trello Bridge R04 - dashboard + authorization + token generation */

(function () {
  'use strict';

  var CONFIG = window.FLORA_TRELLO_CONFIG || {};
  var t = window.TrelloPowerUp.iframe({
    appKey: CONFIG.appKey || '',
    appName: CONFIG.appName || 'Flora Tools Trello Bridge',
    appAuthor: CONFIG.appAuthor || 'Flora Tools'
  });

  var authorizeButton;
  var copyButton;
  var reauthorizeButton;
  var generateTokenButton;
  var tokenRow;
  var tokenField;
  var authState;
  var authHelp;

  function configured() {
    return CONFIG.appKey &&
      CONFIG.appKey !== 'PASTE_TRELLO_API_KEY_HERE';
  }

  function setState(text, kind) {
    authState.textContent = text;
    authState.className = 'auth-state ' + (kind || '');
    return t.sizeTo('#floraBridge');
  }

  function hideToken() {
    tokenRow.hidden = true;
    copyButton.hidden = true;
    tokenField.value = '';
  }

  function showToken(token) {
    if (!token) {
      hideToken();
      return;
    }

    tokenField.value = token;
    tokenRow.hidden = false;
    copyButton.hidden = false;
  }

  function fallbackCopy(text) {
    var temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();

    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }

    document.body.removeChild(temp);
    return ok;
  }

  function copyToken() {
    var token = tokenField.value;
    if (!token) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(token)
        .then(function () {
          setState('Token copied. Paste it into Trello Credentials in Flora Tools.', 'success');
        })
        .catch(function () {
          if (fallbackCopy(token)) {
            setState('Token copied. Paste it into Trello Credentials in Flora Tools.', 'success');
          } else {
            setState('Could not copy automatically. Select the token and copy it manually.', 'warning');
          }
        });
    } else if (fallbackCopy(token)) {
      setState('Token copied. Paste it into Trello Credentials in Flora Tools.', 'success');
    } else {
      setState('Could not copy automatically. Select the token and copy it manually.', 'warning');
    }
  }

  function getClient() {
    return t.getRestApi();
  }

  function refreshAuthorization() {
    hideToken();

    if (!configured()) {
      authorizeButton.disabled = true;
      reauthorizeButton.hidden = true;
      authHelp.hidden = false;
      setState('Admin setup required: add the Power-Up API Key to js/config.js.', 'warning');
      return Promise.resolve();
    }

    authorizeButton.disabled = false;
    authHelp.hidden = true;

    return getClient()
      .isAuthorized()
      .then(function (authorized) {
        if (!authorized) {
          authorizeButton.hidden = false;
          reauthorizeButton.hidden = true;
          setState('This Trello account has not authorized Flora Tools yet.', '');
          return null;
        }

        authorizeButton.hidden = true;
        reauthorizeButton.hidden = false;

        return getClient()
          .getToken()
          .then(function (token) {
            showToken(token);
            setState('Authorized. Copy your personal token into Unity, 3ds Max or Blender.', 'success');
            return token;
          });
      })
      .catch(function () {
        authorizeButton.hidden = false;
        reauthorizeButton.hidden = true;
        setState('Could not read authorization status. Try Authorize Flora Tools.', 'warning');
      });
  }

  function authorize() {
    if (!configured()) {
      refreshAuthorization();
      return;
    }

    authorizeButton.disabled = true;
    reauthorizeButton.disabled = true;
    setState('Opening Trello authorization…', '');

    getClient()
      .authorize({
        scope: 'read,write',
        expiration: 'never'
      })
      .then(function () {
        return getClient().getToken();
      })
      .then(function (token) {
        showToken(token);
        authorizeButton.hidden = true;
        reauthorizeButton.hidden = false;
        setState('Authorization complete. Copy your token below.', 'success');
      })
      .catch(function () {
        setState('Authorization was cancelled or could not be completed.', 'warning');
      })
      .then(function () {
        authorizeButton.disabled = false;
        reauthorizeButton.disabled = false;
        return t.sizeTo('#floraBridge');
      });
  }

  function generateToken() {
    if (!configured()) {
      refreshAuthorization();
      return;
    }

    generateTokenButton.disabled = true;
    setState('Generating your Trello token…', '');

    getClient()
      .isAuthorized()
      .then(function (authorized) {
        if (authorized) {
          return getClient().getToken();
        }

        // If this account has not authorized the app yet,
        // authorize first; Trello issues the personal token
        // as part of this flow.
        return getClient()
          .authorize({
            scope: 'read,write',
            expiration: 'never'
          })
          .then(function () {
            return getClient().getToken();
          });
      })
      .then(function (token) {
        if (!token) {
          throw new Error('No token returned');
        }

        showToken(token);
        authorizeButton.hidden = true;
        reauthorizeButton.hidden = false;
        setState('Token ready. Click Copy Token and paste it into Flora Tools.', 'success');
      })
      .catch(function () {
        setState('Could not generate the token. Try authorizing the account again.', 'warning');
      })
      .then(function () {
        generateTokenButton.disabled = false;
        return t.sizeTo('#floraBridge');
      });
  }

  function reauthorize() {
    hideToken();
    reauthorizeButton.disabled = true;

    getClient()
      .clearToken()
      .catch(function () {
        return null;
      })
      .then(function () {
        reauthorizeButton.disabled = false;
        authorizeButton.hidden = false;
        reauthorizeButton.hidden = true;
        return authorize();
      });
  }

  t.render(function () {
    authorizeButton = document.getElementById('authorizeFlora');
    copyButton = document.getElementById('copyToken');
    reauthorizeButton = document.getElementById('reauthorizeFlora');
    generateTokenButton = document.getElementById('generateToken');
    tokenRow = document.getElementById('tokenRow');
    tokenField = document.getElementById('trelloToken');
    authState = document.getElementById('authState');
    authHelp = document.getElementById('authHelp');

    authorizeButton.addEventListener('click', authorize);
    copyButton.addEventListener('click', copyToken);
    reauthorizeButton.addEventListener('click', reauthorize);
    generateTokenButton.addEventListener('click', generateToken);

    return refreshAuthorization()
      .then(function () {
        return t.sizeTo('#floraBridge');
      });
  });
}());
