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
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 150);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 25, 30);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

        // Bloom - Stronger but smaller radius for "Magic" feel
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2, // strength
            0.3, // radius
            0.9  // threshold
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
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
            mesh.position.set(x, 0.5, z);
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
            mesh.position.set(pos.x, 0.5, pos.z);
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

    updatePhysics: function () {
        const obj = this.myRole === 'bunny' ? this.bunny : this.bobcat;
        const input = Controls.getInputVector();

        // Sprint
        const isSprinting = (Controls.keys.shift && input.len > 0.1 && this.myStamina > 0);
        if (isSprinting) this.myStamina = Math.max(0, this.myStamina - 0.8);
        else this.myStamina = Math.min(100, this.myStamina + 0.4);

        // UI
        const bar = document.getElementById('stamina-bar');
        if (bar) bar.style.transform = `scaleX(${this.myStamina / 100})`;

        // Velocity
        let speed = 0.8; // Base speed
        if (isSprinting) speed *= 1.6;
        if (this.myRole === 'bobcat') speed *= 1.05;

        if (input.len > 0.1) {
            this.myVelocity.x += input.x * 2.0; // Acceleration
            this.myVelocity.z += input.z * 2.0;
        }

        // Friction
        this.myVelocity.multiplyScalar(0.9);

        // Cap
        if (this.myVelocity.length() > speed) {
            this.myVelocity.setLength(speed);
        }

        // Move
        const nextPos = obj.position.clone().add(this.myVelocity);

        // World Bounds
        if (nextPos.length() > World.radius) {
            this.myVelocity.multiplyScalar(-0.5); // Bounce
        } else {
            obj.position.copy(nextPos);
        }

        // Scenery Collision
        for (let s of World.scenery) {
            const dx = obj.position.x - s.position.x;
            const dz = obj.position.z - s.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < (obj.userData.radius + s.userData.radius)) {
                this.myVelocity.multiplyScalar(-0.5);
                obj.position.add(this.myVelocity); // Push back
            }
        }

        // Rotation
        if (this.myVelocity.length() > 0.05) {
            const targetRot = Math.atan2(this.myVelocity.x, this.myVelocity.z);
            let rotDiff = targetRot - obj.rotation.y;
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            obj.rotation.y += rotDiff * 0.1;
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
        const time = Date.now() / 1000;

        if (speed > 0.05) {
            // Hopping Animation
            const hopFreq = 15;
            const hopHeight = 0.3;
            const yOff = Math.abs(Math.sin(time * hopFreq)) * hopHeight;

            visuals.position.y = yOff;

            // Tilt forward slightly
            visuals.rotation.x = THREE.MathUtils.lerp(visuals.rotation.x, speed * 0.15, 0.1);

            // Wobble
            visuals.rotation.z = Math.sin(time * hopFreq) * 0.05;
        } else {
            // Idle Breathing
            visuals.position.y = THREE.MathUtils.lerp(visuals.position.y, 0, 0.1);
            visuals.rotation.x = THREE.MathUtils.lerp(visuals.rotation.x, 0, 0.1);
            visuals.rotation.z = THREE.MathUtils.lerp(visuals.rotation.z, 0, 0.1);

            visuals.scale.y = 1 + Math.sin(time * 2) * 0.02;
        }
    },

    updateRemote: function () {
        // Interpolate Bunny
        this.bunny.position.x = THREE.MathUtils.lerp(this.bunny.position.x, this.targetBunny.x, 0.2);
        this.bunny.position.z = THREE.MathUtils.lerp(this.bunny.position.z, this.targetBunny.z, 0.2);
        this.bunny.rotation.y = THREE.MathUtils.lerp(this.bunny.rotation.y, this.targetBunny.r, 0.2);
        const bSpeed = Math.sqrt(this.targetBunny.v.x ** 2 + this.targetBunny.v.z ** 2);
        if (this.myRole !== 'bunny') this.animateObject(this.bunny, bSpeed);

        // Interpolate Bobcat
        this.bobcat.position.x = THREE.MathUtils.lerp(this.bobcat.position.x, this.targetBobcat.x, 0.2);
        this.bobcat.position.z = THREE.MathUtils.lerp(this.bobcat.position.z, this.targetBobcat.z, 0.2);
        this.bobcat.rotation.y = THREE.MathUtils.lerp(this.bobcat.rotation.y, this.targetBobcat.r, 0.2);
        const cSpeed = Math.sqrt(this.targetBobcat.v.x ** 2 + this.targetBobcat.v.z ** 2);
        if (this.myRole !== 'bobcat') this.animateObject(this.bobcat, cSpeed);
    },

    checkLogic: function () {
        if (this.myRole === 'bunny') {
            this.carrots.forEach(c => {
                if (this.collectedIndices.has(c.index)) return;
                if (this.bunny.position.distanceTo(c.mesh.position) < 2.5) {
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

        if (this.myRole === 'bobcat' && dist < 2.5) {
            this.endGame('bobcat');
        }
    },

    endGame: function (winner) {
        this.isGameActive = false;
        Network.send({ type: 'game_over', winner: winner });
        if (winner === 'bunny') document.getElementById('win-screen').style.display = 'block';
        else document.getElementById('lose-screen').style.display = 'block';
    },

    animate: function () {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() / 1000;

        if (this.isGameActive) {
            this.updatePhysics();
            this.checkLogic();
        }
        this.updateRemote();

        // Animate Grass (Simple Wind)
        if (World.grassMesh) {
            // We can't easily animate instanced mesh vertices without a custom shader material on the mesh.
            // But we can rotate the whole group slightly or just leave it static for performance.
            // Let's just leave it static to save FPS, the sky and characters are enough movement.
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.position.add(p.userData.vel);
            p.userData.life -= 0.02;
            p.scale.setScalar(p.userData.life);
            p.rotation.x += 0.1;
            p.rotation.y += 0.1;
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }

        // Camera Smooth Follow
        const target = this.myRole === 'bunny' ? this.bunny : this.bobcat;
        const idealPos = target.position.clone().add(new THREE.Vector3(0, 20, 30));
        this.camera.position.lerp(idealPos, 0.08);
        this.camera.lookAt(target.position.x, 0, target.position.z + 2);

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
    if (msg.type === 'game_restart') location.reload();
};

// Expose to window for UI
window.Game = Game;
window.Network = Network; // Also expose Network for UI buttons
window.Controls = Controls; // Expose Controls just in case

export { Game };
