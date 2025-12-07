import { Game } from './main.js';
import { Network } from './network.js';

const UI = {
    init: function () {
        // Check for file:// protocol
        if (window.location.protocol === 'file:') {
            alert("⚠️ SECURITY WARNING ⚠️\n\nModern web games (ES Modules) cannot run directly from the file system due to browser security (CORS).\n\nPlease run a local server (e.g., 'python3 -m http.server') and open 'http://localhost:8000'.");
            const status = document.getElementById('status-msg');
            if (status) {
                status.innerText = "Error: Please run a local server!";
                status.style.color = "red";
            }
        }

        this.setupEventListeners();
    },

    setupEventListeners: function () {
        const btnHost = document.getElementById('btn-host');
        const btnJoin = document.getElementById('btn-join');
        const btnSolo = document.getElementById('btn-solo');
        const btnRestartWin = document.querySelector('#win-screen button');
        const btnRestartLose = document.querySelector('#lose-screen button');

        if (btnHost) btnHost.addEventListener('click', () => this.startHost());
        if (btnJoin) btnJoin.addEventListener('click', () => this.startJoin());
        if (btnSolo) btnSolo.addEventListener('click', () => this.startSolo());

        if (btnRestartWin) btnRestartWin.addEventListener('click', () => {
            Game.resetGame();
            Network.send({ type: 'game_restart' });
        });
        if (btnRestartLose) btnRestartLose.addEventListener('click', () => {
            Game.resetGame();
            Network.send({ type: 'game_restart' });
        });
    },

    startHost: function () {
        const id = Network.init('bunny');
        document.getElementById('setup-phase').style.display = 'none';
        document.getElementById('waiting-phase').style.display = 'block';
        document.getElementById('host-id-display').style.display = 'block';
        document.getElementById('host-id-display').innerText = id;

        Network.onConnect = () => {
            document.getElementById('lobby-screen').style.display = 'none';
            Game.startGame('bunny');
        };
        Network.connect();
    },

    startJoin: function () {
        const code = document.getElementById('join-code').value.toUpperCase();
        if (code.length !== 4) return alert("Enter 4-letter code");

        Network.init('bobcat');
        Network.onConnect = () => {
            document.getElementById('lobby-screen').style.display = 'none';
            Game.startGame('bobcat');
        };
        Network.connect(code);
    },

    startSolo: function () {
        document.getElementById('lobby-screen').style.display = 'none';
        Game.startGame('bunny');
        // AI
        setInterval(() => {
            if (Game.isGameActive && Game.bobcat && Game.bunny) {
                const dx = Game.bunny.position.x - Game.bobcat.position.x;
                const dz = Game.bunny.position.z - Game.bobcat.position.z;
                Game.bobcat.position.x += dx * 0.02;
                Game.bobcat.position.z += dz * 0.02;
                Game.bobcat.lookAt(Game.bunny.position);
            }
        }, 50);
    }
};

// Initialize when module loads
UI.init();

export { UI };
