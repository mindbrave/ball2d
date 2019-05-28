import { circleShaped, givenBody, atPosition, withZeroVelocity, withVelocity, segmentShaped } from "../../fixtures/body";
import { pipe } from "remeda";
import { expect } from "chai";
import { Meters, Seconds, MetersPerSecond } from "../../../physics/units";
import { vec, Vec } from "../../../vectors";
import { incomingCollisionBetweenCircleAndSegment } from "../../../physics/collisions/detection";
import { BodyPart } from "../../../physics/body";
import { Circle, Segment } from "../../../physics/shape";

test("circle is not going to collide against static segment because duration is too short", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: -1 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 1 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 0.49 as Seconds);

    expect(collision).to.be.null;
});

test("circle is not going to collide against static segment because velocity is not going toward it", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0.5 as Meters}),
        withVelocity(vec(0, 0, 1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 2 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: -1 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 1 as Seconds);

    expect(collision).to.be.null;
});

test("circle is going to collide against static horizontal segment", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 3 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.5 as Seconds, 0.00001);
});

test("circle is going to collide against static vertical segment", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 1 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: 3 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.5 as Seconds, 0.00001);
});

test("circle is going to collide against static segment on the corner", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0.75 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0.25 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 1 as Seconds);

    expect(collision).to.be.not.null;
});

test("circle is going to collide against static segment on the corner while segment is parallel to velocity", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: -1 as Meters}
        ),
        atPosition({x: 0.25 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 1 as Seconds);

    expect(collision).to.be.not.null;
});

test("circle is not going to collide against static segment on the corner while segment is parallel to velocity because duration is to short", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: -1 as Meters}
        ),
        atPosition({x: 0.25 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision).to.be.null;
});

test("circle is going to collide against static segment on the corner while segment is on line with velocity", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: -2 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 1 as Seconds);

    expect(collision).to.be.not.null;
});

test("circle is going to collide against static segment on the corner while segment is on line with velocity", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 0 as Meters, y: 0 as Meters, z: -2 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 1 as Seconds);

    expect(collision).to.be.not.null;
});

test("circle is going orthogonally to collide against static horizontal segment", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.5 as Meters),
        atPosition({x: -0.6 as Meters, y: 0 as Meters, z: 0.6 as Meters}),
        withVelocity(vec(1, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: -100 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 200 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 0.2 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.1 as Seconds, 0.00001);
});

test("circle is going to collide against static horizontal segment with different radius", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.8 as Meters),
        atPosition({x: 1 as Meters, y: 0 as Meters, z: 1 as Meters}),
        withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 3 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 0.51 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.2 as Seconds, 0.00001);
});

test("circle is going to collide against static horizontal segment with different radius", () => {
    const bodyA = pipe(
        givenBody(),
        circleShaped(0.8 as Meters),
        atPosition({x: 1 as Meters, y: 0 as Meters, z: 10 as Meters}),
        withVelocity(vec(0, 0, -10) as Vec<MetersPerSecond>)
    );
    const partA = bodyA.parts[0] as BodyPart<Circle>;
    const bodyB = pipe(
        givenBody(),
        segmentShaped(
            {x: 0 as Meters, y: 0 as Meters, z: 0 as Meters},
            {x: 3 as Meters, y: 0 as Meters, z: 0 as Meters}
        ),
        atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
        withZeroVelocity
    );
    const partB = bodyB.parts[0] as BodyPart<Segment>;

    const collision = incomingCollisionBetweenCircleAndSegment(bodyA, partA, bodyB, partB, 1.0 as Seconds);

    expect(collision!.timeToImpact).to.be.closeTo(0.92 as Seconds, 0.00001);
});