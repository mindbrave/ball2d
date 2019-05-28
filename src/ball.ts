import { Vec, zeroVector } from "./gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { Entity, EntityId } from "./gamda/entities";
import { Physical, alwaysCollide, bounce, doesntOverlap, bounceAgainstStatic } from "./gamda/entitiesPhysics";
import { ShapeType } from "./gamda/physics/shape";
import { Scalar } from "uom-ts";
import { Map } from "immutable";


export type Ball = Entity<Physical>;

export const BALL_RADIUS = 0.8 as Meters;

export const createBall = (position: Vec<Meters>): Ball => ({
    id: null,
    type: 'ball',
    traits: ['physical'],
    body: {
        doesGravityAppliesToThisBody: true,
        position,
        velocity: zeroVector as Vec<MetersPerSecond>,
        dampening: 1.0 as MetersPerSquaredSecond,
        mass: 1.3 as Kilograms,
        parts: [
            {
                shape: {
                    type: ShapeType.Sphere,
                    radius: BALL_RADIUS,
                },
                relativePosition: zeroVector as Vec<Meters>
            }
        ],
        elasticity: 1.0 as Scalar,
    },
    contactBehaviors: Map({
        'character': {
            doesCollide: alwaysCollide,
            onCollision: [bounce],
            doesOverlap: doesntOverlap,
            onOverlap: []
        },
        'ball': {
            doesCollide: alwaysCollide,
            onCollision: [bounce],
            doesOverlap: doesntOverlap,
            onOverlap: []
        },
        'wall': {
            doesCollide: alwaysCollide,
            doesOverlap: doesntOverlap,
            onCollision: [bounceAgainstStatic],
            onOverlap: []
        }
    })
});
