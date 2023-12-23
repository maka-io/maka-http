Package.describe({
  name: 'maka:http',
  summary: "Make HTTP calls to remote servers",
  version: '1.1.5',
  git: 'https://github.com/maka-io/maka-http.git'
});

Npm.depends({
  '@types/meteor': '2.9.7',
  '@maka/types': '1.0.5',
  'node-fetch': '3.3.2'
});

Package.onUse(function (api) {
  // Minimum Meteor version
  api.versionsFrom(['2.0', '3.0-alpha.19']);

  api.use([
    'ecmascript',
    'fetch',
    'url',
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

  api.addFiles('tests/test-responder.js', 'server');
  api.addFiles('tests/http-tests.js', ['client', 'server']);

  api.addAssets('tests/test-static.serveme', 'client');
});
