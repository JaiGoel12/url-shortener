interface GeoData {
  country: string;
  city: string;
}

export async function getGeoFromIP(ip: string): Promise<GeoData> {
  try {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168')) {
      return { country: 'Local', city: 'Localhost' };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    if (!response.ok) {
      return { country: 'Unknown', city: 'Unknown' };
    }

    const data = await response.json();
    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
    };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}
