
import { isEmpty, head, sortBy, isNil, curry, evolve, concat, map } from "ramda";

import { EntityKind, Entity, Entities, setEntity, mapEntitiesWithTrait, updateEntity, entitiesList, setManyEntities, EntityId, getEntity } from "./entities";
import { Map } from "immutable";
import { sphereBounceOfSphere, sphereBounceOfStaticTriangle } from "./physics/collisions/resolve";
import { Seconds, MetersPerSquaredSecond, Meters } from "./physics/units";
import { Body, isSphere, isTriangle } from "./physics/body";
import { Maybe } from "./maybe";
import { sub, lte, pow2 } from "uom-ts";
import { move, applyDampening, setZeroVelocity, applyGravity } from "./physics/motion";
import { GameEvents, pipeWithEvents } from "./game";
import { collisionBetweenBodies } from "./physics/collisions/detection";
import { BodyCollision } from "./physics/collisions/collision";
import { subtractVectors, vectorSqrMagnitude } from "./vectors";

export type EntityContactEffect<T extends Entity = Entity> = (entity: T) => T;

export type DoesCollide = (entityA: Entity<Physical>, entityB: Entity<Physical>) => boolean;
export type DoesOverlap = DoesCollide;

export type OnCollision = (collision: EntitiesCollision, entityA: Entity<Physical>, entityB: Entity<Physical>, entities: Entities) => [Entities, GameEvents];
export type OnOverlap = OnCollision;

export type ContactBehavior = {
    doesCollide: DoesCollide,
    onCollision: OnCollision[],
    doesOverlap: DoesOverlap,
    onOverlap: OnOverlap[],
};

export interface EntitiesCollision {
    bodyCollision: BodyCollision;
    betweenEntities: [EntityId, EntityId],
}

export type Physical = {
    body: Body,
    contactBehaviors: Map<EntityKind, ContactBehavior>,
};

export const isEntityInRange = (range: Meters, entity1: Entity<Physical>, entity2: Entity<Physical>): boolean => (
    lte(vectorSqrMagnitude(subtractVectors(entity2.body.position, entity1.body.position)), pow2(range))
);

export const doesntCollide = (_: Entity<Physical>, __: Entity<Physical>): boolean => false;
export const alwaysCollide = (_: Entity<Physical>, __: Entity<Physical>): boolean => true;
export const doesntOverlap = doesntCollide;
export const alwaysOverlap = alwaysCollide;

export const moveEntitiesWithCollisions = curry((duration: Seconds, events: GameEvents, entities: Entities): [Entities, GameEvents] => {
    const [movedEntitiesList, collision] = moveUntilFirstCollision(duration, entitiesList(entities) as Entity<Physical>[]);
    const movedEntities = setManyEntities(movedEntitiesList, entities);
    if (isNil(collision)) {
        return [movedEntities, events];
    }
    const [entity1id, entity2id] = collision.betweenEntities;
    const entity1 = getEntity(entity1id, movedEntities) as Entity<Physical>;
    const entity2 = getEntity(entity2id, movedEntities) as Entity<Physical>;
    const [entitiesAfterCollision, eventsAfterCollision] = pipeWithEvents(
        movedEntities,
        applyContactEffectsAgainstEntity(entity1, entity2, collision),
        applyContactEffectsAgainstEntity(entity2, entity1, collision)
    );

    return moveEntitiesWithCollisions(sub(duration, collision.bodyCollision.timeToImpact), concat(events, eventsAfterCollision), entitiesAfterCollision);
});

export const moveUntilFirstCollision = (duration: Seconds, entities: Entity<Physical>[]): [Entity<Physical>[], Maybe<EntitiesCollision>] => {
    const incomingCollisions = findIncomingCollisions(duration, entities);
    if (isEmpty(incomingCollisions)) {
        return [map(evolve({body: move(duration)}), entities), null];
    }
    const earliestCollision = head(sortBy((collision: EntitiesCollision): Seconds => collision.bodyCollision.timeToImpact, incomingCollisions))!;
    let movedEntities = map<Entity<Physical>, Entity<Physical>>(evolve({body: move(earliestCollision.bodyCollision.timeToImpact)}), entities);
    return [movedEntities, earliestCollision];
};

