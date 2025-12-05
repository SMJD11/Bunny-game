import * as THREE from 'three';

// Objects Module - Realistic Character Models

export const Objects = {
    createBunny: function () {
        const group = new THREE.Group();
        group.userData = { radius: 1.5 };

        // Soft, realistic fur materials
        const furMat = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.9,
            metalness: 0.0
        });
        const creamMat = new THREE.MeshStandardMaterial({
            color: 0xfff8e1,
            roughness: 0.85
        });
        const pinkMat = new THREE.MeshStandardMaterial({
            color: 0xffcdd2,
            roughness: 0.7
        });
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0x3e2723,
            roughness: 0.3,
            metalness: 0.1
        });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1 });

        const visuals = new THREE.Group();
        group.add(visuals);
        group.userData.visuals = visuals;

        // BODY - Realistic rabbit body shape (elongated oval)
        const bodyGeo = new THREE.SphereGeometry(1, 24, 16);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.y = 1.0;
        body.scale.set(0.8, 0.7, 1.1); // Elongated shape
        body.castShadow = true;
        visuals.add(body);

        // Belly (lighter cream color)
        const bellyGeo = new THREE.SphereGeometry(0.6, 16, 12);
        const belly = new THREE.Mesh(bellyGeo, creamMat);
        belly.position.set(0, 0.85, 0.3);
        belly.scale.set(0.7, 0.6, 0.5);
        visuals.add(belly);

        // HEAD - Large and round for realistic rabbit
        const headGeo = new THREE.SphereGeometry(0.7, 24, 18);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 1.9, 0.5);
        head.scale.set(0.9, 0.85, 0.85);
        head.castShadow = true;
        visuals.add(head);

        // Cheeks (fluffy)
        const cheekGeo = new THREE.SphereGeometry(0.25, 12, 8);
        const cheekL = new THREE.Mesh(cheekGeo, furMat);
        cheekL.position.set(-0.35, 1.75, 0.75);
        visuals.add(cheekL);
        const cheekR = new THREE.Mesh(cheekGeo, furMat);
        cheekR.position.set(0.35, 1.75, 0.75);
        visuals.add(cheekR);

        // EYES - Large, expressive rabbit eyes
        const eyeGeo = new THREE.SphereGeometry(0.15, 16, 12);
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.22, 2.0, 0.95);
        eyeL.scale.set(0.8, 1.0, 0.6);
        visuals.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.22, 2.0, 0.95);
        eyeR.scale.set(0.8, 1.0, 0.6);
        visuals.add(eyeR);

        // Eye highlights (gives life to the eyes)
        const highlightGeo = new THREE.SphereGeometry(0.04, 8, 6);
        const highlightL = new THREE.Mesh(highlightGeo, eyeHighlightMat);
        highlightL.position.set(-0.18, 2.05, 1.05);
        visuals.add(highlightL);
        const highlightR = new THREE.Mesh(highlightGeo, eyeHighlightMat);
        highlightR.position.set(0.26, 2.05, 1.05);
        visuals.add(highlightR);

        // NOSE - Pink triangle nose
        const noseGeo = new THREE.SphereGeometry(0.08, 8, 6);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 1.8, 1.1);
        nose.scale.set(1.2, 0.8, 0.6);
        visuals.add(nose);

        // EARS - Long, realistic rabbit ears
        const createEar = (xPos, rotZ) => {
            const earGroup = new THREE.Group();

            // Outer ear
            const outerGeo = new THREE.CapsuleGeometry(0.12, 1.2, 6, 12);
            const outer = new THREE.Mesh(outerGeo, furMat);
            outer.position.y = 0.6;
            outer.castShadow = true;
            earGroup.add(outer);

            // Inner ear (pink)
            const innerGeo = new THREE.CapsuleGeometry(0.06, 0.9, 4, 8);
            const inner = new THREE.Mesh(innerGeo, pinkMat);
            inner.position.set(0, 0.55, 0.05);
            earGroup.add(inner);

            earGroup.position.set(xPos, 2.5, 0.3);
            earGroup.rotation.set(-0.3, 0, rotZ);

            return earGroup;
        };

        visuals.add(createEar(-0.25, -0.15));
        visuals.add(createEar(0.25, 0.15));

        // TAIL - Fluffy cotton ball
        const tailGeo = new THREE.SphereGeometry(0.3, 12, 10);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(0, 0.9, -0.9);
        tail.scale.set(1, 0.9, 0.8);
        visuals.add(tail);

        // LEGS - Realistic rabbit legs
        // Front legs (smaller)
        const frontLegGeo = new THREE.CapsuleGeometry(0.12, 0.4, 4, 8);
        const frontL = new THREE.Mesh(frontLegGeo, furMat);
        frontL.position.set(-0.35, 0.35, 0.4);
        frontL.rotation.x = 0.3;
        visuals.add(frontL);

        const frontR = new THREE.Mesh(frontLegGeo, furMat);
        frontR.position.set(0.35, 0.35, 0.4);
        frontR.rotation.x = 0.3;
        visuals.add(frontR);

        // Back legs (larger, powerful)
        const backLegGeo = new THREE.CapsuleGeometry(0.18, 0.5, 4, 8);
        const backL = new THREE.Mesh(backLegGeo, furMat);
        backL.position.set(-0.4, 0.4, -0.5);
        backL.rotation.x = -0.4;
        visuals.add(backL);

        const backR = new THREE.Mesh(backLegGeo, furMat);
        backR.position.set(0.4, 0.4, -0.5);
        backR.rotation.x = -0.4;
        visuals.add(backR);

        // Feet
        const footGeo = new THREE.SphereGeometry(0.15, 8, 6);
        const footL = new THREE.Mesh(footGeo, furMat);
        footL.position.set(-0.45, 0.15, -0.7);
        footL.scale.set(0.8, 0.5, 1.3);
        visuals.add(footL);

        const footR = new THREE.Mesh(footGeo, furMat);
        footR.position.set(0.45, 0.15, -0.7);
        footR.scale.set(0.8, 0.5, 1.3);
        visuals.add(footR);

        return group;
    },

    createBobcat: function () {
        const group = new THREE.Group();
        group.userData = { radius: 2.0 };

        // Realistic bobcat materials
        const furMat = new THREE.MeshStandardMaterial({
            color: 0xc4a364, // Tawny tan
            roughness: 0.85,
            metalness: 0
        });
        const darkSpotMat = new THREE.MeshStandardMaterial({
            color: 0x5d4037, // Dark brown spots
            roughness: 0.9
        });
        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.8
        });
        const blackMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4
        });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0xffc107,
            roughness: 0.3,
            emissive: 0x4a3000,
            emissiveIntensity: 0.2
        });

        const visuals = new THREE.Group();
        group.add(visuals);
        group.userData.visuals = visuals;

        // BODY - Muscular cat body
        const bodyGeo = new THREE.CapsuleGeometry(0.7, 1.5, 8, 16);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.set(0, 1.1, 0);
        body.rotation.z = Math.PI / 2;
        body.scale.set(0.9, 1, 1.1);
        body.castShadow = true;
        visuals.add(body);

        // Belly stripe
        const bellyGeo = new THREE.CapsuleGeometry(0.35, 1.2, 6, 10);
        const belly = new THREE.Mesh(bellyGeo, whiteMat);
        belly.position.set(0, 0.85, 0.1);
        belly.rotation.z = Math.PI / 2;
        visuals.add(belly);

        // HEAD - Angular cat face
        const headGeo = new THREE.SphereGeometry(0.6, 20, 16);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 1.8, 1.1);
        head.scale.set(1, 0.9, 0.95);
        head.castShadow = true;
        visuals.add(head);

        // Muzzle
        const muzzleGeo = new THREE.SphereGeometry(0.3, 12, 10);
        const muzzle = new THREE.Mesh(muzzleGeo, whiteMat);
        muzzle.position.set(0, 1.65, 1.55);
        muzzle.scale.set(1, 0.7, 0.8);
        visuals.add(muzzle);

        // Nose
        const noseGeo = new THREE.SphereGeometry(0.08, 8, 6);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 1.72, 1.75);
        nose.scale.set(1.2, 0.8, 0.6);
        visuals.add(nose);

        // EYES - Intense predator eyes
        const eyeGeo = new THREE.SphereGeometry(0.12, 14, 10);
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.22, 1.9, 1.5);
        eyeL.scale.set(0.9, 1.1, 0.5);
        visuals.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.22, 1.9, 1.5);
        eyeR.scale.set(0.9, 1.1, 0.5);
        visuals.add(eyeR);

        // Pupils (vertical slits)
        const pupilGeo = new THREE.SphereGeometry(0.05, 8, 6);
        const pupilL = new THREE.Mesh(pupilGeo, blackMat);
        pupilL.position.set(-0.22, 1.9, 1.6);
        pupilL.scale.set(0.4, 1.2, 0.3);
        visuals.add(pupilL);

        const pupilR = new THREE.Mesh(pupilGeo, blackMat);
        pupilR.position.set(0.22, 1.9, 1.6);
        pupilR.scale.set(0.4, 1.2, 0.3);
        visuals.add(pupilR);

        // Eye brows (angry look)
        const browGeo = new THREE.BoxGeometry(0.15, 0.03, 0.08);
        const browL = new THREE.Mesh(browGeo, darkSpotMat);
        browL.position.set(-0.25, 2.02, 1.52);
        browL.rotation.z = 0.25;
        visuals.add(browL);

        const browR = new THREE.Mesh(browGeo, darkSpotMat);
        browR.position.set(0.25, 2.02, 1.52);
        browR.rotation.z = -0.25;
        visuals.add(browR);

        // EARS - Pointed with tufts
        const createEar = (xPos, rotZ) => {
            const earGroup = new THREE.Group();

            // Main ear
            const earGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
            const ear = new THREE.Mesh(earGeo, furMat);
            ear.position.y = 0.2;
            earGroup.add(ear);

            // Inner ear
            const innerGeo = new THREE.ConeGeometry(0.1, 0.3, 4);
            const inner = new THREE.Mesh(innerGeo, whiteMat);
            inner.position.set(0, 0.15, 0.03);
            earGroup.add(inner);

            // Tuft at top
            const tuftGeo = new THREE.ConeGeometry(0.04, 0.15, 3);
            const tuft = new THREE.Mesh(tuftGeo, darkSpotMat);
            tuft.position.y = 0.5;
            earGroup.add(tuft);

            earGroup.position.set(xPos, 2.25, 0.9);
            earGroup.rotation.set(-0.2, 0, rotZ);

            return earGroup;
        };

        visuals.add(createEar(-0.3, -0.2));
        visuals.add(createEar(0.3, 0.2));

        // Ruff (cheek fur)
        const ruffGeo = new THREE.SphereGeometry(0.2, 10, 8);
        const ruffL = new THREE.Mesh(ruffGeo, whiteMat);
        ruffL.position.set(-0.45, 1.7, 1.2);
        ruffL.scale.set(0.8, 1.2, 0.6);
        visuals.add(ruffL);

        const ruffR = new THREE.Mesh(ruffGeo, whiteMat);
        ruffR.position.set(0.45, 1.7, 1.2);
        ruffR.scale.set(0.8, 1.2, 0.6);
        visuals.add(ruffR);

        // TAIL - Short bobcat tail
        const tailGeo = new THREE.CapsuleGeometry(0.12, 0.3, 4, 8);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(0, 1.3, -1.0);
        tail.rotation.x = -0.5;
        visuals.add(tail);

        // Black tail tip
        const tailTipGeo = new THREE.SphereGeometry(0.1, 8, 6);
        const tailTip = new THREE.Mesh(tailTipGeo, blackMat);
        tailTip.position.set(0, 1.45, -1.15);
        visuals.add(tailTip);

        // LEGS - Powerful cat legs
        const legGeo = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8);

        // Front legs
        const frontL = new THREE.Mesh(legGeo, furMat);
        frontL.position.set(-0.4, 0.45, 0.6);
        frontL.castShadow = true;
        visuals.add(frontL);

        const frontR = new THREE.Mesh(legGeo, furMat);
        frontR.position.set(0.4, 0.45, 0.6);
        frontR.castShadow = true;
        visuals.add(frontR);

        // Back legs (more muscular)
        const backLegGeo = new THREE.CapsuleGeometry(0.18, 0.5, 4, 8);
        const backL = new THREE.Mesh(backLegGeo, furMat);
        backL.position.set(-0.45, 0.5, -0.6);
        backL.rotation.x = -0.2;
        backL.castShadow = true;
        visuals.add(backL);

        const backR = new THREE.Mesh(backLegGeo, furMat);
        backR.position.set(0.45, 0.5, -0.6);
        backR.rotation.x = -0.2;
        backR.castShadow = true;
        visuals.add(backR);

        // Paws
        const pawGeo = new THREE.SphereGeometry(0.12, 8, 6);
        const pawFL = new THREE.Mesh(pawGeo, furMat);
        pawFL.position.set(-0.4, 0.1, 0.65);
        pawFL.scale.set(1, 0.6, 1.2);
        visuals.add(pawFL);

        const pawFR = new THREE.Mesh(pawGeo, furMat);
        pawFR.position.set(0.4, 0.1, 0.65);
        pawFR.scale.set(1, 0.6, 1.2);
        visuals.add(pawFR);

        const pawBL = new THREE.Mesh(pawGeo, furMat);
        pawBL.position.set(-0.45, 0.1, -0.75);
        pawBL.scale.set(1, 0.6, 1.3);
        visuals.add(pawBL);

        const pawBR = new THREE.Mesh(pawGeo, furMat);
        pawBR.position.set(0.45, 0.1, -0.75);
        pawBR.scale.set(1, 0.6, 1.3);
        visuals.add(pawBR);

        // Spots on body (simplified)
        const spotGeo = new THREE.SphereGeometry(0.08, 6, 4);
        const spotPositions = [
            [-0.5, 1.2, 0.3], [0.5, 1.3, 0.2], [-0.3, 1.0, -0.3],
            [0.4, 1.1, -0.4], [-0.6, 0.9, 0], [0.55, 0.95, -0.1]
        ];

        for (const pos of spotPositions) {
            const spot = new THREE.Mesh(spotGeo, darkSpotMat);
            spot.position.set(...pos);
            spot.scale.set(1, 0.7, 1);
            visuals.add(spot);
        }

        return group;
    },

    createCarrot: function () {
        const grp = new THREE.Group();

        // Glowing carrot body
        const carrotMat = new THREE.MeshStandardMaterial({
            color: 0xff7043,
            emissive: 0xff5722,
            emissiveIntensity: 0.5,
            roughness: 0.4
        });

        const body = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 1.0, 8),
            carrotMat
        );
        body.rotation.x = Math.PI;
        body.position.y = 0.5;
        body.castShadow = true;
        grp.add(body);

        // Carrot rings detail
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xff8a65,
            emissive: 0xff6e40,
            emissiveIntensity: 0.3
        });

        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.15 - i * 0.03, 0.02, 6, 12),
                ringMat
            );
            ring.position.y = 0.3 + i * 0.2;
            ring.rotation.x = Math.PI / 2;
            grp.add(ring);
        }

        // Leafy top
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x4caf50,
            emissive: 0x2e7d32,
            emissiveIntensity: 0.2,
            roughness: 0.6
        });

        for (let i = 0; i < 4; i++) {
            const leaf = new THREE.Mesh(
                new THREE.ConeGeometry(0.06, 0.5, 4),
                leafMat
            );
            const angle = (i / 4) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * 0.08,
                1.2,
                Math.sin(angle) * 0.08
            );
            leaf.rotation.set(
                (Math.random() - 0.5) * 0.3,
                angle,
                (Math.random() - 0.5) * 0.3
            );
            grp.add(leaf);
        }

        // Glow effect (outer sphere)
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff9800,
            transparent: true,
            opacity: 0.15
        });
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 12, 8),
            glowMat
        );
        glow.position.y = 0.6;
        grp.add(glow);

        grp.userData = { offset: Math.random() * 100 };

        return grp;
    }
};
