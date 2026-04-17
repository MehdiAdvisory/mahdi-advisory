const https = require("https");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!TOKEN || !BASE_ID) {
  console.error("Missing AIRTABLE_ACCESS_TOKEN or AIRTABLE_BASE_ID env vars");
  process.exit(1);
}

const outputDir = path.resolve(__dirname, "../src/server/libs/airtable/generated");
fs.mkdirSync(outputDir, { recursive: true });

const options = {
  hostname: "api.airtable.com",
  path: `/v0/meta/bases/${BASE_ID}/tables`,
  method: "GET",
  headers: { Authorization: `Bearer ${TOKEN}` },
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    if (res.statusCode !== 200) {
      console.error(`Airtable API error ${res.statusCode}: ${body}`);
      process.exit(1);
    }
    const outputPath = path.join(outputDir, "schema.json");
    fs.writeFileSync(outputPath, JSON.stringify(JSON.parse(body), null, 2));
    console.log(`Schema written to ${outputPath}`);
  });
});

req.on("error", (err) => {
  console.error("Request failed:", err.message);
  process.exit(1);
});
req.end();
