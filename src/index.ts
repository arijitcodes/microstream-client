import { io, Socket } from "socket.io-client";
import { nanoid } from "nanoid";
import Logger from "./utils/logger"; // Import the logger
import { exit } from "process";
import CustomError from "./utils/customError"; // Import the custom error class

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
  private timedOutRequests: {
    [requestId: string]: {
      allowLateResponseAfterTimeout: boolean;
      onLateResponse?: (
        error: CustomError | null,
        response: {
          response: any;
          originalPayload: RequestPayload;
        } | null
      ) => void;
      originalPayload: RequestPayload; // In case we use it in future
    };
  } = {};
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
    this.socket.on("request", ({ id, event, data }: RequestPayload) => {
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
          // this.socket.emit("response", { id, error: "Internal server error" });
          // Send a CustomError for internal server errors
          this.socket.emit("response", {
            id,
            response: {
              error: new CustomError(
                "INTERNAL_SERVER_ERROR",
                "Internal server error",
                {
                  event,
                  requestID: id,
                  error:
                    error instanceof Error || error instanceof CustomError
                      ? error.message
                      : "UNKNOWN",
                }
              ),
            },
          });
        }
      } else {
        this.logger.warn(
          `[${this.serviceName}] No handler found for event "${event}" (ID: ${id})`
        );
        // No handler found for the event
        // this.socket.emit("response", { id, error: "Event not found" });
        // Send a CustomError for event not found errors
        this.socket.emit("response", {
          id,
          response: {
            error: new CustomError(
              "EVENT_NOT_FOUND",
              `Event "${event}" not found`,
              { event, requestID: id, serviceName: this.serviceName }
            ),
          },
        });
      }
    });

    // Handle responses to pending requests
    this.socket.on("response", ({ id, response }) => {
      this.logger.debug(
        `[${this.serviceName}] Received response for request ${id}`,
        response
      );

      /*
      if (this.pendingRequests[id]) {
        this.pendingRequests[id](response);
        delete this.pendingRequests[id];
      } else {
        this.logger.warn(
          `[${this.serviceName}] Received unexpected response for request ${id}`,
          response
        );
      }
      */

      // First check if the request is a Normal Pending Request
      if (this.pendingRequests[id]) {
        this.pendingRequests[id](response);
        delete this.pendingRequests[id];
        return;
      }

      // Else - Check if the request is in timedOutRequests
      const timedOutRequest = this.timedOutRequests[id];

      if (timedOutRequest) {
        this.logger.warn(
          `Received response for timed-out request ${id}`,
          response
        );

        // Check if late responses are allowed
        if (timedOutRequest.allowLateResponseAfterTimeout) {
          // Invoke the onLateResponse callback if it exists
          this.logger.info(
            `Invoking onLateResponse callback for timed-out request ${id}`
          );

          if (timedOutRequest.onLateResponse) {
            // If the response contains an error, pass it as the first argument
            if (response.error) {
              timedOutRequest.onLateResponse(
                response.error, // Error object
                null // No response
              );
            } else {
              // If the response is successful, pass null as the first argument and the response as the second argument
              timedOutRequest.onLateResponse(
                null, // No error
                {
                  response,
                  originalPayload: timedOutRequest.originalPayload,
                }
              );
            }
          }
        }

        // Clean up the timed-out request
        delete this.timedOutRequests[id];
      } else {
        // Completely unexpected response
        this.logger.warn(
          `[${this.serviceName}] Received unexpected response for request ${id}`,
          response
        );
      }
    });

    // Handle socket connection rejection error by the hub
    this.socket.on("connect_error", (error) => {
      const customError = error as Error & { data?: any };

      // Check if the error contains additional data
      if (customError instanceof Error && customError.data) {
        // If yes, then it's a custom connection error/rejection from the hub
        this.logger.error(
          `[${this.serviceName}] Connection error to MicroStream Hub: ${customError.data?.code}:`,
          customError.data?.message
        );

        // Special cases for handling specific error codes
        switch (customError.data?.code) {
          case "DUPLICATE_SERVICE_REGISTRATION":
            // Exit the process if a duplicate service registration attempt is detected
            exit(1);
            break;

          // Add more cases as needed in the future

          default:
            // Do something on default or continue as usual
            break;
        }
      } else {
        this.logger.error(
          `[${this.serviceName}] Connection error to Microstream Hub: ${customError.message}`
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
   *
   * @param targetService - The name of the target service.
   * @param event - The event name to trigger on the target service.
   * @param data - Optional data to send with the request.
   * @param allowLateResponseAfterTimeout - Whether to allow handling late responses after the request times out.
   *                                         If `true`, the `onLateResponse` callback will be invoked if a late response is received.
   *                                         Defaults to `false`.
   * @param onLateResponse - Optional callback to handle late responses. This callback is invoked if:
   *                         1. `allowLateResponseAfterTimeout` is `true`, and
   *                         2. A late response is received after the request has timed out.
   *                         The callback receives two arguments:
   *                         - `error`: A `CustomError` object if the late response contains an error, or `null` if the response is successful.
   *                         - `response`: An object containing the `response` and `originalPayload` if the response is successful, or `null` if there’s an error.
   * @returns A promise that resolves with the response from the target service.
   *          If the request times out, the promise is rejected with a `CustomError`. For specific error codes, refer to the documentation.
   *          If a late response is received and `allowLateResponseAfterTimeout` is `true`, the `onLateResponse` callback is invoked.
   */
  public sendRequest(
    targetService: string,
    event: string,
    data?: any,
    allowLateResponseAfterTimeout: boolean = false,
    onLateResponse?: (
      error: CustomError | null,
      response: {
        response: any;
        originalPayload: RequestPayload;
      } | null
    ) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = nanoid();
      const payload: RequestPayload = { id: requestId, event, data };

      // Send the request
      this.socket.emit("request", { targetService, payload });

      // Set a timeout for the request
      const timeoutHandler = setTimeout(() => {
        // Only add the timed out request to timedOutRequests object/map if late responses are allowed
        if (allowLateResponseAfterTimeout) {
          this.timedOutRequests[requestId] = {
            allowLateResponseAfterTimeout,
            onLateResponse,
            originalPayload: payload,
          };
        }

        // reject(new Error("Request timeout"));
        reject(
          /* new Error(
            `Request to ${targetService} timed out after ${this.timeout}ms`
          ) */
          new CustomError(
            "REQUEST_TIMEOUT",
            `Request to ${targetService} timed out after ${this.timeout}ms`,
            { targetService, event, data }
          )
        );

        // Delete from PendingRequests
        delete this.pendingRequests[requestId]; // Clean up
      }, this.timeout);

      // Track the pending request
      this.pendingRequests[requestId] = (response) => {
        clearTimeout(timeoutHandler);
        // resolve(response);
        if (response.error) {
          reject(response.error); // Reject if the response contains an error
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
