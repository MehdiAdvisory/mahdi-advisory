const { generateSchemaFiles } = require("airtable-schema-generator");
const path = require("path");
const fs = require("fs");

const generatedDir = path.resolve(__dirname, "../src/server/libs/airtable/generated");
const schemaPath = path.join(generatedDir, "schema.json");

if (!fs.existsSync(schemaPath)) {
  console.error("schema.json not found. Run fetch-airtable-schema.cjs first.");
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

generateSchemaFiles({
  schemaMeta: schema,
  outputFolder: generatedDir,
  exceptions: { pluralize: [], depluralize: [] },
});

console.log("Schema files generated in", generatedDir);
