
import { merge, Observable, of } from "rxjs";
import { map, tap, filter, mapTo } from "rxjs/operators";

import { ticks, TicksPerSecond } from "./gamda/ticks";
import { isZeroVector, isNotZeroVector } from "./gamda/vectors";
import { updateEntitiesMeshPositions, addEntityView, changeViewCameraTarget } from "./view";
import { wsad, onKeyDown, wsadDirectionToVec } from "./gamda/input";
import { game, gameEvents, GameCommand, GameEvent, isEventOfType } from "./gamda/game";
import { orderCharacterToStop, orderCharacterToMoveInDirection } from "./movement";
import { startGame } from "./start";
import { CharacterSelected, CHARACTER_SELECTED } from "./character";
import { EntityAdded, ENTITY_ADDED } from "./gamda/entities";
import { Soccer, initialGameState, updateGame } from "./soccer";
import { kickBallWithSelectedCharacter } from "./kickBall";

const ticksPerSecond = 60.0 as TicksPerSecond;
const everyTick$ = ticks(ticksPerSecond);
const directionToMove$ = wsad().pipe(map(wsadDirectionToVec));

const gameEvents$ = gameEvents();
const whenEntityIsAdded$ = gameEvents$.pipe(filter(isEventOfType<GameEvent, EntityAdded>(ENTITY_ADDED)));
const whenCharacterIsSelected$ = gameEvents$.pipe(filter(isEventOfType<GameEvent, CharacterSelected>(CHARACTER_SELECTED)));

const gameCommands$: Observable<GameCommand<Soccer>> = merge(
    of(startGame),
    everyTick$.pipe(map(updateGame)),
    directionToMove$.pipe(filter(isZeroVector)).pipe(mapTo(orderCharacterToStop)),
    directionToMove$.pipe(filter(isNotZeroVector)).pipe(map(orderCharacterToMoveInDirection)),
    onKeyDown(" ").pipe(mapTo(kickBallWithSelectedCharacter)),
    whenEntityIsAdded$.pipe(map(addEntityView)),
    whenCharacterIsSelected$.pipe(map(changeViewCameraTarget)),
);

const onGameUpdate$ = game(gameCommands$, gameEvents$, initialGameState());
onGameUpdate$.subscribe(updateEntitiesMeshPositions);
 