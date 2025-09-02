"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Task,
  Goals,
  TaskScreenPosition,
  ScreenPosition,
  ProgressBarProps,
} from "@/types";
import * as THREE from "three";

export interface MonthMeshes {
  [month: string]: MonthMeshGroup;
}

export interface MonthMeshGroup {
  goal: THREE.Mesh;
  tasks: THREE.Mesh[];
  connections: THREE.Line[];
}

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [focusedMonth, setFocusedMonth] = useState<string | null>("September");
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const monthMeshesRef = useRef<MonthMeshes>({});
  const focusedTaskRef = useRef<Task | null>(null);
  const focusedMonthRef = useRef<string | null>(null);
  const skipNextRaycastRef = useRef<boolean>(false);
  const [taskScreenPositions, setTaskScreenPositions] = useState<
    TaskScreenPosition[]
  >([]);
  const [focusedTaskScreenPos, setFocusedTaskScreenPos] =
    useState<ScreenPosition | null>(null);

  const goals: Goals = {
    September: {
      position: [-6, 2, 0],
      color: 0xff6b35,
      description:
        "September focus: execute three concrete goals inline on nodes",
      tasks: [
        {
          name: "Learn Rust",
          position: [-8, 1, -2],
          color: 0xff8c42,
          description:
            "Currently covering: ownership, borrowing, and lifetimes",
          currentTopic: "Ownership & Borrowing",
          progress: 45,
        },
        {
          name: "Work on X Project",
          position: [-7, 3, 1],
          color: 0xff8c42,
          description: "Implement feature Y and refactor module Z",
          currentTopic: "Feature Y planning",
          progress: 30,
        },
        {
          name: "Make a Sale",
          position: [-5, 0, -1],
          color: 0xff8c42,
          description: "Prospect outreach and demo scheduling",
          currentTopic: "Draft outreach emails",
          progress: 10,
        },
      ],
    },
    October: {
      position: [-2, 3, 0],
      color: 0xf7931e,
      description: "Growth Phase - Learn and expand your network",
      tasks: [
        {
          name: "Read 2 Books",
          position: [-3, 4, -2],
          color: 0xffb347,
          description: "Focus on personal development and business",
          progress: 40,
        },
        {
          name: "Learn New Skill",
          position: [-1, 5, 1],
          color: 0xffb347,
          description: "Complete online course in data analysis",
          progress: 30,
        },
        {
          name: "Network Building",
          position: [-2, 1, -1],
          color: 0xffb347,
          description: "Attend 4 industry events and connect",
          progress: 20,
        },
      ],
    },
    November: {
      position: [2, 3, 0],
      color: 0xffd700,
      description: "Implementation - Put plans into action",
      tasks: [
        {
          name: "Side Project Launch",
          position: [3, 4, -2],
          color: 0xffdc73,
          description: "Launch MVP of personal project",
          progress: 15,
        },
        {
          name: "Mindfulness Practice",
          position: [1, 5, 1],
          color: 0xffdc73,
          description: "Daily 20-minute meditation sessions",
          progress: 0,
        },
        {
          name: "Financial Review",
          position: [2, 1, -1],
          color: 0xffdc73,
          description: "Analyze spending, investments, and goals",
          progress: 0,
        },
      ],
    },
    December: {
      position: [6, 2, 0],
      color: 0x87ceeb,
      description: "Reflection & Planning - Review and prepare for next year",
      tasks: [
        {
          name: "Year-End Review",
          position: [8, 1, -2],
          color: 0xa4d8f0,
          description: "Comprehensive analysis of achievements",
          progress: 0,
        },
        {
          name: "2026 Planning",
          position: [7, 3, 1],
          color: 0xa4d8f0,
          description: "Set goals and strategies for next year",
          progress: 0,
        },
        {
          name: "Celebrate Wins",
          position: [5, 0, -1],
          color: 0xa4d8f0,
          description: "Acknowledge progress and reward achievements",
          progress: 0,
        },
      ],
    },
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Camera position
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create materials
    const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const taskGeometry = new THREE.SphereGeometry(0.15, 16, 16);

    // Store meshes for interaction
    const meshes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];
    const monthMeshes: MonthMeshes = {};

    // Create month nodes and task nodes
    Object.entries(goals).forEach(([month, data]) => {
      // Main goal sphere
      const goalMaterial = new THREE.MeshPhongMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8,
      });

      const goalSphere = new THREE.Mesh(sphereGeometry, goalMaterial);
      goalSphere.position.set(...data.position);
      goalSphere.userData = { type: "goal", month, data };
      scene.add(goalSphere);
      meshes.push(goalSphere);

      // Store month meshes for easy access
      monthMeshes[month] = { goal: goalSphere, tasks: [], connections: [] };

      // Task spheres
      data.tasks.forEach((task, index) => {
        const taskMaterial = new THREE.MeshPhongMaterial({
          color: task.color,
          emissive: task.color,
          emissiveIntensity: 0.1,
          transparent: true,
          opacity: 0.7,
        });

        const taskSphere = new THREE.Mesh(taskGeometry, taskMaterial);
        taskSphere.position.set(...task.position);
        taskSphere.userData = { type: "task", task, month };
        scene.add(taskSphere);
        meshes.push(taskSphere);
        monthMeshes[month].tasks.push(taskSphere);

        // Create connection line from goal to task
        const points = [
          new THREE.Vector3(...data.position),
          new THREE.Vector3(...task.position),
        ];

        const connectionGeometry = new THREE.BufferGeometry().setFromPoints(
          points
        );
        const connectionMaterial = new THREE.LineBasicMaterial({
          color: task.color,
          transparent: true,
          opacity: 0.4,
        });

        const line = new THREE.Line(connectionGeometry, connectionMaterial);
        scene.add(line);
        connections.push(line);
        monthMeshes[month].connections.push(line);
      });
    });

    monthMeshesRef.current = monthMeshes;

    // Create arc connections between months
    const monthPositions = Object.values(goals).map(
      (g) => new THREE.Vector3(...g.position)
    );
    const arcLines: THREE.Line[] = [];
    for (let i = 0; i < monthPositions.length - 1; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
        monthPositions[i],
        new THREE.Vector3(
          (monthPositions[i].x + monthPositions[i + 1].x) / 2,
          monthPositions[i].y + 1,
          0
        ),
        monthPositions[i + 1]
      );

      const points = curve.getPoints(50);
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const arcMaterial = new THREE.LineBasicMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.6,
      });

      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      scene.add(arcLine);
      arcLines.push(arcLine);
    }

    // Add floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x87ceeb,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Raycaster for click-only interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to highlight specific month
    const highlightMonth = (targetMonth: string | null): void => {
      const hasFocusedTask = Boolean(focusedTaskRef.current);
      Object.entries(monthMeshes).forEach(([month, meshGroup]) => {
        const isTarget = month === targetMonth;
        const baseOpacity = isTarget ? 1.0 : targetMonth ? 0.2 : 1.0;
        const emissiveIntensity = isTarget ? 0.4 : 0.05;

        // Goal sphere visibility
        meshGroup.goal.visible = true;
        (meshGroup.goal.material as THREE.MeshPhongMaterial).opacity =
          hasFocusedTask ? (isTarget ? 1.0 : 0.2) : baseOpacity;
        (meshGroup.goal.material as THREE.MeshPhongMaterial).emissiveIntensity =
          emissiveIntensity;
        (meshGroup.goal.material as THREE.MeshPhongMaterial).needsUpdate = true;

        // Task spheres and their connections
        meshGroup.tasks.forEach((taskMesh, idx) => {
          if (isTarget) {
            if (hasFocusedTask) {
              const isFocused =
                taskMesh.userData.task.name === focusedTaskRef.current?.name;
              // Keep other tasks visible when a task is focused
              taskMesh.visible = true;
              (taskMesh.material as THREE.MeshPhongMaterial).opacity = isFocused
                ? 1.0
                : 0.7;
              if (meshGroup.connections[idx]) {
                meshGroup.connections[idx].visible = true;
                (
                  meshGroup.connections[idx].material as THREE.LineBasicMaterial
                ).opacity = isFocused ? 0.85 : 0.5;
              }
            } else {
              taskMesh.visible = true;
              (taskMesh.material as THREE.MeshPhongMaterial).opacity = 0.95;
              if (meshGroup.connections[idx]) {
                meshGroup.connections[idx].visible = true;
                (
                  meshGroup.connections[idx].material as THREE.LineBasicMaterial
                ).opacity = 0.65;
              }
            }
            (taskMesh.material as THREE.MeshPhongMaterial).emissiveIntensity =
              hasFocusedTask ? 0.6 : 0.3;
            (taskMesh.material as THREE.MeshPhongMaterial).needsUpdate = true;
          } else {
            taskMesh.visible = true;
            (taskMesh.material as THREE.MeshPhongMaterial).opacity = targetMonth
              ? 0.2
              : 0.8;
            (
              taskMesh.material as THREE.MeshPhongMaterial
            ).emissiveIntensity = 0.05;
            if (meshGroup.connections[idx]) {
              meshGroup.connections[idx].visible = true;
              (
                meshGroup.connections[idx].material as THREE.LineBasicMaterial
              ).opacity = targetMonth ? 0.15 : 0.4;
            }
            (taskMesh.material as THREE.MeshPhongMaterial).needsUpdate = true;
          }
        });
      });

      // Arc lines subdued when focusing a month or task
      arcLines.forEach((line) => {
        (line.material as THREE.LineBasicMaterial).opacity = targetMonth
          ? 0.15
          : 0.6;
      });
    };

    // Ensure initial highlight (default September focus) and move camera to September goal
    highlightMonth("September");
    const septemberGroup = monthMeshes["September"];
    if (septemberGroup && septemberGroup.goal) {
      const targetPos = new THREE.Vector3(
        septemberGroup.goal.position.x,
        septemberGroup.goal.position.y,
        septemberGroup.goal.position.z + 8
      );
      const startPos = camera.position.clone();
      const duration = 1000;
      const startTime = Date.now();
      const animateCameraInitial = (): void => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(startPos, targetPos, eased);
        camera.lookAt(septemberGroup.goal.position);
        if (progress < 1) requestAnimationFrame(animateCameraInitial);
      };
      animateCameraInitial();
    }

    // Expose for UI label clicks
    if (typeof window !== "undefined") {
      window.__winterArcHighlight = highlightMonth;
      window.__winterArcFocusMonthCamera = (month: string): void => {
        const group = monthMeshes[month];
        if (!group) return;
        const targetPos = new THREE.Vector3(
          group.goal.position.x,
          group.goal.position.y,
          group.goal.position.z + 8
        );
        const startPos = camera.position.clone();
        const duration = 1000;
        const startTime = Date.now();
        const animate = (): void => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          camera.position.lerpVectors(startPos, targetPos, eased);
          camera.lookAt(group.goal.position);
          if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
      };
    }

    const onMouseClick = (event: MouseEvent): void => {
      if (skipNextRaycastRef.current) {
        skipNextRaycastRef.current = false;
        return;
      }
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clicked = intersects[0].object as THREE.Mesh;
        const targetMonth = clicked.userData.month;

        if (clicked.userData.type === "goal") {
          // Toggle: if already focused on a month and clicking a goal again, reset to default view
          if (
            focusedMonthRef.current &&
            !focusedTaskRef.current &&
            targetMonth === focusedMonthRef.current
          ) {
            setFocusedMonth(null);
            setFocusedTask(null);
            focusedTaskRef.current = null;
            // Animate camera back to default
            const targetPos = new THREE.Vector3(0, 0, 12);
            const startPos = camera.position.clone();
            const duration = 800;
            const startTime = Date.now();
            const animateCameraBack = (): void => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              camera.position.lerpVectors(startPos, targetPos, eased);
              camera.lookAt(0, 0, 0);
              if (progress < 1) requestAnimationFrame(animateCameraBack);
            };
            animateCameraBack();
            highlightMonth(null);
            return;
          }
          setFocusedTask(null);
          focusedTaskRef.current = null;
          setFocusedMonth(targetMonth);
          highlightMonth(targetMonth);
        } else if (clicked.userData.type === "task") {
          const t = clicked.userData.task;
          setFocusedMonth(targetMonth);
          setFocusedTask(t);
          focusedTaskRef.current = t;
          highlightMonth(targetMonth);
        }

        // Animate camera to focus on clicked node (unless resetting above)
        const targetPos = new THREE.Vector3(...clicked.position.toArray());
        targetPos.z += 8;

        const startPos = camera.position.clone();
        const duration = 1200;
        const startTime = Date.now();

        const animateCamera = (): void => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          camera.position.lerpVectors(startPos, targetPos, eased);
          camera.lookAt(clicked.position);

          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          }
        };

        animateCamera();
      }
    };

    window.addEventListener("click", onMouseClick);

    // Helper to project world position to screen
    const projectToScreen = (vector3: THREE.Vector3): ScreenPosition => {
      const width = renderer.domElement.clientWidth;
      const height = renderer.domElement.clientHeight;
      const projected = vector3.clone().project(camera);
      return {
        x: (projected.x * 0.5 + 0.5) * width,
        y: (-projected.y * 0.5 + 0.5) * height,
      };
    };

    let lastOverlayUpdate = 0;

    // Animation loop
    const animate = (): void => {
      requestAnimationFrame(animate);

      // Rotate particles slowly
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      // Gentle floating animation for nodes
      const time = Date.now() * 0.001;
      meshes.forEach((mesh, index) => {
        const userData = mesh.userData as { originalY?: number; type: string };
        const baseY = userData.originalY || mesh.position.y;
        if (!userData.originalY) {
          userData.originalY = mesh.position.y;
        }

        if (userData.type === "goal") {
          mesh.position.y = baseY + Math.sin(time + index) * 0.1;
        } else {
          mesh.position.y = baseY + Math.sin(time * 1.5 + index * 0.5) * 0.05;
        }
      });

      // Update overlay positions at ~30fps
      const now = Date.now();
      if (now - lastOverlayUpdate > 33) {
        lastOverlayUpdate = now;
        if (focusedMonthRef.current) {
          const group = monthMeshesRef.current[focusedMonthRef.current];
          if (group) {
            // Always compute positions for all tasks of the focused month
            const positions = group.tasks.map((taskMesh) => {
              const wp = new THREE.Vector3();
              taskMesh.getWorldPosition(wp);
              const s = projectToScreen(wp);
              return {
                month: focusedMonthRef.current!,
                name: taskMesh.userData.task.name,
                description: taskMesh.userData.task.description,
                color: taskMesh.userData.task.color,
                x: s.x,
                y: s.y,
              };
            });
            setTaskScreenPositions(positions);

            // If a task is focused, also compute its detail panel position
            if (focusedTaskRef.current) {
              const taskMesh = group.tasks.find(
                (m) => m.userData.task.name === focusedTaskRef.current?.name
              );
              if (taskMesh) {
                const wp = new THREE.Vector3();
                taskMesh.getWorldPosition(wp);
                const s = projectToScreen(wp);
                setFocusedTaskScreenPos({ x: s.x, y: s.y });
              }
            } else {
              setFocusedTaskScreenPos(null);
            }
          }
        } else {
          setTaskScreenPositions([]);
          setFocusedTaskScreenPos(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Handle resize
    const handleResize = (): void => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return (): void => {
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("resize", handleResize);
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    focusedMonthRef.current = focusedMonth;
  }, [focusedMonth]);

  useEffect(() => {
    focusedTaskRef.current = focusedTask;
  }, [focusedTask]);

  const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color }) => (
    <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          backgroundColor: `#${color.toString(16).padStart(6, "0")}`,
        }}
      />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a1529] to-[#050b18] overflow-hidden">
      <div className="absolute top-10 left-0 right-0 z-20 p-6">
        <div className="flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold drop-shadow-2xl bg-gradient-to-r from-gray-500 to-gray-200 bg-clip-text text-transparent">
              Mayank&apos;s Winter Arc
            </h1>
            {focusedMonth && (
              <div className="text-sm text-muted-foreground mt-1 opacity-90 font-medium tracking-wider">
                Focused on {focusedMonth}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at center, transparent 20%, rgba(5,11,24,0.9) 70%),
            url('/image.png')
          `,
          backgroundSize: "cover, contain",
          backgroundPosition: "center, center",
          backgroundRepeat: "no-repeat, no-repeat",
          opacity: 0.3,
        }}
      />

      {/* 3D Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-10" />

      {/* UI Overlay */}

      {/* Inline Task Labels near nodes (always show for focused month); hide label for focused task */}
      {focusedMonth &&
        taskScreenPositions.map((p) => (
          <div
            key={`${p.month}-${p.name}`}
            className="absolute z-30"
            style={{
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -120%)",
              display:
                focusedTask && focusedTask.name === p.name ? "none" : "block",
              opacity: focusedTask && focusedTask.name !== p.name ? 0.9 : 1,
            }}
          >
            <div className="px-3 py-2 rounded-md text-xs text-white bg-black/70 border border-white/20 shadow-lg whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: `#${p.color
                      .toString(16)
                      .padStart(6, "0")}`,
                  }}
                />
                <span className="font-semibold">{p.name}</span>
              </div>
            </div>
          </div>
        ))}

      {/* Focused task details near the node */}
      {focusedMonth && focusedTask && focusedTaskScreenPos && (
        <div
          className="absolute z-30"
          style={{
            left: focusedTaskScreenPos.x,
            top: focusedTaskScreenPos.y,
            transform: "translate(-50%, -125%)",
          }}
        >
          <div className="rounded-lg p-4 bg-black/80 border border-white/30 shadow-2xl min-w-[220px] max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: `#${focusedTask.color
                      .toString(16)
                      .padStart(6, "0")}`,
                  }}
                />
                <span className="text-white text-sm font-semibold">
                  {focusedTask.name}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded">
                {focusedMonth}
              </span>
            </div>
            {focusedTask.currentTopic && (
              <div className="text-[11px] text-blue-300 mb-1">
                Current: {focusedTask.currentTopic}
              </div>
            )}
            <div className="text-[11px] text-gray-300 leading-relaxed">
              {focusedTask.description}
            </div>
            <div className="mt-3">
              <ProgressBar
                progress={focusedTask.progress}
                color={focusedTask.color}
              />
            </div>
          </div>
        </div>
      )}

      {/* Month Labels */}
      <div className="absolute top-2/5 left-0 right-0 z-20 flex justify-center">
        <div className="relative w-full max-w-4xl h-48">
          {Object.keys(goals).map((month, index) => {
            const totalItems = Object.keys(goals).length;
            const angleStep = Math.PI / (totalItems - 1); // 180 degrees divided by items
            const angle = Math.PI - angleStep * index; // Reverse the angle calculation
            const radius = 320; // Increased radius for a larger arc

            // Calculate position on semicircle
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            return (
              <div
                key={month}
                className={`absolute text-lg font-semibold transition-all duration-300 cursor-pointer ${
                  focusedMonth === month
                    ? "text-white opacity-100 scale-110"
                    : "text-white/60 opacity-70 hover:opacity-90"
                }`}
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  left: `calc(50% + ${x}px)`,
                  top: `calc(100% - ${y}px)`, // Invert Y to make it a proper semicircle
                  transform: `translate(-50%, -50%) ${
                    focusedMonth === month ? "scale(1.1)" : ""
                  }`,
                  transformOrigin: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedTask(null);
                  focusedTaskRef.current = null;
                  setFocusedMonth(month);
                  if (
                    typeof window !== "undefined" &&
                    window.__winterArcHighlight
                  ) {
                    window.__winterArcHighlight(month);
                  }
                  if (
                    typeof window !== "undefined" &&
                    window.__winterArcFocusMonthCamera
                  ) {
                    skipNextRaycastRef.current = true;
                    window.__winterArcFocusMonthCamera(month);
                  }
                }}
              >
                {month}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="text-white text-lg">
            Initializing 3D Winter Arc...
          </div>
        </div>
      )}
    </div>
  );
}
