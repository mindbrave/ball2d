import { pipe } from "remeda";
import { expect } from "chai";

import { givenBody, sphereShaped, withVelocity, atPosition, triangleShaped, withZeroVelocity, circleShaped, segmentShaped } from "../fixtures/body";

import { vec, Vec } from "../../vectors";
import { sphereBounceOfSphere, sphereBounceOfStaticTriangle, circleBounceOfStaticSegment } from "../../physics/collisions/resolve";
import { Meters, MetersPerSecond, Seconds } from "../../physics/units";
import { BodyPart } from "../../physics/body";
import { Sphere, Triangle, Circle, Segment } from "../../physics/shape";
import { EntitiesCollision } from "../../entitiesPhysics";
import { BodyCollision } from "../../physics/collisions/collision";

describe("Can correctly resolve bouncing bodies off each other", function() {
    test("can bounce sphere of sphere if going into each other in the same direction", function() {
        const sphereA = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>),
        );
        const sphereB = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>),
        );
        const spherePartA = sphereA.parts[0] as BodyPart<Sphere>;
        const spherePartB = sphereB.parts[0] as BodyPart<Sphere>;

        const resolvedA = sphereBounceOfSphere(sphereA, spherePartA, sphereB, spherePartB);
        const resolvedB = sphereBounceOfSphere(sphereB, spherePartB, sphereA, spherePartA);

        expect(resolvedA.velocity).to.deep.equal(sphereB.velocity);
        expect(resolvedB.velocity).to.deep.equal(sphereA.velocity);
    });

    test("can bounce sphere of sphere when one stays and one is moving", function() {
        const sphereA = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>),
        );
        const sphereB = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withVelocity(vec(0, 0, 0) as Vec<MetersPerSecond>),
        );
        const spherePartA = sphereA.parts[0] as BodyPart<Sphere>;
        const spherePartB = sphereB.parts[0] as BodyPart<Sphere>;

        const resolvedA = sphereBounceOfSphere(sphereA, spherePartA, sphereB, spherePartB);
        const resolvedB = sphereBounceOfSphere(sphereB, spherePartB, sphereA, spherePartA);

        expect(resolvedA.velocity).to.deep.equal(sphereB.velocity);
        expect(resolvedB.velocity).to.deep.equal(sphereA.velocity);
    });

    test("can bounce sphere of sphere on 45 degrees angle", function() {
        const sphereA = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(1, 1, 0) as Vec<MetersPerSecond>),
        );
        const sphereB = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withVelocity(vec(0, 0, 0) as Vec<MetersPerSecond>),
        );
        const spherePartA = sphereA.parts[0] as BodyPart<Sphere>;
        const spherePartB = sphereB.parts[0] as BodyPart<Sphere>;

        const resolvedA = sphereBounceOfSphere(sphereA, spherePartA, sphereB, spherePartB);
        const resolvedB = sphereBounceOfSphere(sphereB, spherePartB, sphereA, spherePartA);

        expect(resolvedA.velocity).to.deep.equal(vec(0, 1, 0) as Vec<MetersPerSecond>);
        expect(resolvedB.velocity).to.deep.equal(vec(1, 0, 0) as Vec<MetersPerSecond>);
    });

    test("can bounce sphere of horizontal static triangle going orthogonally to it", function() {
        const sphere = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(1, 0.5, 1) as Vec<Meters>),
            withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>),
        );
        const staticTriangle = pipe(
            givenBody(),
            triangleShaped(
                vec(0, 0, 0) as Vec<Meters>,
                vec(0, 0, 4) as Vec<Meters>,
                vec(3, 0, 0) as Vec<Meters>,
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const spherePart = sphere.parts[0] as BodyPart<Sphere>;
        const trianglePart = staticTriangle.parts[0] as BodyPart<Triangle>;

        const resolvedSphere = sphereBounceOfStaticTriangle(sphere, spherePart, staticTriangle, trianglePart);

        expect(resolvedSphere.velocity).to.deep.equal(vec(0, 1, 0) as Vec<MetersPerSecond>);
    });

    test("can bounce sphere of horizontal static triangle going diagonaly to it", function() {
        const sphere = pipe(
            givenBody(),
            sphereShaped(0.5 as Meters),
            atPosition(vec(1, 0.5, 1) as Vec<Meters>),
            withVelocity(vec(1, -1, 1) as Vec<MetersPerSecond>),
        );
        const staticTriangle = pipe(
            givenBody(),
            triangleShaped(
                vec(0, 0, 0) as Vec<Meters>,
                vec(0, 0, 4) as Vec<Meters>,
                vec(3, 0, 0) as Vec<Meters>,
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const spherePart = sphere.parts[0] as BodyPart<Sphere>;
        const trianglePart = staticTriangle.parts[0] as BodyPart<Triangle>;

        const resolvedSphere = sphereBounceOfStaticTriangle(sphere, spherePart, staticTriangle, trianglePart);

        expect(resolvedSphere.velocity).to.deep.equal(vec(1, 1, 1) as Vec<MetersPerSecond>);
    });

    test("can bounce circle of horizontal static segment going orthogonally to it", function() {
        const circle = pipe(
            givenBody(),
            circleShaped(1 as Meters),
            atPosition(vec(0, 0, 1) as Vec<Meters>),
            withVelocity(vec(1, 0, -1) as Vec<MetersPerSecond>),
        );
        const staticSegment = pipe(
            givenBody(),
            segmentShaped(
                vec(0, 0, 0) as Vec<Meters>,
                vec(2, 0, 0) as Vec<Meters>,
            ),
            atPosition(vec(-1, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const circlePart = circle.parts[0] as BodyPart<Circle>;
        const segmentPart = staticSegment.parts[0] as BodyPart<Segment>;
        const collision: BodyCollision = {
            contactPoints: [vec(0, 0, -1) as Vec<Meters>, vec(1, 0, 0) as Vec<Meters>],
            betweenBodyParts: [0, 0],
            timeToImpact: 0 as Seconds
        };

        const resolvedCircle = circleBounceOfStaticSegment(circle, circlePart, staticSegment, segmentPart, collision);

        expect(resolvedCircle.velocity).to.deep.equal(vec(1, 0, 1) as Vec<MetersPerSecond>);
    });

    test("can bounce circle of horizontal static segment going orthogonally to it", function() {
        const circle = pipe(
            givenBody(),
            circleShaped(1 as Meters),
            atPosition(vec(10, 0, 1) as Vec<Meters>),
            withVelocity(vec(-1, 0, -1) as Vec<MetersPerSecond>),
        );
        const staticSegment = pipe(
            givenBody(),
            segmentShaped(
                vec(0, 0, 0) as Vec<Meters>,
                vec(20, 0, 0) as Vec<Meters>,
            ),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const circlePart = circle.parts[0] as BodyPart<Circle>;
        const segmentPart = staticSegment.parts[0] as BodyPart<Segment>;
        const collision: BodyCollision = {
            contactPoints: [vec(0, 0, -1) as Vec<Meters>, vec(10, 0, 0) as Vec<Meters>],
            betweenBodyParts: [0, 0],
            timeToImpact: 0 as Seconds
        };

        const resolvedCircle = circleBounceOfStaticSegment(circle, circlePart, staticSegment, segmentPart, collision);

        expect(resolvedCircle.velocity).to.deep.equal(vec(-1, 0, 1) as Vec<MetersPerSecond>);
    });

    test("can bounce circle of horizontal static segment going perpediculary to it from top", function() {
        const circle = pipe(
            givenBody(),
            circleShaped(1 as Meters),
            atPosition(vec(0, 0, 1) as Vec<Meters>),
            withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>),
        );
        const staticSegment = pipe(
            givenBody(),
            segmentShaped(
                vec(0, 0, 0) as Vec<Meters>,
                vec(2, 0, 0) as Vec<Meters>,
            ),
            atPosition(vec(-1, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const circlePart = circle.parts[0] as BodyPart<Circle>;
        const segmentPart = staticSegment.parts[0] as BodyPart<Segment>;
        const collision: BodyCollision = {
            contactPoints: [vec(0, 0, -1) as Vec<Meters>, vec(1, 0, 0) as Vec<Meters>],
            betweenBodyParts: [0, 0],
            timeToImpact: 0 as Seconds
        };

        const resolvedCircle = circleBounceOfStaticSegment(circle, circlePart, staticSegment, segmentPart, collision);

        expect(resolvedCircle.velocity).to.deep.equal(vec(0, 0, 1) as Vec<MetersPerSecond>);
    });

    test("can bounce circle of horizontal static segment going perpediculary to it from bottom", function() {
        const circle = pipe(
            givenBody(),
            circleShaped(1 as Meters),
            atPosition(vec(0, 0, -1) as Vec<Meters>),
            withVelocity(vec(0, 0, 1) as Vec<MetersPerSecond>),
        );
        const staticSegment = pipe(
            givenBody(),
            segmentShaped(
                vec(0, 0, 0) as Vec<Meters>,
                vec(-2, 0, 0) as Vec<Meters>,
            ),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withZeroVelocity
        );
        const circlePart = circle.parts[0] as BodyPart<Circle>;
        const segmentPart = staticSegment.parts[0] as BodyPart<Segment>;
        const collision: BodyCollision = {
            contactPoints: [vec(0, 0, 1) as Vec<Meters>, vec(-1, 0, 0) as Vec<Meters>],
            betweenBodyParts: [0, 0],
            timeToImpact: 0 as Seconds
        };

        const resolvedCircle = circleBounceOfStaticSegment(circle, circlePart, staticSegment, segmentPart, collision);

        expect(resolvedCircle.velocity).to.deep.equal(vec(0, 0, -1) as Vec<MetersPerSecond>);
    });
});
