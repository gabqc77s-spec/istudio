/* V4 — Generic Container Engine for Impulsa */
/* Reads content.json, builds containers, applies CSS properties directly. */
/* Optimized for CSS 3D Space and pure data-driven DOM rendering. */

const RESERVED = { nombre: true, hover: true, 'hover-hermanos': true, click: true, scroll: true, texto: true };

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

        // Check if we are running inside an iframe (Editor Mode)
        const isEditorMode = window.self !== window.top;

        if (isEditorMode) {
            // Global click interceptor for direct selection in the 3D Canvas
            document.body.addEventListener('click', (e) => {
                // Ignore clicks on links or elements with 'ignore-editor' class
                if (e.target.closest('a') || e.target.closest('.ignore-editor')) return;

                // Find the nearest generated container that has a dataset.path
                const targetNode = e.target.closest('[data-path]');
                if (targetNode) {
                    // Prevent normal click actions (like accordions or links) while in pure edit selection mode
                    // Only prevent if we actually holding shift or clicking to select. For now, default click selects.
                    e.preventDefault();
                    e.stopPropagation();

                    // Send path to parent editor
                    window.parent.postMessage({
                        type: 'select-node',
                        path: targetNode.dataset.path
                    }, '*');

                    // Visual Feedback in Canvas
                    document.querySelectorAll('[data-path]').forEach(el => el.style.outline = '');
                    targetNode.style.outline = '2px dashed #a855f7';
                    targetNode.style.outlineOffset = '2px';
                }
            }, true); // Use capture phase to intercept before component logic
        }

        // Listen for live updates from editor.html
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'update-content') {
                currentContent = e.data.content;
                app.innerHTML = '';
                // Pass empty string as initial path
                construir(currentContent, app, 0, '');

                // Re-apply highlight if a node is selected
                if (isEditorMode && e.data.selectedPath) {
                    setTimeout(() => {
                        const selectedNode = document.querySelector(`[data-path="${e.data.selectedPath}"]`);
                        if (selectedNode) {
                            selectedNode.style.outline = '2px dashed #a855f7';
                            selectedNode.style.outlineOffset = '2px';
                        }
                    }, 50);
                }
            }

            if (e.data && e.data.type === 'inject-partial') {
                deepMerge(currentContent, e.data.partial);
                app.innerHTML = '';
                construir(currentContent, app, 0, '');
            }
        });

        // --- API de Captura y Navegación ---
        window.get_json_v4_por_path = (path) => {
            if (!currentContent || !path) return null;

            // Convertir path de string (ej: "pagina_principal.seccion_hero") a array de llaves
            // Maneja también arrays si existieran: pagina.lista[0] -> ["pagina", "lista", "0"]
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
        el.style.setProperty(key, val);
    }

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

    parent.appendChild(el);
    return { el, hoverData, hoverHermanos: hoverHermanosData };
}


// ======= LOGICA DE INTERACCION DEL MOTOR =======

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
document.addEventListener('DOMContentLoaded', init);
