export const SOCKET_EVENT_CONNECT = 'connect';
export const SOCKET_EVENT_DISCONNECT = 'disconnect';
export const SOCKET_EVENT_MESSAGE = 'message';
export const SOCKET_EVENT_JOIN = 'join';
export const SOCKET_EVENT_LEAVE = 'leave';
export const SOCKET_EVENT_TYPING = 'typing';
export const SOCKET_EVENT_STOP_TYPING = 'stop_typing';
export const SOCKET_EVENT_ERROR = 'error';

export const SOCKET_EVENT_ALERT = 'alert';
export const SOCKET_EVENT_REFETCH_CHATS = 'refetch_chats';
export const SOCKET_EVENT_NEW_ATTACHMENTS = 'new_attachments';
export const SOCKET_EVENT_NEW_MESSAGE_ALERT = 'new_message_alert';
export const SOCKET_EVENT_NEW_REQUEST = 'new_request';

export const SOCKET_EVENTS = [
    SOCKET_EVENT_CONNECT,
    SOCKET_EVENT_DISCONNECT,
    SOCKET_EVENT_MESSAGE,
    SOCKET_EVENT_JOIN,
    SOCKET_EVENT_LEAVE,
    SOCKET_EVENT_TYPING,
    SOCKET_EVENT_STOP_TYPING,
    SOCKET_EVENT_ERROR,
    SOCKET_EVENT_ALERT,
    SOCKET_EVENT_REFETCH_CHATS,
    SOCKET_EVENT_NEW_ATTACHMENTS,
    SOCKET_EVENT_NEW_MESSAGE_ALERT,
    SOCKET_EVENT_NEW_REQUEST,
];