
import { head, pipe, prop } from "ramda";

import { createCharacter, isCharacter, CHARACTER_RADIUS } from "./character";
import { Meters } from "./gamda/physics/units";
import { Soccer, selectCharacter, addEntities } from "./soccer";
import { GameEvents, pipeWithEvents } from "./gamda/game";
import { filterEntities, Entities, Entity } from "./gamda/entities";
import { runRenderLoop } from "./view";
import { createParallelogramWall } from "./wall";
import { vec, Vec } from "./gamda/vectors";
import { createBall } from "./ball";

export const startGame = (game: Soccer): [Soccer, GameEvents] => {
    const character1 = createCharacter({
        x: 0 as Meters,
        y: CHARACTER_RADIUS,
        z: 0 as Meters,
    });
    const character2 = createCharacter({
        x: 2 as Meters,
        y: CHARACTER_RADIUS,
        z: 0 as Meters,
    });
    const character3 = createCharacter({
        x: 4 as Meters,
        y: CHARACTER_RADIUS,
        z: 0 as Meters,
    });
    const character4 = createCharacter({
        x: -2 as Meters,
        y: CHARACTER_RADIUS,
        z: 0 as Meters,
    });
    const character5 = createCharacter({
        x: -4 as Meters,
        y: CHARACTER_RADIUS,
        z: 0 as Meters,
    });
    const character6 = createCharacter({
        x: -6 as Meters,
        y: CHARACTER_RADIUS,
        z: 0 as Meters,
    });
    const ball = createBall({
        x: 0 as Meters,
        y: CHARACTER_RADIUS,
        z: -2 as Meters,
    });
    
    return pipeWithEvents(
        game,
        addEntities([
            character1,
            character2,
            character3,
            character4,
            character5,
            character6,
            ball,
            ...createPlayField(),
        ]),
        renderGame,
        selectFirstCharacter
    );
};

export const renderGame = (game: Soccer): [Soccer, GameEvents] => [({...game, view: runRenderLoop(game.view)}), []];

const selectFirstCharacter = (game: Soccer): [Soccer, GameEvents] => selectCharacter(filterEntities(isCharacter, game.entities)[0], game);

const createPlayField = (): Entity[] => {
    const ground = createParallelogramWall(
        vec(-30, 0, -30) as Vec<Meters>,
        vec(-30, 0, 30) as Vec<Meters>,
        vec(30, 0, 30) as Vec<Meters>,
    );
    const roof = createParallelogramWall(
        vec(30, 30, 30) as Vec<Meters>,
        vec(-30, 30, 30) as Vec<Meters>,
        vec(-30, 30, -30) as Vec<Meters>,
    );
    const westWall = createParallelogramWall(
        vec(-30, 0, -30) as Vec<Meters>,
        vec(-30, 30, -30) as Vec<Meters>,
        vec(-30, 30, 30) as Vec<Meters>,
    );
    const northWall = [
        createParallelogramWall(
            vec(-30, 0, 30) as Vec<Meters>,
            vec(-30, 30, 30) as Vec<Meters>,
            vec(-8, 30, 30) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(8, 0, 30) as Vec<Meters>,
            vec(8, 30, 30) as Vec<Meters>,
            vec(30, 30, 30) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 4, 30) as Vec<Meters>,
            vec(-8, 30, 30) as Vec<Meters>,
            vec(8, 30, 30) as Vec<Meters>,
        ),   
    ];
    const northGoal = [
        createParallelogramWall(
            vec(-8, 0, 30) as Vec<Meters>,
            vec(-8, 0, 34) as Vec<Meters>,
            vec(8, 0, 34) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 4, 34) as Vec<Meters>,
            vec(-8, 4, 30) as Vec<Meters>,
            vec(8, 4, 30) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 0, 34) as Vec<Meters>,
            vec(-8, 4, 34) as Vec<Meters>,
            vec(8, 4, 34) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 0, 30) as Vec<Meters>,
            vec(-8, 4, 30) as Vec<Meters>,
            vec(-8, 4, 34) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(8, 0, 34) as Vec<Meters>,
            vec(8, 4, 34) as Vec<Meters>,
            vec(8, 4, 30) as Vec<Meters>,
        ),
    ]
    const eastWall = createParallelogramWall(
        vec(30, 0, 30) as Vec<Meters>,
        vec(30, 30, 30) as Vec<Meters>,
        vec(30, 30, -30) as Vec<Meters>,
    );
    const southWall = createParallelogramWall(
        vec(30, 0, -30) as Vec<Meters>,
        vec(30, 30, -30) as Vec<Meters>,
        vec(-30, 30, -30) as Vec<Meters>,
    );
    return [
        ground,
        roof,
        westWall,
        eastWall,
        ...northWall,
        ...northGoal,
        southWall,
    ];
};
