exports.disabled = 0;
exports.name = 'Redis Lookup';
exports.version = 0.1;
exports.group = 'Demo Functions';

let conf;
const sessions = {};

const fs = require('fs');
const path = require('path');
const redis = require("redis");

let client;
let ready;

const dLogger = C.util.getLogger('redisLookup');

const timeoutPromise = (ms, promise) => {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in '+ ms + 'ms.')
    }, ms)
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ]);
}

const redisConnect = () => {
  return new Promise(resolve => {
    dLogger.info(`connecting to redis ${conf.host}:${conf.port}`);
    client = redis.createClient(conf.port, conf.host, {
      tls: conf.secure ? { port: conf.port, host: conf.host } : null,
      db: conf.db,
    });
    client.on('connect', () => {
      dLogger.info(`connected to redis ${conf.host}:${conf.port}`);
      resolve();
    });
    client.on('end', () => {
      dLogger.info(`disconnected. reconnecting to redis ${conf.host}:${conf.port}`);
      ready = redisConnect();
    });
  });
}


exports.init = (opt) => {
  conf = (opt || {}).conf || {};

  ready = redisConnect();
};

exports.unload = () => {
  client.quit();
}


exports.process = (event) => {
  if (event[conf.fromField]) {
    return ready.then(() => timeoutPromise(500, new Promise((resolve, reject) => {
      client.get(`session_${event[conf.fromField]}`, (err, reply) => {
        if (err) reject(`Error: ${err.message}`);
        event[conf.toField] = reply;
        resolve(event);
      });
    })));
  }
  return event;
};

