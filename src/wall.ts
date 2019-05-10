
import { Entity, EntityId } from "./gamda/entities";
import { Physical, alwaysCollide, doesntOverlap } from "./gamda/entitiesPhysics";
import { Vec, zeroVector, subtractVectors, vec } from "./gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { Map } from "immutable";
import { ShapeType, Triangle } from "./gamda/physics/shape";
import { BodyPart } from "./gamda/physics/body";
import { Scalar } from "uom-ts";

export type Wall = Entity<Physical>;

export const createParallelogramWall = (leftBottom: Vec<Meters>, leftTop: Vec<Meters>, rightTop: Vec<Meters>): Wall => (
    createWall(leftBottom, [
        {
            shape: {
                type: ShapeType.Triangle,
                p1: subtractVectors(leftBottom, leftBottom),
                p2: subtractVectors(leftTop, leftBottom),
                p3: subtractVectors(rightTop, leftBottom),
            },
            relativePosition: vec(0, 0, 0) as Vec<Meters>,
        },
        {
            shape: {
                type: ShapeType.Triangle,
                p1: subtractVectors(leftBottom, leftBottom),
                p2: subtractVectors(rightTop, leftBottom),
                p3: subtractVectors(rightTop, leftTop)
            },
            relativePosition: vec(0, 0, 0) as Vec<Meters>,
        },
    ])
)

const createWall = (position: Vec<Meters>, triangles: BodyPart<Triangle>[]): Wall => ({
    id: null,
    type: 'wall',
    traits: ['physical'],
    body: {
        doesGravityAppliesToThisBody: false,
        position,
        velocity: zeroVector as Vec<MetersPerSecond>,
        dampening: 0 as MetersPerSquaredSecond,
        mass: 1 as Kilograms,
        parts: triangles,
        elasticity: 0.9 as Scalar,
    },
    contactBehaviors: Map({
        'character': {
            doesCollide: alwaysCollide,
            onCollision: [],
            doesOverlap: doesntOverlap,
            onOverlap: []
        },
        'ball': {
            doesCollide: alwaysCollide,
            onCollision: [],
            doesOverlap: doesntOverlap,
            onOverlap: []
        }
    })
});
