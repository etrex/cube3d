import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xffffff); // Set background to white
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Initialize camera with placeholder aspect ratio (will be updated)
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

// Get DOM elements
const controlsPanel = document.getElementById('controls');
const toggleButton = document.getElementById('toggle-controls');

// Function to update renderer and camera when window size changes
function updateSize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Initial size setup - need to wait a bit for the DOM to be ready
setTimeout(() => {
    updateSize();
}, 0);

// Camera position - set to view from top-right-front
camera.position.set(3, 4, 5); // x, y, z position
camera.lookAt(0, 0, 0); // look at the center

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Function to handle controls visibility change
function handleControlsVisibility() {
    const isControlsVisible = controlsPanel.classList.contains('visible');
    document.body.classList.toggle('controls-visible', isControlsVisible);
    updateSize(); // Immediately update size

    // Start monitoring size changes during the transition
    const startTime = Date.now();
    const duration = 300; // Match the CSS transition duration

    function updateDuringTransition() {
        const elapsed = Date.now() - startTime;
        updateSize();

        if (elapsed < duration) {
            requestAnimationFrame(updateDuringTransition);
        }
    }

    requestAnimationFrame(updateDuringTransition);
}

// Call handleControlsVisibility initially if controls are visible
if (controlsPanel.classList.contains('visible')) {
    handleControlsVisibility();
}

// Handle controls toggle
toggleButton.addEventListener('click', () => {
    controlsPanel.classList.toggle('visible');
    handleControlsVisibility();
});

// Hide controls when clicking on canvas (mobile-friendly)
document.getElementById('canvas-container').addEventListener('click', (e) => {
    if (window.innerWidth <= 600) {
        controlsPanel.classList.remove('visible');
        handleControlsVisibility();
    }
});

// Create cube
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Create materials for each face (matching axis colors)
const materials = [
    new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }), // Right face (positive X) - Red
    new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }), // Left face (negative X) - Red
    new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }), // Top face (positive Y) - Green
    new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }), // Bottom face (negative Y) - Green
    new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 }), // Front face (positive Z) - Blue
    new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 })  // Back face (negative Z) - Blue
];

// Create materials for the cube edges
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

// Create the main cube with translucent colored faces
const cube = new THREE.Mesh(geometry, materials);

// Create edges for the cube
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(edges, edgeMaterial);
cube.add(line);  // Add the edges to the cube
scene.add(cube);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add grid helper (ground plane)
const size = 1000; // 增加網格範圍
const divisions = 1000; // 增加網格線條數量
const gridHelper = new THREE.GridHelper(size, divisions, 0xE0E0E0, 0xE0E0E0); // 使用更淡的灰色
scene.add(gridHelper);

// Add axes helper (X = red, Y = green, Z = blue)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);



// Handle window resize
// Handle window resize
window.addEventListener('resize', () => {
    updateSize();
});

// Control handlers
const controlIds = {
    position: ['posX', 'posY', 'posZ'],
    rotation: ['rotX', 'rotY', 'rotZ'],
    scale: ['scaleX', 'scaleY', 'scaleZ'],
    camera: ['cameraDistance']
};

// Update value displays
function updateValueDisplay(id, value) {
    document.getElementById(`${id}Value`).textContent = Number(value).toFixed(1);
}

// Add event listeners to all controls
Object.values(controlIds).flat().forEach(id => {
    const element = document.getElementById(id);
    element.addEventListener('input', (e) => {
        updateValueDisplay(id, e.target.value);
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update position
    cube.position.x = parseFloat(document.getElementById('posX').value);
    cube.position.y = parseFloat(document.getElementById('posY').value);
    cube.position.z = parseFloat(document.getElementById('posZ').value);

    // Update rotation (convert degrees to radians)
    cube.rotation.x = THREE.MathUtils.degToRad(parseFloat(document.getElementById('rotX').value));
    cube.rotation.y = THREE.MathUtils.degToRad(parseFloat(document.getElementById('rotY').value));
    cube.rotation.z = THREE.MathUtils.degToRad(parseFloat(document.getElementById('rotZ').value));

    // Update scale
    cube.scale.x = parseFloat(document.getElementById('scaleX').value);
    cube.scale.y = parseFloat(document.getElementById('scaleY').value);
    cube.scale.z = parseFloat(document.getElementById('scaleZ').value);

    // Update camera distance while maintaining direction
    const distance = parseFloat(document.getElementById('cameraDistance').value);
    const currentDirection = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(currentDirection.multiplyScalar(distance));

    controls.update();
    renderer.render(scene, camera);
}

animate();