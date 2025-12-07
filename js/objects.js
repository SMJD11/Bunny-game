import * as THREE from 'three';

// Objects Module - High Quality Low Poly Characters

export const Objects = {
    createBunny: function () {
        const group = new THREE.Group();
        group.userData = { radius: 1.0 }; // Hitbox radius

        // Materials - Matte "Fur" feel (Lambert for Safari compatibility)
        const whiteMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
        });
        const pinkMat = new THREE.MeshLambertMaterial({
            color: 0xffb7b2,
        });
        const darkMat = new THREE.MeshLambertMaterial({
            color: 0x333333,
        });

        const visuals = new THREE.Group();
        group.add(visuals);
        group.userData.visuals = visuals;

        // --- BODY ---
        // Main body - slightly arched
        const bodyGeo = new THREE.DodecahedronGeometry(0.8, 0);
        const body = new THREE.Mesh(bodyGeo, whiteMat);
        body.scale.set(1, 0.8, 1.2);
        body.position.y = 0.8;
        body.castShadow = true;
        visuals.add(body);

        // --- HEAD ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.4, 0.8);
        visuals.add(headGroup);

        const headGeo = new THREE.DodecahedronGeometry(0.5, 0);
        const head = new THREE.Mesh(headGeo, whiteMat);
        head.scale.set(1, 0.9, 1.1);
        head.castShadow = true;
        headGroup.add(head);

        // Nose
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), pinkMat);
        nose.position.set(0, 0, 0.5);
        headGroup.add(nose);

        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const eyeL = new THREE.Mesh(eyeGeo, darkMat);
        eyeL.position.set(-0.3, 0.1, 0.3);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, darkMat);
        eyeR.position.set(0.3, 0.1, 0.3);
        headGroup.add(eyeR);

        // Ears - Long and distinct
        const earGeo = new THREE.BoxGeometry(0.2, 1.2, 0.1);
        const earL = new THREE.Mesh(earGeo, whiteMat);
        earL.position.set(-0.2, 0.8, -0.1);
        earL.rotation.x = -0.2;
        earL.rotation.z = 0.2;
        earL.castShadow = true;
        headGroup.add(earL);

        const earR = new THREE.Mesh(earGeo, whiteMat);
        earR.position.set(0.2, 0.8, -0.1);
        earR.rotation.x = -0.2;
        earR.rotation.z = -0.2;
        earR.castShadow = true;
        headGroup.add(earR);

        // --- TAIL ---
        const tail = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), whiteMat);
        tail.position.set(0, 0.8, -0.7);
        visuals.add(tail);

        // --- LEGS ---
        // Back legs (Large for hopping)
        const backLegGeo = new THREE.BoxGeometry(0.3, 0.6, 0.6);
        const legBL = new THREE.Mesh(backLegGeo, whiteMat);
        legBL.position.set(-0.5, 0.4, -0.4);
        visuals.add(legBL);

        const legBR = new THREE.Mesh(backLegGeo, whiteMat);
        legBR.position.set(0.5, 0.4, -0.4);
        visuals.add(legBR);

        // Front legs (Small)
        const frontLegGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        const legFL = new THREE.Mesh(frontLegGeo, whiteMat);
        legFL.position.set(-0.3, 0.25, 0.6);
        visuals.add(legFL);

        const legFR = new THREE.Mesh(frontLegGeo, whiteMat);
        legFR.position.set(0.3, 0.25, 0.6);
        visuals.add(legFR);

        return group;
    },

    createBobcat: function () {
        const group = new THREE.Group();
        group.userData = { radius: 1.5 };

        // Materials
        const furMat = new THREE.MeshLambertMaterial({
            color: 0xd2b48c, // Tan
        });
        const darkMat = new THREE.MeshLambertMaterial({
            color: 0x5d4037, // Dark Brown
        });
        const whiteMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
        });

        const visuals = new THREE.Group();
        group.add(visuals);
        group.userData.visuals = visuals;
        group.userData.legs = [];

        // --- BODY ---
        const bodyGeo = new THREE.BoxGeometry(1.2, 1.0, 2.0);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.y = 1.2;
        body.castShadow = true;
        visuals.add(body);

        // --- HEAD ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.0, 1.2);
        visuals.add(headGroup);

        const headGeo = new THREE.BoxGeometry(0.9, 0.8, 0.9);
        const head = new THREE.Mesh(headGeo, furMat);
        head.castShadow = true;
        headGroup.add(head);

        // Muzzle
        const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), whiteMat);
        muzzle.position.set(0, -0.2, 0.5);
        headGroup.add(muzzle);

        // Ears - Pointed with tufts
        const earGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earL = new THREE.Mesh(earGeo, darkMat);
        earL.position.set(-0.3, 0.6, 0);
        earL.rotation.y = -0.2;
        headGroup.add(earL);

        const earR = new THREE.Mesh(earGeo, darkMat);
        earR.position.set(0.3, 0.6, 0);
        earR.rotation.y = 0.2;
        headGroup.add(earR);

        // --- TAIL ---
        // Short bobbed tail
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.6), darkMat);
        tail.position.set(0, 1.5, -1.2);
        tail.rotation.x = 0.5;
        visuals.add(tail);

        // --- LEGS ---
        const legGeo = new THREE.BoxGeometry(0.25, 1.2, 0.3);

        // Helper to create leg
        const createLeg = (x, z) => {
            const legGroup = new THREE.Group();
            const mesh = new THREE.Mesh(legGeo, furMat);
            mesh.position.y = -0.6; // Pivot at top
            mesh.castShadow = true;
            legGroup.add(mesh);
            legGroup.position.set(x, 1.2, z);
            visuals.add(legGroup);
            group.userData.legs.push(legGroup);
            return legGroup;
        };

        createLeg(-0.4, 0.8); // FL
        createLeg(0.4, 0.8);  // FR
        createLeg(-0.4, -0.8); // BL
        createLeg(0.4, -0.8);  // BR

        return group;
    },

    createCarrot: function () {
        const grp = new THREE.Group();

        // Low poly carrot - Thicker and brighter
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 1.2, 8),
            new THREE.MeshLambertMaterial({ color: 0xff6d00 }) // Bright Orange
        );
        body.rotation.x = Math.PI;
        body.position.y = 0.6;
        grp.add(body);

        // Leaves - Brighter Green
        const leafMat = new THREE.MeshLambertMaterial({ color: 0x00e676 });

        const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.05), leafMat);
        l1.position.set(0, 1.3, 0);
        l1.rotation.z = 0.3;
        grp.add(l1);

        const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.05), leafMat);
        l2.position.set(0, 1.3, 0);
        l2.rotation.z = -0.3;
        grp.add(l2);

        // Glow ring (Billboard)
        const ringGeo = new THREE.TorusGeometry(0.5, 0.05, 4, 12);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd180 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.5;
        grp.add(ring);

        grp.userData = { offset: Math.random() * 100 };
        return grp;
    }
};
