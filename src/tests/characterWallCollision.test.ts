
import { vec, Vec } from "../gamda/vectors";
import { Seconds, MetersPerSecond, Meters, MetersPerSquaredSecond } from "../gamda/physics/units";
import { givenCharacter, atPosition, withVelocity, givenWall, givenGame, withEntities, simulate, withNoDampening, withNoGravity, withGravity, withSphereShape, withElasticity } from "./fixtures";
import { expectEntity, toHaveVelocity, toBeAtPosition, toBeAlmostAtPosition } from "./expects";
import { entitiesList, EntityId } from "../gamda/entities";
import { TicksPerSecond } from "../gamda/ticks";
import { withDampening } from "../gamda/tests/fixtures/body";
import { Scalar } from "uom-ts";

test("character bounces of vertical wall", () => {
    const character = givenCharacter(
        atPosition(vec(0, 0, 0) as Vec<Meters>),
        withVelocity(vec(0, 0, 1) as Vec<MetersPerSecond>),
        withSphereShape(1.0 as Meters),
    );
    const wall = givenWall(vec(-1, -1, 2) as Vec<Meters>, vec(-1, 1, 2) as Vec<Meters>, vec(1, 1, 2) as Vec<Meters>);
    const game = givenGame(withEntities(character, wall), withNoGravity);

    const gameAfter = simulate(game, 2 as Seconds, 1 as TicksPerSecond);

    expectEntity(
        entitiesList(gameAfter.entities)[0]!,
        toHaveVelocity(vec(0, 0, -1) as Vec<MetersPerSecond>),
        toBeAtPosition(vec(0, 0, 0) as Vec<Meters>)
    );
});

test("character bounces of horizontal wall (ground)", () => {
    const character = givenCharacter(
        atPosition(vec(0, 2, 0) as Vec<Meters>),
        withVelocity(vec(0, -1, 0) as Vec<MetersPerSecond>),
        withSphereShape(1.0 as Meters),
    );
    const wall = givenWall(vec(-1, 0, -1) as Vec<Meters>, vec(-1, 0, 1) as Vec<Meters>, vec(1, 0, 1) as Vec<Meters>);
    const game = givenGame(withEntities(character, wall), withNoGravity);

    const gameAfter = simulate(game, 2 as Seconds, 1 as TicksPerSecond);

    expectEntity(
        entitiesList(gameAfter.entities)[0]!,
        toHaveVelocity(vec(0, 1, 0) as Vec<MetersPerSecond>),
        toBeAtPosition(vec(0, 2, 0) as Vec<Meters>)
    );
});

test("character bounces of ground due to gravity but finally stays on ground because of lost energy due to elasticity", () => {
    const character = givenCharacter(
        atPosition(vec(0, 2, 0) as Vec<Meters>),
        withSphereShape(1.0 as Meters),
        withElasticity(0.5 as Scalar)
    );
    const wall = givenWall(vec(-1, 0, -1) as Vec<Meters>, vec(-1, 0, 1) as Vec<Meters>, vec(1, 0, 1) as Vec<Meters>);
    const game = givenGame(withEntities(character, wall), withGravity(10 as MetersPerSquaredSecond));

    const gameAfter = simulate(game, 3 as Seconds, 20 as TicksPerSecond);

    expectEntity(
        entitiesList(gameAfter.entities)[0]!,
        toBeAlmostAtPosition(vec(0, 1, 0) as Vec<Meters>)
    );
});
