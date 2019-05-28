
import { createCharacter, isCharacter, CHARACTER_RADIUS } from "./character";
import { Meters } from "./gamda/physics/units";
import { Soccer, selectCharacter, addEntities, Team, addCharacter } from "./soccer";
import { GameEvents, pipeWithEvents } from "./gamda/game";
import { filterEntities, Entity } from "./gamda/entities";
import { createWall } from "./wall";
import { vec, Vec } from "./gamda/vectors";
import { createBall } from "./ball";

export const startGame = (game: Soccer): [Soccer, GameEvents] => {
    const character1 = createCharacter({
        x: -20 as Meters,
        y: 0 as Meters,
        z: -6 as Meters,
    }, {team: Team.A, index: 1});
    const character2 = createCharacter({
        x: -20 as Meters,
        y: 0 as Meters,
        z: 6 as Meters,
    }, {team: Team.A, index: 2});
    const character3 = createCharacter({
        x: -10 as Meters,
        y: 0 as Meters,
        z: -6 as Meters,
    }, {team: Team.A, index: 3});
    const character4 = createCharacter({
        x: -10 as Meters,
        y: 0 as Meters,
        z: 6 as Meters,
    }, {team: Team.A, index: 4});
    const character5 = createCharacter({
        x: 20 as Meters,
        y: 0 as Meters,
        z: -6 as Meters,
    }, {team: Team.B, index: 1});
    const character6 = createCharacter({
        x: 20 as Meters,
        y: 0 as Meters,
        z: 6 as Meters,
    }, {team: Team.B, index: 2});
    const character7 = createCharacter({
        x: 10 as Meters,
        y: 0 as Meters,
        z: -6 as Meters,
    }, {team: Team.B, index: 3});
    const character8 = createCharacter({
        x: 10 as Meters,
        y: 0 as Meters,
        z: 6 as Meters,
    }, {team: Team.B, index: 4});
    const ball = createBall({
        x: 0 as Meters,
        y: 0 as Meters,
        z: 0 as Meters,
    });
    
    return pipeWithEvents(
        game,
        addEntities([
            ball,
            ...createPlayField(),
        ]),
        addCharacter(character1),
        addCharacter(character2),
        addCharacter(character3),
        addCharacter(character4),
        addCharacter(character5),
        addCharacter(character6),
        addCharacter(character7),
        addCharacter(character8),
        selectFirstCharacter
    );
};

const selectFirstCharacter = (game: Soccer): [Soccer, GameEvents] => selectCharacter(filterEntities(isCharacter, game.entities)[0], game);

const createPlayField = (): Entity[] => {
    const westWall = [
        createWall(
            vec(-30, 0, -16) as Vec<Meters>,
            vec(-30, 0, -6) as Vec<Meters>,
        ),
        createWall(
            vec(-30, 0, 16) as Vec<Meters>,
            vec(-30, 0, 6) as Vec<Meters>,
        ),
        createWall(
            vec(-30, 0, -16) as Vec<Meters>,
            vec(-26, 0, -20) as Vec<Meters>,
        ),
        createWall(
            vec(-30, 0, 16) as Vec<Meters>,
            vec(-26, 0, 20) as Vec<Meters>,
        )
    ];
    const eastWall = [
        createWall(
            vec(30, 0, -16) as Vec<Meters>,
            vec(30, 0, -6) as Vec<Meters>,
        ),
        createWall(
            vec(30, 0, 16) as Vec<Meters>,
            vec(30, 0, 6) as Vec<Meters>,
        ),
        createWall(
            vec(30, 0, -16) as Vec<Meters>,
            vec(26, 0, -20) as Vec<Meters>,
        ),
        createWall(
            vec(30, 0, 16) as Vec<Meters>,
            vec(26, 0, 20) as Vec<Meters>,
        )
    ];
    const northWall = createWall(
        vec(-26, 0, 20) as Vec<Meters>,
        vec(26, 0, 20) as Vec<Meters>,
    );
    const southWall = createWall(
        vec(-26, 0, -20) as Vec<Meters>,
        vec(26, 0, -20) as Vec<Meters>,
    );
    const eastGoal = [
        createWall(
            vec(30, 0, -6) as Vec<Meters>,
            vec(33, 0, -6) as Vec<Meters>,
        ),
        createWall(
            vec(30, 0, 6) as Vec<Meters>,
            vec(33, 0, 6) as Vec<Meters>,
        ),
        createWall(
            vec(33, 0, -6) as Vec<Meters>,
            vec(33, 0, 6) as Vec<Meters>,
        )
    ];
    const westGoal = [
        createWall(
            vec(-30, 0, -6) as Vec<Meters>,
            vec(-33, 0, -6) as Vec<Meters>,
        ),
        createWall(
            vec(-30, 0, 6) as Vec<Meters>,
            vec(-33, 0, 6) as Vec<Meters>,
        ),
        createWall(
            vec(-33, 0, -6) as Vec<Meters>,
            vec(-33, 0, 6) as Vec<Meters>,
        )
    ];
    return [
        ...westWall,
        ...eastWall,
        ...westGoal,
        ...eastGoal,
        northWall,
        southWall,
    ];
};
