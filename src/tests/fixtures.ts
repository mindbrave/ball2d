import { Character } from "../character";
import { pipe, range } from "remeda";
import { assocPath, head, assoc, pipe as pipeRamda } from "ramda";
import { vec, Vec } from "../gamda/vectors";
import { MetersPerSecond, Meters, Seconds, MetersPerSquaredSecond, Kilograms } from "../gamda/physics/units";
import { createParallelogramWall, Wall } from "../wall";
import { Soccer, updateGame, addEntities } from "../soccer";
import { Entity, EntityId } from "../gamda/entities";
import { Map, Set } from "immutable";
import { TicksPerSecond, convertTicksRatioToPeriod } from "../gamda/ticks";
import { ShapeType } from "../gamda/physics/shape";
import { Scalar } from "uom-ts";
import { alwaysCollide, doesntOverlap, bounce, bounceAgainstStatic } from "../gamda/entitiesPhysics";

export const givenCharacter = (...givens: Array<(character: Character) => Character>): Character => ((pipe as any)(
    {
        id: null,
        type: 'character',
        traits: ['physical', 'withBehavior', 'canJump'],
        jumpImpulse: 12 as MetersPerSecond,
        body: {
            doesGravityAppliesToThisBody: true,
            position: vec(0, 0, 0) as Vec<Meters>,
            velocity: vec(0, 0, 0) as Vec<MetersPerSecond>,
            dampening: 0.0 as MetersPerSquaredSecond,
            parts: [
                {
                    shape: {
                        type: ShapeType.Sphere,
                        radius: 0.9 as Meters,
                    },
                    relativePosition: vec(0, 0, 0) as Vec<Meters>
                }
            ],
            elasticity: 1.0 as Scalar,
            mass: 1.0 as Kilograms,
        },
        contactBehaviors: Map({
            'character': {
                doesCollide: alwaysCollide,
                doesOverlap: doesntOverlap,
                onCollision: [bounce],
                onOverlap: []
            },
            'projectile': {
                doesCollide: alwaysCollide,
                onCollision: [bounce],
                doesOverlap: doesntOverlap,
                onOverlap: []
            },
            'wall': {
                doesCollide: alwaysCollide,
                doesOverlap: doesntOverlap,
                onCollision: [bounceAgainstStatic],
                onOverlap: []
            }
        }),
        movementBehavior: {
            acceleration: 30.0 as MetersPerSquaredSecond,
            maxVelocity: 15.0 as MetersPerSecond,
            direction: {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar},
        },
    },
    ...givens
));

export const atPosition = (position: Vec<Meters>) => (character: Character) => assocPath(["body", "position"], position, character);

export const withVelocity = (velocity: Vec<MetersPerSecond>) => (character: Character) => assocPath(["body", "velocity"], velocity, character);

export const withSphereShape = (radius: Meters) => (char: Character): Character => assocPath(["body", "parts"], [{
    shape: {
        type: ShapeType.Sphere,
        radius,
    },
    relativePosition: vec(0, 0, 0) as Vec<Meters>
}], char);

export const withNoDampening = (character: Character) => assocPath(["body", "dampening"], 0 as MetersPerSquaredSecond, character);
export const withElasticity = (elasticity: Scalar) => (character: Character) => assocPath(["body", "elasticity"], elasticity, character);

export const givenWall = pipeRamda(createParallelogramWall, (wall: Wall) => assocPath(['body', 'elasticity'], 1.0, wall));

export const givenGame = (...givens: Array<(game: Soccer) => Soccer>): Soccer => ((pipe as any)(
    {
        selectedCharacterId: 0 as EntityId,
        entities: {
            map: Map<EntityId, Entity>(),
            lastEntityId: 0 as EntityId,
            byTrait: {
                "physical": Set<EntityId>(),
                "withBehavior": Set<EntityId>(),
                "canJump": Set<EntityId>(),
            },
        },
        view: {},
    },
    ...givens
));

export const withEntities = (...entities: Entity[]) => (game: Soccer): Soccer => head(addEntities(entities)(game)) as Soccer;

export const withGravity = (gravity: MetersPerSquaredSecond) => assoc("gravity", gravity);

export const withNoGravity = withGravity(0 as MetersPerSquaredSecond);

export const simulate = (game: Soccer, duration: Seconds, tps: TicksPerSecond): Soccer => range(0, duration * tps).reduce((game: Soccer, i: number): Soccer => (
    head(updateGame(convertTicksRatioToPeriod(tps))(game)) as Soccer
), game);
