const express = require('express');
const cron = require('node-cron');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const PORT = 1235;
const COMPLETED_EVENTS_LOG = './completed_events.json';

app.use(express.json());

const events = [];

// add events
app.post('/events', (req, res) => {
  const { title, description, datetime } = req.body;
  if (!title || !datetime) {
    return res.status(400).send({ message: 'Title and datetime are required.' });
  }

  const event = { title, description, datetime, reminderSent: false };
  events.push(event);
  res.status(201).send({ message: 'Event created successfully.' });
});

// get upcoming events
app.get('/events', (req, res) => {
  const currentTime = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.datetime) > currentTime);
  res.json({ events: upcomingEvents });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ message: 'Connected to WebSocket.' }));
});

const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// send reminders and handle completed events
cron.schedule('* * * * *', () => {
  const currentTime = new Date();
  const fiveMinutesBefore = new Date(currentTime.getTime() + 5 * 60 * 1000);

  events.forEach((event, index) => {
    const eventTime = new Date(event.datetime);

    // Send reminder 5 minutes before the event time if not already sent
    if (!event.reminderSent && eventTime > currentTime && eventTime <= fiveMinutesBefore) {
      broadcast({ type: 'reminder', event });
      event.reminderSent = true;
    }

    // Mark completed events and log them
    if (eventTime <= currentTime) {
      const completedEvent = events.splice(index, 1)[0];
      fs.appendFile(
        COMPLETED_EVENTS_LOG,
        JSON.stringify(completedEvent) + '\n',
        (err) => {
          if (err) console.error('Error logging event:', err);
        }
      );
    }
  });
});

// WebSocket test client
const testClient = new WebSocket(`ws://localhost:${PORT}`);

testClient.on('open', () => {
  console.log('Test client connected to WebSocket server');
});
testClient.on('message', (data) => {
  console.log('Test client received:', JSON.parse(data));
});
