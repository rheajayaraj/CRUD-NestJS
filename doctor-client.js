const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  query: { doctorId: '681da0baae05a57981b50abb' },
});

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('appointmentNotification', (data) => {
  console.log('📩 Notification received:', data);
});
