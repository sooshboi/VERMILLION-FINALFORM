document.addEventListener('DOMContentLoaded', function() { 
  const tabs = document.querySelectorAll('.tabs button');
  const optionsContainers = document.querySelectorAll('.right-bottom .options');
  
  // Color and option clicks for combos
  const colorButtons = document.querySelectorAll('.colors button');
  colorButtons.forEach(colorBtn => { 
    colorBtn.addEventListener('click', function() { 
      colorButtons.forEach(c => c.classList.remove('active')); 
      this.classList.add('active'); 
      applyCombo(); 
    });
  });

  const optionButtons = document.querySelectorAll('.option');
  optionButtons.forEach(optBtn => { 
    optBtn.addEventListener('click', function() { 
      const siblings = this.parentElement.querySelectorAll('.option'); 
      siblings.forEach(s => s.classList.remove('active')); 
      this.classList.add('active'); 
      if (this.dataset.type === 'wrap') { 
        applyCombo();
        const vehiclePanel = document.querySelector('.left-panel');
        vehiclePanel.classList.add('updating'); 
        setTimeout(() => { vehiclePanel.classList.remove('updating'); }, 400); 
      }
    });
  });

  function applyCombo() { 
    const selectedColor = document.querySelector('.colors button.active'); 
    const selectedTexture = document.querySelector('#wraps-options .option.active'); 

    if (selectedColor && selectedTexture) { 
      const colorValue = selectedColor.textContent.toLowerCase(); 
      const textureValue = selectedTexture.dataset.value; 
      const combo = colorValue + '-' + textureValue; 

      // Placeholder for 3D apply (uncomment when model loads)
      // if (model) {
      //   model.traverse((child) => {
      //     if (child.isMesh) { 
      //       child.material.color.set(new THREE.Color(colorValue)); 
      //       child.material.metalness = (textureValue === 'metallic' ? 0.9 : 0); 
      //       child.material.roughness = (textureValue === 'glossy' ? 0.1 : 0.5); 
      //       child.material.needsUpdate = true; 
      //     } 
      //   });
      // }
      vehiclePanel.dataset.livery = combo; 
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      optionsContainers.forEach(container => container.classList.add('hidden'));

      const targetId = this.textContent.toLowerCase() + '-options';
      const targetContainer = document.getElementById(targetId);
      if (targetContainer) {
        targetContainer.classList.remove('hidden');
      }
    });
  });

  if (tabs.length > 0) {
    tabs[0].click();
  }

  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('dropdown-menu');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // Track price state
  let basePrice = 600; 
  let decalCount = 0;   
  let decalPrice = 25;  

  const totalDisplay = document.getElementById('total-price');
  const addToCartBtn = document.getElementById('add-to-cart');

  function updatePrice() {
    const total = basePrice + (decalCount * decalPrice);
    totalDisplay.textContent = `Total: $${total}`;
  }

  const activeDecals = new Set(); 

  document.querySelectorAll('#decals-options .option').forEach(btn => {
    btn.addEventListener('click', () => {
      const decalValue = btn.dataset.value; 

      if (btn.classList.contains('active')) {
        activeDecals.delete(decalValue);
        btn.classList.remove('active');
        decalCount--;
      } else {
        activeDecals.add(decalValue);
        btn.classList.add('active');
        decalCount++;
      }

      updatePrice(); 
    });
  });

  // 3D Car Setup (fixed for CodePen)
  let scene, camera, renderer, model;

  const container = document.getElementById('three-container');
  if (container) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader = new THREE.GLTFLoader();
    loader.load(
      'https://raw.githubusercontent.com/RennVermillion/LiveryEditor/main/mk5-unibody.glb',  // Your GitHub link—test with this, replace with others
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        model.scale.set(1.2, 1.2, 1.2);
        model.position.y = -0.5;
        console.log('Car loaded. Panels:', model.children.map(child => child.name)); 
      },
      undefined,
      (error) => console.error('Load error:', error)
    );

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  } else {
    console.error('No three-container div found.');
  }
});
