import { parseObject } from "./parse.js";
import { multiply, inverse } from "./matrix.js";
import {
  translationMatrix,
  xRotationMatrix,
  yRotationMatrix,
  zRotationMatrix,
  scaleMatrix,
} from "./transformation.js";
import {
  orthographicMatrix,
  perspectiveMatrix,
  obliqueMatrix,
} from "./projection.js";

function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  // Get the strings for GLSL shaders
  const vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
  const fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;

  // create GLSL shaders, upload the GLSL sources, then compile them
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);

  const coordinates = gl.getAttribLocation(program, "coordinates");
  const transformation = gl.getUniformLocation(program, "transformation");
  const inputColor = gl.getUniformLocation(program, "inputColor");
  const projection = gl.getUniformLocation(program, "projection");
  const perspective = gl.getUniformLocation(program, "perspective");
  const isShadingOn = gl.getUniformLocation(program, "Onshading");

  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  function radToDeg(r) {
    return (r * 180) / Math.PI;
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  let parsedInput = parseObject("../../test/cube.json");
  let modelType = parsedInput[0];
  let modelSurfaces = parsedInput[1];
  let translation = [0, 0, 0];
  let rotation = [degToRad(40), degToRad(25), degToRad(325)];
  let scale = [1, 1, 1];
  let viewAngle = 30;
  let viewRadius = 0.2;
  let projectionType = "orthographic";
  let baseColor = [96, 153, 102, 1];

  let rotationSpeed = 0.2;
  let modelName = "cube";
  let then = 0;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(modelType.vertices),
    gl.STATIC_DRAW
  );

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(modelType.indices),
    gl.STATIC_DRAW
  );

  const animation = document.querySelector("#animation");
  animation.checked = true;
  animation.addEventListener("change", (event) => {
    if (!event.target.checked) {
      rotationSpeed = 0;
    } else {
      rotationSpeed = 0.2;
    }
  });

  const shading = document.querySelector("#shading");
  let isShading = true;
  shading.checked = true;
  shading.addEventListener("change", (event) => {
    if (!event.target.checked) {
      isShading = false;
    } else {
      isShading = true;
    }
    gl.uniform1i(isShadingOn, isShading);
  });

  // Model Radio Button Handler
  const models = document.querySelectorAll("input[name='model']");
  models.forEach((model) => {
    model.addEventListener("change", (event) => {
      modelName = event.target.value;
      parsedInput = parseObject("../../test/" + event.target.value + ".json");
      modelType = parsedInput[0];
      modelSurfaces = parsedInput[1];

      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(modelType.vertices),
        gl.STATIC_DRAW
      );

      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(modelType.indices),
        gl.STATIC_DRAW
      );
    });
  });

  // Projection Radio Button Handler
  const projections = document.querySelectorAll("input[name='projection']");
  projections.forEach((projection) => {
    projection.addEventListener("change", (event) => {
      projectionType = event.target.value;
    });
  });

  // Translation Slider Handlers
  const translateX = document.querySelector("#translateX");
  translateX.value = translation[0];
  translateX.addEventListener("input", () => {
    translation[0] = translateX.value;
  });

  const translateY = document.querySelector("#translateY");
  translateY.value = translation[1];
  translateY.addEventListener("input", () => {
    translation[1] = translateY.value;
  });

  const translateZ = document.querySelector("#translateZ");
  translateZ.value = translation[2];
  translateZ.addEventListener("input", () => {
    translation[2] = translateZ.value;
  });

  // Rotation Slider Handlers
  const rotateX = document.querySelector("#rotateX");
  rotateX.value = radToDeg(rotation[0]);
  rotateX.addEventListener("input", () => {
    rotation[0] = (rotateX.value * Math.PI) / 180;
  });

  const rotateY = document.querySelector("#rotateY");
  rotateY.value = radToDeg(rotation[1]);
  rotateY.addEventListener("input", () => {
    rotation[1] = (rotateY.value * Math.PI) / 180;
  });

  const rotateZ = document.querySelector("#rotateZ");
  rotateZ.value = radToDeg(rotation[2]);
  rotateZ.addEventListener("input", () => {
    rotation[2] = (rotateZ.value * Math.PI) / 180;
  });

  // Scale Slider Handlers
  const scaleX = document.querySelector("#scaleX");
  scaleX.value = scale[0];
  scaleX.addEventListener("input", () => {
    scale[0] = scaleX.value;
  });

  const scaleY = document.querySelector("#scaleY");
  scaleY.value = scale[1];
  scaleY.addEventListener("input", () => {
    scale[1] = scaleY.value;
  });

  const scaleZ = document.querySelector("#scaleZ");
  scaleZ.value = scale[2];
  scaleZ.addEventListener("input", () => {
    scale[2] = scaleZ.value;
  });

  // View Angle Slider Handler
  const angle = document.querySelector("#angle");
  angle.value = viewAngle;
  angle.addEventListener("input", () => {
    viewAngle = angle.value;
  });

  // View Radius Slider Handler
  const radius = document.querySelector("#radius");
  radius.value = viewRadius;
  radius.addEventListener("input", () => {
    viewRadius = radius.value;
  });

  // Color Picker Handler
  const colorWell = document.querySelector("#colorWell");
  colorWell.value = rgbToHex(baseColor[0], baseColor[1], baseColor[2]);
  colorWell.addEventListener("input", () => {
    baseColor = hexToRgb(colorWell.value);
  });

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 1.0];
  }

  var load_btn = document.querySelector("#load");
  load_btn.onclick = function (event) {
    loadModel();
  };

  function loadModel() {
    var file = document.querySelector("#loadedFile").files[0];
    if (file == null) {
      window.alert("No file selected");
      return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function () {
      modelName = file.name.split(".json")[0];
      // parsedInput = parseObject(fileReader.result);
      // modelType = parsedInput[0];
      // modelSurfaces = parsedInput[1];

      const model = {
        vertices: [],
        indices: [],
      };

      const json = JSON.parse(fileReader.result);
      model.vertices = json.vertices;
      const surfaces = json.surfaces;
      for (let i = 0; i < surfaces.length; i++) {
        const surface = surfaces[i];
        const indices = surface.split("-");
        for (let j = 1; j + 1 < indices.length; j++) {
          model.indices.push(indices[0]);
          model.indices.push(indices[j]);
          model.indices.push(indices[j + 1]);
        }
      }
      const max = model.vertices.reduce((a, b) => {
        return Math.max(a, b);
      });
      const min = model.vertices.reduce((a, b) => {
        return Math.min(a, b);
      });
      const range = max - min;

      model.vertices.forEach((item, i) => {
        const normed = (item - min) / range;
        model.vertices[i] = normed - 0.5;
      });

      modelType = model;
      modelSurfaces = json.surfaces;

      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(modelType.vertices),
        gl.STATIC_DRAW
      );

      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(modelType.indices),
        gl.STATIC_DRAW
      );
    };
    fileReader.readAsText(file);
  }

  const help = document.querySelector("#help-modal");

  const helpOpen = document.querySelector("#help-btn");
  helpOpen.addEventListener("click", () => {
    help.showModal();
  });

  const helpClose = document.querySelector("#help-close");
  helpClose.addEventListener("click", () => {
    help.close();
  });

  function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;
    rotation[1] += rotationSpeed * deltaTime;
    rotateY.value = radToDeg(rotation[1]) % 360;

    function resizeCanvasToDisplaySize(canvas, multiplier) {
      multiplier = multiplier || 1;
      const width = (canvas.clientWidth * multiplier) | 0;
      const height = (canvas.clientHeight * multiplier) | 0;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    gl.enableVertexAttribArray(coordinates);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

    gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);

    const transformationMatrix = multiply(
      translationMatrix(translation),
      multiply(
        multiply(
          multiply(xRotationMatrix(rotation[0]), yRotationMatrix(rotation[1])),
          zRotationMatrix(rotation[2])
        ),
        scaleMatrix(scale)
      )
    );

    function getNewVertices() {
      let initialVertices = modelType.vertices;

      const tempVertices = new Float32Array(initialVertices.length);

      for (let i = 0; i < initialVertices.length; i += 3) {
        let vertex = [
          initialVertices[i],
          initialVertices[i + 1],
          initialVertices[i + 2],
        ];

        let transformedVertex = [
          transformationMatrix[0] * vertex[0] +
            transformationMatrix[4] * vertex[1] +
            transformationMatrix[8] * vertex[2] +
            transformationMatrix[12],
          transformationMatrix[1] * vertex[0] +
            transformationMatrix[5] * vertex[1] +
            transformationMatrix[9] * vertex[2] +
            transformationMatrix[13],
          transformationMatrix[2] * vertex[0] +
            transformationMatrix[6] * vertex[1] +
            transformationMatrix[10] * vertex[2] +
            transformationMatrix[14],
        ];

        tempVertices[i] = transformedVertex[0];
        tempVertices[i + 1] = transformedVertex[1];
        tempVertices[i + 2] = transformedVertex[2];
      }

      let transformedVertices = Array.prototype.slice.call(tempVertices);

      return transformedVertices;
    }

    var btn = document.querySelector("#save");
    btn.onclick = function (event) {
      saveModel();
    };

    function saveModel() {
      let newVertices = getNewVertices();

      let surfaces = modelSurfaces;

      let object = {
        vertices: newVertices,
        surfaces: modelSurfaces,
      };

      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(object, null, 4)], {
        type: "text/plain",
      });
      a.href = URL.createObjectURL(file);
      a.download = "saved-" + modelName + ".json";
      a.click();
    }

    var projectionMatrix = multiply(
      orthographicMatrix(),
      inverse(
        multiply(
          yRotationMatrix((viewAngle * Math.PI) / 180),
          translationMatrix([0, 0, viewRadius])
        )
      )
    );

    gl.uniformMatrix4fv(
      transformation,
      false,
      new Float32Array(transformationMatrix)
    );
    gl.uniform3f(
      inputColor,
      baseColor[0] / 255,
      baseColor[1] / 255,
      baseColor[2] / 255
    );
    gl.uniform1i(isShadingOn, isShading);

    if (projectionType === "oblique") {
      projectionMatrix = multiply(
        obliqueMatrix(),
        inverse(
          multiply(
            yRotationMatrix((viewAngle * Math.PI) / 180),
            translationMatrix([0, 0, viewRadius])
          )
        )
      );
    }

    projectionType === "perspective"
      ? gl.uniform1f(perspective, 1.5)
      : gl.uniform1f(perspective, 0);

    gl.uniformMatrix4fv(projection, false, projectionMatrix);

    gl.drawElements(
      gl.TRIANGLES,
      modelType.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
