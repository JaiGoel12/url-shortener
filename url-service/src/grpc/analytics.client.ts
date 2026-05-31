import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/analytics.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const analyticsProto = grpc.loadPackageDefinition(packageDefinition).analytics as any;

let client: any;

export function getAnalyticsClient() {
  if (!client) {
    const host = process.env.GRPC_ANALYTICS_HOST || 'localhost:50051';
    client = new analyticsProto.AnalyticsService(
      host,
      grpc.credentials.createInsecure()
    );
  }
  return client;
}
