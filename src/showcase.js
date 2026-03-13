console.log("SHOWCASE.JS LOADED");
/* V4 — Generic Container Engine for Impulsa */
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

window.get_json_v4_por_path = (path) => {
    if (!currentContent || !path) return null;
    const cleanPath = path.replace(/:ins\[\d+\]/g, '');
    const keys = cleanPath.split('.').flatMap(k => k.split(/[\[\]]/)).filter(Boolean);
    let result = currentContent;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else { return null; }
    }
    return result;
};

window.get_json_v4_por_path_jerarquico = (path) => {
    if (!currentContent || !path) return null;
    const cleanPath = path.replace(/:ins\[\d+\]/g, '');
    const keys = cleanPath.split('.').flatMap(k => k.split(/[\[\]]/)).filter(Boolean);

    const cloneNodeProperties = (node) => {
        const clone = {};
        for (const key in node) {
            const val = node[key];
            if (typeof val !== 'object' || val === null || RESERVED[key]) {
                clone[key] = val;
            }
        }
        return clone;
    };

    let fullHierarchy = {};
    let currentTarget = fullHierarchy;
    let currentDataSource = currentContent;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!currentDataSource || !currentDataSource[key]) return null;
        const isLast = (i === keys.length - 1);

        if (isLast) {
            currentTarget[key] = JSON.parse(JSON.stringify(currentDataSource[key]));
        } else {
            currentTarget[key] = cloneNodeProperties(currentDataSource[key]);
            currentTarget = currentTarget[key];
            currentDataSource = currentDataSource[key];
        }
    }
    return fullHierarchy;
};

window.get_v4_current_content = () => currentContent;

window.inyectar_cambios_v4 = (input) => {
    let partial = null;
    let replace = false;
    if (input.args && input.args.partial) {
        partial = input.args.partial;
        replace = !!input.args.replace;
    } else if (input.partial) {
        partial = input.partial;
        replace = !!input.replace;
    } else {
        partial = input;
    }
    if (partial && typeof partial === 'object') {
        window.postMessage({ type: 'inject-partial', partial, replace }, '*');
    }
};

export async function init() {
    try {
        console.log("V4 Engine: Initializing...");
        const res = await fetch('./src/content.json');
        const data = await res.json();
        currentContent = data;
        const app = document.getElementById('app');
        if (!app) {
            console.error("V4 Engine Error: #app element not found");
            return;
        }

        console.log("V4 Engine: Data loaded, building DOM...");
        app.innerHTML = '';
        construir(currentContent, app, 0);
        console.log("V4 Engine: Build complete.");

        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'inject-partial') {
                if (e.data.replace) {
                    currentContent = e.data.partial;
                } else {
                    deepMerge(currentContent, e.data.partial);
                }
                app.innerHTML = '';
                construir(currentContent, app, 0);
            }
        });
    } catch (e) {
        console.error("V4 Engine Error:", e);
    }
}

