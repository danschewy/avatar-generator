import { useRafInterval, useSize } from "ahooks";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function BgGoo({
  speed,
  resolution,
  depth,
  seed = 0,
  still = false,
  size,
}) {
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef);
  return (
    <motion.div
      ref={wrapRef}
      id="goo-wrap"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: still ? 0 : 3 }}
      className="h-full w-full"
    >
      {true && (
        <Goo
          speed={speed}
          seed={seed}
          resolution={resolution}
          depth={depth}
          size={size}
          inView={inView}
          still={still}
        />
      )}
    </motion.div>
  );
}

function Goo({ inView, size, speed, resolution, depth, seed, still }) {
  const mousePosRef = useRef({ x: 0, y: 0 });
  const startRef = useRef(performance.now());
  const canvasRef = useRef(null);
  const glRef = useRef(null);

  const shaderProgramRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const vertexShaderSource = `
	attribute vec2 position;
	void main() {
			gl_Position = vec4(position, 0.0, 1.0);
	}
`;

  const fragmentShaderSource = `
	precision mediump float;
	uniform vec2 iResolution;
	uniform float iTime;
	uniform vec2 iMouse;
	float speed = ${speed};

	vec3 color1 = vec3(235.0/255.0, 231.0/255.0, 92.0/255.0);
	vec3 color2 = vec3(223.0/255.0, 72.0/255.0, 67.0/255.0);
	vec3 color3 = vec3(235.0/255.0, 64.0/255.0, 240.0/255.0);

	vec2 effect(vec2 p, float i, float time) {
		vec2 mouse = iMouse;
  	return vec2(sin(p.x * i + time) * cos(p.y * i + time), sin(length(p.x)) * cos(length(p.y)));
	}

	void main() {
			vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / max(iResolution.x, iResolution.y);
      p.x += ${seed.toFixed(
        1
      )}; // Use the seed prop to offset the starting position of the goo effect
      p.y += ${seed.toFixed(1)};

			p *= ${resolution.toFixed(1)};
			for (int i = 1; i < ${depth}; i++) {
					float fi = float(i);
					p += effect(p, fi, iTime * speed);
			}
			vec3 col = mix(mix(color1, color2, 1.0-sin(p.x)), color3, cos(p.y+p.x));
			gl_FragColor = vec4(col, 1.0);
	}
`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl =
      canvas.getContext("webgl", { preserveDrawingBuffer: still }) ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      console.error(
        "Unable to initialize WebGL. Your browser may not support it."
      );
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    glRef.current = gl;
    shaderProgramRef.current = shaderProgram;
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const shaderProgram = shaderProgramRef.current;
    const { width, height } = size;
    if (!gl || !shaderProgram) return;
    gl.viewport(0, 0, width, height); // Set the WebGL viewport to match
    const iResolutionLocation = gl.getUniformLocation(
      shaderProgram,
      "iResolution"
    );
    gl.uniform2f(iResolutionLocation, gl.canvas.width, gl.canvas.height);
  }, [size]);

  const frameHandler = () => {
    const start = startRef.current;
    const time = performance.now() - start;
    const mousePos = mousePosRef.current;

    if ((reducedMotion || still) && time > 200) {
      return;
    }

    const gl = glRef.current;
    const shaderProgram = shaderProgramRef.current;
    if (!gl || !shaderProgram) return;

    const iTimeLocation = gl.getUniformLocation(shaderProgram, "iTime");
    const iMouseLocation = gl.getUniformLocation(shaderProgram, "iMouse");

    gl.uniform2f(iMouseLocation, mousePos.x, mousePos.y);
    gl.uniform1f(iTimeLocation, time * 0.001);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  useRafInterval(frameHandler, inView ? 1000 / 60 : undefined);

  return <canvas {...size} ref={canvasRef} className="w-full h-full" />;
}
