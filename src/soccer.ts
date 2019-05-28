
import { append } from "ramda";
import assocPath from "ramda/es/assocPath";

import { Entities, EntityId, Entity, storeEntity, EntityAdded, ENTITY_ADDED, getEntity, setManyEntities, filterEntities } from "./gamda/entities";
import { View } from "./view";
import { Seconds, MetersPerSquaredSecond } from "./gamda/physics/units";
import { GameEvents, pipeWithEvents, GameEvent } from "./gamda/game";
import { updateMovingBehavior, stopCharacter } from "./movement";
import { updatePhysics } from "./physics";
import { Character, CHARACTER_SELECTED, isCharacter } from "./character";

export enum Team { A, B };

type Teams = {
    [team:number]: {
        [index:number]: EntityId
    }
};

export type Soccer = {
    selectedCharacterId: EntityId;
    playerTeam: Team,
    teams: Teams,
    gravity: MetersPerSquaredSecond;
    entities: Entities;
    view: View;
};

export const selectCharacter = (character: Character, game: Soccer): [Soccer, GameEvents] => ([stopCharacters({
    ...game,
    selectedCharacterId: character.id!,
}), [{type: CHARACTER_SELECTED, characterId: character.id!} as GameEvent]])

const stopCharacters = (game: Soccer): Soccer => ({
    ...game,
    entities: setManyEntities(filterEntities(isCharacter, game.entities).map(stopCharacter), game.entities),
});
const getPlayerCharacterByIndex = (index: number, game: Soccer): Character => (getEntity(game.teams[game.playerTeam][index], game.entities) as Character);

export const selectGivenCharacter = (characterIndex: number) => (game: Soccer): [Soccer, GameEvents] => (
    selectCharacter(getPlayerCharacterByIndex(characterIndex, game), game)
);

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

export const addCharacter = (character: Character) => (game: Soccer): [Soccer, EntityAdded[]] => {
    let entities = storeEntity(character)(game.entities);
    return [
        assocPath<EntityId, Soccer>(['teams', character.teamAssign.team, character.teamAssign.index], entities.lastEntityId, {...game, entities}),
        [{type: ENTITY_ADDED, entityId: entities.lastEntityId}]
    ]
};
