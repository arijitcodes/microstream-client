const { readFileSync } = require("fs");
const { join } = require("path");

module.exports = {
  branches: ["main"],
  // repositoryUrl: "git@github.com:arijitcodes/microstream-hub.git", // Keep this only for local `npx semantic-release --dry-run` NOT FOR CI/CD ON GITHUB WORKFLOW - COmment it
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        writerOpts: {
          commitPartial: readFileSync(
            join(__dirname, "./configs/semantic-release/commit-template.hbs"),
            "utf-8"
          ),
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm", // Add this for the Client SDK only
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "microstream-client.tar.gz", // Adjust based on your build output
            name: "microstream-client_v${nextRelease.version}.tar.gz",
            label: "MicroStream Client SDK v${nextRelease.version}",
          },
        ],
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package*.json", "bun.lockb"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
