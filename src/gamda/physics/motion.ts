import { curryN } from "ramda";
import { Seconds, MetersPerSecond, MetersPerSquaredSecond } from "./units";
import { addVectors, scaleVector, subtractVectors, vectorMagnitude, normalizeVector, Vec, divideVector, clampVector, zeroVector, vec } from "../vectors";
import { mul, Scalar } from "uom-ts";
import { Body } from "./body";

export const move = curryN(2, (delta: Seconds, body: Body): Body => ({
    ...body,
    position: addVectors(body.position, scaleVector(delta, body.velocity)),
}));

export const setZeroVelocity = (body: Body): Body => ({...body, velocity: zeroVector as Vec<MetersPerSecond>});

export const applyImpulse = (impulse: Vec<MetersPerSecond>) => (body: Body): Body => ({...body, velocity: addVectors(body.velocity, impulse)});

export const applyDampening = curryN(2, (delta: Seconds, body: Body): Body => ({
    ...body,
    velocity: subtractVectors(
        body.velocity,
        scaleVector(Math.min(mul(body.dampening, delta), vectorMagnitude(body.velocity)) as MetersPerSecond, normalizeVector(body.velocity))
    ),
}));

export const applyGravity = curryN(3, (delta: Seconds, gravity: MetersPerSquaredSecond, body: Body): Body => ( body.doesGravityAppliesToThisBody ? {
    ...body,
    velocity: addVectors(
        body.velocity,
        scaleVector(mul(gravity, delta), vec(0, -1, 0) as Vec<Scalar>)
    ),
} : body));

export const setBodyVelocityTowardsDirection = (direction: Vec<Scalar>, speed: MetersPerSecond, body: Body): Body => ({
    ...body,
    velocity: scaleVector(speed, normalizeVector(direction)),
});

export const accelerate = (acceleration: Vec<MetersPerSquaredSecond>, delta: Seconds, body: Body): Body => ({
    ...body,
    velocity: addVectors(body.velocity, scaleVector(delta, acceleration)),
});

export const tuneAccelerationToNotExceedGivenVelocity = (
        velocityToNotExceed: MetersPerSecond,
        delta: Seconds,
        currentVelocity: Vec<MetersPerSecond>,
        acceleration: Vec<MetersPerSquaredSecond>
    ): Vec<MetersPerSquaredSecond> => ( 
        divideVector(
            delta,
            scaleVector(
                Math.min(
                    vectorMagnitude(scaleVector(delta, acceleration)),
                    Math.max(0, velocityToNotExceed - vectorMagnitude(currentVelocity))
                ) as MetersPerSecond,
                normalizeVector(acceleration)
            )
        )
);
