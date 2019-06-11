
import { merge, Observable, of } from "rxjs";
import { map, tap, filter, mapTo, pluck } from "rxjs/operators";

import { ticks, TicksPerSecond } from "./gamda/ticks";
import { isZeroVector, isNotZeroVector } from "./gamda/vectors";
import { updateEntitiesViewPositions, addEntityView, createView, changeSelectedViewCharacter, checkWhatWasClicked } from "./view";
import { wsad, onKeyDown, wsadDirectionToVec, onLeftMouseDown } from "./gamda/input";
import { game, gameEvents, GameCommand, GameEvent, isEventOfType, FieldPositionPointed, FIELD_POSITION_POINTED } from "./gamda/game";
import { orderCharacterToStop, orderCharacterToMoveInDirection, orderCharacterToMoveToPosition } from "./movement";
import { startGame } from "./start";
import { CharacterSelected, CHARACTER_SELECTED } from "./character";
import { EntityAdded, ENTITY_ADDED, EntityId, Entity } from "./gamda/entities";
import { Soccer, updateGame, selectGivenCharacter, Team } from "./soccer";
import { kickBallWithSelectedCharacter } from "./kickBall";
import { MetersPerSquaredSecond } from "./gamda/physics/units";
import { Map, Set } from "immutable";

const run = async (): Promise<void> => {

    const ticksPerSecond = 60.0 as TicksPerSecond;
    const everyTick$ = ticks(ticksPerSecond);
    const directionToMove$ = wsad().pipe(map(wsadDirectionToVec));

    const gameEvents$ = gameEvents();
    const whenEntityIsAdded$ = gameEvents$.pipe(filter(isEventOfType<GameEvent, EntityAdded>(ENTITY_ADDED)));
    const whenCharacterIsSelected$ = gameEvents$.pipe(filter(isEventOfType<GameEvent, CharacterSelected>(CHARACTER_SELECTED)));
    const whenFieldPositionIsPointed$ = gameEvents$.pipe(filter(isEventOfType<GameEvent, FieldPositionPointed>(FIELD_POSITION_POINTED)));

    const view = await createView();
    const emptyGameState = async (): Promise<Soccer> => ({
        selectedCharacterId: null,
        gravity: 10 as MetersPerSquaredSecond,
        playerTeam: Team.A,
        teams: {
            [Team.A]: {},
            [Team.B]: {},
        },
        entities: {
            map: Map<EntityId, Entity>(),
            lastEntityId: 0 as EntityId,
            byTrait: {
                "physical": Set<EntityId>(),
                "withBehavior": Set<EntityId>(),
                "canJump": Set<EntityId>(),
                "belongsToTeam": Set<EntityId>(),
            },
        },
        view,
    });

    const gameCommands$: Observable<GameCommand<Soccer>> = merge(
        of(startGame),
        everyTick$.pipe(map(updateGame)),
        directionToMove$.pipe(filter(isZeroVector)).pipe(mapTo(orderCharacterToStop)),
        directionToMove$.pipe(filter(isNotZeroVector)).pipe(map(orderCharacterToMoveInDirection)),
        onKeyDown(" ").pipe(mapTo(kickBallWithSelectedCharacter)),
        onKeyDown("1").pipe(mapTo(selectGivenCharacter(1))),
        onKeyDown("2").pipe(mapTo(selectGivenCharacter(2))),
        onKeyDown("3").pipe(mapTo(selectGivenCharacter(3))),
        onKeyDown("4").pipe(mapTo(selectGivenCharacter(4))),
        whenEntityIsAdded$.pipe(map(addEntityView)),
        whenCharacterIsSelected$.pipe(map(changeSelectedViewCharacter)),
        onLeftMouseDown(view.app.view).pipe(map(checkWhatWasClicked)),
        whenFieldPositionIsPointed$.pipe(pluck('position')).pipe(map(orderCharacterToMoveToPosition)),
    );

    const onGameUpdate$ = game(gameCommands$, gameEvents$, await emptyGameState());
    onGameUpdate$.subscribe(updateEntitiesViewPositions);
}

run().catch(console.error);
