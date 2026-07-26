        document.addEventListener('DOMContentLoaded', () => {
            // Set current year
            document.getElementById('year').textContent = new Date().getFullYear();

            // Mobile Menu Toggle logic
            const btn = document.getElementById('mobile-menu-button');
            const menu = document.getElementById('mobile-menu');
            const spans = btn.querySelectorAll('span');

            btn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
                
                // Animate hamburger icon
                if (menu.classList.contains('hidden')) {
                    spans[0].style.transform = 'rotate(0) translateY(0)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0) translateY(0)';
                    spans[2].classList.add('w-4');
                    spans[2].classList.remove('w-6');
                } else {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                    spans[1].style.opacity = '0';
                    spans[2].classList.remove('w-4');
                    spans[2].classList.add('w-6');
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
                }
            });

            // Close mobile menu on link click
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.add('hidden');
                    spans[0].style.transform = 'rotate(0) translateY(0)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0) translateY(0)';
                    spans[2].classList.add('w-4');
                    spans[2].classList.remove('w-6');
                });
            });

            // Navbar scroll effect
            const navbar = document.getElementById('navbar');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('shadow-2xl');
                    navbar.style.background = 'rgba(10, 10, 10, 0.85)';
                } else {
                    navbar.classList.remove('shadow-2xl');
                    navbar.style.background = 'rgba(10, 10, 10, 0.6)';
                }
            });

            // Intersection Observer for Scroll Animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Optional: Stop observing once animated
                        // observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            const animatableElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
            animatableElements.forEach(el => observer.observe(el));

            // Trigger reveal for elements already in viewport on load
            setTimeout(() => {
                animatableElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight) {
                        el.classList.add('is-visible');
                    }
                });
            }, 300);

            // ==========================================
            // THREE.JS Fondo de particulas interactivas
            // ==========================================
            initThreeJsBackground();
        });

        function initThreeJsBackground() {
            const container = document.getElementById('canvas-container');
            if(!container) return;

            const scene = new THREE.Scene();
            
            // Config de la camara
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 30;

            // Config de renderizado
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Crear Particulas (Nodes in a network)
            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 900; // Numero de particulas
            
            const posArray = new Float32Array(particlesCount * 3);
            const colorsArray = new Float32Array(particlesCount * 3);

            // DevOps colors: Blue (#3b82f6), Purple (#8b5cf6), Emerald (#10b981)
            const colorPalette = [
                new THREE.Color(0x3b82f6),
                new THREE.Color(0x8b5cf6),
                new THREE.Color(0x10b981),
                new THREE.Color(0x333333) // dark grey for depth
            ];

            for(let i = 0; i < particlesCount * 3; i+=3) {
                // Position - Spread them out in a wide space
                posArray[i] = (Math.random() - 0.5) * 100;     // x
                posArray[i+1] = (Math.random() - 0.5) * 100;   // y
                posArray[i+2] = (Math.random() - 0.5) * 50 - 10; // z (push slightly back)

                // Assign random color from palette
                const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                colorsArray[i] = color.r;
                colorsArray[i+1] = color.g;
                colorsArray[i+2] = color.b;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

            // Material for particles
            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);

            // Connect particles with lines (simulate network/infrastructure)
            // Note: Line generation can be heavy, doing a simplified version
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x3b82f6,
                transparent: true,
                opacity: 0.05
            });
            
            // To make lines, we'll just connect some points randomly to simulate a web
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = [];
            for (let i = 0; i < particlesCount; i++) {
                if (Math.random() > 0.8) { // Only connect some
                    const idx1 = i * 3;
                    const idx2 = Math.floor(Math.random() * particlesCount) * 3;
                    linePositions.push(posArray[idx1], posArray[idx1+1], posArray[idx1+2]);
                    linePositions.push(posArray[idx2], posArray[idx2+1], posArray[idx2+2]);
                }
            }
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(linesMesh);

            // Mouse Interaction Variables
            let mouseX = 0;
            let mouseY = 0;
            let targetX = 0;
            let targetY = 0;

            const windowHalfX = window.innerWidth / 2;
            const windowHalfY = window.innerHeight / 2;

            document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX - windowHalfX);
                mouseY = (event.clientY - windowHalfY);
            });

            // Animation Loop
            const clock = new THREE.Clock();

            function animate() {
                requestAnimationFrame(animate);
                const elapsedTime = clock.getElapsedTime();

                targetX = mouseX * 0.001;
                targetY = mouseY * 0.001;

                // Smoothly interpolate rotation based on mouse
                particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
                particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
                
                linesMesh.rotation.y = particlesMesh.rotation.y;
                linesMesh.rotation.x = particlesMesh.rotation.x;

                // Continuous slow rotation
                particlesMesh.rotation.y += 0.001;
                linesMesh.rotation.y += 0.001;

                // Slight wave effect on particles
                const positions = particlesGeometry.attributes.position.array;
                for(let i = 0; i < particlesCount; i++) {
                    const i3 = i * 3;
                    // Move slightly in Y based on time and X position
                    positions[i3 + 1] += Math.sin(elapsedTime * 0.5 + positions[i3]) * 0.01;
                }
                particlesGeometry.attributes.position.needsUpdate = true;

                renderer.render(scene, camera);
            }

            animate();

            // Handle Resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }