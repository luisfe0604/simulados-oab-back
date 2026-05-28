require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ngfuquqknytsohukhqvb:2A2DMGjnPCzCgcMo@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
});

module.exports = pool;