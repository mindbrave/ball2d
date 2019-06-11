import { evolve } from "ramda";
import { Scalar } from "uom-ts";

import { Vec } from "./gamda/vectors";
import { orderToGoIntoDirection, orderToNotMove, updateBodyMovingBehavior, WithBehavior, orderToGoToPosition } from "./gamda/movingBehavior";
import { Seconds, Meters } from "./gamda/physics/units";
import { GameEvents } from "./gamda/game";
import { updateEntity, mapEntitiesWithTrait, Entity, Entities } from "./gamda/entities";
import { Soccer } from "./soccer";

/**
 * Relative direction means forward, back, left and right.
 */
export const orderCharacterToMoveInDirection = (relativeDirection: Vec<Scalar>) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity(
        game.selectedCharacterId!,
        evolve({movementBehavior: orderToGoIntoDirection(relativeDirection)}),
        game.entities
    ),
}, []];

export const orderCharacterToMoveToPosition = (destination: Vec<Meters>) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity(
        game.selectedCharacterId!,
        evolve({movementBehavior: orderToGoToPosition(destination)}),
        game.entities
    ),
}, []];

export const stopCharacter = evolve({movementBehavior: orderToNotMove});

export const orderCharacterToStop = (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity(game.selectedCharacterId!, stopCharacter, game.entities),
}, []];

export const updateMovingBehavior = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => ([
    {...game, entities: updateEntitiesMovingBehavior(delta, game.entities)},
    []
]);

const updateEntitiesMovingBehavior = (delta: Seconds, entities: Entities) => mapEntitiesWithTrait('withBehavior', <T extends Entity<WithBehavior>>(entity: T): T => {
    const [body, movementBehavior] = updateBodyMovingBehavior(delta, entity.movementBehavior, entity.body);
    return {
        ...entity,
        body,
        movementBehavior
    };
})(entities);
