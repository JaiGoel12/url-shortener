import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { AnalyticsService } from '../services/analytics.service';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/analytics.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const analyticsProto = grpc.loadPackageDefinition(packageDefinition).analytics as any;

async function getUrlAnalytics(call: any, callback: any) {
  try {
    const { url_id } = call.request;
    const analytics = await AnalyticsService.getUrlAnalytics(url_id);
    callback(null, analytics);
  } catch (err) {
    console.error('[gRPC] GetUrlAnalytics error:', err);
    callback({ code: grpc.status.INTERNAL, message: 'Internal error' });
  }
}

async function getClicksByTimeRange(call: any, callback: any) {
  try {
    const { url_id, start_date, end_date, limit } = call.request;
    const clicks = await AnalyticsService.getClicksByTimeRange(url_id, start_date, end_date, limit || 50);
    callback(null, { clicks });
  } catch (err) {
    console.error('[gRPC] GetClicksByTimeRange error:', err);
    callback({ code: grpc.status.INTERNAL, message: 'Internal error' });
  }
}

async function getTopCountries(call: any, callback: any) {
  try {
    const { url_id, limit } = call.request;
    const countries = await AnalyticsService.getTopCountries(url_id, limit || 10);
    callback(null, { countries });
  } catch (err) {
    console.error('[gRPC] GetTopCountries error:', err);
    callback({ code: grpc.status.INTERNAL, message: 'Internal error' });
  }
}

export function startGrpcServer(): grpc.Server {
  const server = new grpc.Server();

  server.addService(analyticsProto.AnalyticsService.service, {
    GetUrlAnalytics: getUrlAnalytics,
    GetClicksByTimeRange: getClicksByTimeRange,
    GetTopCountries: getTopCountries,
  });

  const port = process.env.GRPC_PORT || '50051';

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('[gRPC] Server failed to start:', err);
        return;
      }
      console.log(`[gRPC] Analytics server running on port ${boundPort}`);
    }
  );

  return server;
}