/*  This function is made in imperative way because there were big performance problem with declarative approach.
    Declarative version:

    everyDistinctPairInArray(entities).filter(([entityA, entityB]) => canEntitiesCollide(entityA, entityB)).map(([entityA, entityB]) => ({
        timeToImpact: timeTillCollisionBetweenBodies(entityA.body, entityB.body, duration),
        between: [entityA.id, entityB.id],
    })).filter(isNoCollision)
*/
const findIncomingCollisions = (duration: Seconds, entities: Entity<Physical>[]): EntitiesCollision[] => {
    const foundCollisions: EntitiesCollision[] = [];
    let i = 0, k, entityA, entityB, bodyCollision: Maybe<BodyCollision>;
    for (i; i < entities.length; i+=1) {
        for (k = i + 1; k < entities.length; k+=1) {
            entityA = entities[i];
            entityB = entities[k];
            if (!canEntitiesCollide(entityA, entityB)) {
                continue;
            }
            bodyCollision = collisionBetweenBodies(entityA.body, entityB.body, duration);
            if (bodyCollision === null) {
                continue;
            }
            foundCollisions.push({
                bodyCollision,
                betweenEntities: [entityA.id!, entityB.id!], 
            });
        }
    }
    return foundCollisions;
};

const canEntitiesCollide = (entityA: Entity<Physical>, entityB: Entity<Physical>): boolean => {
    const contactBehaviorAvsB = entityA.contactBehaviors.get(entityB.type);
    const contactBehaviorBvsA = entityB.contactBehaviors.get(entityA.type);
    if (contactBehaviorAvsB === undefined || contactBehaviorBvsA === undefined) {
        return false;
    }
    return contactBehaviorAvsB.doesCollide(entityA, entityB) && contactBehaviorBvsA.doesCollide(entityB, entityA);
};

const applyContactEffectsAgainstEntity = (entity1: Entity<Physical>, entity2: Entity<Physical>, collision: EntitiesCollision) => (entities: Entities): [Entities, GameEvents] => {
    const contactBehaviorAgainstEntity2 = entity1.contactBehaviors.get(entity2.type);
    if (!isNil(contactBehaviorAgainstEntity2)) {
        return contactBehaviorAgainstEntity2.onCollision.reduce(
            ([entities, events]: [Entities, GameEvents], onCollision: OnCollision): [Entities, GameEvents] => {
                let [newEntities, newEvents] = onCollision(collision, entity1, entity2, entities);
                return [newEntities, concat(events, newEvents)];
            },
            [entities, []]
        );
    }
    return [entities, []];
};

export const block: OnCollision = (collision, entityA, entityB, entities) => (
    [updateEntity<Entity<Physical>>(entityA.id!, evolve({body: setZeroVelocity}), entities), []]
);

export const bounce: OnCollision = (collision, entityA, entityB, entities) => {
    const partA = entityA.body.parts[collision.bodyCollision.betweenBodyParts[0]];
    const partB = entityB.body.parts[collision.bodyCollision.betweenBodyParts[1]];
    entityA = isSphere(partA) ?
        (
            isSphere(partB) ? ({...entityA, body: sphereBounceOfSphere(entityA.body, partA, entityB.body, partB)}) :
            entityA
        ) : isTriangle(partA) ?
        (
            entityA
        )
        : entityA;
    return [setEntity(entityA, entities), []];
};

export const bounceAgainstStatic: OnCollision = (collision, entityA, entityB, entities) => {
    const partA = entityA.body.parts[collision.bodyCollision.betweenBodyParts[0]];
    const partB = entityB.body.parts[collision.bodyCollision.betweenBodyParts[1]];
    entityA = isSphere(partA) ?
        (
            isTriangle(partB) ? ({...entityA, body: sphereBounceOfStaticTriangle(entityA.body, partA, entityB.body, partB)}) :
            entityA
        ) : isTriangle(partA) ?
        (
            entityA
        )
        : entityA;
    return [setEntity(entityA, entities), []];
};

export const dampenEntitiesVelocity = (delta: Seconds) => (entities: Entities) => mapEntitiesWithTrait<Entity<Physical>>('physical', evolve({
    body: applyDampening(delta),
}))(entities);

export const applyGravityToEntities = (delta: Seconds, gravity: MetersPerSquaredSecond) => (entities: Entities) => mapEntitiesWithTrait<Entity<Physical>>('physical', evolve({
    body: applyGravity(delta, gravity),
}))(entities);
