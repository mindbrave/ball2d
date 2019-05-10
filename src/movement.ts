import { evolve } from "ramda";
import { Scalar } from "uom-ts";

import { Vec } from "./gamda/vectors";
import { orderToGoIntoDirection, orderToNotMove, updateBodyMovingBehavior, WithBehavior } from "./gamda/movingBehavior";
import { Seconds } from "./gamda/physics/units";
import { GameEvents } from "./gamda/game";
import { updateEntity, mapEntitiesWithTrait, Entity, Entities } from "./gamda/entities";
import { Soccer } from "./soccer";

/**
 * 
 * Relative direction means forward, back, left and right.
 */
export const orderCharacterToMoveInDirection = (relativeDirection: Vec<Scalar>) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity<Entity<WithBehavior>>(
        game.selectedCharacterId,
        evolve({movementBehavior: orderToGoIntoDirection(relativeDirection)}),
        game.entities
    ),
}, []];

export const orderCharacterToStop = (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity<Entity<WithBehavior>>(game.selectedCharacterId, evolve({movementBehavior: orderToNotMove}), game.entities),
}, []];

export const updateMovingBehavior = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => ([
    {...game, entities: updateEntitiesMovingBehavior(delta, game.entities)},
    []
]);

const updateEntitiesMovingBehavior = (delta: Seconds, entities: Entities) => mapEntitiesWithTrait('withBehavior', (entity: Entity<WithBehavior>) => ({
    ...entity,
    body: updateBodyMovingBehavior(delta, entity.movementBehavior, entity.body)
}))(entities);
