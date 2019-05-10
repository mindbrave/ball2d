import { Observable, Subject } from "rxjs";
import { scan } from "rxjs/operators";
import { concat } from "ramda";

export type GameEvent = Readonly<{
    type: string;
}>;
export type GameEvents = GameEvent[];
export type GameCommand<T> = (game: T) => [T, GameEvents];

export const game = <T>(commands$: Observable<GameCommand<T>>, events$: Subject<GameEvent>, initialState: T): Observable<T> =>  {
    return commands$.pipe(scan((game: T, command: GameCommand<T>): T => {
        let [updatedGame, events] = command(game);
        events.forEach((event: GameEvent) => setTimeout(() => events$.next(event), 0));
        return updatedGame;
    }, initialState));
};

export const gameEvents = () => new Subject<GameEvent>();

export const isEventOfType = <T extends GameEvent, S extends T>(type: string) => (event: T): event is S => event.type === type;

export const pipeWithEvents = <T>(arg: T, ...fns: ((a: T) => [T, GameEvents])[]) => fns.reduce((acc: [T, GameEvents], f: (a: T) => [T, GameEvents]): [T, GameEvents] => {
    let [result, events] = f(acc[0] as T);
    return [result, concat(acc[1], events)]
}, [arg, []]);
