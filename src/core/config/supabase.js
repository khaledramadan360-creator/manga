'use strict';

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let supabase = null;

if (env.storageProvider === 'supabase') {
  supabase = createClient(env.supabase.url, env.supabase.key);
}

module.exports = supabase;
