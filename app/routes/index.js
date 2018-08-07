const choo = require('choo');
const html = require('choo/html');
const nanotiming = require('nanotiming');
const download = require('./download');
const footer = require('../templates/footer');
const fxPromo = require('../templates/fxPromo');
const signupPromo = require('../templates/signupPromo');
const activeBackground = require('../templates/activeBackground');
const fileList = require('../templates/fileList');
const profile = require('../templates/userAccount');

nanotiming.disabled = true;
const app = choo();

function banner(state, emit) {
  if (state.promo && !state.route.startsWith('/unsupported/')) {
    return fxPromo(state, emit);
  }
}

function body(template) {
  return function(state, emit) {
    const b = html`<body class="background ${activeBackground(state)}">
      ${banner(state, emit)}
      <main class="main">
        <noscript>
          <div class="noscript">
            <h2>${state.translate('javascriptRequired')}</h2>
            <p>
              <a class="link" href="https://github.com/mozilla/send/blob/master/docs/faq.md#why-does-firefox-send-require-javascript">
              ${state.translate('whyJavascript')}
              </a>
            </p>
            <p>${state.translate('enableJavascript')}</p>
          </div>
        </noscript>
        ${signupPromo(state)}
        <div class="stripedBox">
          <div class="mainContent">

            ${profile(state, emit)}

            ${template(state, emit)}
          </div>
        </div>

        <div class="spacer"></div>
        <div class="uploads">
          ${fileList(state)}
        </div>
      </main>
      ${footer(state)}
    </body>`;
    if (state.layout) {
      // server side only
      return state.layout(state, b);
    }
    return b;
  };
}

app.route('/', body(require('../pages/welcome')));
app.route('/share/:id', body(require('../pages/share')));
app.route('/download/:id', body(download));
app.route('/download/:id/:key', body(download));
app.route('/unsupported/:reason', body(require('../pages/unsupported')));
app.route('/legal', body(require('../pages/legal')));
app.route('/error', body(require('../pages/error')));
app.route('/blank', body(require('../pages/blank')));
app.route('/signin', body(require('../pages/signin')));
app.route('/api/fxa/oauth', function(state, emit) {
  emit('replaceState', '/');
  setTimeout(() => emit('render'));
});
app.route('*', body(require('../pages/notFound')));

module.exports = app;
