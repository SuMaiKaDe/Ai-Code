const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const rooms = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-room', (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                gameStarted: false,
                bombNumber: null,
                minNumber: 1,
                maxNumber: 100,
                currentPlayer: 0,
                playerReadyStatus: {}
            };
        }
        const room = rooms[roomCode];
        if (room.players.length < 5) {
            const playerId = room.players.length + 1;
            room.players.push({ id: playerId, socketId: socket.id });
            room.playerReadyStatus[playerId] = false;
            socket.join(roomCode);
            socket.emit('joined-room', { playerId, players: room.players, playerReadyStatus: room.playerReadyStatus });
            io.to(roomCode).emit('player-joined', { playerId, players: room.players, playerReadyStatus: room.playerReadyStatus });
        } else {
            socket.emit('room-full');
        }
    });

    socket.on('player-ready', (data) => {
        const { roomCode, playerId } = data;
        const room = rooms[roomCode];
        room.playerReadyStatus[playerId] = true;
        const allPlayersReady = Object.values(room.playerReadyStatus).every(status => status);
        io.to(roomCode).emit('player - ready - updated', { playerId, playerReadyStatus: room.playerReadyStatus, allPlayersReady });
    });

    socket.on('start-game', (roomCode) => {
        const room = rooms[roomCode];
        const playerIds = room.players.map(player => player.id);
        if (!room.gameStarted && playerIds[0] === 1 && Object.values(room.playerReadyStatus).every(status => status)) {
            room.gameStarted = true;
            room.bombNumber = Math.floor(Math.random() * 100) + 1;
            io.to(roomCode).emit('game-started', {
                players: room.players,
                minNumber: room.minNumber,
                maxNumber: room.maxNumber,
                currentPlayer: room.currentPlayer,
                bombNumber: room.bombNumber
            });
        } else {
            io.to(roomCode).emit('start - game - error', '有玩家未准备或不是1号玩家发起请求');
        }
    });

    socket.on('select-number', (data) => {
    const { roomCode, selectedNumber } = data;
    const room = rooms[roomCode];
    if (room.gameStarted) {
        const currentPlayer = room.players[room.currentPlayer];
        if (currentPlayer.socketId === socket.id) {
            if (selectedNumber === room.bombNumber) {
                io.to(roomCode).emit('bomb-selected', { playerId: currentPlayer.id });
                // 游戏结束后重置房间状态
                room.gameStarted = false;
                room.bombNumber = null;
                room.minNumber = 1;
                room.maxNumber = 100;
                room.currentPlayer = 0;
                // 重置玩家准备状态
                Object.keys(room.playerReadyStatus).forEach(playerId => {
                    room.playerReadyStatus[playerId] = false;
                });
            } else {
                let numbersToDisable = [];
                if (selectedNumber < room.bombNumber) {
                    for (let i = room.minNumber; i <= selectedNumber; i++) {
                        numbersToDisable.push(i);
                    }
                    room.minNumber = selectedNumber + 1;
                } else {
                    for (let i = selectedNumber; i <= room.maxNumber; i++) {
                        numbersToDisable.push(i);
                    }
                    room.maxNumber = selectedNumber - 1;
                }
                room.currentPlayer = (room.currentPlayer + 1) % room.players.length;
                io.to(roomCode).emit('number-selected', {
                    selectedNumber,
                    minNumber: room.minNumber,
                    maxNumber: room.maxNumber,
                    currentPlayer: room.currentPlayer,
                    numbersToDisable
                });
            }
        }
    }
});


    socket.on('game-ended', (roomCode) => {
    const room = rooms[roomCode];
    // 确保游戏状态重置
    room.gameStarted = false;
    room.bombNumber = null;
    room.minNumber = 1;
    room.maxNumber = 100;
    room.currentPlayer = 0;
    // 重置玩家准备状态
    Object.keys(room.playerReadyStatus).forEach(playerId => {
        room.playerReadyStatus[playerId] = false;
    });
    io.to(roomCode).emit('game-ended', { playerReadyStatus: room.playerReadyStatus });
});


    socket.on('disconnect', () => {
        console.log('A user disconnected');
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const index = room.players.findIndex(player => player.socketId === socket.id);
            if (index!== -1) {
                const playerId = room.players[index].id;
                room.players.splice(index, 1);
                delete room.playerReadyStatus[playerId];
                io.to(roomCode).emit('player-left', { players: room.players, playerReadyStatus: room.playerReadyStatus });
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                }
            }
        }
    });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`Server running on port ${port}`);
});