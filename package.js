Package.describe({
  name: 'maka:http',
  summary: "Make HTTP calls to remote servers",
  version: '1.0.0',
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

  api.mainModule('src/httpcall_client.ts', 'client');
  api.mainModule('src/httpcall_server.ts', 'server');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('webapp', 'server');
  api.use('underscore');
  api.use('random');
  api.use('http', ['client', 'server']);
  api.use('tinytest');
  api.use('test-helpers', ['client', 'server']);

  api.addFiles('test_responder.js', 'server');
  api.addFiles('httpcall_tests.js', ['client', 'server']);

  api.addAssets('test_static.serveme', 'client');
});
