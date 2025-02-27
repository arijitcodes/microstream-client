# Microstream Client SDK

A lightweight client SDK for Microstream communication.

## Installation

```bash
npm install microstream-client
```

## Usage

```typescript
import { MicrostreamClient } from "microstream-client";

const client = new MicrostreamClient({
  hubUrl: "http://localhost:3000",
  serviceName: "auth-service",
  logLevel: "debug", // Enable debug logs
});

client.onRequest("authenticate", (data) => {
  console.log("Received authentication request:", data);
  return { success: true, token: "sample-token" };
});

const response = await client.sendRequest("jwt-service", "generate_jwt", {
  userId: 123,
});
console.log("Received response:", response);
```

### Configuration Options

#### MicrostreamClientOptions

- `hubUrl`: URL of the Microstream Hub.
- `serviceName`: Name of the service connecting to the hub.
- `timeout`: Timeout for requests in milliseconds (default: 5000).
- `heartbeatInterval`: Interval for sending heartbeats in milliseconds (default: 5000).
- `logLevel`: Log level for the client (default: "info").

### Log Levels

- `debug`: Log everything (useful for development).
- `info`: Log only important events (useful for production).
- `warn`: Log only warnings and errors.
- `error`: Log only errors.
- `silent`: Disable all logs.
