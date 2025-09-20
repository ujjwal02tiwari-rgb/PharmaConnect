/*
 * Main JavaScript for the revamped PharmaConnect landing page.
 *
 * This file sets up a Three.js scene for the hero section,
 * utilises GSAP and ScrollTrigger for scroll‑driven animations,
 * and manages interactivity such as tab switching and custom cursors.
 * The palette has been updated to align with the neon‑infused styling defined
 * in style.css and to deliver a cohesive experience.
 */

// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

// Hero Three.js setup
const canvas = document.getElementById('hero-canvas');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});

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

// Helper to create wireframe meshes
function createWireframeMesh(geometry, colour) {
  const material = new THREE.MeshStandardMaterial({
    color: colour,
    wireframe: true,
    emissive: 0x000000,
    roughness: 0.5,
    metalness: 0.1
  });
  return new THREE.Mesh(geometry, material);
}

// Create geometry for the hero section (torus knot)
const heroGeometry = new THREE.TorusKnotGeometry(10, 3, 200, 32);
const heroMaterial = new THREE.MeshStandardMaterial({
  // Updated to match the new purple accent defined in style.css
  color: 0x7928ca,
  wireframe: true,
  emissive: 0x0,
  roughness: 0.5,
  metalness: 0.1
});
const knot = new THREE.Mesh(heroGeometry, heroMaterial);
scene.add(knot);

// Additional 3D objects for each section
// About section: Icosahedron (cyan)
const aboutGeom = new THREE.IcosahedronGeometry(8, 1);
const aboutObj = createWireframeMesh(aboutGeom, 0x2de2e6);
aboutObj.scale.set(0, 0, 0);
scene.add(aboutObj);

// Investors section: thin cylinder (golden)
const investorsGeom = new THREE.CylinderGeometry(8, 8, 2, 64);
const investorsObj = createWireframeMesh(investorsGeom, 0xeab308);
investorsObj.rotation.x = Math.PI / 2;
investorsObj.scale.set(0, 0, 0);
scene.add(investorsObj);

// Pharmacists section: pill approximation (pink)
const pharmGeom = new THREE.CylinderGeometry(4, 4, 12, 32);
const pharmObj = createWireframeMesh(pharmGeom, 0xff4da6);
pharmObj.rotation.x = Math.PI / 2;
pharmObj.scale.set(0, 0, 0);
scene.add(pharmObj);

// Process section: Octahedron (cyan/light blue)
const processGeom = new THREE.OctahedronGeometry(8);
const processObj = createWireframeMesh(processGeom, 0x00c8ff);
processObj.scale.set(0, 0, 0);
scene.add(processObj);

// Signup section: Cone (pink)
const signupGeom = new THREE.ConeGeometry(6, 14, 32);
const signupObj = createWireframeMesh(signupGeom, 0xff69b4);
signupObj.scale.set(0, 0, 0);
scene.add(signupObj);

// Create a starfield backdrop
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
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7
  });
  return new THREE.Points(starsGeometry, starsMaterial);
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

// Animation loop to continuously rotate objects
function animate() {
  requestAnimationFrame(animate);
  [knot, aboutObj, investorsObj, pharmObj, processObj, signupObj].forEach((obj) => {
    obj.rotation.x += 0.004;
    obj.rotation.y += 0.006;
  });
  renderer.render(scene, camera);
}
animate();

// Scroll‑driven rotation for the hero knot and starfield
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

// Map each section to its corresponding 3D object
const sectionObjects = [
  { id: '#hero', obj: knot },
  { id: '#about', obj: aboutObj },
  { id: '#investors', obj: investorsObj },
  { id: '#pharmacists', obj: pharmObj },
  { id: '#process', obj: processObj },
  { id: '#signup', obj: signupObj }
];

sectionObjects.forEach(({ id, obj }) => {
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

// Colour transitions per section
const colourTargets = {
  '#hero': [new THREE.Color(0x7928ca), new THREE.Color(0x00c6ff)],
  '#about': [new THREE.Color(0x2de2e6), new THREE.Color(0x00c6ff)],
  '#investors': [new THREE.Color(0xeab308), new THREE.Color(0xfbbf24)],
  '#pharmacists': [new THREE.Color(0xff4da6), new THREE.Color(0xff6ec7)],
  '#process': [new THREE.Color(0x00c8ff), new THREE.Color(0x2de2e6)],
  '#signup': [new THREE.Color(0xff69b4), new THREE.Color(0x00bcd4)]
};

sectionObjects.forEach(({ id, obj }) => {
  const [startColour, endColour] = colourTargets[id] || [new THREE.Color(0xffffff), new THREE.Color(0xffffff)];
  // Apply initial colour
  obj.material.color.copy(startColour);
  // Rotate object across the section
  gsap.to(obj.rotation, {
    x: "+=" + Math.PI * 2,
    y: "+=" + Math.PI * 2,
    scrollTrigger: {
      trigger: id,
      start: 'top center',
      end: 'bottom center',
      scrub: true
    }
  });
  // Colour transition across the section
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
    // Remove active state from all buttons and forms
    tabButtons.forEach((b) => b.classList.remove('active'));
    forms.forEach((form) => form.classList.remove('active'));
    // Add active state to clicked button and its target form
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    document.getElementById(target).classList.add('active');
  });
});

// Simple form submission handler
document.querySelectorAll('.signup-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Show a temporary thank‑you message
    alert('Thank you for signing up! Our team will reach out to you shortly.');
    form.reset();
  });
});

// Custom cursor follow effect
const customCursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (event) => {
  const { clientX, clientY } = event;
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