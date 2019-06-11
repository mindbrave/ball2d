
import { append } from "ramda";
import assocPath from "ramda/es/assocPath";

import { Entities, EntityId, storeEntity, EntityAdded, ENTITY_ADDED, getEntity, Entity, setEntity, updateEntity } from "./gamda/entities";
import { View } from "./view";
import { Seconds, MetersPerSquaredSecond } from "./gamda/physics/units";
import { GameEvents, pipeWithEvents, GameEvent } from "./gamda/game";
import { updateMovingBehavior } from "./movement";
import { updatePhysics } from "./physics";
import { Character, CHARACTER_SELECTED } from "./character";
import { orderToNotMove } from "./gamda/movingBehavior";

export enum Team { A, B };

type Teams = {
    [team:number]: {
        [index:number]: EntityId
    }
};

export type Soccer = {
    selectedCharacterId: EntityId | null;
    playerTeam: Team,
    teams: Teams,
    gravity: MetersPerSquaredSecond;
    entities: Entities;
    view: View;
};

export const selectCharacter = (character: Character, game: Soccer): [Soccer, GameEvents] => ([
    {
        ...game,
        entities: game.selectedCharacterId !== null ? updateEntity(game.selectedCharacterId, stopCharacterMovingInDirection, game.entities) : game.entities,
        selectedCharacterId: character.id!,
    },
    [{type: CHARACTER_SELECTED, characterId: character.id!} as GameEvent]]
);

const stopCharacterMovingInDirection = (character: Character): Character => (
    character.movementBehavior.type === "GoInDirection" ? ({...character, movementBehavior: orderToNotMove(character.movementBehavior)}) : character 
);

const getPlayerCharacterByIndex = (index: number, game: Soccer): Character => (getEntity(game.teams[game.playerTeam][index], game.entities) as Character);

export const selectGivenCharacter = (characterIndex: number) => (game: Soccer): [Soccer, GameEvents] => (
    selectCharacter(getPlayerCharacterByIndex(characterIndex, game), game)
);

export const updateGame = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => pipeWithEvents(
    game,
    updateMovingBehavior(delta),
    updatePhysics(delta)
);

export const addEntities = (entitiesToAdd: Entity[]) => (game: Soccer): [Soccer, EntityAdded[]] => {
    return entitiesToAdd.reduce(([game, events]: [Soccer, EntityAdded[]], entity: Entity): [Soccer, EntityAdded[]] => {
        let entities = storeEntity(entity)(game.entities);
        return [{...game, entities}, append<EntityAdded>({type: ENTITY_ADDED, entityId: entities.lastEntityId}, events)];
    }, [game, []])
};

export const addCharacter = (character: Character) => (game: Soccer): [Soccer, EntityAdded[]] => {
    let entities = storeEntity(character)(game.entities);
    return [
        assocPath<EntityId, Soccer>(['teams', character.teamAssign.team, character.teamAssign.index], entities.lastEntityId, {...game, entities}),
        [{type: ENTITY_ADDED, entityId: entities.lastEntityId}]
    ]
};
