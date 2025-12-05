export const Network = {
    peer: null,
    conn: null,
    myId: null,
    isHost: false,

    // Callbacks
    onConnect: null,
    onData: null,
    onDisconnect: null,

    init: function (role, code = null) {
        // Generate ID or use Code
        if (role === 'bunny') {
            this.isHost = true;
            const shortId = this.generateId();
            this.myId = "BUNNY_GAME_" + shortId;
            return shortId;
        } else {
            this.isHost = false;
            return null;
        }
    },

    connect: function (code = null) {
        // Use Mozilla STUN server
        const config = {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.services.mozilla.com' }
                ]
            }
        };

        if (this.isHost) {
            this.peer = new Peer(this.myId, config);

            this.peer.on('open', (id) => {
                console.log('Host ID:', id);
            });

            this.peer.on('connection', (connection) => {
                this.conn = connection;
                this.setupConnection();
            });

        } else {
            this.peer = new Peer(null, config);

            this.peer.on('open', (id) => {
                const hostId = "BUNNY_GAME_" + code;
                this.conn = this.peer.connect(hostId, { reliable: true });
                this.setupConnection();
            });
        }

        this.peer.on('error', (err) => {
            console.error(err);
            alert("Network Error: " + err.type);
        });
    },

    setupConnection: function () {
        this.conn.on('open', () => {
            console.log("Connected!");
            if (this.onConnect) this.onConnect();
        });

        this.conn.on('data', (data) => {
            if (this.onData) this.onData(data);
        });

        this.conn.on('close', () => {
            if (this.onDisconnect) this.onDisconnect();
        });
    },

    send: function (data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    },

    generateId: function () {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};
