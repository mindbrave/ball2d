import { pipe } from "remeda";
import { expect, assert } from "chai";

import { collisionBetweenBodies } from "../../../physics/collisions/detection";
import { givenBody, atPosition, withZeroVelocity, withVelocity, sphereShaped, madeOf, sphere } from "../../fixtures/body";
import { Meters, Seconds, MetersPerSecond } from "../../../physics/units";
import { Vec, vec } from "../../../vectors";

describe("find incoming collisions between given bodies", () => {
    test("doesnt find incoming collision between two bodies that are not going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity
        );
        const bodyB = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity
        );

        const collision = collisionBetweenBodies(bodyA, bodyB, 10.0 as Seconds);
    
        expect(collision).to.be.null;
    });

    test("can find incoming collision between two bodies that are going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1.0 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond})
        );
        const bodyB = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity
        );

        const collision = collisionBetweenBodies(bodyA, bodyB, 10.0 as Seconds);
    
        assert.closeTo(collision!.timeToImpact, 9.0 as Seconds, 0.1 as Seconds);
    });
});
