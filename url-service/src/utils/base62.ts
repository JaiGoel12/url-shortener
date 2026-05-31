const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BigInt(CHARSET.length);

export function encodeBase62(num: bigint): string {
  if (num === 0n) return CHARSET[0];

  let result = '';
  let n = num;

  while (n > 0n) {
    result = CHARSET[Number(n % BASE)] + result;
    n = n / BASE;
  }

  return result;
}

export function generateShortCode(id: string): string {
  const hash = id.replace(/-/g, '');
  const num = BigInt('0x' + hash.slice(0, 12));
  const code = encodeBase62(num);
  return code.slice(0, 7);
}
