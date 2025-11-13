/**
 * Room interface for type safety
 * Represents a minimal LiveKit Room interface needed for telephony integration
 */
export interface RoomInterface {
  name?: string | undefined;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

/**
 * Configuration for connecting a radio/phone line via SIP trunk
 */
export interface SIPTrunkConfig {
  /** SIP trunk provider name (e.g., 'twilio', 'telnyx', 'vonage') */
  provider: string;
  /** SIP trunk URI or hostname */
  trunkUri: string;
  /** Username for SIP authentication */
  username?: string;
  /** Password for SIP authentication */
  password?: string;
  /** Inbound phone number for receiving calls */
  inboundNumber?: string;
  /** Outbound caller ID */
  outboundCallerId?: string;
}

/**
 * Connection status for a radio line
 */
export enum RadioLineStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * Radio line connection interface
 * Represents a connection between a radio/phone line and the communication system
 */
export interface RadioLineConnection {
  /** Unique identifier for this connection */
  id: string;
  /** Current status of the connection */
  status: RadioLineStatus;
  /** Associated phone number or line identifier */
  lineIdentifier: string;
  /** SIP trunk configuration used for this connection */
  config: SIPTrunkConfig;
  /** Connected timestamp */
  connectedAt?: Date;
  /** Error message if status is ERROR */
  error?: string;
}

/**
 * Manager for radio line connections to communication lines
 */
export class RadioLineCommunicationManager {
  private connections: Map<string, RadioLineConnection> = new Map();
  private config: SIPTrunkConfig;

  constructor(config: SIPTrunkConfig) {
    this.config = config;
  }

  /**
   * Connect a radio/phone line to the communication system
   * @param lineIdentifier Phone number or line identifier
   * @returns Connection object
   */
  async connectRadioLine(lineIdentifier: string): Promise<RadioLineConnection> {
    const connectionId = `radio-line-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const connection: RadioLineConnection = {
      id: connectionId,
      status: RadioLineStatus.CONNECTING,
      lineIdentifier,
      config: this.config,
    };

    this.connections.set(connectionId, connection);

    try {
      // Simulate SIP trunk connection establishment
      console.log(`Connecting radio line ${lineIdentifier} via ${this.config.provider}`);
      console.log(`SIP Trunk URI: ${this.config.trunkUri}`);

      // In a real implementation, this would:
      // 1. Establish SIP connection to the trunk
      // 2. Configure audio routing
      // 3. Set up call handling
      // 4. Register with the SIP provider

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      connection.status = RadioLineStatus.CONNECTED;
      connection.connectedAt = new Date();

      console.log(`✓ Radio line ${lineIdentifier} connected successfully`);
      this.connections.set(connectionId, connection);

      return connection;
    } catch (error) {
      connection.status = RadioLineStatus.ERROR;
      connection.error = error instanceof Error ? error.message : String(error);
      this.connections.set(connectionId, connection);
      throw error;
    }
  }

  /**
   * Disconnect a radio line
   * @param connectionId Connection identifier
   */
  async disconnectRadioLine(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    console.log(`Disconnecting radio line ${connection.lineIdentifier}`);

    connection.status = RadioLineStatus.DISCONNECTED;
    this.connections.set(connectionId, connection);

    console.log(`✓ Radio line ${connection.lineIdentifier} disconnected`);
  }

  /**
   * Get status of a specific connection
   * @param connectionId Connection identifier
   */
  getConnectionStatus(connectionId: string): RadioLineConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Get all active connections
   */
  getAllConnections(): RadioLineConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Check if a line is currently connected
   * @param lineIdentifier Phone number or line identifier
   */
  isLineConnected(lineIdentifier: string): boolean {
    return Array.from(this.connections.values()).some(
      (conn) =>
        conn.lineIdentifier === lineIdentifier && conn.status === RadioLineStatus.CONNECTED,
    );
  }

  /**
   * Configure the manager for use with a LiveKit room
   * This enables integration with the voice agent's communication system
   * @param room LiveKit room instance
   */
  attachToRoom(room: RoomInterface): void {
    console.log(`Attaching radio line manager to room: ${room.name}`);

    // In a real implementation, this would:
    // 1. Set up audio tracks for the radio line
    // 2. Configure bidirectional audio routing
    // 3. Handle participant events
    // 4. Manage call state

    room.on('participantConnected', (...args: unknown[]) => {
      const participant = args[0] as { identity: string };
      console.log(`Participant connected: ${participant.identity}`);
    });

    room.on('participantDisconnected', (...args: unknown[]) => {
      const participant = args[0] as { identity: string };
      console.log(`Participant disconnected: ${participant.identity}`);
    });
  }
}

/**
 * Create a SIP trunk configuration from environment variables
 */
export function createSIPConfigFromEnv(): SIPTrunkConfig {
  const config: SIPTrunkConfig = {
    provider: process.env.SIP_PROVIDER || 'default',
    trunkUri: process.env.SIP_TRUNK_URI || 'sip.example.com',
  };

  if (process.env.SIP_USERNAME) {
    config.username = process.env.SIP_USERNAME;
  }
  if (process.env.SIP_PASSWORD) {
    config.password = process.env.SIP_PASSWORD;
  }
  if (process.env.SIP_INBOUND_NUMBER) {
    config.inboundNumber = process.env.SIP_INBOUND_NUMBER;
  }
  if (process.env.SIP_OUTBOUND_CALLER_ID) {
    config.outboundCallerId = process.env.SIP_OUTBOUND_CALLER_ID;
  }

  return config;
}
