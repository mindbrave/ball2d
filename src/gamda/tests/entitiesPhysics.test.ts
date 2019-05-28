
import { pipe as pipeInline } from "remeda";
import { pipe } from "ramda";
import { expect } from "chai";
import * as sinon from "sinon";

import { vec, Vec, zeroVector } from "../vectors";
import { entitiesList, Entity, storeEntity, EntityId } from "../entities";
import { thatIsPhysical, givenEntity, thatOnCollisionWithEntity, emptyEntities, withBody, thatCollidesWithEntities, thatDoesNotCollideWithEntities } from "./fixtures/entities";
import { Physical, bounce, moveEntitiesWithCollisions, block, OnCollision, bounceAgainstStatic } from "../entitiesPhysics";
import { sphereShaped, atPosition, withVelocity, segmentShaped, withZeroVelocity, circleShaped } from "./fixtures/body";
import { Meters, MetersPerSecond, Seconds } from "../physics/units";

/** 
    TODO cases.

    apply collision effects if collides - DONE
    if one entity collides with other type, but other type doesnt, then dont collide them - DONE
    does overlap, check if effect is applied
    if doesnt overlap, dont apply overlap effects
    case with high speed and two overlaping entities
    case with highspeed and collide and overlap that wont occur because of collision
    if collides, never apply overlap effects
    if doesnt collide but overlaps, apply overlap effect, and no collide
    few collision effects should stack (dont apply just last one)
    few overlap effects should stack (dont apply just last one)
    test if events are all returned
**/

