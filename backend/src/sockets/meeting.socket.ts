import { Namespace } from 'socket.io';
import { registerJoinRoomHandler } from './handlers/joinRoom.handler.js';
import { registerLeaveRoomHandler } from './handlers/leaveRoom.handler.js';
import { registerTransportHandlers } from './handlers/transport.handler.js';
import { registerProduceHandlers } from './handlers/produce.handler.js';
import { registerConsumeHandlers } from './handlers/consume.handler.js';
import { registerReactionHandlers } from './handlers/reaction.handler.js';
import { registerChatHandlers } from './chat.socket.js';

export function registerMeetingHandlers(io: Namespace): void {
  io.on('connection', (socket) => {
    registerJoinRoomHandler(socket);
    registerLeaveRoomHandler(socket);
    registerTransportHandlers(socket);
    registerProduceHandlers(socket);
    registerConsumeHandlers(socket);
    registerReactionHandlers(socket);
    registerChatHandlers(socket);
  });
}
