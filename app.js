/*
 * Main JavaScript for PharmaConnect.
 *
 * This file sets up a Three.js scene for the hero section,
 * utilises GSAP and ScrollTrigger for scroll‑driven animations,
 * and manages basic interactivity such as tab switching in the
 * sign‑up section. The intent is to create an engaging,
 * story‑driven experience reminiscent of creative agency
 * websites like Yalamps.
 */

// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

// Hero Three.js setup
const canvas = document.getElementById('hero-canvas');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });

// Create camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 50;

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// Create geometry: use a torus knot to represent intertwined paths
// This object anchors the hero section. Additional objects for other
// sections will be defined below.
const heroGeometry = new THREE.TorusKnotGeometry(10, 3, 200, 32);
const heroMaterial = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  wireframe: true,
  emissive: 0x0,
  roughness: 0.5,
  metalness: 0.1
});
const knot = new THREE.Mesh(heroGeometry, heroMaterial);
scene.add(knot);

// -----------------------------------------------------------------------------
// Additional 3D objects for each section
// Inspired by the Yalamps demo, each section of the page has its own
// geometric sculpture rendered in the same scene. These shapes will be
// animated in and out on scroll to give a sense of traveling through
// different “rooms”.

function createWireframeMesh(geometry, color) {
  const material = new THREE.MeshStandardMaterial({
    color: color,
    wireframe: true,
    emissive: 0x000000,
    roughness: 0.5,
    metalness: 0.1
  });
  return new THREE.Mesh(geometry, material);
}

// About section: Icosahedron (blue)
const aboutGeom = new THREE.IcosahedronGeometry(8, 1);
const aboutObj = createWireframeMesh(aboutGeom, 0x0072ff);
aboutObj.scale.set(0, 0, 0);
scene.add(aboutObj);

// Investors section: Coin (gold)
// Represent investors with a coin‑like cylinder. A thin cylinder conveys
// investment and finance more clearly than a sphere.
const investorsGeom = new THREE.CylinderGeometry(8, 8, 2, 64);
const investorsObj = createWireframeMesh(investorsGeom, 0xe2a90f);
investorsObj.rotation.x = Math.PI / 2; // lay flat like a coin
investorsObj.scale.set(0, 0, 0);
scene.add(investorsObj);

// Pharmacists section: Pill representation using a cylinder
// Some builds of three.js (including the CDN version used in this project)
// do not ship the experimental CapsuleGeometry class. To avoid runtime
// errors which can break the entire script (and result in a blank page),
// we approximate a pill by using a simple cylinder geometry. This still
// conveys the idea of a capsule when rendered in wireframe mode and
// rotated horizontally. The cylinder has a circular cross‑section and
// gentle proportions to evoke the look of a pharmaceutical capsule.
const pharmGeom = new THREE.CylinderGeometry(4, 4, 12, 32);
const pharmObj = createWireframeMesh(pharmGeom, 0xdd2c00); // red pill colour
// Rotate onto its side so it lies horizontally like a pill.
pharmObj.rotation.x = Math.PI / 2;
pharmObj.scale.set(0, 0, 0);
scene.add(pharmObj);

// Process section: Octahedron (cyan)
// Adjust colour to cyan for visual variety and to mirror Yalamps’ palette.
const processGeom = new THREE.OctahedronGeometry(8);
const processObj = createWireframeMesh(processGeom, 0x00c8ff);
processObj.scale.set(0, 0, 0);
scene.add(processObj);

// Signup section: Cone (pink)
const signupGeom = new THREE.ConeGeometry(6, 14, 32);
const signupObj = createWireframeMesh(signupGeom, 0xff69b4);
signupObj.scale.set(0, 0, 0);
scene.add(signupObj);

// Create a starfield to simulate the deep space backdrop similar to Yalamps
function createStarField() {
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  return starField;
}

const starField = createStarField();
scene.add(starField);

// Renderer configuration
function resizeRenderer() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // Slowly rotate all objects for subtle motion. This enhances
  // the perception of depth and mirrors the continuous movement
  // seen in the inspiration site. The rotation persists regardless
  // of section, but the objects are scaled down when inactive.
  [knot, aboutObj, investorsObj, pharmObj, processObj, signupObj].forEach((obj) => {
    obj.rotation.x += 0.004;
    obj.rotation.y += 0.006;
  });
  renderer.render(scene, camera);
}
animate();

// Scroll‑driven rotation using GSAP
gsap.to(knot.rotation, {
  x: Math.PI * 2,
  y: Math.PI * 2,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: '+=1000',
    scrub: true
  }
});

// Also rotate the starfield slightly on scroll for parallax effect
gsap.to(starField.rotation, {
  y: Math.PI * 2,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: '+=1000',
    scrub: true
  }
});

