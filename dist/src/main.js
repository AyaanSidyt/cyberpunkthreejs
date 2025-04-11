import './style.css';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
//scene
const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 7;
scene.add(camera);

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// RGB Shift effect
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030; // Increased RGB shift effect
composer.addPass(rgbShiftPass);

//Load HDRI environment map
let model;
let rgbShiftAmount = 0;

new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
       
        scene.environment = texture;
        
        //gltf model loader
        const loader = new GLTFLoader();

        loader.load('./DamagedHelmet.gltf', (gltf) => {
            model = gltf.scene;
            scene.add(model);
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.x += (model.position.x - center.x);
            model.position.y += (model.position.y - center.y);
            model.position.z += (model.position.z - center.z);
            
            const scaleValue = 2;
            model.scale.set(scaleValue, scaleValue, scaleValue);
        }, undefined, (error) => {
            console.error('An error occurred loading the model:', error);
        });
    });

//controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
window.addEventListener("mousedown", (e) => {
 if(model){
  const rotationX = (e.clientY/window.innerHeight-0.5)*Math.PI * .3;
  const rotationY = (e.clientX/window.innerWidth-0.5)*Math.PI * .3;
      gsap.to(model.rotation, {
        y: rotationX,
        x: rotationY,
        duration: 0.8,
        ease: "power2.out"
      });
 }
});
window.addEventListener("resize", (e) => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize(window.innerWidth, window.innerHeight);
});
function animate() {
    requestAnimationFrame(animate);
    // controls.update();

    // Animate RGB shift effect
    rgbShiftAmount += 0.001;
    rgbShiftPass.uniforms['amount'].value = Math.sin(rgbShiftAmount) * 0.01;
    
    
    
    composer.render();
}
animate();