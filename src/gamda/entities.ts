
import { Map, Set } from "immutable";
import { defaultTo, isNil } from "ramda";

import { GameEvent } from "./game";
import { Maybe } from "./maybe";

export type EntityId = number & {__brand: "EntityId"};
export type EntityKind = string;

export type Entity<T = unknown> = {
    id: EntityId | null;
    type: string,
    traits: string[],
} & T;

type ByTraitMap = {[trait:string]: Set<EntityId>};

export type Entities = {
    map: Map<EntityId, Entity>;
    byTrait: ByTraitMap,
    lastEntityId: EntityId;
};

export const isEntityStored = (entity: Entity): boolean => !isNil(entity.id);

export const storeEntity = <T extends Entity>(entity: T) => (entities: Entities): Entities => {
    let entityToStore: Entity;
    if (!isEntityStored(entity)) {
        entities = nextEntityId(entities);
        entityToStore = {...entity, id: entities.lastEntityId} as Entity;
    } else {
        entityToStore = entity;
    }
    return {
        ...entities,
        map: entities.map.set(entityToStore.id!, entityToStore),
        byTrait: storeEntityToTraitMap(entityToStore, entities.byTrait)
    };
};
    

const storeEntityToTraitMap = (entity: Entity, byTrait: ByTraitMap): ByTraitMap => entity.traits.reduce((byTrait: ByTraitMap, trait: string) => ({
    ...byTrait,
    [trait]: byTrait[trait].add(entity.id!)
}), byTrait);

export const ENTITY_ADDED = "EntityAdded";

export interface EntityAdded extends GameEvent {
    type: "EntityAdded";
    entityId: EntityId;
}

export const entitiesList = (entities: Entities): Entity<unknown>[] => entities.map.valueSeq().toArray();
export const getEntity = (entityId: EntityId, entities: Entities): Maybe<Entity<unknown>> => defaultTo(null, entities.map.get(entityId));
export const setEntity = <T extends Entity>(entity: T, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.set(entity.id!, entity)
});
export const setManyEntities = (entitiesList: Entity<unknown>[], entities: Entities): Entities => (
    entitiesList.reduce((entities, entity) => setEntity(entity, entities), entities)
);
export const updateEntity = (entityId: EntityId, updater: (entity: Entity<any>) => Entity<any>, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.update(entityId, updater)
});

export const filterEntities = <T extends Entity>(filterFn: (entity: Entity) => entity is T, entities: Entities): T[] => (
    entities.map.filter(filterFn).valueSeq().toArray()
);

export const mapEntitiesWithTrait = (trait: string, mapFunction: (entity: Entity<any>) => Entity<any>) => (entities: Entities): Entities => (
    entities.byTrait[trait].reduce((entities: Entities, entityId: EntityId) => updateEntity(entityId, mapFunction, entities), entities)
);

export const nextEntityId = (entities: Entities): Entities => ({
    ...entities,
    lastEntityId: (entities.lastEntityId + 1) as EntityId
});
