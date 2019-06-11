
import { Entity} from "./gamda/entities";
import { Physical, alwaysCollide, doesntOverlap } from "./gamda/entitiesPhysics";
import { Vec, zeroVector, vec, subtractVectors } from "./gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { Map } from "immutable";
import { ShapeType } from "./gamda/physics/shape";
import { Scalar } from "uom-ts";

export type Wall = Entity<Physical>;

export const createWall = (p1: Vec<Meters>, p2: Vec<Meters>): Wall => ({
    id: null,
    type: 'wall',
    traits: ['physical'],
    body: {
        doesGravityAppliesToThisBody: false,
        position: p1,
        velocity: zeroVector as Vec<MetersPerSecond>,
        dampening: 0 as MetersPerSquaredSecond,
        mass: 1 as Kilograms,
        parts: [{
            shape: {
                type: ShapeType.Segment,
                pointA: vec(0, 0, 0) as Vec<Meters>,
                pointB: subtractVectors(p2, p1),
            },
            relativePosition: vec(0, 0, 0) as Vec<Meters>,
        }],
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
