
import { pipe } from "remeda";
import {
    add, mul, sub, div, pow2, sqrt2, addCurried as add_, negate, lte,
    AnyUnit, Unit, Scalar, MultiplyUnits, DivideUnits
} from "uom-ts";

export interface Vec<UNIT = AnyUnit> {
    x: UNIT;
    y: UNIT;
    z: UNIT;
}

export type Radians = Unit<{rad: 1}>;
export type DirectionVector = Vec;

export const vec = (x: number, y: number, z: number) => ({x, y, z});
export const zeroVector = vec(0, 0, 0);

export const addVectors = <T extends AnyUnit>(v1: Vec<T>, v2: Vec<T>): Vec<T> => ({
    x: add(v1.x, v2.x),
    y: add(v1.y, v2.y),
    z: add(v1.z, v2.z),
});

export const subtractVectors = <T extends AnyUnit>(v1: Vec<T>, v2: Vec<T>): Vec<T> => ({
    x: sub(v1.x, v2.x),
    y: sub(v1.y, v2.y),
    z: sub(v1.z, v2.z),
});

export const scaleVector = <T extends AnyUnit, F extends AnyUnit>(factor: F, v: Vec<T>): Vec<MultiplyUnits<F, T>> => ({
    x: mul(factor, v.x),
    y: mul(factor, v.y),
    z: mul(factor, v.z),
});

export const scaleVectorCurried = <T extends AnyUnit, F extends AnyUnit>(factor: F) => (v: Vec<T>): Vec<MultiplyUnits<F, T>> => ({
    x: mul(factor, v.x),
    y: mul(factor, v.y),
    z: mul(factor, v.z),
});

export const dotProduct = <A extends AnyUnit, B extends AnyUnit>(v1: Vec<A>, v2: Vec<B>): MultiplyUnits<A, B> => (
    pipe(mul(v1.x, v2.x), add_(mul(v1.y, v2.y)), add_(mul(v1.z, v2.z)))
);

export const vectorSqrMagnitude = <T extends AnyUnit>(v: Vec<T>): MultiplyUnits<T, T> => dotProduct(v, v);

export const vectorMagnitude = <T extends AnyUnit>(v: Vec<T>): T => sqrt2(vectorSqrMagnitude(v)) as unknown as T;

export const normalizeVector = <T extends AnyUnit>(v: Vec<T>): Vec<Scalar> => {
    const magnitude = vectorMagnitude<T>(v);
    return magnitude === 0.0 ?
        v as unknown as Vec<Scalar> :
        {
            x: div(v.x, magnitude) as unknown as Scalar,
            y: div(v.y, magnitude) as unknown as Scalar,
            z: div(v.z, magnitude) as unknown as Scalar,
        };
};

export const crossProduct = <A extends AnyUnit, B extends AnyUnit>(v1: Vec<A>, v2: Vec<B>): Vec<MultiplyUnits<A, B>> => ({
    x: sub(mul(v1.y, v2.z), mul(v1.z, v2.y)),
    y: sub(mul(v1.z, v2.x), mul(v1.x, v2.z)),
    z: sub(mul(v1.x, v2.y), mul(v1.y, v2.x)),
})

export const divideVector = <T extends AnyUnit, F extends AnyUnit>(factor: F, v: Vec<T>): Vec<DivideUnits<T, F>> => ({
    x: div(v.x, factor),
    y: div(v.y, factor),
    z: div(v.z, factor),
});

export const negateVector = <T extends AnyUnit>(v: Vec<T>): Vec<T> => ({
    x: negate(v.x),
    y: negate(v.y),
    z: negate(v.z),
});

export const clampVector = <T extends AnyUnit>(clampTo: T, v: Vec<T>): Vec<T> => (
    lte(vectorSqrMagnitude(v), pow2(clampTo)) ?
        v :
        pipe(v, normalizeVector, scaleVectorCurried(clampTo)) as unknown as Vec<T>
);

export const projectVectorOntoXY = <T extends AnyUnit>(v: Vec<T>): Vec<T> => ({
    ...v,
    z: 0 as T,
});

export const rotateVectorAroundZ = <T extends AnyUnit>(angle: Radians, v: Vec<T>): Vec<T> => ({
    x: sub(mul(Math.cos(angle) as Scalar, v.x), mul(Math.sin(angle) as Scalar, v.y)) as unknown as T,
    y: add(mul(Math.sin(angle) as Scalar, v.x), mul(Math.cos(angle) as Scalar, v.y)) as unknown as T,
    z: v.z,
});

export const perpendicularVectorOnXYSpace = <T extends AnyUnit>(v: Vec<T>): Vec<T> => ({
    x: negate(v.y),
    y: v.x,
    z: 0 as T,
});

export const isZeroVector = <T extends AnyUnit>(v: Vec<T>): boolean => v.x === 0 && v.y === 0 && v.z === 0;
export const isNotZeroVector = <T extends AnyUnit>(v: Vec<T>): boolean => !isZeroVector(v);

export const vecToArray = <T extends AnyUnit>(v: Vec<T>): T[] => [v.x, v.y, v.z];
export const vecFromArray = <T extends AnyUnit>(array: [T, T, T]): Vec<T> => ({x: array[0], y: array[1], z: array[2]});

export const vecXYZToXZY = <T extends AnyUnit>(v: Vec<T>): Vec<T> => ({x: v.x, y: v.z, z: v.y});
export const vecXZYToXYZ = vecXYZToXZY;
