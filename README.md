# Real-Time Event Notifier API

This API allows users to create events, receive real-time notifications via WebSockets, and log completed events for future reference. It can be used for managing reminders, deadlines, and events that need real-time updates.

## Features

- **Create Events**: Add events with a title, description, and scheduled date & time.
- **Get Upcoming Events**: Fetch all events that are yet to occur.
- **Real-Time Notifications**: Get notifications 5 minutes before an event starts.
- **Event Logging**: Log completed events for future reference.
- **Overlap Handling**: If events overlap, users are notified accordingly.

## Requirements

- **Node.js** (v14 or later)
- **npm** (v6 or later)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AthmikaU/Real-time_Event-Notifier_API.git
   cd Real-time_Event-Notifier_API

2. Install dependencies:
   ```bash
   npm init -y
   npm install express node-cron ws fs
   
3. Start the Server:
   ```bash
   node index.js
- The server will be running at http://localhost:1235


## How to Use the Endpoints in Postman:

### 1. Add Event (`POST /events`)

This endpoint allows you to create a new event.

- Method: `POST`
- URL: `http://localhost:1235/events`
- Request Body (JSON):
     ```json
     {
        "title": "Event Title",
        "description": "Event Description",
        "datetime": "YYYY-MM-DDTHH:mm:ssZ"
      }
    ```
- title (required): The title of the event.
- description (optional): A brief description of the event.
- datetime (required): The date and time when the event will occur, in ISO 8601 format.

- Example Request:
    ```json
        {
          "title": "Meet your Mentor",
          "description": "Meet your mentor at the department!",
          "datetime": "2024-12-02T18:38:00"
        }
    ```
- Response:
  ```json
    {
      "message": "Event created successfully."
    }
  ```

### 2. Get Upcoming Events (GET /events)

This endpoint retrieves all upcoming events.

- Method: `GET`
- URL: `http://localhost:1235/events`
- Response:
  ```json
    {
    "events": [
      {
          "title": "Meet your Mentor",
          "description": "Meet your mentor at the department!",
          "datetime": "2024-12-02T18:38:00",
          "reminderSent": false
      }
    ]
  }
  ```

### 3. WebSocket Testing

1. Open Postman or any WebSocket client (e.g., wscat, or browser-based tools like websocket.org).

2. Connect to the WebSocket URL `ws://localhost:1235`

3. Once connected, you will receive an initial message:
```json
  {
    "message": "Connected to WebSocket."
  }

```

- If an event is created or is about to start (within 5 minutes), you will receive a reminder notification:

```json
  {
    "type": "reminder",
    "event": {
      "title": "Meet your Mentor",
      "description": "Meet your mentor at the department!",
      "datetime": "2024-12-02T18:38:00",
      "reminderSent": true
    }
  }
```

### 4. Event Completion Logging

- `Cron Job for Event Handling`: A cron job is scheduled to run every minute (* * * * *), checking for events that are scheduled to start within the next 5 minutes. If such events exist, a WebSocket notification will be sent to all connected clients exactly once before 5 minutes.
- Once an event has passed, it is removed from the event list and logged in the file `./completed_events.json`.

<hr />
  
