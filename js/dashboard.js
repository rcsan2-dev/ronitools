/* Flora Tools Trello Bridge R06
 * Fix: Trello t.getRestApi() returns a Promise in the current client.
 * Adds Show / Hide Token.
 */

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
  var toggleTokenButton;
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

  function getClient() {
    return t.getRestApi();
  }

  function hideToken() {
    tokenRow.hidden = true;
    copyButton.hidden = true;
    tokenField.value = '';
    tokenField.type = 'password';
    toggleTokenButton.textContent = 'Show';
  }

  function showToken(token) {
    if (!token) {
      hideToken();
      return;
    }

    tokenField.value = token;
    tokenField.type = 'password';
    toggleTokenButton.textContent = 'Show';
    tokenRow.hidden = false;
    copyButton.hidden = false;
  }

  function toggleTokenVisibility() {
    if (!tokenField.value) return;

    if (tokenField.type === 'password') {
      tokenField.type = 'text';
      toggleTokenButton.textContent = 'Hide';
    } else {
      tokenField.type = 'password';
      toggleTokenButton.textContent = 'Show';
    }

    return t.sizeTo('#floraBridge');
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
          return setState('Token copied. Paste it into Trello Credentials in Flora Tools.', 'success');
        })
        .catch(function () {
          if (fallbackCopy(token)) {
            return setState('Token copied. Paste it into Trello Credentials in Flora Tools.', 'success');
          }
          return setState('Could not copy automatically. Use Show and copy it manually.', 'warning');
        });
    } else if (fallbackCopy(token)) {
      setState('Token copied. Paste it into Trello Credentials in Flora Tools.', 'success');
    } else {
      setState('Could not copy automatically. Use Show and copy it manually.', 'warning');
    }
  }

  function refreshAuthorization() {
    hideToken();

    if (!configured()) {
      authorizeButton.disabled = true;
      generateTokenButton.disabled = true;
      reauthorizeButton.hidden = true;
      authHelp.hidden = false;
      setState('API Key is not configured in js/config.js.', 'warning');
      return Promise.resolve();
    }

    authorizeButton.disabled = false;
    generateTokenButton.disabled = false;
    authHelp.hidden = true;

    return getClient()
      .then(function (client) {
        return client.isAuthorized()
          .then(function (authorized) {
            if (!authorized) {
              authorizeButton.hidden = false;
              reauthorizeButton.hidden = true;
              setState('This Trello account has not authorized Flora Tools yet.', '');
              return null;
            }

            authorizeButton.hidden = true;
            reauthorizeButton.hidden = false;

            return client.getToken()
              .then(function (token) {
                if (token) {
                  showToken(token);
                  setState('Authorized. Your personal Trello token is ready.', 'success');
                } else {
                  setState('Authorized, but no token was returned. Click Generate / Show Token.', 'warning');
                }
                return token;
              });
          });
      })
      .catch(function () {
        authorizeButton.hidden = false;
        reauthorizeButton.hidden = true;
        return setState('Could not read Trello authorization status. Click Authorize Flora Tools.', 'warning');
      });
  }

  function authorize() {
    if (!configured()) {
      refreshAuthorization();
      return;
    }

    authorizeButton.disabled = true;
    generateTokenButton.disabled = true;
    setState('Opening Trello authorization…', '');

    getClient()
      .then(function (client) {
        return client.authorize({
          scope: 'read,write',
          expiration: 'never'
        });
      })
      .then(function (token) {
        if (!token) throw new Error('No token returned');
        showToken(token);
        authorizeButton.hidden = true;
        reauthorizeButton.hidden = false;
        return setState('Authorization complete. Your token is ready.', 'success');
      })
      .catch(function () {
        return setState('Authorization was cancelled or could not be completed.', 'warning');
      })
      .then(function () {
        authorizeButton.disabled = false;
        generateTokenButton.disabled = false;
        return t.sizeTo('#floraBridge');
      });
  }

  function generateToken() {
    if (!configured()) {
      refreshAuthorization();
      return;
    }

    generateTokenButton.disabled = true;
    setState('Getting your Trello token…', '');

    getClient()
      .then(function (client) {
        return client.isAuthorized()
          .then(function (authorized) {
            if (authorized) return client.getToken();
            return client.authorize({
              scope: 'read,write',
              expiration: 'never'
            });
          });
      })
      .then(function (token) {
        if (!token) throw new Error('No token returned');
        showToken(token);
        authorizeButton.hidden = true;
        reauthorizeButton.hidden = false;
        return setState('Token ready. Use Show / Hide or Copy Token.', 'success');
      })
      .catch(function () {
        return setState('Could not get the token. Try Authorize Flora Tools first.', 'warning');
      })
      .then(function () {
        generateTokenButton.disabled = false;
        return t.sizeTo('#floraBridge');
      });
  }

  function reauthorize() {
    hideToken();
    reauthorizeButton.disabled = true;
    setState('Resetting Trello authorization…', '');

    getClient()
      .then(function (client) {
        return client.clearToken()
          .catch(function () { return null; })
          .then(function () {
            return client.authorize({
              scope: 'read,write',
              expiration: 'never'
            });
          });
      })
      .then(function (token) {
        if (!token) throw new Error('No token returned');
        showToken(token);
        authorizeButton.hidden = true;
        reauthorizeButton.hidden = false;
        return setState('Account re-authorized. Your token is ready.', 'success');
      })
      .catch(function () {
        return setState('Could not re-authorize the account.', 'warning');
      })
      .then(function () {
        reauthorizeButton.disabled = false;
        return t.sizeTo('#floraBridge');
      });
  }

  t.render(function () {
    authorizeButton = document.getElementById('authorizeFlora');
    copyButton = document.getElementById('copyToken');
    reauthorizeButton = document.getElementById('reauthorizeFlora');
    generateTokenButton = document.getElementById('generateToken');
    toggleTokenButton = document.getElementById('toggleToken');
    tokenRow = document.getElementById('tokenRow');
    tokenField = document.getElementById('trelloToken');
    authState = document.getElementById('authState');
    authHelp = document.getElementById('authHelp');

    authorizeButton.addEventListener('click', authorize);
    copyButton.addEventListener('click', copyToken);
    reauthorizeButton.addEventListener('click', reauthorize);
    generateTokenButton.addEventListener('click', generateToken);
    toggleTokenButton.addEventListener('click', toggleTokenVisibility);

    return refreshAuthorization()
      .then(function () {
        return t.sizeTo('#floraBridge');
      });
  });
}());
