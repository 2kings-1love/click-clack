# Radio Line to Communication Lines Integration

This document describes the telephony integration that connects radio/phone lines to the LiveKit agent's communication system via SIP trunks.

## Overview

The `RadioLineCommunicationManager` provides a framework for connecting radio/phone lines to the voice agent through SIP trunk integration. This enables telephony features such as:

- Inbound phone calls to the agent
- Outbound calling capabilities
- SIP trunk connectivity with various providers (Twilio, Telnyx, Vonage, etc.)
- Connection lifecycle management
- Integration with LiveKit rooms for bidirectional audio

## Configuration

### Environment Variables

Add the following variables to your `.env.local` file to configure SIP trunk connectivity:

```env
# SIP Trunk Configuration
SIP_PROVIDER=twilio              # Your SIP provider name
SIP_TRUNK_URI=sip.twilio.com    # SIP trunk URI
SIP_USERNAME=your_username       # SIP authentication username (optional)
SIP_PASSWORD=your_password       # SIP authentication password (optional)
SIP_INBOUND_NUMBER=+1234567890   # Inbound phone number (optional)
SIP_OUTBOUND_CALLER_ID=+1234567890  # Outbound caller ID (optional)
```

## Usage

### Basic Setup

The radio line manager is automatically initialized in the agent entry point:

```typescript
import { RadioLineCommunicationManager, createSIPConfigFromEnv } from './telephony.js';

// Create SIP configuration from environment variables
const sipConfig = createSIPConfigFromEnv();

// Initialize the radio line manager
const radioLineManager = new RadioLineCommunicationManager(sipConfig);

// Attach to the LiveKit room
radioLineManager.attachToRoom(ctx.room);
```

### Connecting a Radio/Phone Line

```typescript
// Connect a radio line by phone number
const connection = await radioLineManager.connectRadioLine('+1234567890');
console.log(`Connection ID: ${connection.id}`);
console.log(`Status: ${connection.status}`);
```

### Managing Connections

```typescript
// Check if a line is connected
const isConnected = radioLineManager.isLineConnected('+1234567890');

// Get connection status
const status = radioLineManager.getConnectionStatus(connectionId);

// Get all active connections
const allConnections = radioLineManager.getAllConnections();

// Disconnect a radio line
await radioLineManager.disconnectRadioLine(connectionId);
```

## Architecture

### Components

1. **RadioLineCommunicationManager**: Main class for managing radio line connections
2. **SIPTrunkConfig**: Configuration interface for SIP trunk settings
3. **RadioLineConnection**: Interface representing a single radio line connection
4. **RadioLineStatus**: Enum for connection states (DISCONNECTED, CONNECTING, CONNECTED, ERROR)

### Connection Lifecycle

1. **CONNECTING**: Initial state when establishing connection
2. **CONNECTED**: Successfully connected and ready for communication
3. **DISCONNECTED**: Connection terminated
4. **ERROR**: Connection failed or encountered an error

## Integration with LiveKit

The radio line manager integrates with LiveKit rooms to enable bidirectional audio:

```typescript
// Attach to room for participant events
radioLineManager.attachToRoom(ctx.room);

// The manager will listen for:
// - participantConnected events
// - participantDisconnected events
```

## Automatic Connection via Room Metadata

The agent automatically attempts to connect radio lines when a phone number is provided in the room metadata:

```typescript
// In agent.ts, this happens automatically
const phoneNumber = ctx.room.metadata;
if (phoneNumber && phoneNumber.startsWith('+')) {
  const connection = await radioLineManager.connectRadioLine(phoneNumber);
}
```

## Testing

The module includes comprehensive tests covering:

- Connection establishment
- Connection lifecycle management
- Error handling
- Multiple concurrent connections
- Room integration
- Environment configuration

Run tests with:

```bash
pnpm test
```

## Future Enhancements

The current implementation provides a framework that can be extended with:

- Real SIP protocol implementation
- Audio routing and codec negotiation
- DTMF tone handling
- Call recording capabilities
- Advanced call control features (hold, transfer, conference)
- WebRTC to SIP gateway integration

## Support

For issues or questions:
1. Check the [LiveKit Telephony Documentation](https://docs.livekit.io/agents/start/telephony/)
2. Review the test files for usage examples
3. Consult the inline documentation in `src/telephony.ts`
