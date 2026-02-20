import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const socket = io(SOCKET_URL, {
  autoConnect: false,   // ← don't connect until user is logged in
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export const connectSocket = () => {
  if (!socket.connected) socket.connect()
}