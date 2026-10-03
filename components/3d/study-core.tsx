"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface StudyCoreProps {
  interactive?: boolean;
  className?: string;
  onNodeClick?: (nodeName: string) => void;
}

export function StudyCore({ interactive = true, className = "", onNodeClick }: StudyCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ name: string; desc: string } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Root Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Central Knowledge Core Sphere (Glass + Holographic inner glow)
    const innerGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c6fe0,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    coreGroup.add(innerCore);

    // Solid inner glowing nucleus
    const nucleusGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x3d30a2,
      transparent: true,
      opacity: 0.6,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // 2. Orbital Knowledge Rings
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x4f9eff, transparent: true, opacity: 0.45 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.2, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x00d4aa, transparent: true, opacity: 0.3 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    coreGroup.add(ring2);

    // 3. Knowledge Nodes (Interactive Satellite Spheres)
    const nodes = [
      { name: "Documents", desc: "PDF & Lecture Ingestion", color: 0x7c6fe0, pos: [2.5, 1.2, 0] },
      { name: "Gemma AI", desc: "Open-Weight Intelligence", color: 0x00d4aa, pos: [-2.4, -1.1, 0.8] },
      { name: "Active Recall", desc: "Diagnostic Quizzes", color: 0x4f9eff, pos: [1.2, -2.2, -0.6] },
      { name: "Memory Roadmap", desc: "Spaced Revision Plan", color: 0xffb703, pos: [-1.4, 2.1, -0.7] },
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach((n) => {
      const nodeGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: n.color });
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(n.pos[0], n.pos[1], n.pos[2]);
      mesh.userData = n;
      coreGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Connective line to center
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(n.pos[0], n.pos[1], n.pos[2]),
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: n.color, transparent: true, opacity: 0.25 });
      const line = new THREE.Line(lineGeo, lineMat);
      coreGroup.add(line);
    });

    // 4. Floating Study Dust Particles
    const particlesCount = 90;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x9d93f7,
      transparent: true,
      opacity: 0.7,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    scene.add(particleCloud);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / rect.width - 0.5;
      const rawY = (e.clientY - rect.top) / rect.height - 0.5;
      const x = Math.max(-1, Math.min(1, rawX));
      const y = Math.max(-1, Math.min(1, rawY));
      mouseX = x * 1.2;
      mouseY = y * 1.2;

      // Raycasting for node hover
      if (interactive) {
        const mouseNorm = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -(((e.clientY - rect.top) / rect.height) * 2 - 1)
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseNorm, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);

        if (intersects.length > 0) {
          const hovered = intersects[0].object.userData;
          setActiveTooltip({ name: hovered.name, desc: hovered.desc });
        } else {
          setActiveTooltip(null);
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!onNodeClick) return;
      const rect = container.getBoundingClientRect();
      const mouseNorm = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeClick(intersects[0].object.userData.name);
      }
    };

    if (interactive && !prefersReducedMotion) {
      window.addEventListener("mousemove", onMouseMove);
      container.addEventListener("click", onClick);
    }

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Slow calm rotation
        coreGroup.rotation.y = elapsed * 0.15;
        coreGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

        ring1.rotation.z = elapsed * 0.2;
        ring2.rotation.y = elapsed * -0.15;

        // Subtle pulsing of inner core
        const scale = 1 + Math.sin(elapsed * 1.5) * 0.05;
        nucleus.scale.set(scale, scale, scale);

        // Smooth camera dampening to mouse
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        camera.position.x = targetX * 1.8;
        camera.position.y = -targetY * 1.8;
        camera.lookAt(0, 0, 0);

        particleCloud.rotation.y = elapsed * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("click", onClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, onNodeClick]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {activeTooltip && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-2 rounded-xl bg-[#111118]/90 border border-[#7c6fe0]/40 backdrop-blur-md text-center shadow-xl animate-fade-in">
          <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
            {activeTooltip.name}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{activeTooltip.desc}</div>
        </div>
      )}
    </div>
  );
}
