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

// Initial size setup
updateSize();

// Camera position
camera.position.z = 5;

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Function to update camera position and scene
function updateCameraPosition() {
    const isControlsVisible = controlsPanel.classList.contains('visible');
    if (isControlsVisible && window.innerWidth > 600) {
        // When controls are visible on desktop, offset the target to the left
        controls.target.set(-1, 0, 0);
    } else {
        // When controls are hidden or on mobile, center the target
        controls.target.set(0, 0, 0);
    }
    controls.update();
}

// Handle controls toggle
toggleButton.addEventListener('click', () => {
    controlsPanel.classList.toggle('visible');
    updateCameraPosition();
});

// Hide controls when clicking on canvas (mobile-friendly)
document.getElementById('canvas-container').addEventListener('click', (e) => {
    if (window.innerWidth <= 600) {
        controlsPanel.classList.remove('visible');
        updateCameraPosition();
    }
});

// Create cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
// Create materials for the cube
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const faceMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

// Create the main cube with translucent faces
const cube = new THREE.Mesh(geometry, faceMaterial);

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
const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// Add axes helper (X = red, Y = green, Z = blue)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);



// Handle window resize
// Handle window resize
window.addEventListener('resize', () => {
    updateSize();
    updateCameraPosition();
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

    // Update camera distance
    const distance = parseFloat(document.getElementById('cameraDistance').value);
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.multiplyScalar(-distance);
    camera.position.copy(cameraDirection);

    controls.update();
    renderer.render(scene, camera);
}

animate();