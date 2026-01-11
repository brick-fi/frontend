"use client"

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { PointerLockControls, Environment, Html, RoundedBox, Float, ContactShadows, useTexture } from "@react-three/drei"
import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import * as THREE from "three"

// --- FPS Controls ---
function FPSControls({ locked }: { locked: boolean }) {
    const { camera } = useThree()
    const moveForward = useRef(false)
    const moveBackward = useRef(false)
    const moveLeft = useRef(false)
    const moveRight = useRef(false)
    const velocity = useRef(new THREE.Vector3())
    const direction = useRef(new THREE.Vector3())

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': moveForward.current = true; break;
                case 'ArrowLeft':
                case 'KeyA': moveLeft.current = true; break;
                case 'ArrowDown':
                case 'KeyS': moveBackward.current = true; break;
                case 'ArrowRight':
                case 'KeyD': moveRight.current = true; break;
            }
        }
        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': moveForward.current = false; break;
                case 'ArrowLeft':
                case 'KeyA': moveLeft.current = false; break;
                case 'ArrowDown':
                case 'KeyS': moveBackward.current = false; break;
                case 'ArrowRight':
                case 'KeyD': moveRight.current = false; break;
            }
        }
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useFrame((state, delta) => {
        if (!locked) return

        velocity.current.x -= velocity.current.x * 10.0 * delta
        velocity.current.z -= velocity.current.z * 10.0 * delta

        direction.current.z = Number(moveForward.current) - Number(moveBackward.current)
        direction.current.x = Number(moveRight.current) - Number(moveLeft.current)
        direction.current.normalize()

        if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * 100.0 * delta
        if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * 100.0 * delta

        const speed = 4.0 * delta

        // Move camera
        camera.translateX(-velocity.current.x * delta)
        camera.translateZ(velocity.current.z * delta)

        // Lock Y position (walking height)
        camera.position.y = 1.6

        // Simple Boundary Check (Room is approx 20x20 centered at 0)
        camera.position.x = Math.max(-9, Math.min(9, camera.position.x))
        camera.position.z = Math.max(-9, Math.min(9, camera.position.z))
    })

    return null
}

// --- Furniture Components ---

function ModernSofa(props: any) {
    return (
        <group {...props}>
            {/* Base */}
            <RoundedBox args={[3.2, 0.4, 1.2]} radius={0.05} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
            </RoundedBox>
            {/* Backrest */}
            <RoundedBox args={[3.2, 0.8, 0.3]} radius={0.05} position={[0, 0.6, -0.45]}>
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
            </RoundedBox>
            {/* Armrests */}
            <RoundedBox args={[0.3, 0.6, 1.2]} radius={0.05} position={[-1.45, 0.5, 0]}>
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
            </RoundedBox>
            <RoundedBox args={[0.3, 0.6, 1.2]} radius={0.05} position={[1.45, 0.5, 0]}>
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
            </RoundedBox>
            {/* Cushions */}
            <RoundedBox args={[1.3, 0.2, 1.0]} radius={0.1} position={[-0.7, 0.5, 0.1]}>
                <meshStandardMaterial color="#333" roughness={0.9} />
            </RoundedBox>
            <RoundedBox args={[1.3, 0.2, 1.0]} radius={0.1} position={[0.7, 0.5, 0.1]}>
                <meshStandardMaterial color="#333" roughness={0.9} />
            </RoundedBox>
        </group>
    )
}

function CoffeeTable(props: any) {
    return (
        <group {...props}>
            {/* Glass Top */}
            <RoundedBox args={[1.5, 0.05, 1]} radius={0.02} position={[0, 0.4, 0]}>
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0}
                    transmission={1}
                    thickness={0.5}
                />
            </RoundedBox>
            {/* Legs */}
            <mesh position={[-0.6, 0.2, -0.4]}>
                <cylinderGeometry args={[0.02, 0.02, 0.4]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} /> {/* Gold Legs */}
            </mesh>
            <mesh position={[0.6, 0.2, -0.4]}>
                <cylinderGeometry args={[0.02, 0.02, 0.4]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[-0.6, 0.2, 0.4]}>
                <cylinderGeometry args={[0.02, 0.02, 0.4]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0.6, 0.2, 0.4]}>
                <cylinderGeometry args={[0.02, 0.02, 0.4]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
        </group>
    )
}

