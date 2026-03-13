/* V4 — Generic Container Engine for Impulsa */
/* Reads content.json, builds containers, applies CSS properties directly. */
/* Optimized for CSS 3D Space and pure data-driven DOM rendering. */

const RESERVED = {
    nombre: true, hover: true, 'hover-hermanos': true, click: true, scroll: true,
    texto: true, 'seguir-mouse': true, tilt: true, acciones: true,
    instancias: true, 'look-at': true, 'auto-animar': true,
    paralaje: true, escribir: true, magnetico: true, audio: true
};

let currentContent = null;

function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                target[key] = {};
            }
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// --- API de Captura y Navegación (Global) ---
window.get_json_v4_por_path = (path) => {
    if (!currentContent || !path) return null;

    const keys = path.split('.').flatMap(k => k.split(/[\[\]]/)).filter(Boolean);

    let result = currentContent;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return null;
        }
    }
    return result;
};

window.get_json_v4_por_path_jerarquico = (path) => {
    if (!currentContent || !path) return null;

    const keys = path.split('.').flatMap(k => k.split(/[\[\]]/)).filter(Boolean);

    // Función auxiliar para clonar un nodo solo con sus propiedades directas (sin hijos)
    const cloneNodeProperties = (node) => {
        const clone = {};
        for (const key in node) {
            const val = node[key];
            // Si no es un objeto/array, o es un objeto reservado (hover, click, etc), lo mantenemos
            if (typeof val !== 'object' || val === null || RESERVED[key]) {
                clone[key] = val;
            }
        }
        return clone;
    };

    // Construir la jerarquía de arriba hacia abajo
    let fullHierarchy = {};
    let currentTarget = fullHierarchy;
    let currentDataSource = currentContent;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isLast = (i === keys.length - 1);

        if (isLast) {
            // En el último nivel, devolvemos el nodo completo con sus hijos
            currentTarget[key] = JSON.parse(JSON.stringify(currentDataSource[key]));
        } else {
            // En niveles intermedios, clonamos solo las propiedades del padre y preparamos el hueco para el hijo
            const parentProps = cloneNodeProperties(currentDataSource[key]);
            currentTarget[key] = parentProps;

            // Avanzamos en ambas estructuras
            currentTarget = currentTarget[key];
            currentDataSource = currentDataSource[key];
        }
    }

    return fullHierarchy;
};

// Punto de entrada global compatible con AI Studio Function Calling
window.inyectar_cambios_v4 = (input) => {
    let partial = null;

    // Caso 1: Viene el objeto de llamada completo { name, args: { partial } }
    if (input.args && input.args.partial) {
        partial = input.args.partial;
    }
    // Caso 2: Viene solo el objeto partial
    else if (input.partial) {
        partial = input.partial;
    }
    // Caso 3: Es el JSON crudo
    else {
        partial = input;
    }

    if (partial && typeof partial === 'object') {
        window.postMessage({ type: 'inject-partial', partial }, '*');
    } else {
        console.warn("Inyector V4: El formato recibido no es un JSON válido o partial está vacío.");
    }
};

// Core engine initialization
export async function init() {
    try {
        const res = await fetch('./src/content.json');
        const data = await res.json();
        currentContent = data;
        const app = document.getElementById('app');

        // Clear any loading state and render tree
        app.innerHTML = '';
        construir(currentContent, app, 0);

        // Listen for live updates
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'inject-partial') {
                deepMerge(currentContent, e.data.partial);
                app.innerHTML = '';
                construir(currentContent, app, 0, '');
            }
        });

    } catch (e) {
        console.error("Error starting V4 Engine:", e);
        document.getElementById('app').innerHTML = `<div style="padding: 2rem; color: #ff5555;">Error loading content.json: ${e.message}</div>`;
    }
}

