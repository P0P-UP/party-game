import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

/**
 * useSocket — manages a singleton socket.io connection.
 *
 * Returns { socket, connected }.
 * The socket is created once and reused across re-renders.
 */
export function useSocket() {
  const socketRef = useRef(null);

  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;

    return () => {
      // Don't disconnect on component unmount — keep connection alive
      // Only disconnect when the app is fully unmounted (page close)
    };
  }, []);

  return socketRef.current;
}

/**
 * useSocketEvent — subscribes to a socket event, auto-cleans up.
 * @param {object} socket
 * @param {string} event
 * @param {function} handler
 */
export function useSocketEvent(socket, event, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;
    const cb = (...args) => handlerRef.current(...args);
    socket.on(event, cb);
    return () => socket.off(event, cb);
  }, [socket, event]);
}
