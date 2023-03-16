export function orthographicMatrix(){
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

export function perspectiveMatrix(fov, aspect, near, far){
    var f = 1 / Math.tan(fov / 2);
    var range = near - far;
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) / range, -1,
        0, 0, 2 * near * far / range, 0
    ];
}

export function obliqueMatrix(){
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0.5, 0.5, 1, 0,
        0, 0, 0, 1
    ];
}