// Recursive builder
export function construir(config, parent, profundidad, pathPrefix = '') {
    // Si la config es un array (ej. lista de tarjetas), la iteramos.
    if (Array.isArray(config)) {
         config.forEach((c, idx) => construir(c, parent, profundidad, `${pathPrefix}[${idx}]`));
         return;
    }

    const el = document.createElement('div');
    // Set base z-index for layering, though CSS 3D transform (translateZ) will primarily handle depth
    el.style.zIndex = profundidad;

    // Asignar dataset.path para que el Editor sepa qué elemento es en el JSON
    if (pathPrefix) {
        el.dataset.path = pathPrefix;
    }

    let hoverData = null;
    let hoverHermanosData = null;
    let clickData = null;
    let scrollDir = null;
    const hijos = [];

    // Process properties mapped from JSON
    for (const key in config) {
        const val = config[key];

        // Reserved Logic Keys
        if (key === 'nombre') { el.dataset.nombre = val; continue; }
        if (key === 'texto') { el.innerHTML = val; continue; } // Permite innerHTML para etiquetas <span> internas si las hubiera
        if (key === 'hover') { hoverData = val; continue; }
        if (key === 'hover-hermanos') { hoverHermanosData = val; continue; }
        if (key === 'click') { clickData = val; continue; }
        if (key === 'scroll') { scrollDir = val; continue; }

        // Si es un objeto, es un nodo hijo (ej: { "boton_comprar": { ... } })
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            // Compute current object path
            const childPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const hijo = construir(val, el, profundidad + 1, childPath);
            hijos.push(hijo);
            continue;
        }

        // Si es array (lista de hijos directos en JSON sin nombrar la llave como objeto)
        if (Array.isArray(val)) {
             val.forEach((item, index) => {
                  const childPath = pathPrefix ? `${pathPrefix}.${key}[${index}]` : `${key}[${index}]`;
                  const hijo = construir(item, el, profundidad + 1, childPath);
                  hijos.push(hijo);
             });
             continue;
        }

        // Si no es reservada y no es objeto, es un estilo directo (CSS mapping)
        if (key === 'transform') {
            el.style.setProperty('--base-transform', val);
        } else {
            el.style.setProperty(key, val);
        }
    }

    // Preparar el sistema de transformaciones combinadas (permite mezclar efectos)
    el.style.transform = `
        var(--base-transform, translate3d(0,0,0))
        var(--dyn-mouse-follow, translate3d(0,0,0))
        var(--dyn-look-at, rotateX(0deg) rotateY(0deg))
        var(--dyn-tilt, rotateX(0deg) rotateY(0deg))
        var(--dyn-parallax, translate3d(0,0,0))
        var(--dyn-magnetic, translate3d(0,0,0))
        var(--dyn-auto-animate, translate3d(0,0,0) rotate(0deg) scale(1))
    `.trim();

    // --- Funcionalidad 1: JS-controlled scroll (Scroll Controlado) ---
    // (Exactamente la lógica provista para control de carruseles sin usar overflow scroll nativo)
    if (scrollDir) {
        initScrollSystem(el, scrollDir);
    }

    // --- Funcionalidad 2: Hover hermanos (Sibling Effects) ---
    const hijosConHoverH = hijos.filter(h => h && h.hoverHermanos);
    if (hijosConHoverH.length > 0) {
        initSiblingHover(hijos, hijosConHoverH, el);
    }

    // --- Funcionalidad 3: Self-only hover (Hover simple) ---
    if (hoverData && !hoverHermanosData) {
        initSelfHover(el, hoverData, hijosConHoverH);
    }

    // --- Funcionalidad 4: Click interaction (Toggle state) ---
    if (clickData) {
        initClickState(el, clickData);
    }

    // --- Funcionalidad 5: Seguir mouse (Mouse tracker) ---
    if (config['seguir-mouse']) {
        initFollowMouse(el, config['seguir-mouse']);
    }

    // --- Funcionalidad 6: Tilt 3D (Spatial tilt) ---
    if (config['tilt']) {
        initTilt(el, config['tilt']);
    }

    // --- Funcionalidad 7: Acciones avanzadas (Remote control) ---
    if (config['acciones']) {
        initActions(el, config['acciones']);
    }

    // --- Funcionalidad 8: Instancias procedimentales ---
    if (config['instancias']) {
        initInstances(el, config['instancias'], profundidad + 1, pathPrefix);
    }

    // --- Funcionalidad 9: Look-at (Mirada 3D) ---
    if (config['look-at']) {
        initLookAt(el, config['look-at']);
    }

    // --- Funcionalidad 10: Auto-animar (Movimiento cíclico) ---
    if (config['auto-animar']) {
        initAutoAnimate(el, config['auto-animar']);
    }

    // --- Funcionalidad 11: Paralaje (Scroll reactive) ---
    if (config['paralaje']) {
        initParallax(el, config['paralaje']);
    }

    // --- Funcionalidad 12: Escribir (Typewriter effect) ---
    if (config['escribir']) {
        initTypewriter(el, config['escribir']);
    }

    // --- Funcionalidad 13: Magnético (Mouse attraction) ---
    if (config['magnetico']) {
        initMagnetic(el, config['magnetico']);
    }

    // --- Funcionalidad 14: Audio (Sound effects) ---
    if (config['audio']) {
        initAudio(el, config['audio']);
    }

    parent.appendChild(el);
    return { el, hoverData, hoverHermanos: hoverHermanosData };
}