export function construir(config, parent, profundidad, pathPrefix = '') {
    if (!config) return;
    if (Array.isArray(config)) {
         config.forEach((c, idx) => construir(c, parent, profundidad, `${pathPrefix}[${idx}]`));
         return;
    }

    const el = document.createElement('div');
    el.style.zIndex = profundidad;
    el.style.transformStyle = 'preserve-3d';
    if (pathPrefix) el.dataset.path = pathPrefix;

    let hoverData = null;
    let hoverHermanosData = null;
    let clickData = null;
    let scrollDir = null;
    const hijos = [];

    for (const key in config) {
        const val = config[key];

        if (key === 'nombre') { el.dataset.nombre = val; continue; }
        if (key === 'texto') { el.innerHTML = val; continue; }
        if (key === 'hover') { hoverData = val; continue; }
        if (key === 'hover-hermanos') { hoverHermanosData = val; continue; }
        if (key === 'click') { clickData = val; continue; }
        if (key === 'scroll') { scrollDir = val; continue; }

        if (typeof val === 'object' && val !== null && !Array.isArray(val) && !RESERVED[key]) {
            const childPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const hijo = construir(val, el, profundidad + 1, childPath);
            if (hijo) hijos.push(hijo);
            continue;
        }

        if (Array.isArray(val) && !RESERVED[key]) {
             val.forEach((item, index) => {
                  const childPath = pathPrefix ? `${pathPrefix}.${key}[${index}]` : `${key}[${index}]`;
                  const hijo = construir(item, el, profundidad + 1, childPath);
                  if (hijo) hijos.push(hijo);
             });
             continue;
        }

        if (key === 'transform') {
            el.style.setProperty('--base-transform', val);
        } else if (!RESERVED[key]) {
            el.style.setProperty(key, val);
        }
    }

    el.style.transform = `
        var(--base-transform, translate3d(0,0,0))
        var(--dyn-mouse-follow, translate3d(0,0,0))
        var(--dyn-look-at, rotateX(0deg) rotateY(0deg))
        var(--dyn-tilt, rotateX(0deg) rotateY(0deg))
        var(--dyn-parallax, translate3d(0,0,0))
        var(--dyn-magnetic, translate3d(0,0,0))
        var(--dyn-auto-animate, translate3d(0,0,0) rotate(0deg) scale(1))
    `.trim();


    if (scrollDir) initScrollSystem(el, scrollDir);
    const hijosConHoverH = hijos.filter(h => h && h.hoverHermanos);
    if (hijosConHoverH.length > 0) initSiblingHover(hijos, hijosConHoverH, el);
    if (hoverData && !hoverHermanosData) initSelfHover(el, hoverData, hijosConHoverH);
    if (clickData) initClickState(el, clickData);
    if (config['seguir-mouse']) initFollowMouse(el, config['seguir-mouse']);
    if (config['tilt']) initTilt(el, config['tilt']);
    if (config['acciones']) initActions(el, config['acciones']);
    if (config['instancias']) initInstances(el, config['instancias'], profundidad + 1, pathPrefix);
    if (config['look-at']) initLookAt(el, config['look-at']);
    if (config['auto-animar']) initAutoAnimate(el, config['auto-animar']);
    if (config['paralaje']) initParallax(el, config['paralaje']);
    if (config['escribir']) initTypewriter(el, config['escribir']);
    if (config['magnetico']) initMagnetic(el, config['magnetico']);
    if (config['audio']) initAudio(el, config['audio']);

    parent.appendChild(el);
    return { el, hoverData, hoverHermanos: hoverHermanosData };
}

// --- INTERACCIONES ---

function initFollowMouse(el, config) {
    const f = config.factor || 0.1, s = config.suavizado || 0.1;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
        tx = (e.clientX - window.innerWidth / 2) * f;
        ty = (e.clientY - window.innerHeight / 2) * f;
    });
    const animate = () => {
        if (!el.isConnected) return;
        cx += (tx - cx) * s; cy += (ty - cy) * s;
        el.style.setProperty('--dyn-mouse-follow', `translate3d(${cx}px, ${cy}px, 0)`);
        requestAnimationFrame(animate);
    };
    animate();
}

function initAudio(el, config) {
    const sound = new Audio(config.url);
    sound.volume = config.volumen || 0.5;
    el.addEventListener(config.evento || 'click', () => {
        sound.currentTime = 0;
        sound.play().catch(()=>{});
    });
}

function initTilt(el, config) {
    const max = config.max || 15;
    if (el.parentElement) el.parentElement.style.perspective = `${config.perspectiva || 1500}px`;
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const rx = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -max;
        const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * max;
        el.style.setProperty('--dyn-tilt', `rotateX(${rx}deg) rotateY(${ry}deg)`);
    });
    el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s ease';
        el.style.setProperty('--dyn-tilt', 'rotateX(0deg) rotateY(0deg)');
        setTimeout(() => el.style.transition = '', 500);
    });
}