// -----------------------------------------------------------------------------
// Section‑based 3D object transitions
// Define a mapping between each section and its corresponding 3D object.
// When a section enters the viewport, its object scales up to full size
// while all others shrink down. This creates the impression of travelling
// through different scenes, similar to the Yalamps template.
const sectionObjects = [
  { id: '#hero', obj: knot },
  { id: '#about', obj: aboutObj },
  { id: '#investors', obj: investorsObj },
  { id: '#pharmacists', obj: pharmObj },
  { id: '#process', obj: processObj },
  { id: '#signup', obj: signupObj }
];

sectionObjects.forEach(({ id, obj }) => {
  // For the hero section the object is already scaled to 1 by default.
  if (id === '#hero') {
    obj.scale.set(1, 1, 1);
  }
  ScrollTrigger.create({
    trigger: id,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => {
      // Scale up the current object
      gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'power2.out' });
      // Scale down all other objects
      sectionObjects.forEach(({ obj: otherObj }) => {
        if (otherObj !== obj) {
          gsap.to(otherObj.scale, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' });
        }
      });
    },
    onEnterBack: () => {
      gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'power2.out' });
      sectionObjects.forEach(({ obj: otherObj }) => {
        if (otherObj !== obj) {
          gsap.to(otherObj.scale, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' });
        }
      });
    }
  });
});

// Animate rotation and colour transitions on scroll for each object. This
// enhances the storytelling effect by adding motion within a section. Colours
// transition smoothly between two hues per section. All colour values
// are specified as THREE.Color instances and broken into r/g/b for GSAP.
const colourTargets = {
  '#hero': [new THREE.Color(0xff6600), new THREE.Color(0xff007b)],
  '#about': [new THREE.Color(0x0072ff), new THREE.Color(0x00ff7f)],
  '#investors': [new THREE.Color(0xe2a90f), new THREE.Color(0xffd700)],
  '#pharmacists': [new THREE.Color(0xdd2c00), new THREE.Color(0x4caf50)],
  '#process': [new THREE.Color(0x00c8ff), new THREE.Color(0xff00ff)],
  '#signup': [new THREE.Color(0xff69b4), new THREE.Color(0x00bcd4)]
};

sectionObjects.forEach(({ id, obj }) => {
  const [startColour, endColour] = colourTargets[id] || [new THREE.Color(0xffffff), new THREE.Color(0xffffff)];
  // Set initial colour
  obj.material.color.copy(startColour);
  // Rotation animation across the section
  gsap.to(obj.rotation, {
    x: "+=" + (Math.PI * 2),
    y: "+=" + (Math.PI * 2),
    scrollTrigger: {
      trigger: id,
      start: 'top center',
      end: 'bottom center',
      scrub: true
    }
  });
  // Colour transition
  gsap.to(obj.material.color, {
    r: endColour.r,
    g: endColour.g,
    b: endColour.b,
    scrollTrigger: {
      trigger: id,
      start: 'top center',
      end: 'bottom center',
      scrub: true
    }
  });
});

// Remove previous scaling triggers on the hero object. New per‑section
// animations are defined below.

// Fade in sections on scroll
document.querySelectorAll('.section').forEach((section) => {
  gsap.from(section, {
    opacity: 0,
    y: 100,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'bottom 60%',
      toggleActions: 'play none none reverse'
    }
  });
});

// Tab switching logic for sign‑up section
const tabButtons = document.querySelectorAll('.tab-button');
const forms = document.querySelectorAll('.signup-form');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    // remove active state from all buttons and forms
    tabButtons.forEach((b) => b.classList.remove('active'));
    forms.forEach((form) => form.classList.remove('active'));
    // add active state to clicked button and its target form
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    document.getElementById(target).classList.add('active');
  });
});

// Simple form submission handler
document.querySelectorAll('.signup-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Show a temporary thank‑you message (alert for simplicity)
    alert('Thank you for signing up! Our team will reach out to you shortly.');
    form.reset();
  });
});

// Custom cursor follow effect similar to Yalamps
const customCursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (event) => {
  const { clientX, clientY } = event;
  // Use GSAP to smoothly animate cursor position
  gsap.to(customCursor, {
    x: clientX,
    y: clientY,
    duration: 0.2,
    ease: 'power2.out'
  });
});

// Scroll progress indicator update
const progressDot = document.querySelector('.scroll-progress .progress-dot');
const progressContainer = document.querySelector('.scroll-progress');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  const barHeight = progressContainer.clientHeight;
  const dotHeight = progressDot.clientHeight;
  const yPos = progress * (barHeight - dotHeight) + dotHeight / 2;
  progressDot.style.top = `${yPos}px`;
}
window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();