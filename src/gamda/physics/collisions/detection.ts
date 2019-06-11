
import * as math from "mathjs"
import { head, sortBy, prop } from "ramda";

import { subtractVectors, vectorMagnitude, scaleVector, vectorSqrMagnitude, normalizeVector, dotProduct, isZeroVector, Vec, crossProduct, addVectors, vecToArray, vecFromArray, negateVector, vec, sqrDistanceTo, distanceTo } from "../../vectors";
import { add, sub, lt, pow2, lte, gte, gt, sqrt2, div, mul, AnyUnit, negate, MultiplyUnits, Scalar } from "uom-ts";
import { Seconds, Meters, SquaredMeters, MetersPerSecond } from "../units";
import { Sphere, Triangle, Circle, Segment } from "../shape";
import { Body, isSphere, BodyPart, isSegment } from "../body";
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
            } else if (isSegment(part1) && isSphere(part2)) {
                collisionData = incomingCollisionBetweenSegmentAndCircle(body1, part1, body2, part2, duration);
            } else if (isSphere(part1) && isSegment(part2)) {
                collisionData = incomingCollisionBetweenCircleAndSegment(body1, part1, body2, part2, duration);
            } else {
                throw new Error('No collision function for given shapes specified');
            }
            if (collisionData === null) {
                continue;
            }
            collisions.push({...collisionData, betweenBodyParts: [i, k]});
        }
    }
    if (collisions.length === 0) {
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
    return incomingCollisionBetweenCircleAndStaticCircle(
        {
            center: movingPartPosition,
            radius: part1.shape.radius,
            velocity: movingBody.velocity
        },
        {
            center: staticPartPosition,
            radius: part2.shape.radius,
            velocity: staticBody.velocity
        },
        duration
    );
};

type CirclePhysics = {
    center: Vec<Meters>,
    radius: Meters,
    velocity: Vec<MetersPerSecond>,
}

/**
 * Implementation of this algorithm -> https://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=1
 */
export const incomingCollisionBetweenCircleAndStaticCircle = (circle1: CirclePhysics, circle2: CirclePhysics, duration: Seconds): CollisionData | null => {
    const radiusSum = add(circle1.radius, circle2.radius);
    const towardsVector = subtractVectors(circle2.center, circle1.center);
    const distanceBetweenEntities = sub(vectorMagnitude(towardsVector), radiusSum);
    const entityTranslation = scaleVector(duration, circle1.velocity);
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
    const realDistanceTillCollisionFromBody1 = mul(vectorMagnitude(scaleVector(duration, circle1.velocity)), X);
    const realDistanceTillCollisionFromBody2 = mul(vectorMagnitude(scaleVector(duration, circle2.velocity)), X);
    const timeToImpact = !isZeroVector(circle1.velocity) ?
        div(realDistanceTillCollisionFromBody1, vectorMagnitude(circle1.velocity)) :
        div(realDistanceTillCollisionFromBody2, vectorMagnitude(circle2.velocity));
    const normalBetweenCentersAB = normalizeVector(towardsVector);
    return {
        timeToImpact,
        contactPoints: [
            scaleVector(circle1.radius, normalBetweenCentersAB),
            scaleVector(circle2.radius, negateVector(normalBetweenCentersAB))
        ]
    };
};

export const incomingCollisionBetweenSegmentAndCircle = (body1: Body, part1: BodyPart<Segment>, body2: Body, part2: BodyPart<Circle>, duration: Seconds): CollisionData | null => {
    const collisionData = incomingCollisionBetweenCircleAndSegment(body2, part2, body1, part1, duration);
    if (collisionData === null) {
        return null;
    }
    return {
        ...collisionData,
        contactPoints: [collisionData.contactPoints[1], collisionData.contactPoints[0]],
    }
};

