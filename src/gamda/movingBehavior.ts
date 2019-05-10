
import { Scalar } from "uom-ts";
import { curry } from "ramda";
 
import { scaleVector, Vec } from "./vectors";
import { Body } from "./physics/body";
import { MetersPerSquaredSecond, MetersPerSecond, Seconds } from "./physics/units";
import { accelerate, tuneAccelerationToNotExceedGivenVelocity } from "./physics/motion";

export interface MovementBehavior {
    direction: Vec<Scalar>;
    acceleration: MetersPerSquaredSecond;
    maxVelocity: MetersPerSecond;
}

export interface WithBehavior {
    body: Body;
    movementBehavior: MovementBehavior;
}

export const updateBodyMovingBehavior = curry((delta: Seconds, movementBehavior: MovementBehavior, body: Body): Body => (
    accelerate(
        tuneAccelerationToNotExceedGivenVelocity(
            movementBehavior.maxVelocity,
            delta,
            body.velocity,
            scaleVector(
                movementBehavior.acceleration, 
                movementBehavior.direction
            )
        ),
        delta,
        body
    )
));

export const orderToNotMove = (movementBehavior: MovementBehavior): MovementBehavior => ({
    ...movementBehavior,
    direction: {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar},
});

export const orderToGoIntoDirection = (direction: Vec<Scalar>) => (movementBehavior: MovementBehavior): MovementBehavior => ({
    ...movementBehavior,
    direction
});
