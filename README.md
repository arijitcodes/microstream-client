# MicroStream Client SDK 🚀

The client library for Microstream, a lightweight, real-time communication library for microservices. Replace REST/gRPC with WebSockets for event-driven messaging. Simplifies inter-service communication with a request-response pattern and automatic reconnection.

Author: [Arijit Banerjee](#author)  
License: [MIT](./LICENSE)

<!-- shields.io Badges -->

<!-- Websites / Links - Up / Down -->

[![NPM Package Link](https://img.shields.io/website?url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fmicrostream-client&style=for-the-badge&logo=npm&label=npm%20package&labelColor=%23232323)](https://www.npmjs.com/package/microstream-client) &nbsp;&nbsp;
[![GitHub Repository Link](https://img.shields.io/website?url=https%3A%2F%2Fgithub.com%2Farijitcodes%2Fmicrostream-client&style=for-the-badge&logo=github&label=repository&labelColor=%23232323)](https://github.com/arijitcodes/microstream-client) &nbsp;&nbsp;

<!-- NPM Badges -->

[![NPM License](https://img.shields.io/npm/l/microstream-client?style=for-the-badge&logo=npm&labelColor=%23232323&color=%23404040)](https://github.com/arijitcodes/microstream-client/blob/main/LICENSE.md) &nbsp;
[![NPM Version](https://img.shields.io/npm/v/microstream-client?style=for-the-badge&logo=npm&labelColor=%23232323&color=%23404040)](https://www.npmjs.com/package/microstream-client) &nbsp;
[![npm collaborators](https://img.shields.io/npm/collaborators/microstream-client?style=for-the-badge&logo=npm&label=collaborators&labelColor=%23232323&color=%23404040)](https://www.npmjs.com/package/microstream-client) &nbsp;
[![npm type definitions](https://img.shields.io/npm/types/microstream-client?style=for-the-badge&logo=npm&labelColor=%23232323)](https://www.npmjs.com/package/microstream-client) &nbsp;

<!-- GitHub Badges -->

[![GitHub License](https://img.shields.io/github/license/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=232323&color=404040)](https://github.com/arijitcodes/microstream-client/blob/main/LICENSE) &nbsp;
[![GitHub language count](https://img.shields.io/github/languages/count/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=%23232323&color=%23404040)](https://github.com/arijitcodes/microstream-client) &nbsp;
[![GitHub top language](https://img.shields.io/github/languages/top/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=%23232323)](https://github.com/arijitcodes/microstream-client) &nbsp;
[![GitHub last commit (branch)](https://img.shields.io/github/last-commit/arijitcodes/microstream-client/main?style=for-the-badge&logo=github&labelColor=%23232323)](https://github.com/arijitcodes/microstream-client/commits/main) &nbsp;

[![GitHub contributors](https://img.shields.io/github/contributors/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=232323&color=404040)](https://github.com/arijitcodes/microstream-client/graphs/contributors) &nbsp;
[![GitHub pull requests](https://img.shields.io/github/issues-pr/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=232323&color=404040)](https://github.com/arijitcodes/microstream-client/pulls) &nbsp;
[![GitHub issues](https://img.shields.io/github/issues/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=232323&color=404040)](https://github.com/arijitcodes/microstream-client/issues) &nbsp;
[![GitHub repo size](https://img.shields.io/github/repo-size/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=232323&color=404040)](https://github.com/arijitcodes/microstream-client) &nbsp;
[![GitHub code size](https://img.shields.io/github/languages/code-size/arijitcodes/microstream-client?style=for-the-badge&logo=github&labelColor=232323&color=404040)](https://github.com/arijitcodes/microstream-client) &nbsp;

<!-- Others -->

[![Semantic-Release Badge](https://img.shields.io/badge/semantic--release-e10079?style=for-the-badge&logo=semantic-release&labelColor=%23232323)](https://github.com/semantic-release/semantic-release) &nbsp;
[![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen?style=for-the-badge&labelColor=%23232323&color=brightGreen)](https://commitizen.github.io/cz-cli/) &nbsp;
[![Conventional Commits Badge](https://img.shields.io/badge/conventional_commits-404040?style=for-the-badge&logo=conventionalcommits&labelColor=%23232323&color=%23404040)](https://www.conventionalcommits.org) &nbsp;

<hr>

## Table of Contents 📚

- [Features ✨](#features-✨)
- [Installation 🛠️](#installation-🛠️)
- [Usage 🚀](#usage-🚀)
- [Configuration Options ⚙️](#configuration-options-⚙️)
- [Log Levels 📊](#log-levels-📊)
- [MicroStream Hub 🏢](#microstream-hub-🏢)
- [Author 👨‍💻](#author-👨‍💻)
- [Contributing 🤝](#contributing-🤝)
- [License 📜](#license-📜)

<hr>

## Features ✨

- 🔄 Real-time inter-service communication using WebSockets.
- ⚡ Synchronous request-response pattern without HTTP overhead.
- 🔍 Auto-discovery and connection management.
- 📊 Configurable logging for better observability.
- 🏢 Central WebSocket server for real-time communication between microservices (provided by the hub).
- 🔗 Service discovery and registration (provided by the hub).
- 📡 Request routing and response handling (provided by the hub).
- ❤️ Heartbeat mechanism to detect and remove inactive services (provided by the hub).

<hr>

## Installation 🛠️

```bash
npm install microstream-client
```

<hr>

## Usage 🚀

```typescript
import { MicrostreamClient } from "microstream-client";

// Create a new MicrostreamClient instance with the necessary configuration
const client = new MicrostreamClient({
  hubUrl: "http://localhost:3000", // URL of the Microstream Hub
  serviceName: "auth-service", // Name of your service
  logLevel: "debug", // Enable debug logs
});

// Register a handler for incoming requests
client.onRequest("authenticate", (data) => {
  console.log("Received authentication request:", data);
  return { success: true, token: "sample-token" }; // Respond to the request
});

// Send a request to another service and handle the response
const response = await client.sendRequest("jwt-service", "generate_jwt", {
  userId: 123,
});
console.log("Received response:", response);
```

### Explanation

1. **Configuration**: The [`MicrostreamClient`](#microstreamclientoptions) is configured with the URL of the Microstream Hub, the name of your service, and the log level.
2. **Registering Handlers**: The `onRequest` method is used to register a handler for incoming requests. In this example, the handler responds to an "authenticate" event.
   - **Parameters**:
     - `event`: The event name to listen for.
     - `handler`: The function to handle the request. It receives the request data and returns the response.
3. **Sending Requests**: The `sendRequest` method is used to send a request to another service. In this example, a request is sent to the "jwt-service" to generate a JWT for a user with ID 123.
   - **Parameters**:
     - `targetService`: The name of the target service.
     - `event`: The event name to trigger on the target service.
     - `data`: Optional data to send with the request.
   - **Returns**: A promise that resolves with the response from the target service.

<hr>

## Configuration Options ⚙️

### MicrostreamClientOptions

- `hubUrl`: URL of the Microstream Hub.
- `serviceName`: Name of the service connecting to the hub.
- `timeout`: Timeout for requests in milliseconds (default: 5000).
- `heartbeatInterval`: Interval for sending heartbeats in milliseconds (default: 5000).
- [`logLevel`](#log-levels-): Log level for the client (default: "info").

<hr>

## Log Levels 📊

- `debug`: Log everything (useful for development).
- `info`: Log info, warnings, and errors.
- `warn`: Log warnings and errors.
- `error`: Log only errors.
- `silent`: Disable all logs.

<hr>

## MicroStream Hub 🏢

We also provide a central hub for easy integration with the MicroStream Client SDK.

- [MicroStream Hub on GitHub](https://github.com/arijitcodes/microstream-hub)
- [MicroStream Hub Documentation](https://github.com/arijitcodes/microstream-hub#readme)

<hr>

## Author 👨‍💻

Author: [Arijit Banerjee](https://www.github.com/arijitcodes)

About: Full Stack Web Developer | Cyber Security Enthusiast | Actor

Social Media: &nbsp;
[![Instagram](https://i.ibb.co/4t76vTc/insta-transparent-14px.png) Instagram](https://www.instagram.com/arijit.codes)
&nbsp;
[![Linkedin](https://i.stack.imgur.com/gVE0j.png) LinkedIn](https://www.linkedin.com/in/arijitban)
&nbsp;
[![GitHub](https://i.stack.imgur.com/tskMh.png) GitHub](https://github.com/arijitcodes)
&nbsp;
[![Website](https://i.ibb.co/wCV57xR/Internet-1.png) Website](https://iamarijit.dev)

Email: arijit.codes@gmail.com

<hr>

## Contributing 🤝

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

<hr>

## License 📜

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

<hr>
