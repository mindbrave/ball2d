import { Seconds, Meters } from "../units";
import { Vec } from "../../vectors";
import { BodyPartId } from "../body";

export type BodyCollision = {
    timeToImpact: Seconds,
    betweenBodyParts: [BodyPartId, BodyPartId],
    contactPoints: [Vec<Meters>, Vec<Meters>],
};
