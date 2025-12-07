// Controls Module
// Handles Keyboard and Touch Input

export const Controls = {
    keys: { w: false, s: false, a: false, d: false, shift: false },
    joystick: { x: 0, y: 0 },
    isMobile: false,

    init: function () {
        document.addEventListener('keydown', (e) => this.handleKey(e, true));
        document.addEventListener('keyup', (e) => this.handleKey(e, false));

        // Detect mobile
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.isMobile = true;
            this.setupJoystick();
            this.setupTouchSprint();
        }
    },

    handleKey: function (e, isDown) {
        const k = e.key.toLowerCase();
        // console.log(`Key ${isDown ? 'down' : 'up'}: ${k}`); // Debug log
        if (k === 'w' || k === 'arrowup') this.keys.w = isDown;
        if (k === 's' || k === 'arrowdown') this.keys.s = isDown;
        if (k === 'a' || k === 'arrowleft') this.keys.a = isDown;
        if (k === 'd' || k === 'arrowright') this.keys.d = isDown;
        if (k === 'shift') this.keys.shift = isDown;
    },

    getInputVector: function () {
        let inputX = 0;
        let inputZ = 0;

        if (this.keys.w) inputZ -= 1;
        if (this.keys.s) inputZ += 1;
        if (this.joystick.y !== 0) inputZ += this.joystick.y;

        if (this.keys.a) inputX -= 1;
        if (this.keys.d) inputX += 1;
        if (this.joystick.x !== 0) inputX += this.joystick.x;

        // Normalize
        const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
        if (len > 1) {
            inputX /= len;
            inputZ /= len;
        }

        return { x: inputX, z: inputZ, len: len };
    },

    setupJoystick: function () {
        const base = document.getElementById('joystick-base');
        const knob = document.getElementById('joystick-knob');
        if (!base) return;

        let centerX, centerY;
        const maxRadius = 40;

        base.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = base.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        });

        base.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const factor = distance > maxRadius ? maxRadius / distance : 1;
            const moveX = deltaX * factor;
            const moveY = deltaY * factor;

            knob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
            this.joystick.x = moveX / maxRadius;
            this.joystick.y = moveY / maxRadius;
        });

        base.addEventListener('touchend', (e) => {
            e.preventDefault();
            knob.style.transform = `translate(-50%, -50%)`;
            this.joystick.x = 0;
            this.joystick.y = 0;
        });
    },

    setupTouchSprint: function () {
        const btn = document.getElementById('sprint-btn');
        if (!btn) return;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.shift = true; btn.style.background = "rgba(255,255,255,0.5)"; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.shift = false; btn.style.background = "rgba(255,255,255,0.2)"; });
    }
};
