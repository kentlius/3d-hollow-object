export function parseObject(file) {
  const model = {
    vertices: [],
    indices: [],
  };

  const request = new XMLHttpRequest();
  request.open("GET", file, false);
  request.send();
  const json = JSON.parse(request.responseText);
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

  console.log(model);
  return [model, json.surfaces] ;
}
