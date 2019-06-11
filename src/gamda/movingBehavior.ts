
import { Scalar } from "uom-ts";
import { curry } from "ramda";
 
import { scaleVector, Vec, subtractVectors, normalizeVector, distanceTo, sqrDistanceTo, vectorSqrMagnitude, negateVector, vec } from "./vectors";
import { Body } from "./physics/body";
import { MetersPerSquaredSecond, MetersPerSecond, Seconds, Meters } from "./physics/units";
import { accelerate, tuneAccelerationToNotExceedGivenVelocity } from "./physics/motion";

export interface GoInDirectionMovementBehavior {
    type: "GoInDirection",
    direction: Vec<Scalar>;
    acceleration: MetersPerSquaredSecond;
    maxVelocity: MetersPerSecond;
    updateBehavior: (delta: Seconds, movementBehavior: GoInDirectionMovementBehavior, body: Body) => [Body, MovementBehavior];
}

export interface GoToPositionMovementBehavior {
    type: "GoToPosition",
    acceleration: MetersPerSquaredSecond;
    maxVelocity: MetersPerSecond;
    updateBehavior: (delta: Seconds, movementBehavior: GoToPositionMovementBehavior, body: Body) => [Body, MovementBehavior];
    goToPosition: Vec<Meters>;
}

export interface StopMovementBehavior {
    type: "Stop",
    acceleration: MetersPerSquaredSecond;
    maxVelocity: MetersPerSecond;
    updateBehavior: (delta: Seconds, movementBehavior: StopMovementBehavior, body: Body) => [Body, MovementBehavior];
}

export type MovementBehavior = GoInDirectionMovementBehavior | GoToPositionMovementBehavior | StopMovementBehavior;

export interface WithBehavior {
    body: Body;
    movementBehavior: MovementBehavior;
}

export const updateBodyMovingBehavior = (delta: Seconds, movementBehavior: MovementBehavior, body: Body): [Body, MovementBehavior] => (
    movementBehavior.updateBehavior(delta, movementBehavior as any, body)
);

export const updateToGoIntoDirection = curry((delta: Seconds, movementBehavior: GoInDirectionMovementBehavior, body: Body): [Body, MovementBehavior] => ([
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
    ),
    movementBehavior
]));

export const updateToGoToPosition = curry((delta: Seconds, movementBehavior: GoToPositionMovementBehavior, body: Body): [Body, MovementBehavior] => (
    sqrDistanceTo(movementBehavior.goToPosition)(body.position) <= vectorSqrMagnitude(scaleVector(delta, body.velocity)) ?
    [{
        ...body,
        velocity: (
            vectorSqrMagnitude(body.velocity) <= movementBehavior.maxVelocity ** 2 ? vec(0, 0, 0) as Vec<MetersPerSecond> : (
                subtractVectors(body.velocity, scaleVector(movementBehavior.maxVelocity, normalizeVector(body.velocity)))
            )
        )
    }, orderToNotMove(movementBehavior)] :
    [accelerate(
        tuneAccelerationToNotExceedGivenVelocity(
            movementBehavior.maxVelocity,
            delta,
            body.velocity,
            scaleVector(
                movementBehavior.acceleration, 
                normalizeVector(subtractVectors(movementBehavior.goToPosition!, body.position))
            )
        ),
        delta,
        body
    ), movementBehavior]
));

export const updateToStop = curry((delta: Seconds, movementBehavior: StopMovementBehavior, body: Body): [Body, MovementBehavior] => [
    body,
    movementBehavior
]);

export const orderToNotMove = (movementBehavior: MovementBehavior): StopMovementBehavior => ({
    ...movementBehavior,
    type: "Stop",
    updateBehavior: updateToStop,
});

export const orderToGoIntoDirection = (direction: Vec<Scalar>) => (movementBehavior: MovementBehavior): GoInDirectionMovementBehavior => ({
    ...movementBehavior,
    type: "GoInDirection",
    updateBehavior: updateToGoIntoDirection,
    direction
});

export const orderToGoToPosition = (position: Vec<Meters>) => (movementBehavior: MovementBehavior): MovementBehavior => ({
    ...movementBehavior,
    type: "GoToPosition",
    updateBehavior: updateToGoToPosition,
    goToPosition: position
});
