Package.describe({
  name: 'maka:http',
  summary: "Make HTTP calls to remote servers",
  version: '1.0.0',
  git: 'https://github.com/maka-io/maka-http'
});

Npm.depends({
  '@types/meteor': '2.9.7',
});

Package.onUse(function (api) {
  api.use([
    'url',
    'ecmascript',
    'fetch',
    'modules',
    'typescript'
  ]);

  api.mainModule('src/http-client.ts', 'client');
  api.mainModule('src/http-server.ts', 'server');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('webapp', 'server');
  api.use('underscore');
  api.use('random');
  api.use('http', ['client', 'server']);
  api.use('tinytest');
  api.use('test-helpers', ['client', 'server']);

  api.addFiles('test-responder.js', 'server');
  api.addFiles('http-tests.js', ['client', 'server']);

  api.addAssets('test_static.serveme', 'client');
});
