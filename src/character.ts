
import { Scalar } from "uom-ts";

import { Vec, vec } from "./gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { ShapeType } from "./gamda/physics/shape";
import { Entity, EntityId } from "./gamda/entities";
import { Physical, alwaysCollide, doesntOverlap, bounce, bounceAgainstStatic } from "./gamda/entitiesPhysics";
import { WithBehavior, updateToStop } from "./gamda/movingBehavior";
import { Map } from "immutable";
import { GameEvent } from "./gamda/game";
import { Team } from "./soccer";

type TeamAssign = {
    team: Team,
    index: number,
};

export type BelongsToTeam = {
    teamAssign: TeamAssign
}

export type Character = Entity<Physical & WithBehavior & BelongsToTeam>;

export interface CharacterSelected extends GameEvent {
    type: "CharacterSelected";
    characterId: EntityId;
}

export const CHARACTER_SELECTED = "CharacterSelected";

export const isCharacter = (entity: Entity): entity is Character => entity.type === 'character';

export const CHARACTER_RADIUS = 0.8 as Meters; // 1.5 as Meters;

export const createCharacter = (position: Vec<Meters>, teamAssign: TeamAssign): Character => ({
    id: null,
    type: 'character',
    traits: ['physical', 'withBehavior', 'belongsToTeam'],
    teamAssign,
    body: {
        doesGravityAppliesToThisBody: true,
        position,
        velocity: vec(0, 0, 0) as Vec<MetersPerSecond>,
        dampening: 10.0 as MetersPerSquaredSecond,
        parts: [
            {
                shape: {
                    type: ShapeType.Sphere,
                    radius: CHARACTER_RADIUS as Meters,
                },
                relativePosition: vec(0, 0, 0) as Vec<Meters>
            }
        ],
        elasticity: 0.7 as Scalar,
        mass: 1.0 as Kilograms,
    },
    contactBehaviors: Map({
        'character': {
            doesCollide: alwaysCollide,
            doesOverlap: doesntOverlap,
            onCollision: [bounce],
            onOverlap: []
        },
        'ball': {
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
        type: "Stop",
        acceleration: 25.0 as MetersPerSquaredSecond,
        maxVelocity: 2.0 as MetersPerSecond,
        updateBehavior: updateToStop,
    },
});