function initActions(el, config) {
    for (const ev in config) {
        const list = Array.isArray(config[ev]) ? config[ev] : [config[ev]];
        el.addEventListener(ev, () => {
            list.forEach(a => {
                if (a.tipo === 'navegacion' && a.hacia) {
                    const to = document.querySelector(`[data-path="${a.hacia}"]`);
                    const from = a.desde ? document.querySelector(`[data-path="${a.desde}"]`) : null;
                    if (!to) return;

                    if (from) {
                        from.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                        from.style.opacity = '0';
                        from.style.filter = 'blur(40px)';
                        from.style.transform = 'scale(0.8) translateZ(-1000px)';
                        setTimeout(() => from.style.display = 'none', 1000);
                    }

                    to.style.display = 'flex';
                    to.style.position = 'absolute';
                    to.style.top = '0';
                    to.style.left = '0';
                    to.style.width = '100vw';
                    to.style.height = '100vh';
                    to.style.opacity = '0';
                    to.style.filter = 'blur(40px)';
                    to.style.transform = 'translate3d(0,0,1000px) scale(1.2)';

                    setTimeout(() => {
                        to.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
                        to.style.opacity = '1';
                        to.style.filter = 'blur(0px)';
                        to.style.transform = 'translate3d(0,0,0) scale(1)';
                    }, 50);
                    return;
                }
                const target = a.target ? document.querySelector(`[data-path="${a.target}"]`) : el;
                if (!target) return;
                if (a.estilos) {
                    for (const p in a.estilos) {
                        target.style.setProperty(p, a.estilos[p]);
                    }
                }
                if (a.texto) target.innerHTML = a.texto;
            });
        });
    }
}

function initInstances(el, config, prof, path) {
    for (let i = 0; i < (config.cantidad || 1); i++) {
        const cfg = JSON.parse(JSON.stringify(config.plantilla));
        if (config.variacion) {
            for (const p in config.variacion) {
                const v = config.variacion[p];
                if (typeof v === 'number') {
                    const cur = parseFloat(cfg[p] || 0);
                    cfg[p] = (cur + (Math.random() - 0.5) * v) + (p.includes('width') || p.includes('height') ? 'px' : '');
                }
            }
        }
        construir(cfg, el, prof, `${path}:ins[${i}]`);
    }
}

function initLookAt(el, config) {
    const f = config.intensidad || 20, s = config.suavizado || 0.1;
    let trx = 0, tryy = 0, crx = 0, cry = 0;
    window.addEventListener('mousemove', (e) => {
        tryy = ((e.clientX / window.innerWidth) - 0.5) * f;
        trx = -((e.clientY / window.innerHeight) - 0.5) * f;
    });
    const animate = () => {
        if (!el.isConnected) return;
        crx += (trx - crx) * s; cry += (tryy - cry) * s;
        el.style.setProperty('--dyn-look-at', `rotateX(${crx}deg) rotateY(${cry}deg)`);
        requestAnimationFrame(animate);
    };
    animate();
}

function initAutoAnimate(el, config) {
    const animate = () => {
        if (!el.isConnected) return;
        const d = config.duracion || 3, i = config.intensidad || 10;
        let t = '';
        if (config.tipo === 'flotar') t = `translate3d(0, ${Math.sin(Date.now() / (d * 200)) * i}px, 0)`;
        else if (config.tipo === 'latir') t = `scale(${1 + Math.sin(Date.now() / (d * 200)) * (i / 100)})`;
        else if (config.tipo === 'girar') t = `rotateZ(${(Date.now() / (d * 10)) % 360}deg)`;
        el.style.setProperty('--dyn-auto-animate', t);
        requestAnimationFrame(animate);
    };
    animate();
}

function initParallax(el, config) {
    window.addEventListener('scroll', () => {
        if (!el.isConnected) return;
        const o = window.scrollY * (config.factor || 0.2);
        el.style.setProperty('--dyn-parallax', config.direccion === 'horizontal' ? `translate3d(${o}px,0,0)` : `translate3d(0,${o}px,0)`);
    }, { passive: true });
}

function initTypewriter(el, config) {
    const txt = el.innerHTML; el.innerHTML = '';
    const start = () => {
        let i = 0;
        const tm = setInterval(() => {
            if (!el.isConnected) { clearInterval(tm); return; }
            if (i < txt.length) {
                if (txt[i] === '<') {
                    const e = txt.indexOf('>', i);
                    el.innerHTML += txt.substring(i, e + 1);
                    i = e + 1;
                } else {
                    el.innerHTML += txt[i];
                    i++;
                }
            } else {
                clearInterval(tm);
                if (config.bucle) setTimeout(start, 2000);
            }
        }, config.velocidad || 50);
    };
    setTimeout(start, config.retraso || 0);
}

