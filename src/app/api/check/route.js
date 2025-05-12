export async function POST(request) {
  const { url } = await request.json();

  const response = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyBgKotaoL1nbXejtLhY01MqhFCPYR2hVJs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: {
          clientId: "phishnet",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),
    }
  );

  const data = await response.json();
  const isUnsafe = data && data.matches && data.matches.length > 0;

  return Response.json({
    result: isUnsafe ? "⚠️ ลิงก์อันตราย" : "✅ ปลอดภัย",
    matches: data.matches || [],
  });
}
