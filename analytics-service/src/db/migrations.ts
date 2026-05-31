import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';
dotenv.config();

const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost:9042').split(',');
const localDataCenter = process.env.CASSANDRA_LOCAL_DC || 'datacenter1';
const keyspace = process.env.CASSANDRA_KEYSPACE || 'url_analytics';

async function migrate() {
  const client = new Client({
    contactPoints,
    localDataCenter,
  });

  await client.connect();
  console.log('[Migration] Connected to Cassandra');

  await client.execute(`
    CREATE KEYSPACE IF NOT EXISTS ${keyspace}
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
  `);
  console.log(`[Migration] Keyspace '${keyspace}' ensured`);

  await client.execute(`USE ${keyspace}`);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS clicks (
      url_id     text,
      clicked_at timestamp,
      click_id   uuid,
      ip         text,
      country    text,
      city       text,
      device     text,
      browser    text,
      referrer   text,
      PRIMARY KEY (url_id, clicked_at, click_id)
    ) WITH CLUSTERING ORDER BY (clicked_at DESC, click_id ASC)
  `);
  console.log('[Migration] Table "clicks" created');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS daily_clicks (
      url_id text,
      date   text,
      count  counter,
      PRIMARY KEY (url_id, date)
    ) WITH CLUSTERING ORDER BY (date DESC)
  `);
  console.log('[Migration] Table "daily_clicks" created');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS clicks_by_country (
      url_id  text,
      country text,
      count   counter,
      PRIMARY KEY (url_id, country)
    )
  `);
  console.log('[Migration] Table "clicks_by_country" created');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS clicks_by_device (
      url_id text,
      device text,
      count  counter,
      PRIMARY KEY (url_id, device)
    )
  `);
  console.log('[Migration] Table "clicks_by_device" created');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS clicks_by_browser (
      url_id  text,
      browser text,
      count   counter,
      PRIMARY KEY (url_id, browser)
    )
  `);
  console.log('[Migration] Table "clicks_by_browser" created');

  console.log('[Migration] All tables created successfully!');
  await client.shutdown();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});
