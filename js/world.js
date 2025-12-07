import * as THREE from 'three';

// World Module - Stunning Realistic Environment

export const World = {
    radius: 500, // Much larger world for unlimited feeling
    scenery: [],
    grassMesh: null,
    cloudMeshes: [],

    // Time for animations
    time: 0,

    // Enhanced color palette
    colors: {
        groundBase: 0x5d9a36, // More vibrant green
        groundHighlight: 0x8bc34a,
        grassLight: 0xaed581,
        grassMid: 0x7cb342,
        grassDark: 0x558b2f,
        skyZenith: 0x1976d2, // Deeper blue
        skyHorizon: 0x90caf9, // Brighter horizon
        sunGlow: 0xffcc80,
        cloudWhite: 0xffffff,
        cloudShadow: 0xe1f5fe
    },

    create: function (scene) {
        this.createRealisticSky(scene);
        this.createExpandedTerrain(scene);
        this.createDenseVegetation(scene);
        this.createRealisticLighting(scene);
    },

    createRealisticSky: function (scene) {
        // Beautiful gradient sky dome with sunset warmth
        const vertexShader = `
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform vec3 zenithColor;
            uniform vec3 horizonColor;
            uniform vec3 sunColor;
            uniform vec3 sunPosition;
            uniform float time;
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            
            void main() {
                vec3 viewDir = normalize(vWorldPosition);
                float elevation = viewDir.y;
                
                // Sky gradient with multiple color stops
                vec3 skyColor;
                if (elevation > 0.0) {
                    float t = pow(elevation, 0.5);
                    skyColor = mix(horizonColor, zenithColor, t);
                } else {
                    skyColor = horizonColor;
                }
                
                // Sun glow effect
                vec3 sunDir = normalize(sunPosition);
                float sunDot = max(0.0, dot(viewDir, sunDir));
                float sunGlow = pow(sunDot, 64.0);
                float sunHalo = pow(sunDot, 8.0) * 0.3;
                skyColor += sunColor * (sunGlow + sunHalo);
                
                // Horizon warmth
                float horizonFactor = 1.0 - abs(elevation);
                horizonFactor = pow(horizonFactor, 4.0);
                skyColor = mix(skyColor, vec3(1.0, 0.85, 0.7), horizonFactor * 0.3);
                
                gl_FragColor = vec4(skyColor, 1.0);
            }
        `;

        const skyUniforms = {
            zenithColor: { value: new THREE.Color(0x1565c0) },
            horizonColor: { value: new THREE.Color(0x87ceeb) },
            sunColor: { value: new THREE.Color(0xfff8e1) },
            sunPosition: { value: new THREE.Vector3(200, 100, 150) },
            time: { value: 0 }
        };

        const skyGeo = new THREE.SphereGeometry(800, 64, 32);
        const skyMat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: skyUniforms,
            side: THREE.BackSide,
            depthWrite: false
        });

        const sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);
        this.skyMaterial = skyMat;

        // Volumetric clouds
        this.createClouds(scene);

        // Atmospheric fog for infinite horizon
        scene.fog = new THREE.FogExp2(0xc5dbe6, 0.0012);
    },

    createClouds: function (scene) {
        const cloudGroup = new THREE.Group();

        // Cloud material with soft edges
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            roughness: 1,
            metalness: 0,
            flatShading: true
        });

        // Create multiple cloud clusters
        for (let i = 0; i < 25; i++) {
            const cloudCluster = new THREE.Group();

            // Each cloud is multiple merged spheres
            const numPuffs = 5 + Math.floor(Math.random() * 8);
            for (let j = 0; j < numPuffs; j++) {
                const puffSize = 8 + Math.random() * 15;
                const puffGeo = new THREE.SphereGeometry(puffSize, 8, 6);
                const puff = new THREE.Mesh(puffGeo, cloudMat);
                puff.position.set(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 25
                );
                puff.scale.y = 0.4 + Math.random() * 0.3;
                cloudCluster.add(puff);
            }

            // Position cloud in sky
            const angle = Math.random() * Math.PI * 2;
            const dist = 200 + Math.random() * 400;
            cloudCluster.position.set(
                Math.cos(angle) * dist,
                60 + Math.random() * 80,
                Math.sin(angle) * dist
            );
            cloudCluster.rotation.y = Math.random() * Math.PI;

            cloudCluster.userData = {
                speed: 0.02 + Math.random() * 0.03,
                originalX: cloudCluster.position.x,
                originalZ: cloudCluster.position.z
            };

            cloudGroup.add(cloudCluster);
            this.cloudMeshes.push(cloudCluster);
        }

        scene.add(cloudGroup);
    },

    createExpandedTerrain: function (scene) {
        // Large terrain with rolling hills
        const terrainSize = 1200;
        const segments = 128;
        const geo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
        const pos = geo.attributes.position;

        // More complex noise for realistic hills
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);

            // Multiple octaves of noise for natural terrain
            let height = 0;
            height += Math.sin(x * 0.01) * Math.cos(y * 0.01) * 8;      // Large rolling hills
            height += Math.sin(x * 0.025) * Math.cos(y * 0.025) * 4;    // Medium variations
            height += Math.sin(x * 0.05 + 1.3) * Math.cos(y * 0.05) * 2; // Small bumps
            height += Math.sin(x * 0.08) * Math.cos(y * 0.08 + 0.7) * 1; // Fine detail

            pos.setZ(i, height);
        }
        geo.computeVertexNormals();

        // Rich ground material with color variation
        const groundMat = new THREE.MeshStandardMaterial({
            color: this.colors.groundBase,
            roughness: 0.95,
            metalness: 0,
            flatShading: false
        });

        const terrain = new THREE.Mesh(geo, groundMat);
        terrain.rotation.x = -Math.PI / 2;
        terrain.position.y = -3;
        terrain.receiveShadow = true;
        scene.add(terrain);

        this.terrain = terrain;
    },

    createDenseVegetation: function (scene) {
        // Dense instanced grass with color variation
        this.createGrass(scene);

        // Realistic trees
        this.createTrees(scene);

        // Natural rocks
        this.createRocks(scene);

        // Wildflowers
        this.createFlowers(scene);
    },

    createGrass: function (scene) {
        // Grass blade geometry - taller and more realistic
        const grassGeo = new THREE.BufferGeometry();

        // Triangle blade shape
        const vertices = new Float32Array([
            -0.05, 0, 0,
            0.05, 0, 0,
            0, 0.8, 0
        ]);
        grassGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        grassGeo.computeVertexNormals();

        // Grass material with wind animation capability
        const grassMat = new THREE.MeshLambertMaterial({
            color: this.colors.grassMid,
            side: THREE.DoubleSide
        });

        const grassCount = 30000;
        this.grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
        this.grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        const dummy = new THREE.Object3D();
        const grassColors = [
            new THREE.Color(this.colors.grassLight),
            new THREE.Color(this.colors.grassMid),
            new THREE.Color(this.colors.grassDark)
        ];

        // Instance color buffer for variation
        const colorArray = new Float32Array(grassCount * 3);

        for (let i = 0; i < grassCount; i++) {
            // Distribute grass in a large area
            const r = Math.pow(Math.random(), 0.5) * 450;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            // Calculate height based on terrain
            const terrainY = this.getTerrainHeight(x, z);

            dummy.position.set(x, terrainY, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.rotation.x = (Math.random() - 0.5) * 0.3;

            const scale = 0.6 + Math.random() * 0.8;
            dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);

            dummy.updateMatrix();
            this.grassMesh.setMatrixAt(i, dummy.matrix);

            // Random grass color
            const color = grassColors[Math.floor(Math.random() * grassColors.length)];
            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
        }

        this.grassMesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
        this.grassMesh.receiveShadow = true;
        scene.add(this.grassMesh);
    },

    createTrees: function (scene) {
        // Realistic tree materials
        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x5d4037,
            roughness: 1,
            metalness: 0
        });

        const leafMats = [
            new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8, flatShading: true }),
            new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.8, flatShading: true }),
            new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.8, flatShading: true })
        ];

        for (let i = 0; i < 60; i++) {
            const tree = new THREE.Group();

            // Trunk - tapered cylinder
            const trunkHeight = 2 + Math.random() * 2;
            const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, trunkHeight, 8);
            const trunk = new THREE.Mesh(trunkGeo, barkMat);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            tree.add(trunk);

            // Foliage - multiple layers of icosahedrons
            const foliageBase = trunkHeight;
            const foliageLayers = 2 + Math.floor(Math.random() * 2);

            for (let j = 0; j < foliageLayers; j++) {
                const layerSize = 2.5 - j * 0.6;
                const foliageGeo = new THREE.IcosahedronGeometry(layerSize, 0);
                const foliage = new THREE.Mesh(foliageGeo, leafMats[j % leafMats.length]);
                foliage.position.y = foliageBase + j * 1.2 + 0.5;
                foliage.scale.y = 0.7;
                foliage.rotation.y = Math.random() * Math.PI;
                foliage.castShadow = true;
                tree.add(foliage);
            }

            // Position tree
            const angle = Math.random() * Math.PI * 2;
            const dist = 25 + Math.random() * 400;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const y = this.getTerrainHeight(x, z);

            tree.position.set(x, y, z);

            const scale = 0.7 + Math.random() * 0.8;
            tree.scale.setScalar(scale);

            scene.add(tree);
            tree.userData = { radius: 1.2 * scale };
            this.scenery.push(tree);
        }
    },

    createRocks: function (scene) {
        const rockMats = [
            new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.9, flatShading: true }),
            new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.95, flatShading: true }),
            new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9, flatShading: true })
        ];

        for (let i = 0; i < 40; i++) {
            const rockGeo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.5, 0);
            const rock = new THREE.Mesh(rockGeo, rockMats[Math.floor(Math.random() * rockMats.length)]);

            // Position
            const angle = Math.random() * Math.PI * 2;
            const dist = 15 + Math.random() * 400;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const y = this.getTerrainHeight(x, z);

            rock.position.set(x, y + 0.3, z);
            rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
            rock.scale.set(
                0.8 + Math.random() * 1.5,
                0.4 + Math.random() * 0.8,
                0.8 + Math.random() * 1.5
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);

            rock.userData = { radius: 1.0 };
            this.scenery.push(rock);
        }
    },

    createFlowers: function (scene) {
        // Colorful wildflowers scattered around
        const flowerColors = [0xff4081, 0xffeb3b, 0x7c4dff, 0xff5722, 0x00bcd4];

        for (let i = 0; i < 200; i++) {
            const flowerGroup = new THREE.Group();

            // Stem
            const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
            const stemMat = new THREE.MeshLambertMaterial({ color: 0x558b2f });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.2;
            flowerGroup.add(stem);

            // Petals
            const petalColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            const petalMat = new THREE.MeshLambertMaterial({ color: petalColor });
            const petalGeo = new THREE.SphereGeometry(0.08, 6, 4);

            for (let p = 0; p < 5; p++) {
                const petal = new THREE.Mesh(petalGeo, petalMat);
                const pAngle = (p / 5) * Math.PI * 2;
                petal.position.set(Math.cos(pAngle) * 0.08, 0.45, Math.sin(pAngle) * 0.08);
                flowerGroup.add(petal);
            }

            // Center
            const centerGeo = new THREE.SphereGeometry(0.05, 6, 4);
            const centerMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b });
            const center = new THREE.Mesh(centerGeo, centerMat);
            center.position.y = 0.45;
            flowerGroup.add(center);

            // Position
            const r = Math.random() * 350;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = this.getTerrainHeight(x, z);

            flowerGroup.position.set(x, y, z);
            flowerGroup.scale.setScalar(0.8 + Math.random() * 0.6);

            scene.add(flowerGroup);
        }
    },

    getTerrainHeight: function (x, z) {
        // Match the terrain generation formula
        let height = 0;
        height += Math.sin(x * 0.01) * Math.cos(z * 0.01) * 8;
        height += Math.sin(x * 0.025) * Math.cos(z * 0.025) * 4;
        height += Math.sin(x * 0.05 + 1.3) * Math.cos(z * 0.05) * 2;
        height += Math.sin(x * 0.08) * Math.cos(z * 0.08 + 0.7) * 1;
        return height - 3;
    },

    createRealisticLighting: function (scene) {
        // Strong Ambient Light (Crucial for Safari/Mobile visibility)
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        // Hemisphere light for ambient environmental lighting
        const hemi = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.4);
        scene.add(hemi);

        // Main sun light - golden hour warmth
        const sun = new THREE.DirectionalLight(0xffe0b2, 1.8); // Brighter sun
        sun.position.set(150, 100, 100);
        sun.castShadow = true;

        // High quality shadows
        sun.shadow.mapSize.width = 4096;
        sun.shadow.mapSize.height = 4096;
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 500;

        const shadowSize = 250;
        sun.shadow.camera.left = -shadowSize;
        sun.shadow.camera.right = shadowSize;
        sun.shadow.camera.top = shadowSize;
        sun.shadow.camera.bottom = -shadowSize;
        sun.shadow.bias = -0.0003;
        sun.shadow.normalBias = 0.02;

        scene.add(sun);

        // Subtle fill light from opposite direction
        const fill = new THREE.DirectionalLight(0xcce5ff, 0.3);
        fill.position.set(-100, 40, -80);
        scene.add(fill);
    },

    // Update clouds animation
    update: function (deltaTime) {
        this.time += deltaTime;

        // Animate clouds drifting
        for (const cloud of this.cloudMeshes) {
            const offset = Math.sin(this.time * cloud.userData.speed) * 20;
            cloud.position.x = cloud.userData.originalX + offset;
        }
    }
};
