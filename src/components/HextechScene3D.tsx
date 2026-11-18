import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type StagePhase = 'idle' | 'spinning' | 'revealed';
export type BgMode = 'hextech' | 'void' | 'greenscreen';

interface HextechScene3DProps {
  phase: StagePhase;
  bgMode: BgMode;
}

export default function HextechScene3D({ phase, bgMode }: HextechScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<StagePhase>(phase);
  const bgModeRef = useRef<BgMode>(bgMode);
  const burstTriggerRef = useRef(0);

  useEffect(() => {
    if (phase === 'revealed' && phaseRef.current !== 'revealed') {
      burstTriggerRef.current = 1;
    }
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    bgModeRef.current = bgMode;
  }, [bgMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 12);

    const ambientLight = new THREE.AmbientLight(0x3a3f4a, 0.9);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xc8aa6e, 10, 28);
    goldLight.position.set(3, 5, 6);
    scene.add(goldLight);

    // Subtle matte-gold architectural rings deep in the dark backdrop
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 0, -5);
    scene.add(ringGroup);

    const matteGoldMat = new THREE.MeshStandardMaterial({
      color: 0xc8aa6e,
      metalness: 0.9,
      roughness: 0.35,
      transparent: true,
      opacity: 0.24,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.018, 12, 120), matteGoldMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.014, 12, 100), matteGoldMat);
    ring1.rotation.set(0.45, 0.25, 0);
    ring2.rotation.set(-0.55, 0.5, 0.2);
    ringGroup.add(ring1, ring2);

    // Subtle shockwave ring on reveal
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xc8aa6e,
      transparent: true,
      opacity: 0,
    });
    const shockwaveRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.03, 12, 72), shockwaveMat);
    shockwaveRing.position.set(0, 0, -2);
    scene.add(shockwaveRing);

    // Subtle warm gold & muted ash dust motes
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const goldColor = new THREE.Color(0xc8aa6e);
    const ashColor = new THREE.Color(0x6e7685);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 2;

      const c = Math.random() > 0.45 ? goldColor : ashColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let animId = 0;
    let lastTime = performance.now();
    let spinBoost = 0;
    let shockwaveProgress = -1;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const currentBg = bgModeRef.current;
      const currentPhase = phaseRef.current;

      if (currentBg === 'greenscreen') {
        renderer.setClearColor(0x00ff00, 1);
        ringGroup.visible = false;
        particles.visible = false;
        shockwaveRing.visible = false;
        renderer.render(scene, camera);
        return;
      }

      const showRings = currentBg === 'hextech';
      renderer.setClearColor(0x050608, 0);
      ringGroup.visible = showRings;
      particles.visible = true;
      shockwaveRing.visible = showRings;

      const targetBoost = currentPhase === 'spinning' ? 1 : 0;
      spinBoost += (targetBoost - spinBoost) * dt * 3.5;

      const speedMult = 1 + spinBoost * 4;
      ring1.rotation.x += dt * 0.09 * speedMult;
      ring1.rotation.y += dt * 0.14 * speedMult;
      ring2.rotation.y -= dt * 0.16 * speedMult;
      ring2.rotation.z += dt * 0.08 * speedMult;

      if (burstTriggerRef.current === 1) {
        burstTriggerRef.current = 0;
        shockwaveProgress = 0;
      }

      if (shockwaveProgress >= 0) {
        shockwaveProgress += dt * 1.5;
        if (shockwaveProgress >= 1) {
          shockwaveProgress = -1;
          shockwaveMat.opacity = 0;
        } else {
          const ease = 1 - Math.pow(1 - shockwaveProgress, 3);
          shockwaveRing.scale.setScalar(0.8 + ease * 5.5);
          shockwaveMat.opacity = (1 - shockwaveProgress) * 0.45;
        }
      }

      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const zSpeed = 0.35 + spinBoost * 10;

      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 2] += dt * zSpeed;
        arr[i * 3 + 1] += dt * 0.08 * Math.sin(now * 0.0008 + i);
        if (arr[i * 3 + 2] > 10) {
          arr[i * 3 + 2] = -12;
          arr[i * 3] = (Math.random() - 0.5) * 26;
          arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
        }
      }
      posAttr.needsUpdate = true;

      camera.position.x += (mouse.x * 0.5 - camera.position.x) * dt * 2;
      camera.position.y += (mouse.y * 0.35 - camera.position.y) * dt * 2;
      camera.lookAt(0, 0, -2);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      particleGeo.dispose();
      particleMat.dispose();
      matteGoldMat.dispose();
      shockwaveMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-500 ${
        bgMode === 'greenscreen'
          ? 'bg-[#00FF00]'
          : bgMode === 'void'
          ? 'bg-[#050608]'
          : 'bg-[radial-gradient(ellipse_at_50%_45%,#12161F_0%,#080A0F_50%,#040507_100%)]'
      }`}
    />
  );
}
