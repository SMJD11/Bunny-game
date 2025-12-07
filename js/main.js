import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { Network } from './network.js';
import { Controls } from './controls.js';
import { Objects } from './objects.js';
import { World } from './world.js';

// Main Game Module

const Game = {
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    clock: null,

    bunny: null,
    bobcat: null,
    carrots: [],
    particles: [],

    myRole: null,
    isGameActive: false,

    // Physics
    myVelocity: new THREE.Vector3(),
    myStamina: 100,
    collectedIndices: new Set(),

    // Remote State
    targetBunny: { x: 20, z: 0, r: 0, v: { x: 0, z: 0 } },
    targetBobcat: { x: -20, z: 0, r: Math.PI, v: { x: 0, z: 0 } },

    init: function () {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        // Scene background and fog are now set by World module

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 30, 45);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(this.renderer.domElement);

        // Post Processing
        this.setupPostProcessing();

        // World
        World.create(this.scene);

        // Objects
        this.bunny = Objects.createBunny();
        this.bunny.position.set(20, 0, 0);
        this.scene.add(this.bunny);

        this.bobcat = Objects.createBobcat();
        this.bobcat.position.set(-20, 0, 0);
        this.bobcat.rotation.y = Math.PI;
        this.scene.add(this.bobcat);

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start Loop
        this.animate();
    },

    setupPostProcessing: function () {
        const renderScene = new RenderPass(this.scene, this.camera);

        // Softer bloom for realistic sunlit glow
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,  // strength - softer for realism
            0.5,  // radius - wider spread
            0.85  // threshold - higher for just bright objects
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // Ensure controls are initialized
        Controls.init();
    },

    startGame: function (role) {
        this.myRole = role;
        this.isGameActive = true;
        document.getElementById('player-role-display').innerText = role.toUpperCase();
        document.getElementById('player-role-display').style.color = role === 'bunny' ? '#FFA500' : '#A0522D';

        if (role === 'bunny') {
            this.spawnCarrots();
        }
    },

    spawnCarrots: function () {
        // Clear existing
        this.carrots.forEach(c => this.scene.remove(c.mesh));
        this.carrots = [];
        const data = [];

        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 15 + Math.random() * (World.radius - 25);
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            const mesh = Objects.createCarrot();
            // Snap to terrain height + offset
            const y = World.getTerrainHeight(x, z) + 1.5;
            mesh.position.set(x, y, z);
            this.scene.add(mesh);
            this.carrots.push({ mesh: mesh, index: i });
            data.push({ x, z });
        }

        Network.send({ type: 'carrot_init', data: data });
    },

    spawnRemoteCarrots: function (data) {
        this.carrots.forEach(c => this.scene.remove(c.mesh));
        this.carrots = [];

        data.forEach((pos, i) => {
            const mesh = Objects.createCarrot();
            // Snap to terrain height + offset
            const y = World.getTerrainHeight(pos.x, pos.z) + 1.5;
            mesh.position.set(pos.x, y, pos.z);
            this.scene.add(mesh);
            this.carrots.push({ mesh: mesh, index: i });
        });
    },

    hideCarrot: function (index) {
        if (this.carrots[index] && !this.collectedIndices.has(index)) {
            this.collectedIndices.add(index);
            this.carrots[index].mesh.visible = false;
            this.spawnParticles(this.carrots[index].mesh.position, 0xff8c00);
            document.getElementById('score').innerText = `Carrots: ${this.collectedIndices.size} / 10`;
        }
    },

    spawnParticles: function (pos, color) {
        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 8; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos);
            mesh.position.y += 0.5;
            mesh.userData = {
                vel: new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5),
                life: 1.0
            };
            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    },

    spawnDustParticle: function (pos) {
        const geo = new THREE.SphereGeometry(0.15, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xc4a672,
            transparent: true,
            opacity: 0.6
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            pos.x + (Math.random() - 0.5) * 0.5,
            0.1 + Math.random() * 0.3,
            pos.z + (Math.random() - 0.5) * 0.5
        );
        mesh.userData = {
            vel: new THREE.Vector3((Math.random() - 0.5) * 0.1, Math.random() * 0.05, (Math.random() - 0.5) * 0.1),
            life: 0.8
        };
        this.scene.add(mesh);
        this.particles.push(mesh);
    },

    updatePhysics: function () {
        const obj = this.myRole === 'bunny' ? this.bunny : this.bobcat;
        const input = Controls.getInputVector();

        // Sprint
        const isSprinting = (Controls.keys.shift && input.len > 0.1 && this.myStamina > 0);
        if (isSprinting) this.myStamina = Math.max(0, this.myStamina - 0.6);
        else this.myStamina = Math.min(100, this.myStamina + 0.3);

        // UI
        const bar = document.getElementById('stamina-bar');
        if (bar) bar.style.transform = `scaleX(${this.myStamina / 100})`;

        // Velocity - improved acceleration
        let maxSpeed = 1.2; // Increased base speed
        if (isSprinting) maxSpeed *= 1.8;
        if (this.myRole === 'bobcat') maxSpeed *= 1.08;

        // TANK CONTROLS (Steering + Throttle)
        // input.z is Throttle (Forward/Back)
        // input.x is Steering (Left/Right)

        const turnSpeed = 0.05;
        if (input.x !== 0) {
            obj.rotation.y -= input.x * turnSpeed;
        }

        // Calculate forward vector based on rotation
        // Model faces +Z (0,0,1) when rotation is 0? 
        // Wait, earlier we said "Behind is -Z". So Forward is +Z?
        // Let's test: If rot=0, and we want to go forward (input.z < 0), we should move +Z?
        // Standard Three.js: Forward is usually -Z.
        // Let's assume Forward is -Z relative to the model.

        const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), obj.rotation.y);

        // Throttle
        // input.z is -1 for W (Forward), +1 for S (Back)
        const throttle = -input.z; // Invert so W is positive throttle

        // Acceleration
        const accel = 0.15;
        if (throttle !== 0) {
            this.myVelocity.add(forwardDir.multiplyScalar(throttle * accel));
        }

        // Friction
        this.myVelocity.multiplyScalar(0.92);

        // Cap speed
        if (this.myVelocity.length() > maxSpeed) {
            this.myVelocity.setLength(maxSpeed);
        }

        // Calculate next position
        const nextPos = obj.position.clone().add(this.myVelocity);

        // SOFT WORLD BOUNDARY - gradual slowdown instead of hard bounce
        const distFromCenter = nextPos.length();
        const softBoundaryStart = World.radius * 0.85; // Start slowing at 85% of radius

        // Debug Physics
        // if (Math.random() < 0.05) {
        //     console.log('Pos:', obj.position);
        //     console.log('Dist:', distFromCenter, 'Radius:', World.radius);
        //     console.log('SoftStart:', softBoundaryStart);
        //     console.log('Input:', input);
        // }


        if (distFromCenter > softBoundaryStart) {
            // Calculate how far into the soft boundary zone we are (0 to 1)
            const boundaryDepth = (distFromCenter - softBoundaryStart) / (World.radius - softBoundaryStart);
            const clampedDepth = Math.min(boundaryDepth, 1);

            // Apply progressive slowdown
            const slowdownFactor = 1 - (clampedDepth * 0.8);
            this.myVelocity.multiplyScalar(slowdownFactor);

            // Push back gently toward center if at edge
            if (distFromCenter > World.radius * 0.95) {
                const pushBack = nextPos.clone().normalize().multiplyScalar(-0.3);
                this.myVelocity.add(pushBack);
            }
        }

        // Apply final position (X/Z)
        obj.position.x += this.myVelocity.x;
        obj.position.z += this.myVelocity.z;

        // SNAP TO TERRAIN HEIGHT
        const terrainHeight = World.getTerrainHeight(obj.position.x, obj.position.z);
        obj.position.y = terrainHeight;


        // Hard clamp to prevent escaping
        if (obj.position.length() > World.radius) {
            obj.position.setLength(World.radius * 0.98);
        }

        // IMPROVED SCENERY COLLISION - proper push-away
        for (let s of World.scenery) {
            const dx = obj.position.x - s.position.x;
            const dz = obj.position.z - s.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Larger collision radius for trees
            const minDist = (obj.userData.radius || 1.5) + (s.userData.radius || 2.0);

            if (dist < minDist) {
                // Push player away from obstacle center
                const pushStrength = (minDist - dist) * 1.0; // Hard push
                const pushDir = new THREE.Vector3(dx, 0, dz).normalize();

                // Apply push
                obj.position.x += pushDir.x * pushStrength;
                obj.position.z += pushDir.z * pushStrength;

                // Kill velocity completely (Crash)
                this.myVelocity.set(0, 0, 0);
            }
        }

        // Rotation handled by steering above


        // Spawn dust particles when running fast
        if (this.myVelocity.length() > 0.5 && Math.random() < 0.3) {
            this.spawnDustParticle(obj.position);
        }

        this.animateObject(obj, this.myVelocity.length());

        // Send Data
        Network.send({
            type: 'pos',
            role: this.myRole,
            data: {
                x: obj.position.x,
                z: obj.position.z,
                r: obj.rotation.y,
                v: { x: this.myVelocity.x, z: this.myVelocity.z }
            }
        });
    },

    animateObject: function (obj, speed) {
        const visuals = obj.userData.visuals;
        const legs = obj.userData.legs;
        const time = Date.now() / 1000;

        // Base height offset (breathing)
        let baseY = 0;

        // --- BUNNY HOPPING PHYSICS ---
        // If this object is a bunny (has no 'legs' array in my new implementation, or check role)
        // Actually, my new bunny has no 'legs' array in userData.legs (it has static legs in visuals)
        // Bobcat has 'legs' array.
        const isBobcat = (legs && legs.length > 0);

        if (!isBobcat && speed > 0.1) {
            // HOPPING
            const hopFreq = 12;
            const hopHeight = 0.8; // Higher hop

            // Sine wave for hop
            const hopCycle = Math.sin(time * hopFreq);
            // Only positive part of sine wave (bounce)
            baseY = Math.abs(hopCycle) * hopHeight;

            // Tilt forward when moving
            visuals.rotation.x = THREE.MathUtils.lerp(visuals.rotation.x, 0.2, 0.1);
        }
        else if (isBobcat && speed > 0.1) {
            // BOBCAT RUNNING
            const freq = 15;
            const amp = 0.8;

            if (legs && legs.length === 4) {
                // Diagonal pairs
                legs[0].rotation.x = Math.sin(time * freq) * amp;
                legs[3].rotation.x = Math.sin(time * freq) * amp;
                legs[1].rotation.x = Math.sin(time * freq + Math.PI) * amp;
                legs[2].rotation.x = Math.sin(time * freq + Math.PI) * amp;
            }

            // Bobbing
            baseY = Math.abs(Math.sin(time * freq)) * 0.15;
            visuals.rotation.x = THREE.MathUtils.lerp(visuals.rotation.x, 0.1, 0.1);
        }
        else {
            // IDLE
            if (legs) {
                legs.forEach(leg => leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, 0, 0.1));
            }
            baseY = Math.sin(time * 2) * 0.02;
            visuals.rotation.x = THREE.MathUtils.lerp(visuals.rotation.x, 0, 0.1);
        }

        // Apply local Y offset to visuals (relative to the terrain-snapped root)
        visuals.position.y = baseY;
    },

    updateRemote: function () {
        // Interpolate Bunny
        if (this.myRole !== 'bunny') {
            this.bunny.position.x = THREE.MathUtils.lerp(this.bunny.position.x, this.targetBunny.x, 0.2);
            this.bunny.position.z = THREE.MathUtils.lerp(this.bunny.position.z, this.targetBunny.z, 0.2);

            // Snap to terrain
            this.bunny.position.y = World.getTerrainHeight(this.bunny.position.x, this.bunny.position.z);

            this.bunny.rotation.y = THREE.MathUtils.lerp(this.bunny.rotation.y, this.targetBunny.r, 0.2);
            const bSpeed = Math.sqrt(this.targetBunny.v.x ** 2 + this.targetBunny.v.z ** 2);
            this.animateObject(this.bunny, bSpeed);
        }

        // Interpolate Bobcat
        if (this.myRole !== 'bobcat') {
            this.bobcat.position.x = THREE.MathUtils.lerp(this.bobcat.position.x, this.targetBobcat.x, 0.2);
            this.bobcat.position.z = THREE.MathUtils.lerp(this.bobcat.position.z, this.targetBobcat.z, 0.2);

            // Snap to terrain
            this.bobcat.position.y = World.getTerrainHeight(this.bobcat.position.x, this.bobcat.position.z);

            this.bobcat.rotation.y = THREE.MathUtils.lerp(this.bobcat.rotation.y, this.targetBobcat.r, 0.2);
            const cSpeed = Math.sqrt(this.targetBobcat.v.x ** 2 + this.targetBobcat.v.z ** 2);
            this.animateObject(this.bobcat, cSpeed);
        }
    },

    checkLogic: function () {
        if (this.myRole === 'bunny') {
            this.carrots.forEach(c => {
                if (this.collectedIndices.has(c.index)) return;
                // Increased collection radius
                if (this.bunny.position.distanceTo(c.mesh.position) < 4.0) {
                    this.hideCarrot(c.index);
                    Network.send({ type: 'carrot_collected', index: c.index });
                    if (this.collectedIndices.size >= 10) this.endGame('bunny');
                }
            });
        }

        const dist = this.bunny.position.distanceTo(this.bobcat.position);
        let danger = 1 - ((dist - 5) / 40);
        danger = Math.max(0, Math.min(0.6, danger));
        document.getElementById('danger-overlay').style.boxShadow = `inset 0 0 ${danger * 150}px ${danger * 80}px rgba(255, 0, 0, ${danger})`;

        // ROBUST COLLISION: Host (Bunny) checks, or Bobcat checks.
        // Let's make it so if ANYONE detects it, it counts.
        if (dist < 2.0) { // Reduced distance for more precision
            this.endGame('bobcat');
        }
    },

    endGame: function (winner) {
        this.isGameActive = false;
        Network.send({ type: 'game_over', winner: winner });
        if (winner === 'bunny') document.getElementById('win-screen').style.display = 'block';
        else document.getElementById('lose-screen').style.display = 'block';
    },

    resetGame: function () {
        // Reset State
        this.isGameActive = true;
        this.myStamina = 100;
        this.myVelocity.set(0, 0, 0);
        this.collectedIndices.clear();

        // Reset Positions
        this.bunny.position.set(20, World.getTerrainHeight(20, 0), 0);
        this.bunny.rotation.set(0, 0, 0);

        this.bobcat.position.set(-20, World.getTerrainHeight(-20, 0), 0);
        this.bobcat.rotation.set(0, Math.PI, 0);

        // Reset UI
        document.getElementById('win-screen').style.display = 'none';
        document.getElementById('lose-screen').style.display = 'none';
        document.getElementById('score').innerText = "Carrots: 0 / 10";
        document.getElementById('danger-overlay').style.boxShadow = "none";

        // Respawn Carrots (Host Only)
        if (this.myRole === 'bunny') {
            this.spawnCarrots();
        }
    },

    animate: function () {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        const time = Date.now() / 1000;

        if (this.isGameActive) {
            this.updatePhysics();
            this.checkLogic();
        }
        this.updateRemote();

        // Update world animations (clouds)
        if (World.update) {
            World.update(deltaTime);
        }

        // Animate carrots floating
        for (const carrot of this.carrots) {
            if (carrot.mesh.visible) {
                carrot.mesh.position.y = 0.8 + Math.sin(time * 2 + carrot.mesh.userData.offset) * 0.3;
                carrot.mesh.rotation.y += 0.02;
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.position.add(p.userData.vel);
            p.userData.life -= 0.02;
            p.scale.setScalar(Math.max(0, p.userData.life));
            p.rotation.x += 0.1;
            p.rotation.y += 0.1;
            if (p.material.opacity !== undefined) {
                p.material.opacity = p.userData.life;
            }
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }

        // Dynamic Camera Follow - CHASE CAMERA
        const target = this.myRole === 'bunny' ? this.bunny : this.bobcat;
        if (target) {
            // Calculate ideal offset relative to player rotation
            // We want the camera BEHIND the player.
            // Player faces -Z (usually) or moves in direction of velocity.

            const dist = 40; // Zoomed out even more
            const height = 20; // Higher up

            // Calculate offset based on player's Y rotation
            // If rotation is 0, player faces +Z. Back is -Z.
            // Actually in Three.js, standard forward is -Z.
            // Let's use simple trigonometry based on rotation.

            // Model faces +Z when rotation is 0.
            // So "Behind" is -Z.
            // We need to invert the offset direction.

            const angle = target.rotation.y;
            const backX = Math.sin(angle);
            const backZ = Math.cos(angle);

            // Negate the direction to place camera BEHIND
            const idealPos = new THREE.Vector3(
                target.position.x - backX * dist,
                target.position.y + height,
                target.position.z - backZ * dist
            );

            // Smoothly move camera
            this.camera.position.lerp(idealPos, 0.1);

            // Look at player
            const lookTarget = target.position.clone().add(new THREE.Vector3(0, 2, 0));
            this.camera.lookAt(lookTarget);
        }

        this.composer.render();
    }
};

// Network Handlers
Network.onData = (msg) => {
    if (msg.type === 'pos') {
        if (msg.role === 'bunny') Game.targetBunny = msg.data;
        if (msg.role === 'bobcat') Game.targetBobcat = msg.data;
    }
    if (msg.type === 'carrot_init') Game.spawnRemoteCarrots(msg.data);
    if (msg.type === 'carrot_collected') Game.hideCarrot(msg.index);
    if (msg.type === 'game_over') {
        Game.isGameActive = false;
        if (msg.winner === 'bunny') document.getElementById('win-screen').style.display = 'block';
        else document.getElementById('lose-screen').style.display = 'block';
    }
    if (msg.type === 'game_restart') Game.resetGame();
};

// Expose to window for UI
window.Game = Game;
window.Network = Network; // Also expose Network for UI buttons
window.Controls = Controls; // Expose Controls just in case

export { Game };
