
import { expect } from "chai";
import { Entity } from "../gamda/entities";
import { MetersPerSecond, Meters } from "../gamda/physics/units";
import { Vec } from "../gamda/vectors";
import { Physical } from "../gamda/entitiesPhysics";

export const expectEntity = (entity: Entity, ...expects: Array<(entity: Entity) => void>): void => (
    expects.forEach(expect => expect(entity))
);

export const toHaveVelocity = (velocity: Vec<MetersPerSecond>) => (entity: Entity<Physical>): void => {
    expect(entity.body.velocity).to.be.deep.equal(velocity);
}

export const toBeAlmostAtPosition = (position: Vec<Meters>) => (entity: Entity<Physical>): void => {
    expect(entity.body.position.x).to.be.closeTo(position.x, 0.000001, "Position x is not within error margin");
    expect(entity.body.position.y).to.be.closeTo(position.y, 0.000001, "Position y is not within error margin");
    expect(entity.body.position.z).to.be.closeTo(position.z, 0.000001, "Position z is not within error margin");
}

export const toBeAtPosition = (position: Vec<Meters>) => (entity: Entity<Physical>): void => {
    expect(entity.body.position).to.be.deep.equal(position);
}
