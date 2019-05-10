import { Unit } from "uom-ts";

export type Meters = Unit<{m: 1}>;
export type SquaredMeters = Unit<{m: 2}>;
export type Seconds = Unit<{s: 1}>;
export type Milliseconds = Unit<{ms: 1}>;
export type Kilograms = Unit<{kg: 1}>;
export type MetersPerSecond = Unit<{m: 1, s: -1}>;
export type MetersPerSquaredSecond = Unit<{m: 1, s: -2}>;
