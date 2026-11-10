import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 9);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 6, 5);
scene.add(sun);

scene.add(new THREE.GridHelper(20, 20));

const control = new OrbitControls(camera, renderer.domElement);

const pickables = []
const colors = [0x00FFFF, 0xFF0000, 0x00FF00, 0x0000FF]

for (let i = 0; i < 4; i++) {
  let geometry;
  if (i % 2 === 0) {
    geometry = new THREE.BoxGeometry(1, 1, 1);
  } else {
    geometry = new THREE.SphereGeometry(0.5, 32, 16);
  }
  const material = new THREE.MeshStandardMaterial({ color: colors[i] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Objekti' + [i+1]
  mesh.position.set(-4 + i * 3, 0.5, 0);
  scene.add(mesh);
  pickables.push(mesh);
}

const pointer = new THREE.Vector2();

function updateVectors(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  const W = rect.width
  const H = rect.height

  pointer.x = (2*px)/W - 1;
  pointer.y = 1-(2*py)/H;
}

let selected=null;
let dragging=false;
const raycaster = new THREE.Raycaster();
renderer.domElement.addEventListener('pointerdown', (event)=> {
  updateVectors(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables);
  if (selected) {
    selected.material.emissive.setHex(0x000000);
}
  selected = hits.length > 0 ? hits[0].object : null;
  if (selected) {
    selected.material.emissive.setHex(0x882200);
    dragging=true;
  }
  control.enabled=!dragging;
});

const plane = new THREE.Plane(new THREE.Vector3(0,1,0),0)
const intersect = new THREE.Vector3();

renderer.domElement.addEventListener('pointermove', (event)=> {
  if (!dragging) {
    return;
  };
  updateVectors(event);
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.ray.intersectPlane(plane, intersect)) {
    selected.position.x = intersect.x;
    selected.position.z = intersect.z;
  }
})

renderer.domElement.addEventListener('pointerup', (event)=> {
  dragging=false;
  control.enabled=true;
})

const startPositions = pickables.map((obj) => obj.position.clone());

const gui = new GUI();

gui.add({
  reset() {
    for (let i = 0; i < pickables.length; i++) {
      pickables[i].position.copy(startPositions[i]);
    }
  }
}, 'reset').name('Reset Positions');


function loop() {
  requestAnimationFrame(loop);
  control.update();
  renderer.render(scene, camera);

}

loop();

