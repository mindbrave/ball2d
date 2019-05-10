
import { pipe } from "remeda";

import { Seconds } from "./gamda/physics/units";
import { Soccer } from "./soccer";
import { GameEvents, pipeWithEvents } from "./gamda/game";
import { dampenEntitiesVelocity, moveEntitiesWithCollisions } from "./gamda/entitiesPhysics";

export const updatePhysics = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => {
    const [entities, events] = pipeWithEvents(
        pipe(game.entities, dampenEntitiesVelocity(delta)),
        moveEntitiesWithCollisions(delta, [])
    );
    return [{...game, entities}, events];
};
