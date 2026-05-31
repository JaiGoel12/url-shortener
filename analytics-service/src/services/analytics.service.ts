import { v4 as uuidv4 } from 'uuid';
import { types } from 'cassandra-driver';
import cassandra from '../config/cassandra';

interface ClickData {
  urlId: string;
  ip: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  referrer: string;
  clickedAt: string;
}

export class AnalyticsService {
  static async insertClick(data: ClickData): Promise<void> {
    const clickId = types.Uuid.random();
    const clickedAt = new Date(data.clickedAt);
    const dateStr = clickedAt.toISOString().split('T')[0]; // YYYY-MM-DD

    await cassandra.execute(
      `INSERT INTO clicks (url_id, clicked_at, click_id, ip, country, city, device, browser, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.urlId, clickedAt, clickId, data.ip, data.country, data.city, data.device, data.browser, data.referrer],
      { prepare: true }
    );

    const counterQueries = [
      {
        query: `UPDATE daily_clicks SET count = count + 1 WHERE url_id = ? AND date = ?`,
        params: [data.urlId, dateStr],
      },
      {
        query: `UPDATE clicks_by_country SET count = count + 1 WHERE url_id = ? AND country = ?`,
        params: [data.urlId, data.country || 'Unknown'],
      },
      {
        query: `UPDATE clicks_by_device SET count = count + 1 WHERE url_id = ? AND device = ?`,
        params: [data.urlId, data.device || 'Unknown'],
      },
      {
        query: `UPDATE clicks_by_browser SET count = count + 1 WHERE url_id = ? AND browser = ?`,
        params: [data.urlId, data.browser || 'Unknown'],
      },
    ];

    await cassandra.batch(counterQueries, { prepare: true, counter: true });
  }

  static async getUrlAnalytics(urlId: string) {
    const [dailyResult, countryResult, deviceResult, browserResult] = await Promise.all([
      cassandra.execute(
        'SELECT date, count FROM daily_clicks WHERE url_id = ? LIMIT 30',
        [urlId],
        { prepare: true }
      ),
      cassandra.execute(
        'SELECT country, count FROM clicks_by_country WHERE url_id = ?',
        [urlId],
        { prepare: true }
      ),
      cassandra.execute(
        'SELECT device, count FROM clicks_by_device WHERE url_id = ?',
        [urlId],
        { prepare: true }
      ),
      cassandra.execute(
        'SELECT browser, count FROM clicks_by_browser WHERE url_id = ?',
        [urlId],
        { prepare: true }
      ),
    ]);

    const clicksPerDay = dailyResult.rows.map((row) => ({
      date: row.date,
      count: row.count.toInt(),
    }));

    const totalClicks = clicksPerDay.reduce((sum, day) => sum + day.count, 0);

    const countries = countryResult.rows.map((row) => ({
      country: row.country,
      city: '',
      count: row.count.toInt(),
    }));

    const devices = deviceResult.rows.map((row) => ({
      device: row.device,
      count: row.count.toInt(),
    }));

    const browsers = browserResult.rows.map((row) => ({
      browser: row.browser,
      count: row.count.toInt(),
    }));

    return { total_clicks: totalClicks, clicks_per_day: clicksPerDay, countries, devices, browsers };
  }

  static async getClicksByTimeRange(urlId: string, startDate: string, endDate: string, limit: number) {
    const query = startDate && endDate
      ? 'SELECT * FROM clicks WHERE url_id = ? AND clicked_at >= ? AND clicked_at <= ? LIMIT ?'
      : 'SELECT * FROM clicks WHERE url_id = ? LIMIT ?';

    const params = startDate && endDate
      ? [urlId, new Date(startDate), new Date(endDate), limit]
      : [urlId, limit];

    const result = await cassandra.execute(query, params, { prepare: true });

    return result.rows.map((row) => ({
      id: row.click_id.toString(),
      ip: row.ip,
      country: row.country,
      city: row.city,
      device: row.device,
      browser: row.browser,
      referrer: row.referrer,
      clicked_at: row.clicked_at.toISOString(),
    }));
  }

  static async getTopCountries(urlId: string, limit: number) {
    const result = await cassandra.execute(
      'SELECT country, count FROM clicks_by_country WHERE url_id = ?',
      [urlId],
      { prepare: true }
    );

    const sorted = result.rows
      .map((row) => ({ country: row.country, city: '', count: row.count.toInt() }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  }
}