// ======= LOGICA DE INTERACCION DEL MOTOR =======

function initFollowMouse(el, config) {
    const factor = config.factor || 0.1;
    const smooth = config.suavizado || 0.1;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) * factor;
        targetY = (e.clientY - window.innerHeight / 2) * factor;
    });

    function animate() {
        if (!el.isConnected) return;
        currentX += (targetX - currentX) * smooth;
        currentY += (targetY - currentY) * smooth;
        el.style.setProperty('--dyn-mouse-follow', `translate3d(${currentX}px, ${currentY}px, 0)`);
        requestAnimationFrame(animate);
    }
    animate();
}

function initAudio(el, config) {
    const sound = new Audio(config.url);
    sound.volume = config.volumen || 0.5;

    if (config.loop) sound.loop = true;

    const trigger = config.evento || 'click';
    el.addEventListener(trigger, () => {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Audio play blocked by browser policy. Interaction required first."));
    });
}

function initTilt(el, config) {
    const max = config.max || 15;
    const perspective = config.perspectiva || 1000;
    const smooth = config.suavizado || 0.1;

    if (el.parentElement) el.parentElement.style.perspective = `${perspective}px`;

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -max;
        const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * max;
        el.style.setProperty('--dyn-tilt', `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    });

    el.addEventListener('mouseleave', () => {
        el.style.transition = `transform ${smooth}s ease`;
        el.style.setProperty('--dyn-tilt', `rotateX(0deg) rotateY(0deg)`);
        setTimeout(() => el.style.transition = '', smooth * 1000);
    });
}

function initActions(el, config) {
    for (const eventType in config) {
        const actionsList = Array.isArray(config[eventType]) ? config[eventType] : [config[eventType]];

        el.addEventListener(eventType, () => {
            actionsList.forEach(action => {
                // Soporte para navegación de página completa (Page Swapper)
                if (action.tipo === 'navegacion' && action.hacia) {
                    const toEl = document.querySelector(`[data-path="${action.hacia}"]`);
                    if (!toEl) return;

                    if (action.desde) {
                        const fromEl = document.querySelector(`[data-path="${action.desde}"]`);
                        if (fromEl) {
                            // Si 'desde' es el contenedor padre, ocultamos a todos sus hijos excepto el destino
                            if (action.hacia.startsWith(action.desde)) {
                                Array.from(fromEl.children).forEach(child => {
                                    if (child !== toEl && child.style.display !== 'none') {
                                        child.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                                        child.style.opacity = '0';
                                        child.style.filter = 'blur(20px)';
                                        child.style.pointerEvents = 'none';
                                        child.style.transform = action.efecto === 'slide' ? 'translateY(-100px) scale(0.8)' : 'scale(0.5) translateZ(-1500px)';
                                        setTimeout(() => child.style.display = 'none', 1000);
                                    }
                                });
                            } else {
                                // Swapping 1 a 1 tradicional (Cinematic Exit)
                                fromEl.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                                fromEl.style.opacity = '0';
                                fromEl.style.filter = 'blur(20px)';
                                fromEl.style.pointerEvents = 'none';
                                fromEl.style.transform = 'scale(0.8) translateZ(-1000px)';
                                setTimeout(() => fromEl.style.display = 'none', 1000);
                            }
                        }
                    }

                    toEl.style.display = 'flex';

                    // Cinematic Entrance
                    toEl.style.filter = 'blur(40px)';
                    toEl.style.transform = 'scale(1.2) translateZ(1000px)';
                    toEl.style.opacity = '0';

                    setTimeout(() => {
                        toEl.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
                        toEl.style.opacity = '1';
                        toEl.style.filter = 'blur(0px)';
                        toEl.style.pointerEvents = 'auto';
                        toEl.style.transform = 'translateY(0) rotateX(0) scale(1) translateZ(0)';
                    }, 50);
                    return;
                }

                const targetEl = action.target ? document.querySelector(`[data-path="${action.target}"]`) : el;
                if (!targetEl) return;

                if (action.estilos) {
                    for (const prop in action.estilos) {
                        targetEl.style.setProperty(prop, action.estilos[prop]);
                    }
                }

                if (action.texto) {
                    targetEl.innerHTML = action.texto;
                }
            });
        });
    }
}

function initInstances(el, config, profundidad, pathPrefix) {
    const count = config.cantidad || 1;
    const template = config.plantilla;
    if (!template) return;

    for (let i = 0; i < count; i++) {
        const instanceConfig = JSON.parse(JSON.stringify(template));

        // Aplicar variaciones si existen (ej: dispersión aleatoria)
        if (config.variacion) {
            for (const prop in config.variacion) {
                const v = config.variacion[prop];
                if (typeof v === 'number') {
                    const current = parseFloat(instanceConfig[prop] || 0);
                    instanceConfig[prop] = (current + (Math.random() - 0.5) * v) + (prop.includes('width') || prop.includes('height') || prop.includes('padding') ? 'px' : '');
                }
            }
        }

        construir(instanceConfig, el, profundidad, `${pathPrefix}.instancia_${i}`);
    }
}

function initLookAt(el, config) {
    const factor = config.intensidad || 20;
    const smooth = config.suavizado || 0.1;
    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;

    window.addEventListener('mousemove', (e) => {
        targetRY = ((e.clientX / window.innerWidth) - 0.5) * factor;
        targetRX = -((e.clientY / window.innerHeight) - 0.5) * factor;
    });

    function animate() {
        if (!el.isConnected) return;
        currentRX += (targetRX - currentRX) * smooth;
        currentRY += (targetRY - currentRY) * smooth;
        el.style.setProperty('--dyn-look-at', `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`);
        requestAnimationFrame(animate);
    }
    animate();
}

function initAutoAnimate(el, config) {
    const type = config.tipo || 'flotar';
    const duration = config.duracion || 3;
    const intensity = config.intensidad || 10;

    function cycle() {
        if (!el.isConnected) return;
        let transform = '';
        if (type === 'flotar') {
            const y = Math.sin(Date.now() / (duration * 200)) * intensity;
            transform = `translate3d(0, ${y}px, 0)`;
        } else if (type === 'latir') {
            const s = 1 + Math.sin(Date.now() / (duration * 200)) * (intensity / 100);
            transform = `scale(${s})`;
        } else if (type === 'girar') {
            const r = (Date.now() / (duration * 10)) % 360;
            transform = `rotateZ(${r}deg)`;
        }
        el.style.setProperty('--dyn-auto-animate', transform);
        requestAnimationFrame(cycle);
    }
    cycle();
}

function initParallax(el, config) {
    const factor = config.factor || 0.2;
    const direccion = config.direccion || 'vertical';

    window.addEventListener('scroll', () => {
        if (!el.isConnected) return;
        const scroll = window.scrollY;
        const offset = scroll * factor;
        const transform = direccion === 'vertical' ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;
        el.style.setProperty('--dyn-parallax', transform);
    }, { passive: true });
}

function initTypewriter(el, config) {
    const fullText = el.innerHTML;
    const speed = config.velocidad || 50;
    const delay = config.retraso || 0;
    const loop = config.bucle || false;

    el.innerHTML = '';

    function start() {
        if (!el.isConnected) return;
        let i = 0;
        el.innerHTML = '';

        const timer = setInterval(() => {
            if (!el.isConnected) { clearInterval(timer); return; }
            if (i < fullText.length) {
                if (fullText[i] === '<') {
                    const end = fullText.indexOf('>', i);
                    el.innerHTML += fullText.substring(i, end + 1);
                    i = end + 1;
                } else {
                    el.innerHTML += fullText[i];
                    i++;
                }
            } else {
                clearInterval(timer);
                if (loop) setTimeout(start, 2000);
            }
        }, speed);
    }

    setTimeout(start, delay);
}

function initMagnetic(el, config) {
    const force = config.fuerza || 0.5;
    const radius = config.radio || 200;
    const smooth = config.suavizado || 0.2;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
        if (!el.isConnected) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < radius) {
            targetX = dx * force;
            targetY = dy * force;
        } else {
            targetX = 0;
            targetY = 0;
        }
    });

    function animate() {
        if (!el.isConnected) return;
        currentX += (targetX - currentX) * smooth;
        currentY += (targetY - currentY) * smooth;
        el.style.setProperty('--dyn-magnetic', `translate3d(${currentX}px, ${currentY}px, 0)`);
        requestAnimationFrame(animate);
    }
    animate();
}

function initScrollSystem(el, scrollDir) {
    const dir = scrollDir.direccion || 'horizontal';
    let offsetX = 0, offsetY = 0;
    let dragging = false;
    let startX = 0, startY = 0;
    let startOffsetX = 0, startOffsetY = 0;
    const useX = (dir === 'horizontal' || dir === 'ambos');
    const useY = (dir === 'vertical' || dir === 'ambos');
    let hoveredChild = null;
    const fadeZone = (scrollDir.fade !== undefined) ? scrollDir.fade : 0.15;
    const fadeInicio = (scrollDir['fade-inicio'] !== undefined) ? scrollDir['fade-inicio'] : 0;
    const fadeMin = (scrollDir['fade-min'] !== undefined) ? scrollDir['fade-min'] : 0.3;

    el.style.cursor = 'grab';
    el.style.userSelect = 'none';

    function getMaxX() {
        let total = 0;
        const gap = parseFloat(getComputedStyle(el).gap) || 0;
        for (let i = 0; i < el.children.length; i++) {
            total += el.children[i].offsetWidth;
            if (i < el.children.length - 1) total += gap;
        }
        return Math.max(0, total - el.clientWidth);
    }

    function getMaxY() {
        let total = 0;
        const gap = parseFloat(getComputedStyle(el).gap) || 0;
        for (let i = 0; i < el.children.length; i++) {
            total += el.children[i].offsetHeight;
            if (i < el.children.length - 1) total += gap;
        }
        return Math.max(0, total - el.clientHeight);
    }

    function clamp() {
        if (useX) {
            const mx = getMaxX();
            if (offsetX < -mx) offsetX = -mx;
            if (offsetX > 0) offsetX = 0;
        }
        if (useY) {
            const my = getMaxY();
            if (offsetY < -my) offsetY = -my;
            if (offsetY > 0) offsetY = 0;
        }
    }

    function applyScroll() {
        for (let i = 0; i < el.children.length; i++) {
            el.children[i].style.position = 'relative';
            if (useX) el.children[i].style.left = offsetX + 'px';
            if (useY) el.children[i].style.top = offsetY + 'px';
        }
        applyFade();
    }

    function applyFade() {
        const containerW = el.clientWidth;
        const containerH = el.clientHeight;
        const atLeftLimit = (offsetX >= 0);
        const atRightLimit = (offsetX <= -getMaxX());
        const atTopLimit = (offsetY >= 0);
        const atBottomLimit = (offsetY <= -getMaxY());

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];
            if (child === hoveredChild) { child.style.opacity = '1'; continue; }

            let opacity = 1;

            if (useX && fadeZone > 0) {
                const childLeft = child.offsetLeft + offsetX;
                const childRight = childLeft + child.offsetWidth;
                const zoneW = containerW * fadeZone;
                const fadeStartR = containerW * (1 - fadeInicio);
                const fadeStartL = containerW * fadeInicio;

                if (!atRightLimit && childLeft > fadeStartR) {
                    opacity = Math.min(opacity, Math.max(0, 1 - (childLeft - fadeStartR) / zoneW));
                }
                if (!atLeftLimit && childRight < fadeStartL) {
                    opacity = Math.min(opacity, Math.max(0, childRight / zoneW));
                }
            }

            if (useY && fadeZone > 0) {
                const childTop = child.offsetTop + offsetY;
                const childBottom = childTop + child.offsetHeight;
                const zoneH = containerH * fadeZone;
                const fadeStartB = containerH * (1 - fadeInicio);
                const fadeStartT = containerH * fadeInicio;

                if (!atBottomLimit && childTop > fadeStartB) {
                    opacity = Math.min(opacity, Math.max(0, 1 - (childTop - fadeStartB) / zoneH));
                }
                if (!atTopLimit && childBottom < fadeStartT) {
                    opacity = Math.min(opacity, Math.max(0, childBottom / zoneH));
                }
            }

            child.style.opacity = Math.max(fadeMin, opacity);
            child.style.transition = 'opacity 0.2s ease';
        }
    }

    // Track hover per child for fade override
    for (let c = 0; c < el.children.length; c++) {
        ((child) => {
            child.addEventListener('mouseenter', () => { hoveredChild = child; applyFade(); });
            child.addEventListener('mouseleave', () => { hoveredChild = null; applyFade(); });
        })(el.children[c]);
    }

    // Mouse drag
    el.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        startOffsetX = offsetX; startOffsetY = offsetY;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        if (useX) offsetX = startOffsetX + (e.clientX - startX);
        if (useY) offsetY = startOffsetY + (e.clientY - startY);
        clamp();
        applyScroll();
    });
    window.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; el.style.cursor = 'grab'; }
    });

    // Touch drag
    el.addEventListener('touchstart', (e) => {
        dragging = true;
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        startOffsetX = offsetX; startOffsetY = offsetY;
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        if (useX) offsetX = startOffsetX + (e.touches[0].clientX - startX);
        if (useY) offsetY = startOffsetY + (e.touches[0].clientY - startY);
        clamp();
        applyScroll();
    }, { passive: true });
    el.addEventListener('touchend', () => { dragging = false; });

    // Wheel
    el.addEventListener('wheel', (e) => {
        const prevX = offsetX, prevY = offsetY;
        let captured = false;

        if (useX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            offsetX -= e.deltaX;
            clamp();
            if (offsetX !== prevX) captured = true;
        }

        if (useY && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
            offsetY -= e.deltaY;
            clamp();
            if (offsetY !== prevY) captured = true;
        }

        if (captured) {
            applyScroll();
            e.preventDefault();
        }
    }, { passive: false });

    // Initial calculation
    // Timeout needed to allow DOM to render and calculate sizes
    setTimeout(applyFade, 0);
}

function initSiblingHover(hijos, hijosConHoverH, el) {
    hijosConHoverH.forEach(hijo => {
        if(!hijo || !hijo.el) return;
        hijo.el.addEventListener('mouseenter', () => {
            if (hijo.hoverData) {
                hijo._originals = {};
                for (let p in hijo.hoverData) {
                    hijo._originals[p] = hijo.el.style.getPropertyValue(p);
                    hijo.el.style.setProperty(p, hijo.hoverData[p]);
                }
            }
            hijos.forEach(hermano => {
                if (!hermano || hermano === hijo || !hermano.el) return;
                hermano._hOriginals = {};
                for (let p in hijo.hoverHermanos) {
                    hermano._hOriginals[p] = hermano.el.style.getPropertyValue(p);
                    hermano.el.style.setProperty(p, hijo.hoverHermanos[p]);
                }
            });
        });

        hijo.el.addEventListener('mouseleave', () => {
            if (hijo._originals) {
                for (let p in hijo._originals) {
                    hijo.el.style.setProperty(p, hijo._originals[p]);
                }
                hijo._originals = null;
            }
            hijos.forEach(hermano => {
                if (!hermano || hermano === hijo || !hermano._hOriginals || !hermano.el) return;
                for (let p in hermano._hOriginals) {
                    hermano.el.style.setProperty(p, hermano._hOriginals[p]);
                }
                hermano._hOriginals = null;
            });
        });
    });
}

function initSelfHover(el, hoverData, hijosConHoverH) {
    const hasSiblingWiring = hijosConHoverH.some(h => h.el === el);
    if (!hasSiblingWiring) {
        const originalStyles = {};
        el.addEventListener('mouseenter', () => {
            for (let p in hoverData) {
                originalStyles[p] = el.style.getPropertyValue(p);
                el.style.setProperty(p, hoverData[p]);
            }
        });
        el.addEventListener('mouseleave', () => {
            for (let p in originalStyles) {
                el.style.setProperty(p, originalStyles[p]);
            }
        });
    }
}

function initClickState(el, clickData) {
    el.style.cursor = 'pointer';
    let clicked = false;
    const clickOriginal = {};
    el.addEventListener('click', () => {
        clicked = !clicked;
        if (clicked) {
            for (let p in clickData) {
                clickOriginal[p] = el.style.getPropertyValue(p);
                el.style.setProperty(p, clickData[p]);
            }
        } else {
            for (let p in clickOriginal) {
                el.style.setProperty(p, clickOriginal[p]);
            }
        }
    });
}

// Start Engine
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
