import { Soccer } from "./soccer";
import { GameEvents } from "./gamda/game";
import { getEntity, setManyEntities, Entity, Entities, filterEntities } from "./gamda/entities";
import { Character } from "./character";
import { evolve } from "ramda";
import { Physical, isEntityInRange } from "./gamda/entitiesPhysics";
import { Ball } from "./ball";
import { Meters, MetersPerSecond } from "./gamda/physics/units";
import { applyImpulse } from "./gamda/physics/motion";
import { subtractVectors, scaleVector, Vec, normalizeVector } from "./gamda/vectors";
import { Scalar } from "uom-ts";

const KICK_RANGE = 2.5 as Meters;
const KICK_FORCE = 5.0 as MetersPerSecond;

export const kickBallWithSelectedCharacter = (game: Soccer): [Soccer, GameEvents] => {
    const character = getEntity(game.selectedCharacterId!, game.entities) as Character;
    const ball = nearestBall(character, game.entities);
    if (isEntityInRange(KICK_RANGE, ball, character)) {
        return [{
            ...game, entities: setManyEntities(kickBallByCharacter(character, ball), game.entities),
        }, []];
    }
    return [game, []];
};

const isBall = (entity: Entity): entity is Ball => entity.type === 'ball';

const nearestBall = (_: Entity<Physical>, entities: Entities): Ball => filterEntities(isBall, entities)[0];

const kickBall = (direction: Vec<Scalar>, ball: Ball): Ball => evolve({
    body: applyImpulse(scaleVector(KICK_FORCE, direction))
}, ball);

const kickBallByCharacter = (character: Character, ball: Ball): [Character, Ball] => [
    character,
    kickBall(normalizeVector(subtractVectors(ball.body.position, character.body.position)), ball)
];