export const incomingCollisionBetweenCircleAndSegment = (body1: Body, part1: BodyPart<Circle>, body2: Body, part2: BodyPart<Segment>, duration: Seconds): CollisionData | null => {
    const [movingBody, staticBody] = considerSecondBodyStationary(body1, body2);
    if (isZeroVector(movingBody.velocity)) {
        return null;
    }
    // movement vector
    const V = scaleVector(duration, movingBody.velocity)
    // circle position
    const C = addVectors(movingBody.position, part1.relativePosition);
    // segment points
    const segmentPosition = addVectors(staticBody.position, part2.relativePosition);
    const A = addVectors(segmentPosition, part2.shape.pointA);
    const B = addVectors(A, part2.shape.pointB);
    // circle position after move without collision
    const C2 = addVectors(C, V);
    // closestPointOnLineToCircle
    const D = closestPointOnLine({p1: A, p2: B}, C);
    // intersection Of movement vector And Line
    const I = linesIntersection(
        {p1: C, p2: C2},
        {p1: A, p2: B}
    );
    if (I === null) {
        // movement vector is parallel to segment
        const nearestEndpointToCircle = nearestPoint([A, B], C);
        const collision = incomingCollisionBetweenCircleAndStaticCircle(
            {
                center: C,
                radius: part1.shape.radius,
                velocity: movingBody.velocity
            },
            {
                center: nearestEndpointToCircle,
                radius: 0 as Meters,
                velocity: vec(0, 0, 0) as Vec<MetersPerSecond>
            },
            duration
        );
        if (collision === null) {
            return null;
        }
        return {
            timeToImpact: collision.timeToImpact,
            contactPoints: [collision.contactPoints[0], subtractVectors(nearestEndpointToCircle, segmentPosition)]
        };
    }
    // closest point on segment to movement endpoint
    const b = closestPointOnLineSegment({p1: A, p2: B}, C2);
    // closest point on movement vector to A
    const c = closestPointOnLineSegment({p1: C, p2: C2}, A);
    // closest point on movement vector to B
    const d = closestPointOnLineSegment({p1: C, p2: C2}, B);
    const nearestEndpointToCircleMovementEndpoint = nearestPoint([A, B], C2);
    if (!(
        (isPointWithinSegmentBoundary({p1: A, p2: B}, I) && isPointWithinSegmentBoundary({p1: C, p2: C2}, I)) ||
        (b !== null && distanceTo(b, C2) < part1.shape.radius) ||
        (c !== null && distanceTo(c, A) < part1.shape.radius) ||
        (d !== null && distanceTo(d, B) < part1.shape.radius) ||
        (distanceTo(nearestEndpointToCircleMovementEndpoint, C2) < part1.shape.radius)
    )) {
        return null;
    }
    const lengthCI = distanceTo(C, I); 
    const lengthV = vectorMagnitude(V);
    const lengthCD = distanceTo(C, D)
    const X: Meters = mul(div(lengthCI, lengthCD), part1.shape.radius);
    const lengthCP = sub(lengthCI, X);
    if (lengthV < lengthCP) {
        return null;
    }
    // circle position on collision
    const P: Vec<Meters> = addVectors(C, scaleVector(lengthCP, normalizeVector(V)));
    
    // closestPointOnLineSegmentToCollisionCirclePosition
    const E = closestPointOnLine({p1: A, p2: B}, P);
    /* if collision point of circle and line is not within line segment */
    if (!isPointWithinSegmentBoundary({p1: A, p2: B}, E)) {
        
        const nearestEndpoint = nearestPoint([A, B], E);
        const collision = incomingCollisionBetweenCircleAndStaticCircle(
            {
                center: C,
                radius: part1.shape.radius,
                velocity: movingBody.velocity
            },
            {
                center: nearestEndpoint,
                radius: 0 as Meters,
                velocity: vec(0, 0, 0) as Vec<MetersPerSecond>
            },
            duration
        );
        if (collision === null) {
            return null;
        }
        return {
            timeToImpact: collision.timeToImpact,
            contactPoints: [collision.contactPoints[0], subtractVectors(nearestEndpoint, segmentPosition)]
        };
    }
    return {
        contactPoints: [
            subtractVectors(E, C),
            subtractVectors(E, A)
        ],
        timeToImpact: div(lengthCP, vectorMagnitude(movingBody.velocity)),
    };
};

const isPointWithinSegmentBoundary = (segment: LineSegment, point: Vec<Meters>): boolean => (
    point.x >= Math.min(segment.p1.x, segment.p2.x) && point.x <= Math.max(segment.p1.x, segment.p2.x) &&
    point.z >= Math.min(segment.p1.z, segment.p2.z) && point.z <= Math.max(segment.p1.z, segment.p2.z)
);

const nearestPoint = (points: Vec<Meters>[], nearestTo: Vec<Meters>): Vec<Meters> => (
    points
        .map(point => ({distance: sqrDistanceTo(point)(nearestTo), toPoint: point}))
        .sort((first, second) => first.distance >= second.distance ? 1 : -1)[0].toPoint
);

type LineSegment = {
    p1: Vec<Meters>,
    p2: Vec<Meters>,
}

const linesIntersection = (l1: LineSegment, l2: LineSegment): Vec<Meters> | null => {
    const A1 = sub(l1.p2.z, l1.p1.z);
    const B1 = sub(l1.p1.x, l1.p2.x);
    const C1 = add(mul(A1, l1.p1.x), mul(B1, l1.p1.z));
    const A2 = sub(l2.p2.z, l2.p1.z);
    const B2 = sub(l2.p1.x, l2.p2.x);
    const C2 = add(mul(A2, l2.p1.x), mul(B2, l2.p1.z));

    const det = sub(mul(A1, B2), mul(A2, B1));
    if (det === 0) {
        return null;
    }
    const x: Meters = div(sub(mul(B2, C1), mul(B1, C2)), det);
    const z: Meters = div(sub(mul(A1, C2), mul(A2, C1)), det);
    return {
        x,
        y: 0 as Meters,
        z,
    }
};

const lineSegmentsIntersection = (l1: LineSegment, l2: LineSegment): Vec<Meters> | null => {
    const linesIntersectionPoint = linesIntersection(l1, l2);
    if (linesIntersectionPoint === null) {
        return null;
    }
    if (!isPointWithinSegmentBoundary(l1, linesIntersectionPoint) || !isPointWithinSegmentBoundary(l2, linesIntersectionPoint)) {
        return null;
    }
    return linesIntersectionPoint;
};

const closestPointOnLine = (line: LineSegment,  point: Vec<Meters>): Vec<Meters> => {
    const A1 = sub(line.p2.z, line.p1.z);
    const B1 = sub(line.p1.x, line.p2.x);
    const C1 = add(mul(line.p1.x, sub(line.p2.z, line.p1.z)), mul(line.p1.z, sub(line.p1.x, line.p2.x)));
    const C2 = sub(mul(A1, point.z), mul(B1, point.x));
    const det = add(mul(A1, A1), mul(B1, B1));
    let closestPointOnLine: Vec<Meters>;
    if (det === 0) {
        closestPointOnLine = point;
    } else {
        const x: Meters = div(sub(mul(A1, C1), mul(B1, C2)), det);
        const z: Meters = div(add(mul(A1, C2), mul(B1, C1)), det);
        closestPointOnLine = {
            x,
            y: 0 as Meters,
            z
        }
    }
    return closestPointOnLine;
}

const closestPointOnLineSegment = (line: LineSegment,  point: Vec<Meters>): Vec<Meters> | null => {
    const closestPoint = closestPointOnLine(line, point)
    if (!isPointWithinSegmentBoundary(line, closestPoint)) {
        return null;
    }
    return closestPoint;
}

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
