import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getAnalyticsClient } from '../grpc/analytics.client';

export async function getUrlAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { urlId } = req.params;
    const client = getAnalyticsClient();

    const analytics = await new Promise((resolve, reject) => {
      client.GetUrlAnalytics({ url_id: urlId }, (err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      });
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    console.error('[Analytics] gRPC call failed:', err);
    res.json({
      success: true,
      data: { total_clicks: 0, clicks_per_day: [], devices: [], browsers: [], countries: [] },
    });
  }
}

export async function getClicksByTimeRange(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { urlId } = req.params;
    const { start, end, limit } = req.query;
    const client = getAnalyticsClient();

    const clicks = await new Promise((resolve, reject) => {
      client.GetClicksByTimeRange(
        {
          url_id: urlId,
          start_date: (start as string) || '',
          end_date: (end as string) || '',
          limit: parseInt(limit as string) || 50,
        },
        (err: any, response: any) => {
          if (err) return reject(err);
          resolve(response);
        }
      );
    });

    res.json({
      success: true,
      data: clicks,
    });
  } catch (err) {
    console.error('[Analytics] gRPC call failed:', err);
    res.json({ success: true, data: { clicks: [] } });
  }
}

export async function getTopCountries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { urlId } = req.params;
    const { limit } = req.query;
    const client = getAnalyticsClient();

    const countries = await new Promise((resolve, reject) => {
      client.GetTopCountries(
        { url_id: urlId, limit: parseInt(limit as string) || 10 },
        (err: any, response: any) => {
          if (err) return reject(err);
          resolve(response);
        }
      );
    });

    res.json({
      success: true,
      data: countries,
    });
  } catch (err) {
    console.error('[Analytics] gRPC call failed:', err);
    res.json({ success: true, data: { countries: [] } });
  }
}
