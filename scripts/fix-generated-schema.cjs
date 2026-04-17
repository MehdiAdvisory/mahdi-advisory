const fs = require("fs");
const path = require("path");

const generatedDir = path.resolve(__dirname, "../src/server/libs/airtable/generated");

const files = fs.readdirSync(generatedDir).filter((f) => f.endsWith(".js"));

for (const file of files) {
  const filePath = path.join(generatedDir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Fix common issues: remove "use strict" duplicates, fix require paths
  content = content.replace(/"use strict";\s*"use strict";/g, '"use strict";');

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
}

console.log("Post-generation fixes complete.");