function initMagnetic(el, config) {
    const f = config.fuerza || 0.5, r = config.radio || 200, s = config.suavizado || 0.2;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
        if (!el.isConnected) return;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2), dy = e.clientY - (rect.top + rect.height / 2);
        if (Math.sqrt(dx * dx + dy * dy) < r) { tx = dx * f; ty = dy * f; } else { tx = 0; ty = 0; }
    });
    const animate = () => {
        if (!el.isConnected) return;
        cx += (tx - cx) * s; cy += (ty - cy) * s;
        el.style.setProperty('--dyn-magnetic', `translate3d(${cx}px, ${cy}px, 0)`);
        requestAnimationFrame(animate);
    };
    animate();
}

function initScrollSystem(el, cfg) {
    let ox = 0, oy = 0, dr = false, sx, sy, sox, soy;
    const ux = cfg.direccion !== 'vertical', uy = cfg.direccion !== 'horizontal';
    el.style.cursor = 'grab';
    const getMx = () => Math.max(0, Array.from(el.children).reduce((a, c) => a + c.offsetWidth, 0) - el.clientWidth);
    const getMy = () => Math.max(0, Array.from(el.children).reduce((a, c) => a + c.offsetHeight, 0) - el.clientHeight);
    const apply = () => {
        const mx = getMx(), my = getMy();
        ox = Math.min(0, Math.max(-mx, ox)); oy = Math.min(0, Math.max(-my, oy));
        Array.from(el.children).forEach(c => {
            c.style.position = 'relative';
            if (ux) c.style.left = ox + 'px'; if (uy) c.style.top = oy + 'px';
        });
    };
    el.onmousedown = (e) => { dr = true; sx = e.clientX; sy = e.clientY; sox = ox; soy = oy; el.style.cursor = 'grabbing'; e.preventDefault(); };
    window.onmousemove = (e) => { if (!dr) return; if (ux) ox = sox + (e.clientX - sx); if (uy) oy = soy + (e.clientY - sy); apply(); };
    window.onmouseup = () => { dr = false; el.style.cursor = 'grab'; };
    el.onwheel = (e) => { if (ux) ox -= e.deltaX; if (uy) oy -= e.deltaY; apply(); e.preventDefault(); };
    setTimeout(apply, 0);
}

function initSiblingHover(hijos, hch, el) {
    hch.forEach(h => {
        h.el.onmouseenter = () => {
            if (h.hoverData) { h.orig = {}; for (const p in h.hoverData) { h.orig[p] = h.el.style.getPropertyValue(p); h.el.style.setProperty(p, h.hoverData[p]); } }
            hijos.forEach(hr => { if (hr !== h) { hr.horig = {}; for (const p in h.hoverHermanos) { hr.horig[p] = hr.el.style.getPropertyValue(p); hr.el.style.setProperty(p, h.hoverHermanos[p]); } } });
        };
        h.el.onmouseleave = () => {
            if (h.orig) { for (const p in h.orig) h.el.style.setProperty(p, h.orig[p]); h.orig = null; }
            hijos.forEach(hr => { if (hr.horig) { for (const p in hr.horig) hr.el.style.setProperty(p, hr.horig[p]); hr.horig = null; } });
        };
    });
}

function initSelfHover(el, data, hch) {
    if (hch.some(h => h.el === el)) return;
    const orig = {};
    el.onmouseenter = () => { for (const p in data) { orig[p] = el.style.getPropertyValue(p); el.style.setProperty(p, data[p]); } };
    el.onmouseleave = () => { for (const p in orig) el.style.setProperty(p, orig[p]); };
}

function initClickState(el, data) {
    let cl = false; const orig = {};
    el.onclick = () => {
        cl = !cl;
        if (cl) for (const p in data) { orig[p] = el.style.getPropertyValue(p); el.style.setProperty(p, data[p]); }
        else for (const p in orig) el.style.setProperty(p, orig[p]);
    };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
