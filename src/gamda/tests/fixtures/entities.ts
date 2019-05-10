import { Entity, Entities, EntityKind, EntityId } from "../../entities";
import { Body } from "../../physics/body";
import { Map, Set } from "immutable";
import { append, defaultTo } from "ramda";
import { Physical, OnCollision, alwaysCollide, doesntCollide, doesntOverlap, bounce } from "../../entitiesPhysics";
import { givenBody } from "./body";

export const emptyEntities = (): Entities => ({
    map: Map([]),
    lastEntityId: 0 as EntityId,
    byTrait: {
        "physical": Set<EntityId>(),
        "withBehavior": Set<EntityId>(),
    },
});

export const givenEntity = (type: EntityKind): Entity => ({
    id: null,
    type,
    traits: []
});

export const thatIsPhysical = <T>(entity: Entity<T>): Entity<T & Physical> => ({
    ...entity,
    body: givenBody(),
    contactBehaviors: Map([]),
    traits: append('physical', entity.traits)
});

export const withBody = (fn: (body: Body) => Body) => <T extends Entity<Physical>>(entity: T): T => ({
    ...entity,
    body: fn(entity.body),
});

export const thatCollidesWithEntities = (entityKind: EntityKind) => <T extends Entity<Physical>>(entity: T): T => {
    const contactBehavior = defaultTo({
        onCollision: [],
        doesCollide: doesntCollide,
        onOverlap: [],
        doesOverlap: doesntOverlap,
    }, entity.contactBehaviors.get(entityKind));
    return {
        ...entity,
        contactBehaviors: entity.contactBehaviors.set(entityKind, {
            ...contactBehavior,
            doesCollide: alwaysCollide,
        }),
    };
};

export const thatDoesNotCollideWithEntities = (_: EntityKind) => <T extends Entity<Physical>>(entity: T): T => entity;

export const thatOnCollisionWithEntity = (entityKind: EntityKind, whatToDo: OnCollision) => <T extends Physical>(entity: Entity<T>): Entity<T> => {
    const contactBehavior = defaultTo({
        onCollision: [],
        doesCollide: doesntCollide,
        onOverlap: [],
        doesOverlap: doesntOverlap,
    }, entity.contactBehaviors.get(entityKind));
    return {
        ...entity,
        contactBehaviors: entity.contactBehaviors.set(entityKind, {
            ...contactBehavior,
            onCollision: append(whatToDo, contactBehavior.onCollision),
        }),
    };
};
