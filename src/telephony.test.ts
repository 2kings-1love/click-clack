import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import {
  RadioLineCommunicationManager,
  RadioLineStatus,
  type SIPTrunkConfig,
  createSIPConfigFromEnv,
} from './telephony.js';

describe('Radio Line Communication Manager', () => {
  const mockConfig: SIPTrunkConfig = {
    provider: 'test-provider',
    trunkUri: 'sip.test.com',
    username: 'testuser',
    password: 'testpass',
    inboundNumber: '+1234567890',
    outboundCallerId: '+0987654321',
  };

  describe('RadioLineCommunicationManager', () => {
    it('should initialize with config', () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      assert.ok(manager, 'Manager should be created');
    });

    it('should connect a radio line successfully', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      const lineIdentifier = '+1234567890';

      const connection = await manager.connectRadioLine(lineIdentifier);

      assert.ok(connection, 'Connection should be created');
      assert.strictEqual(connection.status, RadioLineStatus.CONNECTED);
      assert.strictEqual(connection.lineIdentifier, lineIdentifier);
      assert.ok(connection.id, 'Connection should have an ID');
      assert.ok(connection.connectedAt, 'Connection should have a timestamp');
    });

    it('should track multiple connections', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);

      const connection1 = await manager.connectRadioLine('+1111111111');
      const connection2 = await manager.connectRadioLine('+2222222222');

      const allConnections = manager.getAllConnections();
      assert.strictEqual(allConnections.length, 2);
      assert.ok(allConnections.some((c) => c.id === connection1.id));
      assert.ok(allConnections.some((c) => c.id === connection2.id));
    });

    it('should disconnect a radio line', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      const connection = await manager.connectRadioLine('+1234567890');

      await manager.disconnectRadioLine(connection.id);

      const status = manager.getConnectionStatus(connection.id);
      assert.ok(status);
      assert.strictEqual(status.status, RadioLineStatus.DISCONNECTED);
    });

    it('should throw error when disconnecting non-existent connection', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);

      await assert.rejects(
        async () => {
          await manager.disconnectRadioLine('non-existent-id');
        },
        {
          message: /Connection .* not found/,
        },
      );
    });

    it('should check if a line is connected', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      const lineIdentifier = '+1234567890';

      assert.strictEqual(manager.isLineConnected(lineIdentifier), false);

      await manager.connectRadioLine(lineIdentifier);

      assert.strictEqual(manager.isLineConnected(lineIdentifier), true);
    });

    it('should retrieve connection status by ID', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      const connection = await manager.connectRadioLine('+1234567890');

      const status = manager.getConnectionStatus(connection.id);

      assert.ok(status);
      assert.strictEqual(status.id, connection.id);
      assert.strictEqual(status.status, RadioLineStatus.CONNECTED);
    });

    it('should return undefined for non-existent connection', () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      const status = manager.getConnectionStatus('non-existent-id');

      assert.strictEqual(status, undefined);
    });

    it('should attach to room without errors', () => {
      const manager = new RadioLineCommunicationManager(mockConfig);

      // Create a mock room object
      const mockRoom = {
        name: 'test-room',
        on: mock.fn(),
      };

      assert.doesNotThrow(() => {
        manager.attachToRoom(mockRoom);
      });
    });
  });

  describe('createSIPConfigFromEnv', () => {
    it('should create config from environment variables', () => {
      // Set environment variables
      process.env.SIP_PROVIDER = 'twilio';
      process.env.SIP_TRUNK_URI = 'sip.twilio.com';
      process.env.SIP_USERNAME = 'user123';
      process.env.SIP_PASSWORD = 'pass123';
      process.env.SIP_INBOUND_NUMBER = '+1111111111';
      process.env.SIP_OUTBOUND_CALLER_ID = '+2222222222';

      const config = createSIPConfigFromEnv();

      assert.strictEqual(config.provider, 'twilio');
      assert.strictEqual(config.trunkUri, 'sip.twilio.com');
      assert.strictEqual(config.username, 'user123');
      assert.strictEqual(config.password, 'pass123');
      assert.strictEqual(config.inboundNumber, '+1111111111');
      assert.strictEqual(config.outboundCallerId, '+2222222222');

      // Clean up
      delete process.env.SIP_PROVIDER;
      delete process.env.SIP_TRUNK_URI;
      delete process.env.SIP_USERNAME;
      delete process.env.SIP_PASSWORD;
      delete process.env.SIP_INBOUND_NUMBER;
      delete process.env.SIP_OUTBOUND_CALLER_ID;
    });

    it('should use default values when env vars are not set', () => {
      const config = createSIPConfigFromEnv();

      assert.strictEqual(config.provider, 'default');
      assert.strictEqual(config.trunkUri, 'sip.example.com');
      assert.strictEqual(config.username, undefined);
      assert.strictEqual(config.password, undefined);
      assert.strictEqual(config.inboundNumber, undefined);
      assert.strictEqual(config.outboundCallerId, undefined);
    });
  });

  describe('RadioLineStatus', () => {
    it('should have expected status values', () => {
      assert.strictEqual(RadioLineStatus.DISCONNECTED, 'disconnected');
      assert.strictEqual(RadioLineStatus.CONNECTING, 'connecting');
      assert.strictEqual(RadioLineStatus.CONNECTED, 'connected');
      assert.strictEqual(RadioLineStatus.ERROR, 'error');
    });
  });

  describe('Connection lifecycle', () => {
    it('should transition through connection states', async () => {
      const manager = new RadioLineCommunicationManager(mockConfig);
      const lineIdentifier = '+1234567890';

      // Initial state - not connected
      assert.strictEqual(manager.isLineConnected(lineIdentifier), false);

      // Connect the line
      const connection = await manager.connectRadioLine(lineIdentifier);
      assert.strictEqual(connection.status, RadioLineStatus.CONNECTED);
      assert.strictEqual(manager.isLineConnected(lineIdentifier), true);

      // Disconnect the line
      await manager.disconnectRadioLine(connection.id);
      const disconnectedStatus = manager.getConnectionStatus(connection.id);
      assert.ok(disconnectedStatus);
      assert.strictEqual(disconnectedStatus.status, RadioLineStatus.DISCONNECTED);
      assert.strictEqual(manager.isLineConnected(lineIdentifier), false);
    });
  });
});
