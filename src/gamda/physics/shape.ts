import { Vec } from "../vectors";
import { Meters } from "./units";

export enum ShapeType {
    Segment = "Segment",
    Sphere = "Sphere",
    Triangle = "Triangle",
}

export type Segment = {
    type: ShapeType.Segment,
    pointA: Vec<Meters>,
    pointB: Vec<Meters>,
}

export type Sphere = {
    type: ShapeType.Sphere,
    radius: Meters,
}

export type Triangle = {
    type: ShapeType.Triangle,
    p1: Vec<Meters>,
    p2: Vec<Meters>,
    p3: Vec<Meters>,
}

export type Shape = Sphere | Segment | Triangle;
