import { distance } from 'fastest-levenshtein';

export async function POST(req) {
  try {
    const { url } = await req.json();
    const parsed = new URL(url);

    const path = parsed.pathname + parsed.search;
    const hostname = parsed.hostname.toLowerCase();
    const queryCount = Array.from(parsed.searchParams).length;
    const subdomains = hostname.split('.').length - 2;
    const pathSegments = path.split('/').filter(Boolean);

    // 1. ตรวจคำอันตราย
    const dangerousWords = ['login', 'bank', 'free', 'secure', 'verify', '888', 'slot', 'casino', 'หวย'];
    const hasDangerWord = dangerousWords.some(word => url.toLowerCase().includes(word));

    // 2. ตรวจความยาว
    const isTooLong = url.length > 100;

    // 3. ตรวจ subdomains
    const hasTooManySubdomains = subdomains >= 3;

    // 4. ตรวจ query มากเกินไป
    const tooManyParams = queryCount >= 5;

    // 5. ตรวจ path ที่น่าสงสัย เช่น มีรหัสสุ่ม
    const hasRandomPath = pathSegments.some(seg => /[a-zA-Z0-9]{12,}/.test(seg));

    // 6. ตรวจโดเมนปลอม
    const knownBrands = ['facebook.com', 'google.com', 'paypal.com', 'apple.com', 'microsoft.com'];
    const isSpoofed = knownBrands.some(brand => {
      const d = distance(brand, hostname);
      return d > 0 && d <= 2 && hostname !== brand;
    });

    // รวมการวิเคราะห์
    const isDanger =
      hasDangerWord ||
      isTooLong ||
      hasTooManySubdomains ||
      tooManyParams ||
      hasRandomPath ||
      isSpoofed;

    return Response.json({ result: isDanger ? 'warn' : 'safe' });
  } catch (err) {
    console.error('AI-Check Error:', err);
    return new Response(JSON.stringify({ result: 'error' }), {
      status: 500,
    });
  }
}