describe("test collision effects applying", () => {
    test("if entities are setup to not collide with each other, than dont apply collision effects", () => {
        const entityA = pipeInline(
            givenEntity('test'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatDoesNotCollideWithEntities('test'),
            thatOnCollisionWithEntity('test', block)
        );
        const entityB = pipeInline(
            givenEntity('test'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(2, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatDoesNotCollideWithEntities('test'),
            thatOnCollisionWithEntity('test', block)
        );

        const [entities, _] = moveEntitiesWithCollisions(
            0.51 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(entityA),  storeEntity(entityB))
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.be.deep.equal(entityA.body.velocity);
        expect(resolvedBallB.body.velocity).to.be.deep.equal(entityB.body.velocity);
    });

    test("if entities collides with themselves then collision effects should be applied on them", () => {
        const entityA = pipeInline(
            givenEntity('test'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatCollidesWithEntities('test'),
            thatOnCollisionWithEntity('test', block)
        );
        const entityB = pipeInline(
            givenEntity('test'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(2, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatCollidesWithEntities('test'),
            thatOnCollisionWithEntity('test', block)
        );

        const [entities, _] = moveEntitiesWithCollisions(
            0.51 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(entityA),  storeEntity(entityB))
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.be.deep.equal(zeroVector);
        expect(resolvedBallB.body.velocity).to.be.deep.equal(zeroVector);
    });

    test("if two entities are going to collide but only one is setup to collide with it, then don't apply collision effects (case with explicit behavior - dont collide)", () => {
        const entityA = pipeInline(
            givenEntity('test1'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatCollidesWithEntities('test2'),
            thatOnCollisionWithEntity('test2', block)
        );
        const entityB = pipeInline(
            givenEntity('test2'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(2, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatDoesNotCollideWithEntities('test1'),
            thatOnCollisionWithEntity('test1', block)
        );

        const [entities, _] = moveEntitiesWithCollisions(
            0.51 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(entityA),  storeEntity(entityB))
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.be.deep.equal(entityA.body.velocity);
        expect(resolvedBallB.body.velocity).to.be.deep.equal(entityB.body.velocity);
    });

    test("if two entities are going to collide but only one is setup to collide with it, then don't apply collision effects (case with no behavior specified)", () => {
        const entityA = pipeInline(
            givenEntity('test1'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
            thatCollidesWithEntities('test2'),
            thatOnCollisionWithEntity('test2', block)
        );
        const entityB = pipeInline(
            givenEntity('test2'),
            thatIsPhysical,
            withBody(pipe(
                sphereShaped(0.5 as Meters),
                atPosition(vec(2, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            ))
        );

        const [entities, _] = moveEntitiesWithCollisions(
            0.51 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(entityA),  storeEntity(entityB))
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.be.deep.equal(entityA.body.velocity);
        expect(resolvedBallB.body.velocity).to.be.deep.equal(entityB.body.velocity);
    });
});

const expectCollisionEffect = (onCollision: OnCollision) => sinon.fake(onCollision);

describe("test moving, bouncing entities with collisions", () => {
    test("two entities should bounce off each other if they come at themselves", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(10, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            4.51 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB)),
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballB.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballA.body.velocity);
    });

    test("two entities with the same speed going into each other will not collide if period is too short", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(10, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            4.5 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB)),
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballA.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballB.body.velocity);
    });

    test("two entities with different speed going into each other will collide", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(2, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(10, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            3.01 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB))
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballB.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballA.body.velocity);
    });

    test("two entities will collide when speed is much bigger than distance per time period", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(100, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(10, 0, 0) as Vec<Meters>),
                withVelocity(vec(-100, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            3.01 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB))
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballB.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballA.body.velocity);
    });

    test("three entities moving in the same direction, won't collide", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(1, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballC = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(2, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            5.00 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB),  storeEntity(ballC))
        );

        const [resolvedBallA, resolvedBallB, resolvedBallC] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballA.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballB.body.velocity);
        expect(resolvedBallC.body.velocity).to.deep.equal(ballC.body.velocity);
    });

    test("entity hitting slower entity from behind", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(2, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(2, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            1.01 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB)),
        );

        const [resolvedBallA, resolvedBallB] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballB.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballA.body.velocity);
    });

    test("three entities should bounce of each other, but middle should stay in place", () => {
        const ballA = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballB = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(5, 0, 0) as Vec<Meters>),
                withVelocity(vec(0, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const ballC = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(10, 0, 0) as Vec<Meters>),
                withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            4.01 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ballA),  storeEntity(ballB),  storeEntity(ballC))
        );

        const [resolvedBallA, resolvedBallB, resolvedBallC] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBallA.body.velocity).to.deep.equal(ballC.body.velocity);
        expect(resolvedBallB.body.velocity).to.deep.equal(ballB.body.velocity);
        expect(resolvedBallC.body.velocity).to.deep.equal(ballA.body.velocity);
    });

    test("ball hitting wall should bounce", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 1) as Vec<Meters>),
                withVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(-1, 0, 0) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(2, 0, 0) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            1.00 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBall.body.velocity).to.deep.equal(vec(0, 0, 1) as Vec<MetersPerSecond>);
        expect(resolvedBall.body.position).to.deep.equal(ball.body.position);
    });

    test("slow ball hitting wall should bounce", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(0, 0, 1) as Vec<Meters>),
                withVelocity(vec(0, 0, -0.51) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(-1, 0, 0) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(2, 0, 0) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        const [entities, _] = moveEntitiesWithCollisions(
            1.00 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBall.body.velocity).to.deep.equal(vec(0, 0, 0.51) as Vec<MetersPerSecond>);
    });

    test("ball moving ortogonally hitting wall should bounce", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                atPosition(vec(-1, 0, 1) as Vec<Meters>),
                withVelocity(vec(1, 0, -1) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(-100, 0, 0) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(200, 0, 0) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        let [entities, _] = moveEntitiesWithCollisions(
            0.60 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBall.body.velocity).to.deep.equal(vec(1, 0, 1) as Vec<MetersPerSecond>);
    });

    test("ball with different radius moving vertically hitting wall should bounce", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                sphereShaped(0.8 as Meters),
                atPosition(vec(1, 0, 10) as Vec<Meters>),
                withVelocity(vec(0, 0, -10) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(-100, 0, 0) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(200, 0, 0) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        let [entities, _] = moveEntitiesWithCollisions(
            1.0 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBall.body.velocity).to.deep.equal(vec(0, 0, 10) as Vec<MetersPerSecond>);
    });

    test("ball should bounce of segment corner", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                circleShaped(0.8 as Meters),
                atPosition(vec(-1, 0, 0) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(0.1, 0, 0) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(1, 0, 0) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        let [entities, _] = moveEntitiesWithCollisions(
            1.0 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];
        expect(resolvedBall.body.velocity).to.deep.equal(vec(-1, 0, 0) as Vec<MetersPerSecond>);
    });

    test("ball should bounce of segment corner 2", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                circleShaped(0.8 as Meters),
                atPosition(vec(-7.2, 0, -6.1) as Vec<Meters>),
                withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(-6, 0, -6) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(0, 0, 12) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        let [entities, _] = moveEntitiesWithCollisions(
            0.2 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );
        [entities, _] = moveEntitiesWithCollisions(
            0.2 as Seconds,
            [],
            entities,
        );
        [entities, _] = moveEntitiesWithCollisions(
            0.2 as Seconds,
            [],
            entities,
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];

        expect(resolvedBall.body.velocity).to.not.deep.equal(vec(1, 0, 0) as Vec<MetersPerSecond>);
    });

    test("ball should bounce of segment corner 3", () => {
        const ball = pipeInline(
            givenBall(),
            withBody(pipe(
                circleShaped(0.8 as Meters),
                atPosition(vec(-7.2, 0, -7.0) as Vec<Meters>),
                withVelocity(vec(1, 0, 1) as Vec<MetersPerSecond>)
            )),
        );
        const wall = pipeInline(
            givenWall(),
            withBody(pipe(
                atPosition(vec(-6, 0, -6) as Vec<Meters>),
                segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(0, 0, 12) as Vec<Meters>),
                withZeroVelocity
            )),
        );

        let [entities, _] = moveEntitiesWithCollisions(
            0.5 as Seconds,
            [],
            pipeInline(emptyEntities(), storeEntity(ball),  storeEntity(wall)),
        );
        [entities, _] = moveEntitiesWithCollisions(
            0.1 as Seconds,
            [],
            entities,
        );

        const [resolvedBall, resolvedWall] = entitiesList(entities) as Entity<Physical>[];

        expect(resolvedBall.body.velocity).to.not.deep.equal(vec(1, 0, 1) as Vec<MetersPerSecond>);
    });
});

const givenBall = (): Entity<Physical> => pipeInline(
    givenEntity('ball'),
    thatIsPhysical,
    withBody(sphereShaped(0.5 as Meters)),
    thatCollidesWithEntities('ball'),
    thatCollidesWithEntities('wall'),
    thatOnCollisionWithEntity('ball', bounce),
    thatOnCollisionWithEntity('wall', bounceAgainstStatic)
);

const givenWall = (): Entity<Physical> => pipeInline(
    givenEntity('wall'),
    thatIsPhysical,
    withBody(segmentShaped(vec(0, 0, 0) as Vec<Meters>, vec(1, 0, 0) as Vec<Meters>)),
    thatCollidesWithEntities('ball'),
);
