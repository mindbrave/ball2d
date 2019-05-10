
import { isNil } from "ramda";
import { add, Scalar } from "uom-ts";
import { Map } from "immutable";

import { Vec, normalizeVector, subtractVectors, addVectors, scaleVector, vec } from "./gamda/vectors";
import { Soccer, addEntities } from "./soccer";
import { GameEvents } from "./gamda/game";
import { getPointerCurrent3dPosition } from "./view";
import { Physical, alwaysCollide, bounce, doesntOverlap, block } from "./gamda/entitiesPhysics";
import { WithBehavior } from "./gamda/movingBehavior";
import { getEntity, storeEntity, Entity, nextEntityId, EntityId } from "./gamda/entities";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { ShapeType, Sphere } from "./gamda/physics/shape";
import { Body, BodyPart } from "./gamda/physics/body";

export type Projectile = Entity<Physical & WithBehavior>;

const PROJECTILE_RADIUS = 2.0 as Meters;

export const shootBallWithSelectedCharacter = (game: Soccer): [Soccer, GameEvents] => {
    const targetPosition = getPointerCurrent3dPosition(game.view);
    console.log('shoot', targetPosition)
    if (isNil(targetPosition)) {
        return [game, []];
    }
    const selectedEntity = getEntity(game.selectedCharacterId, game.entities) as Entity<Physical>;
    const selectedEntityBody = selectedEntity.body;
    const selectedSphere = selectedEntityBody.parts[0] as BodyPart<Sphere>;
    const shootDirection = normalizeVector(subtractVectors({...targetPosition, y: selectedEntityBody.position.y}, selectedEntityBody.position));
    const distanceBetweenBallAndEntity = 0.1 as Meters;
    const projectileStartPosition = addVectors(
        selectedEntityBody.position,
        scaleVector(add(PROJECTILE_RADIUS, add(distanceBetweenBallAndEntity, selectedSphere.shape.radius)), shootDirection)
    );
    let entities = nextEntityId(game.entities);
    const projectile = createProjectile(entities.lastEntityId, projectileStartPosition, shootDirection);
    console.log('added')
    return addEntities([projectile])(game);
};

const createProjectile = (id: EntityId, position: Vec<Meters>, direction: Vec<Scalar>): Projectile => ({
    id,
    type: 'projectile',
    traits: ['physical', 'withBehavior'],
    body: {
        doesGravityAppliesToThisBody: true,
        position,
        velocity: scaleVector(15.0 as MetersPerSecond, direction),
        dampening: 5.0 as MetersPerSquaredSecond,
        mass: 999999 as Kilograms,
        parts: [
            {
                shape: {
                    type: ShapeType.Sphere,
                    radius: PROJECTILE_RADIUS,
                },
                relativePosition: vec(0, 0, 0) as Vec<Meters>
            }
        ],
        elasticity: 1.0 as Scalar,
    },
    movementBehavior: {
        acceleration: 0.0 as MetersPerSquaredSecond,
        maxVelocity: 15.0 as MetersPerSecond,
        direction: direction,
    },
    contactBehaviors: Map({
        'character': {
            doesCollide: alwaysCollide,
            onCollision: [bounce],
            doesOverlap: doesntOverlap,
            onOverlap: []
        }
    })
});
