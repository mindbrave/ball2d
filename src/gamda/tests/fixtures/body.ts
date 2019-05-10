
import { Vec, vec } from "../../vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "../../physics/units";
import { ShapeType, Sphere, Triangle } from "../../physics/shape";
import { Body, BodyPart } from "../../physics/body";
import { Scalar } from "uom-ts";

export const givenBody = (): Body => ({
    doesGravityAppliesToThisBody: false,
    position: vec(0, 0, 0) as Vec<Meters>,
    velocity: vec(0, 0, 0) as Vec<MetersPerSecond>,
    dampening: 0 as MetersPerSquaredSecond,
    parts: [{
        relativePosition: vec(0, 0, 0) as Vec<Meters>,
        shape: {
            type: ShapeType.Sphere,
            radius: 1.0 as Meters,
        },
    }],
    mass: 1.0 as Kilograms,
    elasticity: 1.0 as Scalar,
});

export const atPosition = (position: Vec<Meters>) => (body: Body): Body => ({
    ...body,
    position,
});

export const withVelocity = (velocity: Vec<MetersPerSecond>) => (body: Body): Body => ({
    ...body,
    velocity,
});

export const withZeroVelocity = (body: Body): Body => ({
    ...body,
    velocity: vec(0, 0, 0) as Vec<MetersPerSecond>,
});

export const withDampening = (dampening: MetersPerSquaredSecond) => (body: Body): Body => ({
    ...body,
    dampening
});

export const sphereShaped = (radius: Meters) => (body: Body): Body => ({
    ...body,
    parts: [{
        relativePosition: vec(0, 0, 0) as Vec<Meters>,
        shape: {
            type: ShapeType.Sphere,
            radius,
        }
    }]
});

export const triangleShaped = (p1: Vec<Meters>, p2: Vec<Meters>, p3: Vec<Meters>) => (body: Body): Body => ({
    ...body,
    parts: [{
        relativePosition: vec(0, 0, 0) as Vec<Meters>,
        shape: {
            type: ShapeType.Triangle,
            p1, p2, p3
        }
    }],
});

export const madeOf = (...bodyParts: BodyPart[]) => (body: Body): Body => ({
    ...body,
    parts: bodyParts
});

export const sphere = (radius: Meters, relativePosition: Vec<Meters>): BodyPart<Sphere> => ({
    shape: {
        type: ShapeType.Sphere,
        radius,
    },
    relativePosition
});

export const triangle = (points: [Vec<Meters>, Vec<Meters>, Vec<Meters>], relativePosition: Vec<Meters>): BodyPart<Triangle> => ({
    shape: {
        type: ShapeType.Triangle,
        p1: points[0],
        p2: points[1],
        p3: points[2]
    },
    relativePosition
});
