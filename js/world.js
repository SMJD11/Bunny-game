import * as THREE from 'three';

// World Module - Stylized Revamp

export const World = {
    radius: 120,
    scenery: [],
    grassMesh: null,

    // Config
    colors: {
        ground: 0x8bc34a,
        grass: 0xaed581,
        skyTop: 0x2980b9,
        skyBottom: 0xf1c40f
    },

    create: function (scene) {
        this.createSky(scene);
        this.createTerrain(scene);
        this.createVegetation(scene);
        this.createLighting(scene);
    },

    createSky: function (scene) {
        // Gradient Sky Sphere
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `;
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition + offset ).y;
                gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
            }
        `;
        const uniforms = {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0xffeedd) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        };

        const skyGeo = new THREE.SphereGeometry(400, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);

        // Fog to blend
        scene.fog = new THREE.FogExp2(0xffeedd, 0.002);
    },

    createTerrain: function (scene) {
        // Uneven Ground using Simplex-like noise (Math.sin combination for simplicity)
        const geo = new THREE.PlaneGeometry(300, 300, 64, 64);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            // Simple noise function
            const z = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 2 +
                Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
            pos.setZ(i, z);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            color: this.colors.ground,
            roughness: 1,
            flatShading: true
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -2; // Lower slightly so 0 is "ground level" roughly
        mesh.receiveShadow = true;
        scene.add(mesh);
    },

    createVegetation: function (scene) {
        // 1. Grass (Instanced)
        const grassGeo = new THREE.ConeGeometry(0.1, 0.6, 3);
        grassGeo.translate(0, 0.3, 0);
        const grassMat = new THREE.MeshLambertMaterial({ color: this.colors.grass });

        const count = 8000;
        this.grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, count);
        this.grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Allow updates if we want complex animation

        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            const r = Math.random() * 110;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            // Height offset based on terrain noise (approx)
            const y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 - 2;

            dummy.position.set(x, y, z);
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.rotation.z = (Math.random() - 0.5) * 0.2; // Slight tilt
            dummy.scale.setScalar(0.8 + Math.random() * 0.5);
            dummy.updateMatrix();
            this.grassMesh.setMatrixAt(i, dummy.matrix);
        }
        this.grassMesh.receiveShadow = true;
        scene.add(this.grassMesh);

        // 2. Trees (Stylized)
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 1 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.8, flatShading: true });
        const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.8, flatShading: true });

        for (let i = 0; i < 40; i++) {
            const grp = new THREE.Group();

            // Trunk
            const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.5, 6), trunkMat);
            t.position.y = 0.75; t.castShadow = true;
            grp.add(t);

            // Leaves (Clumps of spheres/dodecahedrons)
            const lGeo = new THREE.DodecahedronGeometry(1);
            const l1 = new THREE.Mesh(lGeo, leafMat);
            l1.position.y = 2.5; l1.scale.set(1.2, 1, 1.2); l1.castShadow = true;

            const l2 = new THREE.Mesh(lGeo, leafMat2);
            l2.position.set(0.5, 2, 0.5); l2.scale.set(0.8, 0.8, 0.8); l2.castShadow = true;

            const l3 = new THREE.Mesh(lGeo, leafMat2);
            l3.position.set(-0.5, 2.2, -0.4); l3.scale.set(0.7, 0.7, 0.7); l3.castShadow = true;

            grp.add(l1); grp.add(l2); grp.add(l3);

            // Position
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 90;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 - 2;

            grp.position.set(x, y, z);

            // Random Scale
            const s = 0.8 + Math.random() * 0.8;
            grp.scale.set(s, s, s);

            scene.add(grp);
            grp.userData = { radius: 1.0 * s };
            this.scenery.push(grp);
        }

        // 3. Rocks
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, flatShading: true });
        const rockGeo = new THREE.DodecahedronGeometry(0.8);

        for (let i = 0; i < 20; i++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            const angle = Math.random() * Math.PI * 2;
            const dist = 10 + Math.random() * 100;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 - 2;

            rock.position.set(x, y + 0.3, z);
            rock.scale.set(1 + Math.random(), 0.5 + Math.random() * 0.5, 1 + Math.random());
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
            rock.userData = { radius: 0.8 };
            this.scenery.push(rock);
        }
    },

    createLighting: function (scene) {
        // Ambient
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        scene.add(hemi);

        // Sun (Golden Hour)
        const dir = new THREE.DirectionalLight(0xffaa00, 1.2);
        dir.position.set(80, 50, 50);
        dir.castShadow = true;

        // Shadow Config
        dir.shadow.mapSize.width = 2048;
        dir.shadow.mapSize.height = 2048;
        const d = 150;
        dir.shadow.camera.left = -d; dir.shadow.camera.right = d;
        dir.shadow.camera.top = d; dir.shadow.camera.bottom = -d;
        dir.shadow.bias = -0.0005;

        scene.add(dir);
    }
};
