import * as THREE from 'three';

// Objects Module - Stylized Characters

export const Objects = {
    createBunny: function () {
        const group = new THREE.Group();
        group.userData = { radius: 1.5 };

        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.0
        });
        const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffb7b2 });
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const visuals = new THREE.Group();
        group.add(visuals);
        group.userData.visuals = visuals;

        // Body (Round)
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), mat);
        body.position.y = 0.9;
        body.scale.set(1, 0.85, 1);
        body.castShadow = true;
        visuals.add(body);

        // Head (Big)
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), mat);
        head.position.set(0, 1.9, 0.2);
        head.castShadow = true;
        visuals.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const e1 = new THREE.Mesh(eyeGeo, blackMat); e1.position.set(-0.3, 2.1, 0.95);
        const e2 = new THREE.Mesh(eyeGeo, blackMat); e2.position.set(0.3, 2.1, 0.95);
        visuals.add(e1); visuals.add(e2);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), pinkMat);
        nose.position.set(0, 1.95, 1.05);
        visuals.add(nose);

        // Ears (Long & Floppy)
        const earGeo = new THREE.CapsuleGeometry(0.15, 1.0, 4, 8);
        const createEar = (x, rotZ, rotX) => {
            const eGroup = new THREE.Group();
            const outer = new THREE.Mesh(earGeo, mat);
            outer.position.y = 0.5;
            eGroup.add(outer);
            eGroup.position.set(x, 2.6, 0.2);
            eGroup.rotation.set(rotX, 0, rotZ);
            eGroup.castShadow = true;
            return eGroup;
        };

        visuals.add(createEar(-0.4, -0.4, -0.2));
        visuals.add(createEar(0.4, 0.4, -0.2));

        // Tail (Fluffy)
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mat);
        tail.position.set(0, 0.8, -0.9);
        visuals.add(tail);

        // Legs (Stubby)
        const legGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const l1 = new THREE.Mesh(legGeo, mat); l1.position.set(-0.5, 0.25, 0.5);
        const l2 = new THREE.Mesh(legGeo, mat); l2.position.set(0.5, 0.25, 0.5);
        const l3 = new THREE.Mesh(legGeo, mat); l3.position.set(-0.5, 0.25, -0.5);
        const l4 = new THREE.Mesh(legGeo, mat); l4.position.set(0.5, 0.25, -0.5);
        visuals.add(l1); visuals.add(l2); visuals.add(l3); visuals.add(l4);

        return group;
    },

    createBobcat: function () {
        const group = new THREE.Group();
        group.userData = { radius: 2.0 };

        const mat = new THREE.MeshStandardMaterial({
            color: 0xd35400, // Dark Orange
            roughness: 0.8
        });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const visuals = new THREE.Group();
        group.add(visuals);
        group.userData.visuals = visuals;

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 2.0), mat);
        body.position.y = 1.0;
        body.castShadow = true;
        visuals.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 1.3), mat);
        head.position.set(0, 2.0, 1.2);
        head.castShadow = true;
        visuals.add(head);

        // Muzzle (White)
        const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.2), whiteMat);
        muzzle.position.set(0, 1.8, 1.9);
        visuals.add(muzzle);

        // Eyes (Angry)
        const eyeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const e1 = new THREE.Mesh(eyeGeo, blackMat); e1.position.set(-0.35, 2.1, 1.86); e1.rotation.z = 0.2;
        const e2 = new THREE.Mesh(eyeGeo, blackMat); e2.position.set(0.35, 2.1, 1.86); e2.rotation.z = -0.2;
        visuals.add(e1); visuals.add(e2);

        // Ears (Pointy with tufts)
        const eGeo = new THREE.ConeGeometry(0.25, 0.6, 4);
        const e1m = new THREE.Mesh(eGeo, mat); e1m.position.set(-0.5, 2.8, 1.2); e1m.rotation.set(0, 0, -0.3);
        const e2m = new THREE.Mesh(eGeo, mat); e2m.position.set(0.5, 2.8, 1.2); e2m.rotation.set(0, 0, 0.3);
        visuals.add(e1m); visuals.add(e2m);

        // Tail (Short & Stubby)
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.6), mat);
        tail.position.set(0, 1.4, -1.0);
        tail.rotation.x = -Math.PI / 3;
        visuals.add(tail);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.35, 0.8, 0.35);
        const l1 = new THREE.Mesh(legGeo, mat); l1.position.set(-0.5, 0.4, 0.8);
        const l2 = new THREE.Mesh(legGeo, mat); l2.position.set(0.5, 0.4, 0.8);
        const l3 = new THREE.Mesh(legGeo, mat); l3.position.set(-0.5, 0.4, -0.8);
        const l4 = new THREE.Mesh(legGeo, mat); l4.position.set(0.5, 0.4, -0.8);
        visuals.add(l1); visuals.add(l2); visuals.add(l3); visuals.add(l4);

        return group;
    },

    createCarrot: function () {
        const grp = new THREE.Group();

        // Body (Low Poly Cone)
        const mat = new THREE.MeshStandardMaterial({
            color: 0xff9800,
            emissive: 0xff6d00,
            emissiveIntensity: 0.4,
            roughness: 0.4,
            flatShading: true
        });
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 5), mat);
        body.rotation.x = Math.PI;
        body.position.y = 0.6;
        body.castShadow = true;

        // Leaves (Tuft)
        const topMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, flatShading: true });
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), topMat);
        top.position.y = 1.4;

        grp.add(body); grp.add(top);

        // Float animation offset
        grp.userData = { offset: Math.random() * 100 };

        return grp;
    }
};
