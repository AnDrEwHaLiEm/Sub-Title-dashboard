const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
    try {
        const path = req.query.path;
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal server error');
            } else {
                const response = data.split("\n");
                return res.send(response);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    console.log(`Client connected, ${wss.clients.size} clients connected`);

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log('Received: ', data);
        // Broadcast message to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', function () {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
