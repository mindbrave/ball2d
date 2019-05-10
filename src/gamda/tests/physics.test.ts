
import { assert } from "chai";
import { Scalar } from "uom-ts";
import { pipe } from "remeda";
 
import { 
    givenBody, withVelocity, withZeroVelocity, atPosition, withDampening
} from "./fixtures/body";
import { Seconds, Meters, MetersPerSecond, MetersPerSquaredSecond } from "../physics/units";
import { setBodyVelocityTowardsDirection, accelerate, tuneAccelerationToNotExceedGivenVelocity, applyDampening, move } from "../physics/motion";

test("that body is not moved if velocity is zero", () => {
    const body = pipe(givenBody(), withZeroVelocity);

    const movedBody = move(1.0 as Seconds, body);

    assert.deepEqual(body.position, movedBody.position);
});

test("that can move body", () => {
    const body = pipe(givenBody(), atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}), withVelocity({
        x: 4.0 as MetersPerSecond,
        y: 0 as MetersPerSecond,
        z: 5.0 as MetersPerSecond,
    }));

    const movedBody = move(1.0 as Seconds, body);

    assert.deepEqual(movedBody.position, {
        x: 4.0 as Meters,
        y: 0 as Meters,
        z: 5.0 as Meters,
    });
});

test("that can set body velocity towards given direction", () => {
    const body = givenBody();

    const changedBody = setBodyVelocityTowardsDirection(
        {
            x: 1.0 as Scalar,
            y: 0 as Scalar,
            z: 0 as Scalar,
        },
        5.0 as MetersPerSecond,
        body
    );

    assert.deepEqual(changedBody.velocity, {
        ...body.velocity,
        x: 5.0 as MetersPerSecond,
    });
});

test("that applying zero acceleration will not speed body up", () => {
    const body = pipe(givenBody(), withZeroVelocity);

    const acceleratedBody = accelerate({
            x: 0 as MetersPerSquaredSecond,
            y: 0 as MetersPerSquaredSecond,
            z: 0 as MetersPerSquaredSecond,
        },
        1.0 as Seconds,
        body
    );

    assert.deepEqual(acceleratedBody.velocity, body.velocity);
});

test("that can accelerate body", () => {
    const body = pipe(givenBody(), withZeroVelocity);

    const acceleratedBody = accelerate({
            x: 1.0 as MetersPerSquaredSecond,
            y: 0 as MetersPerSquaredSecond,
            z: 0 as MetersPerSquaredSecond,
        },
        1.0 as Seconds,
        body
    );

    assert.deepEqual(acceleratedBody.velocity, {
        x: 1.0 as MetersPerSecond,
        y: 0 as MetersPerSecond,
        z: 0 as MetersPerSecond,
    });
});

describe("can tune acceleration so that it won't exceed given velocity", () => {
    test("acceleration is not tuned because it won't exceed given velocity", () => {

        const acceleration = tuneAccelerationToNotExceedGivenVelocity(
            1.0 as MetersPerSecond,
            1.0 as Seconds,
            {
                x: 0 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            },
            {
                x: 1.0 as MetersPerSquaredSecond,
                y: 0 as MetersPerSquaredSecond,
                z: 0 as MetersPerSquaredSecond,
            },
        );

        assert.deepEqual(acceleration, {
            x: 1.0 as MetersPerSquaredSecond,
            y: 0 as MetersPerSquaredSecond,
            z: 0 as MetersPerSquaredSecond,
        });
    });

    test("acceleration is tuned down because it will exceed given velocity", () => {
        const acceleration = tuneAccelerationToNotExceedGivenVelocity(
            1.0 as MetersPerSecond,
            1.0 as Seconds,
            {
                x: 0.5 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            },
            {
                x: 1.0 as MetersPerSquaredSecond,
                y: 0 as MetersPerSquaredSecond,
                z: 0 as MetersPerSquaredSecond,
            },
        );

        assert.deepEqual(acceleration, {
            x: 0.5 as MetersPerSquaredSecond,
            y: 0 as MetersPerSquaredSecond,
            z: 0 as MetersPerSquaredSecond,
        });
    });

    test("acceleration is tuned down to zero because velocity is already maximum", () => {
        const acceleration = tuneAccelerationToNotExceedGivenVelocity(
            1.0 as MetersPerSecond,
            1.0 as Seconds,
            {
                x: 1.0 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            },
            {
                x: 1.0 as MetersPerSquaredSecond,
                y: 0 as MetersPerSquaredSecond,
                z: 0 as MetersPerSquaredSecond,
            },
        );

        assert.deepEqual(acceleration, {
            x: 0 as MetersPerSquaredSecond,
            y: 0 as MetersPerSquaredSecond,
            z: 0 as MetersPerSquaredSecond,
        });
    });

    test("acceleration is tuned down to zero because velocity is already over maximum", () => {
        const acceleration = tuneAccelerationToNotExceedGivenVelocity(
            1.0 as MetersPerSecond,
            1.0 as Seconds,
            {
                x: 2.0 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            },
            {
                x: 1.0 as MetersPerSquaredSecond,
                y: 0 as MetersPerSquaredSecond,
                z: 0 as MetersPerSquaredSecond,
            },
        );

        assert.deepEqual(acceleration, {
            x: 0 as MetersPerSquaredSecond,
            y: 0 as MetersPerSquaredSecond,
            z: 0 as MetersPerSquaredSecond,
        });
    });
});

describe("dampening is decreasing velocity of body during time until it stopes", () => {
    test("velocity stays at zero if its already zero", () => {
        const body = pipe(givenBody(), withZeroVelocity);

        const changedBody = applyDampening(
            1.0 as Seconds,
            body
        );

        assert.deepEqual(changedBody.velocity, {
            x: 0 as MetersPerSecond,
            y: 0 as MetersPerSecond,
            z: 0 as MetersPerSecond,
        });
    });

    test("velocity should be decreased by dampening", () => {
        const body = pipe(
            givenBody(),
            withVelocity({
                x: 2.0 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            }),
            withDampening(1.0 as MetersPerSquaredSecond)
        );

        const changedBody = applyDampening(
            1.0 as Seconds,
            body
        );

        assert.deepEqual(changedBody.velocity, {
            x: 1.0 as MetersPerSecond,
            y: 0 as MetersPerSecond,
            z: 0 as MetersPerSecond,
        });
    });
});
