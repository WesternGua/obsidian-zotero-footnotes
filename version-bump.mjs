import { readFileSync, writeFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const manifestJson = JSON.parse(readFileSync("manifest.json", "utf8"));
const versionsJson = JSON.parse(readFileSync("versions.json", "utf8"));

const targetVersion = packageJson.version;

if (!targetVersion) {
  throw new Error("package.json is missing a version field");
}

manifestJson.version = targetVersion;
writeFileSync("manifest.json", `${JSON.stringify(manifestJson, null, 2)}\n`);

versionsJson[targetVersion] = manifestJson.minAppVersion;
writeFileSync("versions.json", `${JSON.stringify(versionsJson, null, 2)}\n`);

console.log(`Synced manifest.json and versions.json to ${targetVersion}`);
