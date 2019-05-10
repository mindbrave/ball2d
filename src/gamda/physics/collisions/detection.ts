
import * as math from "mathjs"
import { head, sortBy, prop, isEmpty } from "ramda";

import { subtractVectors, vectorMagnitude, scaleVector, vectorSqrMagnitude, normalizeVector, dotProduct, isZeroVector, Vec, crossProduct, addVectors, vecToArray, vecFromArray, negateVector } from "../../vectors";
import { add, sub, lt, pow2, lte, gte, gt, sqrt2, div, mul, AnyUnit, negate, MultiplyUnits, Scalar } from "uom-ts";
import { Seconds, Meters, SquaredMeters, MetersPerSecond } from "../units";
import { Sphere, Triangle } from "../shape";
import { Body, isSphere, isTriangle, BodyPart } from "../body";
import { BodyCollision } from "./collision";

type TimeToImpact = Seconds;
type CollisionPoint = Vec<Meters>;
type CollisionData = {
    timeToImpact: TimeToImpact,
    contactPoints: [CollisionPoint, CollisionPoint]
}

export const collisionBetweenBodies = (body1: Body, body2: Body, duration: Seconds): BodyCollision | null => {
    let collisions: BodyCollision[] = [],
        collisionData: CollisionData | null,
        part1: BodyPart,
        part2: BodyPart;
    for (let i=0; i<body1.parts.length; i+=1) {
        part1 = body1.parts[i];
        for (let k=0; k<body2.parts.length; k+=1) {
            part2 = body2.parts[k];
            if (isSphere(part1) && isSphere(part2)) {
                collisionData = incomingCollisionBetweenSpheres(body1, part1, body2, part2, duration);
            } else if (isSphere(part1) && isTriangle(part2)) {
                collisionData = incomingCollisionBetweenSphereAndTriangle(body1, part1, body2, part2, duration);
            } else if (isTriangle(part1) && isSphere(part2)) {
                collisionData = incomingCollisionBetweenSphereAndTriangle(body2, part2, body1, part1, duration);
            } else {
                throw new Error('No collision function for given shapes specified');
            }
            if (collisionData === null) {
                continue;
            }
            collisions.push({...collisionData, betweenBodyParts: [i, k]});
        }
    }
    if (isEmpty(collisions)) {
        return null;
    }
    return head(sortBy(prop<'timeToImpact', number>('timeToImpact'), collisions))!;
};

/**
 * Implementation of this algorithm -> https://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=1
 */
export const incomingCollisionBetweenSpheres = (body1: Body, part1: BodyPart<Sphere>, body2: Body, part2: BodyPart<Sphere>, duration: Seconds): CollisionData | null => {
    const [movingBody, staticBody] = considerSecondBodyStationary(body1, body2);
    if (isZeroVector(movingBody.velocity)) {
        return null;
    }
    const movingPartPosition = addVectors(movingBody.position, part1.relativePosition);
    const staticPartPosition = addVectors(staticBody.position, part2.relativePosition);
    const radiusSum = add(part1.shape.radius, part2.shape.radius);
    const towardsVector = subtractVectors(staticPartPosition, movingPartPosition);
    const distanceBetweenEntities = sub(vectorMagnitude(towardsVector), radiusSum);
    const entityTranslation = scaleVector(duration, movingBody.velocity);
    const distanceEntityCanMoveSqr = vectorSqrMagnitude(entityTranslation);
    if (!lt(pow2(distanceBetweenEntities), distanceEntityCanMoveSqr)) {
        return null;
    }
    const normalizedTranslation = normalizeVector(entityTranslation);
    const D = dotProduct(normalizedTranslation, towardsVector);
    if (lte(D, 0 as Meters)) {
        return null;
    }
    const distanceBetweenCenters = vectorMagnitude(towardsVector);
    const radiusSumSquared = pow2(radiusSum);
    const closestDistanceThatCanGetBetweenEntitiesSquared = sub(pow2(distanceBetweenCenters), pow2(D));
    if (gte(closestDistanceThatCanGetBetweenEntitiesSquared, radiusSumSquared)) {
        return null;
    }
    const T = sub(radiusSumSquared, closestDistanceThatCanGetBetweenEntitiesSquared);
    if (lt(T, 0 as SquaredMeters)) {
        return null;
    }
    const distanceTillCollision = sub(D, sqrt2(T));
    const translationDistance = vectorMagnitude(entityTranslation);
    if (lt(translationDistance, distanceTillCollision)) {
        return null;
    }
    translationDistance === 0 ? console.error('translationDistance ZERO', translationDistance) : null;
    const X = div(distanceTillCollision, translationDistance);
    const realDistanceTillCollisionFromBody1 = mul(vectorMagnitude(scaleVector(duration, body1.velocity)), X);
    const realDistanceTillCollisionFromBody2 = mul(vectorMagnitude(scaleVector(duration, body2.velocity)), X);
    const timeToImpact = !isZeroVector(body1.velocity) ?
        div(realDistanceTillCollisionFromBody1, vectorMagnitude(body1.velocity)) :
        div(realDistanceTillCollisionFromBody2, vectorMagnitude(body2.velocity));
    const normalBetweenCentersAB = normalizeVector(towardsVector);
    return {
        timeToImpact,
        contactPoints: [
            scaleVector(part1.shape.radius, normalBetweenCentersAB),
            scaleVector(part2.shape.radius, negateVector(normalBetweenCentersAB))
        ]
    };
};

