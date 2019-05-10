
import { assert } from "chai";
import { Scalar } from "uom-ts";
import { 
    addVectors, subtractVectors, scaleVector, vectorMagnitude, clampVector, projectVectorOntoXY, rotateVectorAroundZ,
    perpendicularVectorOnXYSpace,
    Radians,
    crossProduct
} from "../vectors";

test("Add two vectors", () => {
    const v1 = {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar};
    const v2 = {x: 1 as Scalar, y: 1 as Scalar, z: 1 as Scalar};

    assert.deepEqual(addVectors(v1, v2), {x: 1, y: 1, z: 1});
});

test("Subtract two vectors", () => {
    const v1 = {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar};
    const v2 = {x: 1 as Scalar, y: 1 as Scalar, z: 1 as Scalar};

    assert.deepEqual(subtractVectors(v1, v2), {x: -1, y: -1, z: -1});
});

test("Scale vector", () => {
    const v1 = {x: 2 as Scalar, y: 3 as Scalar, z: -1 as Scalar};
    const factor = 3.0 as Scalar;

    assert.deepEqual(scaleVector(factor, v1), {x: 6, y: 9, z: -3});
});

test("Clamp vector longer than clamp value", () => {
    const v1 = {x: 3 as Scalar, y: 4 as Scalar, z: 5 as Scalar};  // length about 7
    const clampTo = 2.0 as Scalar;

    const clamped = clampVector(clampTo, v1);

    assert.closeTo(vectorMagnitude(clamped), clampTo, 0.0000001);
});

test("Clamp vector shorter than clamp value", () => {
    const v1 = {x: 3 as Scalar, y: 4 as Scalar, z: 5 as Scalar};  // length about 7
    const clampTo = 10.0 as Scalar;

    const clamped = clampVector(clampTo, v1);

    assert.deepEqual(clamped, v1);
});

test("Project vector onto XY plane", () => {
    const v1 = {x: 3 as Scalar, y: 4 as Scalar, z: 5 as Scalar};

    const projected = projectVectorOntoXY(v1);

    assert.deepEqual(projected, {x: 3, y: 4, z: 0});
});

test("Vectors cross product", () => {
    const v1 = {x: 1 as Scalar, y: 0 as Scalar, z: 0 as Scalar};
    const v2 = {x: 0 as Scalar, y: 1 as Scalar, z: 0 as Scalar};

    const crossVector = crossProduct(v1, v2);

    assert.deepEqual(crossVector, {x: 0, y: 0, z: 1});
});

test("Rotate around Z axis", () => {
    const v1 = {x: 1 as Scalar, y: 1 as Scalar, z: 1 as Scalar};

    const rotated = rotateVectorAroundZ(Math.PI as Radians, v1);
    
    assert.closeTo(rotated.x, -1, 0.00000001);
    assert.closeTo(rotated.y, -1, 0.00000001);
    assert.closeTo(rotated.z, 1, 0.00000001);
});

test("Rotate around Z axis", () => {
    const v1 = {x: 1 as Scalar, y: 1 as Scalar, z: 1 as Scalar};

    const rotated = rotateVectorAroundZ(4 * Math.PI as Radians, v1);
    
    assert.closeTo(rotated.x, 1, 0.00000001);
    assert.closeTo(rotated.y, 1, 0.00000001);
    assert.closeTo(rotated.z, 1, 0.00000001);
});

test("Get perpendicular vector", () => {
    const v1 = {x: 1 as Scalar, y: 1 as Scalar, z: 0 as Scalar};

    const perpendicular = perpendicularVectorOnXYSpace(v1);
    
    assert.deepEqual(perpendicular, {x: -1, y: 1, z: 0})
});

test("Get perpendicular vector", () => {
    const v1 = {x: 0 as Scalar, y: -1 as Scalar, z: 0 as Scalar};

    const perpendicular = perpendicularVectorOnXYSpace(v1);
    
    assert.deepEqual(perpendicular, {x: 1, y: 0, z: 0})
});

test("Get perpendicular vector for zero vector", () => {
    const v1 = {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar};

    const perpendicular = perpendicularVectorOnXYSpace(v1);
    
    assert.deepEqual(perpendicular, {x: -0, y: 0, z: 0})
});
