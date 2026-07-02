(function () {

    if (typeof THREE === 'undefined') return;
    var canvas = document.getElementById('hero-canvas');
    var heroEl = document.getElementById('hero');
    if (!canvas || !heroEl) return;

    var vertex = [
        'varying vec2 vUv;',
        'void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
    ].join('\n');

    var noise = [
        'vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}',
        'vec2 mod289(vec2 x){return x - floor(x * (1.0/289.0)) * 289.0;}',
        'vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
        'float snoise(vec2 v){',
        '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);',
        '  vec2 i  = floor(v + dot(v, C.yy));',
        '  vec2 x0 = v - i + dot(i, C.xx);',
        '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
        '  vec4 x12 = x0.xyxy + C.xxzz;',
        '  x12.xy -= i1;',
        '  i = mod289(i);',
        '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
        '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
        '  m = m*m; m = m*m;',
        '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
        '  vec3 h = abs(x) - 0.5;',
        '  vec3 ox = floor(x + 0.5);',
        '  vec3 a0 = x - ox;',
        '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
        '  vec3 g;',
        '  g.x  = a0.x  * x0.x  + h.x  * x0.y;',
        '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
        '  return 130.0 * dot(m, g);',
        '}'
    ].join('\n');

    var fragMobile = [
        'uniform float uTime; uniform vec2 uMouse; uniform vec2 uResolution;',
        'varying vec2 vUv;', noise,
        'void main() {',
        '  vec2 ratio = vec2(uResolution.x / uResolution.y, 1.0);',
        '  vec2 p = (vUv - 0.5) * ratio;',
        '  float n1 = snoise(p * 1.6 + vec2(uTime * 0.05, uTime * 0.03));',
        '  float n2 = snoise(p * 2.4 - vec2(uTime * 0.04, -uTime * 0.06) + uMouse * 0.5);',
        '  float blend = smoothstep(-0.3, 0.6, n1 * 0.6 + n2 * 0.4);',
        '  vec3 color = mix(vec3(0.02), vec3(0.0, 0.784, 0.588), blend * 0.55);',
        '  gl_FragColor = vec4(color, 1.0);',
        '}'
    ].join('\n');

    var fragDesktop = [
        'uniform float uTime; uniform vec2 uMouse; uniform vec2 uMouseVel; uniform vec2 uResolution;',
        'varying vec2 vUv;', noise,
        'void main() {',
        '  vec2 ratio = vec2(uResolution.x / uResolution.y, 1.0);',
        '  vec2 p = (vUv - 0.5) * ratio;',
        '  float distToMouse = length(p - uMouse);',
        '  float influence = smoothstep(0.7, 0.0, distToMouse);',
        '  vec2 pWarped = p - uMouseVel * influence * 3.0;',
        '  float n1 = snoise(pWarped * 1.6 + vec2(uTime * 0.05, uTime * 0.03));',
        '  float n2 = snoise(pWarped * 2.4 - vec2(uTime * 0.04, -uTime * 0.06));',
        '  float blend = smoothstep(-0.3, 0.6, n1 * 0.6 + n2 * 0.4);',
        '  vec3 color = mix(vec3(0.02), vec3(0.0, 0.784, 0.588), blend * 0.55);',
        '  gl_FragColor = vec4(color, 1.0);',
        '}'
    ].join('\n');

    var isDesktop = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

    var uniforms = {
        uTime:      { value: 0 },
        uResolution:{ value: new THREE.Vector2(1, 1) },
        uMouse:     { value: new THREE.Vector2(0, 0) },
        uMouseVel:  { value: new THREE.Vector2(0, 0) }
    };

    var scene    = new THREE.Scene();
    var camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertex,
        fragmentShader: isDesktop ? fragDesktop : fragMobile
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    function resize() {
        renderer.setSize(heroEl.clientWidth, heroEl.clientHeight);
        uniforms.uResolution.value.set(heroEl.clientWidth, heroEl.clientHeight);
    }
    resize();
    window.addEventListener('resize', resize);

    var target = new THREE.Vector2(0, 0);
    var smooth = new THREE.Vector2(0, 0);
    var prev   = new THREE.Vector2(0, 0);
    var vel    = new THREE.Vector2(0, 0);

    heroEl.addEventListener('mousemove', function (e) {
        var r = heroEl.getBoundingClientRect();
        var rx = uniforms.uResolution.value.x / uniforms.uResolution.value.y;
        target.set(
            ((e.clientX - r.left) / r.width - 0.5) * rx,
            -((e.clientY - r.top) / r.height - 0.5)
        );
        if (!isDesktop) uniforms.uMouse.value.set(
            (e.clientX - r.left) / r.width - 0.5,
            -((e.clientY - r.top) / r.height - 0.5)
        );
    });

    var clock = new THREE.Clock();

    (function animate() {
        requestAnimationFrame(animate);
        uniforms.uTime.value = clock.getElapsedTime();

        if (isDesktop) {
            smooth.x += (target.x - smooth.x) * 0.05;
            smooth.y += (target.y - smooth.y) * 0.05;
            var rawVx = (smooth.x - prev.x) * 14;
            var rawVy = (smooth.y - prev.y) * 14;
            prev.copy(smooth);
            vel.x += (rawVx - vel.x) * 0.15;
            vel.y += (rawVy - vel.y) * 0.15;
            uniforms.uMouse.value.copy(smooth);
            uniforms.uMouseVel.value.copy(vel);
        }

        renderer.render(scene, camera);
    })();

})();
