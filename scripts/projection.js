function orthographicMatrix(){
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

function perspectiveMatrix(fov, aspect, near, far){
  const f = 1 / Math.tan(fov / 2);
  const range = near - far;
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) / range, -1,
    0, 0, 2 * near * far / range, 0
  ];
}

function obliqueMatrix(){
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0.5, 0.5, 1, 0,
    0, 0, 0, 1
  ];
}

export { orthographicMatrix, perspectiveMatrix, obliqueMatrix };
