import { Client, DseClientOptions } from 'cassandra-driver';

const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost:9042').split(',');
const localDataCenter = process.env.CASSANDRA_LOCAL_DC || 'datacenter1';
const keyspace = process.env.CASSANDRA_KEYSPACE || 'url_analytics';

const client = new Client({
  contactPoints,
  localDataCenter,
  keyspace,
  pooling: {
    coreConnectionsPerHost: {
      [0]: 2, // local
      [1]: 1, // remote
    },
  },
} as DseClientOptions);

export async function connectCassandra(): Promise<void> {
  try {
    await client.connect();
    console.log('[Cassandra] Connected to cluster');
  } catch (err) {
    console.error('[Cassandra] Connection failed:', err);
    throw err;
  }
}

export default client;
