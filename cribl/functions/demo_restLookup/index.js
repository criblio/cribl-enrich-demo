exports.disabled = 0;
exports.name = 'REST Lookup';
exports.version = 0.1;
exports.group = 'Demo Functions';

const url = require('url');

const dLogger = C.util.getLogger('restLookup');

const { Expression } = C.expr;

let urlExpression;
let http;
let requestCount = 0;

exports.init = (opt) => {
  conf = (opt || {}).conf || {};

  urlExpression = new Expression(conf.urlExpression, { disallowAssign: true });
  const u = urlExpression.evalOn({});
  const parsedurl = new url.URL(u);
  const proto = parsedurl.protocol.substr(0, parsedurl.protocol.length - 1);
  // Avoid dynamic imports
  if (proto === 'http') {
    http = require('http');
  } else {
    http = require('https');
  }

  if (conf.headers && Array.isArray(conf.headers)) {
    conf.headersObj = conf.headers.reduce((prev, cur) => Object.keys(cur).forEach(k => prev[k] = cur[k]), {});
  }
};


exports.process = (event) => {
  const u = urlExpression.evalOn(event);

  // dLogger.info(`Executing REST Lookup against ${u}`);

  return new Promise((resolve, reject) => {
    http.get(u, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        let d = data;
        try {
          d = JSON.parse(data);
        } catch (e) {
        }
        event[conf.eventField] = d;
        requestCount--;
        resolve(event);
      });

    }).on("error", (err) => {
      dLogger.error(`Error in REST Lookup: ${err.message}`);
      requestCount--;
      reject(`Error: ${err.message}`);
    });
  });
};

