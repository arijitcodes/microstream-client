
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
});

client.onRequest("authenticate", (data) => {
  console.log("Received authentication request:", data);
  return { success: true, token: "sample-token" };
});

const response = await client.sendRequest("jwt-service", "generate_jwt", { userId: 123 });
console.log("Received response:", response);
```
