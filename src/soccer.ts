
import { Map, Set } from "immutable";
import { append } from "ramda";

import { Entities, EntityId, Entity, storeEntity, EntityAdded, ENTITY_ADDED } from "./gamda/entities";
import { createView, View } from "./view";
import { Seconds, MetersPerSquaredSecond } from "./gamda/physics/units";
import { GameEvents, pipeWithEvents, GameEvent } from "./gamda/game";
import { updateMovingBehavior } from "./movement";
import { updatePhysics } from "./physics";
import { Character, CHARACTER_SELECTED } from "./character";

export type Soccer = Readonly<{
    selectedCharacterId: EntityId;
    gravity: MetersPerSquaredSecond;
    entities: Entities;
    view: View;
}>;

export const selectCharacter = (character: Character, game: Soccer): [Soccer, GameEvents] => ([{
    ...game,
    selectedCharacterId: character.id!,
}, [{type: CHARACTER_SELECTED, characterId: character.id!} as GameEvent]])

export const initialGameState = () => ({
    selectedCharacterId: 0 as EntityId,
    gravity: 10 as MetersPerSquaredSecond,
    entities: {
        map: Map<EntityId, Entity>(),
        lastEntityId: 0 as EntityId,
        byTrait: {
            "physical": Set<EntityId>(),
            "withBehavior": Set<EntityId>(),
            "canJump": Set<EntityId>(),
        },
    },
    view: createView(),
});

export const updateGame = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => pipeWithEvents(
    game,
    updateMovingBehavior(delta),
    updatePhysics(delta)
);

export const addEntities = (entitiesToAdd: Entity<unknown>[]) => (game: Soccer): [Soccer, EntityAdded[]] => {
    return entitiesToAdd.reduce(([game, events]: [Soccer, EntityAdded[]], entity: Entity<unknown>): [Soccer, EntityAdded[]] => {
        let entities = storeEntity(entity)(game.entities);
        return [{...game, entities}, append<EntityAdded>({type: ENTITY_ADDED, entityId: entities.lastEntityId}, events)];
    }, [game, []])
};
