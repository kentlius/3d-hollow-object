export function parseObject(file){
    var model = {
        vertices : [],
        indices  : []
    };
    //parse json file
    var request = new XMLHttpRequest();
    request.open("GET", file, false);
    request.send(null)
    var json = JSON.parse(request.responseText);
    model.vertices = json.vertices;
    var surfaces = json.surfaces;
    for(var i = 0; i < surfaces.length; i++){
        var surface = surfaces[i];
        //split on -
        var indices = surface.split("-");
        for(var j = 1; j+1 < indices.length; j++){
            model.indices.push(indices[0]);
            model.indices.push(indices[j]);
            model.indices.push(indices[j+1]);
        }
    }
    var max   = model.vertices.reduce((a, b) => {return Math.max(a, b);});
    var min   = model.vertices.reduce((a, b) => {return Math.min(a, b);});
    var range = max - min;

    model.vertices.forEach((item, i) => {
        var normed = (item - min) / range;
        model.vertices[i] = normed - 0.5;
    });

    console.log(model);
    return model;
}