import { sphereShaped, givenBody, atPosition, withZeroVelocity, withVelocity, triangleShaped, madeOf, sphere, triangle } from "../../fixtures/body";
import { pipe } from "remeda";
import { expect } from "chai";
import { Meters, Seconds, MetersPerSecond } from "../../../physics/units";
import { vec, Vec } from "../../../vectors";
import { incomingCollisionBetweenSphereAndTriangle } from "../../../physics/collisions/detection";
import { BodyPart } from "../../../physics/body";
import { Sphere, Triangle } from "../../../physics/shape";

test("sphere is not going to collide against static triangle because duration is too short", () => {
    const bodyA = pipe(
        givenBody(),
        sphereShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 1 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Sphere>;
    const bodyB = pipe(
        givenBody(),
        triangleShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: 4 as Meters},
            {x: 3 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Triangle>;

    const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, partA, bodyB, partB, 0.49 as Seconds);

    expect(collision).to.be.null;
});

test("sphere is going to collide against horizontal static front faced triangle", () => {
    const bodyA = pipe(
        givenBody(),
        sphereShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 1 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Sphere>;
    const bodyB = pipe(
        givenBody(),
        triangleShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: 4 as Meters},
            {x: 3 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Triangle>;

    const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.5 as Seconds, 0.00001);
});

test("sphere is going to collide against vertical static front faced triangle", () => {
    const bodyA = pipe(
        givenBody(),
        sphereShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 1 as Meters, z: 1 as Meters}),
        withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Sphere>;
    const bodyB = pipe(
        givenBody(),
        triangleShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 3 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: 4 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Triangle>;

    const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.5 as Seconds, 0.00001);
});

test("sphere is going to collide against diagonal static front faced triangle", () => {
    const bodyA = pipe(
        givenBody(),
        sphereShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 5 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Sphere>;
    const bodyB = pipe(
        givenBody(),
        triangleShaped(
            {x: 5 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 5 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 5 as Meters, z: 5 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Triangle>;

    const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.3 as Seconds, 0.01);
});

test("sphere is not going to collide against vertical static back faced triangle", () => {
    const bodyA = pipe(
        givenBody(),
        sphereShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 1 as Meters, z: 1 as Meters}),
        withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Sphere>;
    const bodyB = pipe(
        givenBody(),
        triangleShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: 4 as Meters},
            {x: 0 as Meters, y: 3 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Triangle>;

    const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision).to.be.null;
});

test("sphere is not going to collide against static triangle because it's going to miss it", () => {
    const bodyA = pipe(
        givenBody(),
        sphereShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 3 as Meters, z: 2 as Meters}),
        withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Sphere>;
    const bodyB = pipe(
        givenBody(),
        triangleShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 3 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: 4 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Triangle>;

    const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision).to.be.null;
});

describe("find incoming collisions between given sphere and triangles with body parts moved from body origin", () => {
    test("doesnt find incoming collision between two bodies that are not going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(0, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(0, 1, 0) as Vec<Meters>),
            withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>)
        );
        const bodyB = pipe(
            givenBody(),
            madeOf(
                triangle(
                    [
                        vec(0, 0, 0) as Vec<Meters>,
                        vec(0, 0, 1) as Vec<Meters>,
                        vec(1, 0, 0) as Vec<Meters>
                    ],
                    vec(-2, 0, 0) as Vec<Meters>
                )
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const spherePartA = bodyA.parts[0] as BodyPart<Sphere>;
        const trianglePartB = bodyB.parts[0] as BodyPart<Triangle>;

        const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, spherePartA, bodyB, trianglePartB, 1.0 as Seconds);
    
        expect(collision).to.be.null;
    });

    test("can find incoming collision between two bodies that are going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(0, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(-2, 1, 0) as Vec<Meters>),
            withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>)
        );
        const bodyB = pipe(
            givenBody(),
            madeOf(
                triangle(
                    [
                        vec(0, 0, 0) as Vec<Meters>,
                        vec(0, 0, 1) as Vec<Meters>,
                        vec(1, 0, 0) as Vec<Meters>
                    ],
                    vec(-2, 0, 0) as Vec<Meters>
                )
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const spherePartA = bodyA.parts[0] as BodyPart<Sphere>;
        const trianglePartB = bodyB.parts[0] as BodyPart<Triangle>;

        const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, spherePartA, bodyB, trianglePartB, 1.0 as Seconds);
    
        expect(collision).to.be.not.null;
    });

    test("both bodies are not moving", () => {
        const bodyA = pipe(
            givenBody(),
            madeOf(
                sphere(0.5 as Meters, vec(0, 0, 0) as Vec<Meters>)
            ),
            atPosition(vec(0, 1, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const bodyB = pipe(
            givenBody(),
            madeOf(
                triangle(
                    [
                        vec(0, 0, 0) as Vec<Meters>,
                        vec(0, 0, 1) as Vec<Meters>,
                        vec(1, 0, 0) as Vec<Meters>
                    ],
                    vec(0, 0, 0) as Vec<Meters>
                )
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const spherePartA = bodyA.parts[0] as BodyPart<Sphere>;
        const trianglePartB = bodyB.parts[0] as BodyPart<Triangle>;

        const collision = incomingCollisionBetweenSphereAndTriangle(bodyA, spherePartA, bodyB, trianglePartB, 5.0 as Seconds);
    
        expect(collision).to.be.null;
    });
});