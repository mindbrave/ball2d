
import { div, mul, sub, add, Scalar } from "uom-ts";

import { normalizeVector, subtractVectors, dotProduct, scaleVector, crossProduct, Vec, addVectors, perpendicularVectorOnXZSpace, isEqualVector, negateVector } from "../../vectors";
import { Body, BodyPart } from "../body";
import { Sphere, Triangle, Segment, Circle } from "../shape";
import { MetersPerSecond } from "../units";
import { BodyCollision } from "./collision";

export const sphereBounceOfSphere = (body1: Body, part1: BodyPart<Sphere>, body2: Body, part2: BodyPart<Sphere>): Body => {
    const normalizedVectorBetween = normalizeVector(subtractVectors(
        addVectors(body2.position, part2.relativePosition),
        addVectors(body1.position, part1.relativePosition)
    ));
    const a1 = dotProduct(body1.velocity, normalizedVectorBetween);
    const a2 = dotProduct(body2.velocity, normalizedVectorBetween);

    const optimizedP = div(mul(2.0 as Scalar, sub(a1, a2)), add(body1.mass, body2.mass));
    const newVelocity = subtractVectors(body1.velocity, scaleVector(mul(optimizedP, body2.mass), normalizedVectorBetween));
    return {
        ...body1,
        velocity: newVelocity,
    };
};

export const sphereBounceOfStaticTriangle = (body1: Body, part1: BodyPart<Sphere>, body2: Body, part2: BodyPart<Triangle>): Body => {
    const triangleNormal = crossProduct(
        subtractVectors(part2.shape.p2, part2.shape.p1),
        subtractVectors(part2.shape.p3, part2.shape.p1)
    );
    const reflectedVelocity: Vec<MetersPerSecond> = scaleVector(
        mul(2 as Scalar, div(dotProduct(triangleNormal, body1.velocity), dotProduct(triangleNormal, triangleNormal))),
        triangleNormal
    );
    return {
        ...body1,
        velocity: subtractVectors(body1.velocity, scaleVector(mul(body1.elasticity, body2.elasticity), reflectedVelocity)),
    };
};

export const circleBounceOfStaticSegment = (body1: Body, part1: BodyPart<Circle>, body2: Body, part2: BodyPart<Segment>, collision: BodyCollision): Body => {
    const normal = perpendicularVectorOnXZSpace(subtractVectors(part2.shape.pointB, part2.shape.pointA));
    const reflectedVelocity: Vec<MetersPerSecond> = scaleVector(
        mul(2 as Scalar, div(dotProduct(normal, body1.velocity), dotProduct(normal, normal))),
        normal
    );
    
    if (isEqualVector(collision.contactPoints[1], part2.shape.pointA) || isEqualVector(collision.contactPoints[1], part2.shape.pointB)) {
        // collision with segment corner
        const normalizedVectorBetween = normalizeVector(subtractVectors(
            addVectors(addVectors(body2.position, part2.relativePosition), collision.contactPoints[1]),
            addVectors(body1.position, part1.relativePosition)
        ));
        const a1 = dotProduct(body1.velocity, normalizedVectorBetween);
    
        const optimizedP = mul(2.0 as Scalar, a1);
        const newVelocity = subtractVectors(body1.velocity, scaleVector(optimizedP, normalizedVectorBetween));
        return {
            ...body1,
            velocity: newVelocity,
        };
    }
    return {
        ...body1,
        velocity: subtractVectors(body1.velocity, scaleVector(mul(body1.elasticity, body2.elasticity), reflectedVelocity)),
    };
};
