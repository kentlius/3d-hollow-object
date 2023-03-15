import {draw } from './draw.js';

var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');

function main() {

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  window.requestAnimationFrame(() => draw(gl));
}

main();
