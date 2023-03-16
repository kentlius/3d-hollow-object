import { parseObject } from "./parse.js";
import { translationMatrix, xRotationMatrix, yRotationMatrix, zRotationMatrix, scaleMatrix } from "./transformation.js";
import { orthographicMatrix, perspectiveMatrix, obliqueMatrix } from "./projection.js";
import { multiply, inverse } from "./matrix.js";

var model = parseObject("../../test/cube.json");
var translation = [0, 0, 0];
var rotation = [Math.PI / 180 * 0, Math.PI / 180 * 15, Math.PI / 180 * 15];
var scale = [1, 1, 1];
var viewAngle = 30;
var viewRadius = 0.2;
var projectionType = "orthographic";
var baseColor = [0.0, 1.0, 1.0, 1.0];

function createShaderProgram(gl) {
    //create vertex shader
    var vertexShaderCode = `attribute vec3 coordinates;
    uniform float perspective;
    uniform mat4 transformation;
    uniform mat4 projection;
    varying float color;

    void main(void) {
        vec4 position = projection * transformation * vec4(coordinates.x, coordinates.y, coordinates.z * -1.0, 1.0);
        color = min(max((1.0 - position.z) / 2.0, 0.0), 1.0);
        if (perspective < 0.01)
            gl_Position = position;
        else {
            float perspectiveFac = 2.0 + position.z * perspective;
            gl_Position = vec4(position.x / perspectiveFac, position.y / perspectiveFac, position.z, position.w);
        }
    }`
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader));
    }

    //create fragment shader
    var fragmentShaderCode = `precision mediump float;
    uniform vec3 inputColor;
    varying float color;

    void main(void) {
        gl_FragColor = vec4(inputColor * color, 1.0);
    }`
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader));
    }

    //create shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(shaderProgram));
        return;
    }

    return shaderProgram;
}

export function draw(gl) {
    // TODO : compute transformationMatrix
    var transformationMatrix = multiply(multiply(multiply(multiply(scaleMatrix(scale), xRotationMatrix(rotation[0])), 
                                                yRotationMatrix(rotation[1])), zRotationMatrix(rotation[2])), translationMatrix(translation));
    // TODO : compute projectionMatrix
    var projectionMatrix = multiply(orthographicMatrix(), inverse(multiply(yRotationMatrix(viewAngle*Math.PI/180), translationMatrix([0, 0, viewRadius]))));

    var shaderProgram = createShaderProgram(gl);

    var coordinates  = gl.getAttribLocation(shaderProgram, "coordinates");
    var transformation  = gl.getUniformLocation(shaderProgram, "transformation");
    var inputColor  = gl.getUniformLocation(shaderProgram, "inputColor");
    var projection = gl.getUniformLocation(shaderProgram, "projection");
    var perspective  = gl.getUniformLocation(shaderProgram, "perspective");

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.useProgram(shaderProgram);
    gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordinates);
    gl.uniformMatrix4fv(transformation, false, new Float32Array(transformationMatrix));
    gl.uniform3f(inputColor, baseColor[0], baseColor[1], baseColor[2]);

    if (projectionType === "perspective")
        gl.uniform1f(perspective, 1.5);
    else
        gl.uniform1f(perspective, 0);

    gl.uniformMatrix4fv(projection, false, projectionMatrix);

    // Bind vertices and indices
    console.log(model.indices)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

    // Draw
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
    window.requestAnimationFrame(() => draw(gl));
}
