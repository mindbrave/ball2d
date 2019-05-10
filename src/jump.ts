import { Physical } from "./gamda/entitiesPhysics";
import { MetersPerSecond } from "./gamda/physics/units";
import { Entity } from "./gamda/entities";
import { evolve } from "ramda";
import { applyImpulse } from "./gamda/physics/motion";
import { vec, Vec } from "./gamda/vectors";

type CanJump = Physical & {
    jumpImpulse: MetersPerSecond;
}

const makeEntityJump = (entity: Entity<CanJump>): Entity => evolve({body: applyImpulse(vec(0, entity.jumpImpulse, 0) as Vec<MetersPerSecond>)}, entity);
