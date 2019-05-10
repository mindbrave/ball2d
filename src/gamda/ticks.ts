
import { Unit, mul, div, DivideUnits } from "uom-ts";
import { interval, TimeInterval } from "rxjs";
import { map, timeInterval, pluck, filter, concatMap } from "rxjs/operators";

import { Seconds, Milliseconds } from "./physics/units";
import { Observable } from "rxjs";
import { append } from "ramda";
import { range } from "remeda";

type Ticks = Unit<{tick: 1}>
export type TicksPerSecond = DivideUnits<Ticks, Seconds>;

export const ticks = (ticksPerSecond: TicksPerSecond): Observable<Seconds> => {
    const tickDuration = convertTicksRatioToPeriod(ticksPerSecond);
    return interval(secondsToMilliseconds(tickDuration))
        .pipe(timeInterval())
        .pipe(pluck<TimeInterval<number>, Milliseconds>('interval'))
        .pipe(map(millisecondsToSeconds))
        .pipe(filter(interval => interval !== 0.0))
        .pipe(concatMap(interval => append(
            interval % tickDuration as Seconds,
            range(0, Math.floor(interval / tickDuration)).map(() => tickDuration)
        )));
};

const MILLISECONDS_TO_SECONDS_RATIO = 1000.0 as DivideUnits<Milliseconds, Seconds>;

const secondsToMilliseconds = (seconds: Seconds): Milliseconds => mul(seconds, MILLISECONDS_TO_SECONDS_RATIO);
const millisecondsToSeconds = (milliseconds: Milliseconds): Seconds => div(milliseconds, MILLISECONDS_TO_SECONDS_RATIO);

export const convertTicksRatioToPeriod = (ticksRatio: TicksPerSecond): Seconds => div(1.0 as Ticks, ticksRatio);
