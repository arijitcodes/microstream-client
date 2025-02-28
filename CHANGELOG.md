# 1.0.0 (2025-02-28)


### Bug Fixes

✅ **tsconfig:** Simplify include paths in TypeScript configuration ([4db3106](https://github.com/arijitcodes/microstream-client/commit/4db310686451130f89cdcd3e8f6a6d25f77aae92))
  


### Features

✅ **logger:** Implement configurable and colorful logging ([2cff58b](https://github.com/arijitcodes/microstream-client/commit/2cff58b8aa2a31fcd50cbd25df1e1c6259d486c3))  

This commit introduces a new logging utility to the microstream-client SDK, allowing developers to control the verbosity of logs using a configurable logLevel option. The logLevel supports the following levels: "debug", "info", "warn", "error", and "silent". Additionally, logs are now color-coded based on their type for better readability.

Changes include:
- Creation of a logger.ts file in src/utils/ with methods for debug, info, warn, and error, respecting the logLevel setting.
- Addition of a logLevel option to the MicrostreamClientOptions interface.
- Initialization of the logger in the MicrostreamClient constructor using the provided logLevel.
- Replacement of all console.log, console.warn, and console.error calls with the appropriate logger methods.
- Color-coding of log messages using the chalk library. <br/><br/>
  
✅ **logger:** Implement configurable logging and replace console statements in client SDK ([4506ce3](https://github.com/arijitcodes/microstream-client/commit/4506ce3ba2a96d31f537413b823a76b2295d25b2))  

This commit introduces a new logging utility to the microstream-client SDK, allowing developers to control the verbosity of logs using a configurable logLevel option. The logLevel supports the following levels: "debug", "info", "warn", "error", and "silent".

Changes include:

- Creation of a logger.ts file in src/utils/ with methods for debug, info, warn, and error, respecting the logLevel setting.
- Addition of a logLevel option to the MicrostreamClientOptions interface.
- Initialization of the logger in the MicrostreamClient constructor using the provided logLevel.
- Replacement of all console.log, console.warn, and console.error calls with the appropriate logger methods. <br/><br/>
  
✅ **microstream-client:** The primary working setup for microstream-client. ([c10ec70](https://github.com/arijitcodes/microstream-client/commit/c10ec700ab1bb1609f42691e5d5531c801a8ec79))  

This is the first commit - with the primary version (v1) of a working version of microstream-client. <br/><br/>
  
✅ **semantic-release:** set up Semantic-Release for auto Release & Update ([72890b7](https://github.com/arijitcodes/microstream-client/commit/72890b72dee0f3551cc70a2f16b0946712eb5a67)), closes [#1](https://github.com/arijitcodes/microstream-client/issues/1)  

    Setup Semantic-Release with Commitizen - along with GitHub Workflow. Now this setup will -

     - Auto Release on GitHub, NPM
     - Update Changelog automatically from Conventional Commit messages and update version in package.json
     - Set up Commitizen for Conventional Commit message formatting
     - Setup GitHub Workflow to automate all these tasks <br/><br/>
