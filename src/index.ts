import { io, Socket } from "socket.io-client";
import { nanoid } from "nanoid";
import Logger from "./utils/logger"; // Import the logger

/**
 * Options for initializing the MicrostreamClient.
 */
export interface MicrostreamClientOptions {
  /** URL of the Microstream Hub. */
  hubUrl: string;
  /** Name of the service connecting to the hub. */
  serviceName: string;
  /** Timeout for requests in milliseconds (default: 5000). */
  timeout?: number;
  /** Interval for sending heartbeats in milliseconds (default: 5000). */
  heartbeatInterval?: number;
  /** Log level for the client (default: "info"). */
  logLevel?: "debug" | "info" | "warn" | "error" | "silent";
}

/**
 * Payload for sending a request.
 */
export interface RequestPayload {
  /** Unique ID for the request. */
  id: string;
  /** Event name to trigger on the target service. */
  event: string;
  /** Optional data to send with the request. */
  data?: any;
}

/**
 * A client SDK for Microstream communication.
 */
export class MicrostreamClient {
  private socket: Socket;
  private serviceName: string;
  private timeout: number;
  private heartbeatInterval: number;
  private heartbeatTimer?: ReturnType<typeof setTimeout>; // Use NodeJS.Timeout directly
  private handlers: { [event: string]: (data: any) => any } = {};
  private pendingRequests: { [requestId: string]: (response: any) => void } =
    {};
  private logger: Logger; // Add logger instance

  /**
   * Initializes a new MicrostreamClient.
   * @param options - Configuration options for the client.
   */
  constructor({
    hubUrl,
    serviceName,
    timeout = 5000,
    heartbeatInterval = 5000,
    logLevel = "info", // Add logLevel option
  }: MicrostreamClientOptions) {
    this.serviceName = serviceName;
    this.timeout = timeout;
    this.heartbeatInterval = heartbeatInterval;
    this.logger = new Logger(logLevel); // Initialize logger
    this.socket = io(hubUrl, { query: { serviceName } });

    // Handle connection
    this.socket.on("connect", () => {
      this.logger.info(
        `[${this.serviceName}] Connected to Microstream Hub at ${hubUrl}`
      );
      this.startHeartbeat();
    });

    // Handle disconnection
    this.socket.on("disconnect", () => {
      this.logger.warn(
        `[${this.serviceName}] Disconnected from Microstream Hub`
      );
      this.stopHeartbeat();
    });

    // Handle incoming requests
    this.socket.on("request", ({ id, event, data }) => {
      this.logger.debug(
        `[${this.serviceName}] Received request for event "${event}" (ID: ${id})`,
        data
      );

      // Check if a handler is registered for the event
      if (this.handlers[event]) {
        try {
          // Execute the handler and get the response
          const response = this.handlers[event](data);
          this.logger.debug(
            `[${this.serviceName}] Sending response for event "${event}" (ID: ${id})`,
            response
          );
          // Send the response back to the requester
          this.socket.emit("response", { id, response });
        } catch (error) {
          this.logger.error(
            `[${this.serviceName}] Error handling request for event "${event}" (ID: ${id})`,
            error
          );
          // Handle any errors that occur during handler execution
          this.socket.emit("response", { id, error: "Internal server error" });
        }
      } else {
        this.logger.warn(
          `[${this.serviceName}] No handler found for event "${event}" (ID: ${id})`
        );
        // No handler found for the event
        this.socket.emit("response", { id, error: "Event not found" });
      }
    });

    // Handle responses to pending requests
    this.socket.on("response", ({ id, data }) => {
      this.logger.debug(
        `[${this.serviceName}] Received response for request ${id}`,
        data
      );
      if (this.pendingRequests[id]) {
        this.pendingRequests[id](data);
        delete this.pendingRequests[id];
      } else {
        this.logger.warn(
          `[${this.serviceName}] Received unexpected response for request ${id}`,
          data
        );
      }
    });
  }

  /**
   * Registers a handler for incoming requests with the specified event name when the client is initialized.
   * @param event - The event name to listen for.
   * @param handler - The function to handle the request.
   */
  public onRequest(event: string, handler: (data: any) => any) {
    // Register the handler for the specified event - in the beginning - when the client is being initialized
    this.handlers[event] = handler;
  }

  /**
   * Sends a request to another service through the Microstream Hub.
   * @param targetService - The name of the target service.
   * @param event - The event name to trigger on the target service.
   * @param data - Optional data to send with the request.
   * @returns A promise that resolves with the response from the target service.
   */
  public sendRequest(
    targetService: string,
    event: string,
    data?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = nanoid();
      const payload: RequestPayload = { id: requestId, event, data };

      // Send the request
      this.socket.emit("request", { targetService, payload });

      // Set a timeout for the request
      const timeoutHandler = setTimeout(() => {
        // reject(new Error("Request timeout"));
        reject(
          new Error(
            `Request to ${targetService} timed out after ${this.timeout}ms`
          )
        );
        delete this.pendingRequests[requestId]; // Clean up
      }, this.timeout);

      // Track the pending request
      this.pendingRequests[requestId] = (response) => {
        clearTimeout(timeoutHandler);
        // resolve(response);
        if (response.error) {
          reject(new Error(response.error)); // Reject if the response contains an error
        } else {
          resolve(response); // Resolve with the response data
        }
      };
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval > 0) {
      this.logger.info(
        `[${this.serviceName}] Starting heartbeat with interval ${this.heartbeatInterval}ms`
      );
      this.heartbeatTimer = setInterval(() => {
        this.logger.debug(`[${this.serviceName}] Sending heartbeat`);
        this.socket.emit("heartbeat", { serviceName: this.serviceName });
      }, this.heartbeatInterval);
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      this.logger.info(`[${this.serviceName}] Stopping heartbeat`);
      clearInterval(this.heartbeatTimer);
    }
  }
}
