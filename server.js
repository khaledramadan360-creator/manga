'use strict';

const app             = require('./src/app');
const env             = require('./src/core/config/env');
const { connectDB }   = require('./src/core/config/db');
const { syncDB }      = require('./src/models/index');

const start = async () => {
  await connectDB();
  await syncDB();

  app.listen(env.port, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${env.port}`);
    console.log(`📦 Environment: ${env.nodeEnv}`);
  });
};

start();