function WallArt({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
    const artTexture = useLoader(THREE.TextureLoader, '/dubai-palm.png') // Reuse assets as art
    return (
        <group position={position} rotation={rotation}>
            <mesh>
                <boxGeometry args={[2, 3, 0.1]} />
                <meshStandardMaterial color="#111" /> {/* Frame */}
            </mesh>
            <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[1.8, 2.8]} />
                <meshBasicMaterial map={artTexture} />
            </mesh>
        </group>
    )
}

function FloorLamp(props: any) {
    return (
        <group {...props}>
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.1, 0.2, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 3]} />
                <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 0.6, 32, 1, true]} />
                <meshStandardMaterial color="#fff" side={THREE.DoubleSide} transparent opacity={0.8} />
            </mesh>
            <pointLight position={[0, 2.8, 0]} intensity={2} color="#ffaa00" distance={5} />
        </group>
    )
}

// --- Main Room Scene ---

function Room() {
    const texture = useLoader(THREE.TextureLoader, '/dubai-downtown.png')

    return (
        <group>
            <Environment preset="city" />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#e5e5e5" roughness={0.5} />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#fff" />
            </mesh>

            {/* Walls */}
            <mesh position={[0, 2, -10]}> {/* Back */}
                <planeGeometry args={[20, 4]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-10, 2, 0]}> {/* Left */}
                <planeGeometry args={[20, 4]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>
            <mesh rotation={[0, -Math.PI / 2, 0]} position={[10, 2, 0]}> {/* Right */}
                <planeGeometry args={[20, 4]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Window View */}
            <mesh position={[0, 2, 10]}> {/* Window Frame Top */}
                <boxGeometry args={[20, 1, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 2, 10]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[30, 15]} />
                <meshBasicMaterial map={texture} />
            </mesh>

            {/* Furniture Layout */}
            <group position={[0, 0, -2]}>
                <ModernSofa position={[0, 0, 0]} />
                <CoffeeTable position={[0, 0, 1.5]} />
                <ModernSofa position={[-2.5, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} />
                <FloorLamp position={[3.5, 0, -1]} />
            </group>

            <WallArt position={[0, 2, -9.9]} rotation={[0, 0, 0]} />
            <WallArt position={[-9.9, 2, 0]} rotation={[0, Math.PI / 2, 0]} />

            <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={20} blur={2} far={4} />

            <ambientLight intensity={0.4} />
        </group>
    )
}

function Instructions() {
    return (
        <Html center position={[0, 0, 0]} className="pointer-events-none w-max">
            <div className="bg-black/70 border border-white/20 text-white p-6 rounded-xl text-center backdrop-blur-md shadow-2xl animate-in zoom-in duration-300">
                <p className="font-bold text-2xl mb-2 text-brand-green">Virtual Tour Ready</p>
                <div className="flex gap-4 justify-center items-center text-sm text-gray-300 py-2">
                    <span className="flex flex-col items-center"><kbd className="bg-white/10 px-2 py-1 rounded mb-1">W</kbd>Move</span>
                    <span className="flex flex-col items-center"><kbd className="bg-white/10 px-2 py-1 rounded mb-1">Mouse</kbd>Look</span>
                </div>
                <p className="text-xs text-brand-green mt-2 animate-pulse">Click Screen to Start Implementation</p>
            </div>
        </Html>
    )
}

export function VirtualTourViewer({ onClose }: { onClose: () => void }) {
    const [locked, setLocked] = useState(false)

    return (
        <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-500">
            <div className="absolute top-6 right-6 z-[60]">
                <Button onClick={onClose} variant="outline" className="bg-black/50 text-white border-white/20 hover:bg-white hover:text-black">
                    Exit Tour (ESC)
                </Button>
            </div>

            <Canvas shadows camera={{ fov: 60, position: [0, 1.6, 5] }}>
                <Suspense fallback={<Html center className="text-white">Loading Premium Assets...</Html>}>
                    <Room />
                    <FPSControls locked={locked} />
                    <PointerLockControls
                        onLock={() => setLocked(true)}
                        onUnlock={() => setLocked(false)}
                    />
                    {!locked && <Instructions />}
                </Suspense>
            </Canvas>

            {locked && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-white/50 text-xs tracking-widest uppercase">
                    Walking Mode Active • Use WASD to Explore
                </div>
            )}
        </div>
    )
}