export const incomingCollisionBetweenSphereAndTriangle = (body1: Body, part1: BodyPart<Sphere>, body2: Body, part2: BodyPart<Triangle>, duration: Seconds): CollisionData | null => {
    const [movingBody, staticBody] = considerSecondBodyStationary(body1, body2);
    if (isZeroVector(movingBody.velocity)) {
        return null;
    }
    const trianglePosition = addVectors(staticBody.position, part2.relativePosition);
    const p1 = addVectors(trianglePosition, part2.shape.p1);
    const p2 = addVectors(trianglePosition, part2.shape.p2);
    const p3 = addVectors(trianglePosition, part2.shape.p3);
    const AB = subtractVectors(p2, p1);
    const AC = subtractVectors(p3, p1);
    const normal = normalizeVector(crossProduct(AB, AC));
    const translation: Vec<Meters> = scaleVector(duration, movingBody.velocity);
    const normalizedTranslation = normalizeVector(translation);
    const D = dotProduct(normalizedTranslation, negateVector(normal));
    if (lte(D, 0 as Scalar)) {
        return null;
    }
    const spherePosition = addVectors(movingBody.position, part1.relativePosition);
    const sphereContactPointWithPlane = subtractVectors(spherePosition, scaleVector(part1.shape.radius, normal));
    const sphereContactPointRelative = subtractVectors(sphereContactPointWithPlane, spherePosition);
    const destinationPointOfSphere = addVectors(spherePosition, translation);
    const destinationPointOfContactPoint = addVectors(destinationPointOfSphere, sphereContactPointRelative);
    const intersect = math.intersect as any; // types are wrong so we have to cast as any
    const planeCoefficients = coefficientsOfPlaneFrom3Points(p1, p2, p3);
    const intersectionPointArray: [Meters, Meters, Meters] = intersect(vecToArray(sphereContactPointWithPlane), vecToArray(destinationPointOfContactPoint), planeCoefficients);
    const intersectionPoint = vecFromArray(intersectionPointArray);
    const sphereContactPointToIntersectionPointLength = vectorMagnitude(subtractVectors(intersectionPoint, sphereContactPointWithPlane));
    const translationLength = vectorMagnitude(translation);
    if (gte(sphereContactPointToIntersectionPointLength, translationLength)) {
        return null;
    }
    const v0 = AB, v1 = AC, v2 = subtractVectors(intersectionPoint, p1);
    const d00 = dotProduct(v0, v0);
    const d01 = dotProduct(v0, v1);
    const d11 = dotProduct(v1, v1);
    const d20 = dotProduct(v2, v0);
    const d21 = dotProduct(v2, v1);
    const denom = d00 * d11 - d01 * d01;
    const gamma = (d11 * d20 - d01 * d21) / denom;
    const beta = (d00 * d21 - d01 * d20) / denom;
    const alpha = 1.0 - gamma - beta;
    if (!((0 <= alpha && alpha <= 1) && (0 <= beta && beta <= 1) && (0 <= gamma && gamma <= 1))) {
        return null;
    }

    return {
        timeToImpact: div(mul(sphereContactPointToIntersectionPointLength, duration), translationLength),
        contactPoints: [sphereContactPointRelative, subtractVectors(intersectionPoint, trianglePosition)]
    };
};

const coefficientsOfPlaneFrom3Points = <T extends AnyUnit>(p0: Vec<T>, p1: Vec<T>, p2: Vec<T>): [MultiplyUnits<T, T>, MultiplyUnits<T, T>, MultiplyUnits<T, T>, MultiplyUnits<MultiplyUnits<T, T>, T>] => {
    const a1 = sub(p1.x, p0.x);
    const b1 = sub(p1.y, p0.y);
    const c1 = sub(p1.z, p0.z);
    const a2 = sub(p2.x, p0.x);
    const b2 = sub(p2.y, p0.y);
    const c2 = sub(p2.z, p0.z);
    const a = sub(mul(b1, c2), mul(b2, c1));
    const b = sub(mul(a2, c1), mul(a1, c2));
    const c = sub(mul(a1, b2), mul(b1, a2));
    const d = negate(sub(sub(mul(negate(a), p0.x), mul(b, p0.y)), mul(c, p0.z)));
    return [a, b, c, d];
};

const considerSecondBodyStationary = (body1: Body, body2: Body): [Body, Body] => {
    return [
        {
            ...body1,
            velocity: subtractVectors(body1.velocity, body2.velocity),
        },
        {
            ...body2,
            velocity: {
                x: 0 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            },
        },
    ];
};
