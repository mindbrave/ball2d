import { pipe } from "remeda";
import { expect } from "chai";
import { givenBody, madeOf, sphere, atPosition, withVelocity, withZeroVelocity } from "../../fixtures/body";
import { Meters, MetersPerSecond, Seconds } from "../../../physics/units";
import { vec, Vec } from "../../../vectors";
import { collisionBetweenBodies, incomingCollisionBetweenSpheres } from "../../../physics/collisions/detection";
import { BodyPart } from "../../../physics/body";
import { Sphere } from "../../../physics/shape";

describe("find incoming collisions between given sphere bodies with body parts moved from body origin", () => {
    test("doesnt find incoming collision between two bodies that are not going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(0, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(0, 0, 1) as Vec<Meters>),
            withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
        );
        const bodyB = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(1, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const spherePartA = bodyA.parts[0] as BodyPart<Sphere>;
        const spherePartB = bodyB.parts[0] as BodyPart<Sphere>;

        const collision = incomingCollisionBetweenSpheres(bodyA, spherePartA, bodyB, spherePartB, 1.0 as Seconds);
    
        expect(collision).to.be.null;
    });

    test("can find incoming collision between two bodies that are going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(0, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(0, 0, 2) as Vec<Meters>),
            withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
        );
        const bodyB = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(2, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(-2, 0, 0) as Vec<MetersPerSecond>)
        );
        const spherePartA = bodyA.parts[0] as BodyPart<Sphere>;
        const spherePartB = bodyB.parts[0] as BodyPart<Sphere>;

        const collision = incomingCollisionBetweenSpheres(bodyA, spherePartA, bodyB, spherePartB, 2.0 as Seconds);
    
        expect(collision).to.be.not.null;
    });
});