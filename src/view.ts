
import  { Map } from "immutable";

import { Vec, vecToArray, addVectors, subtractVectors } from "./gamda/vectors";
import { Entity, EntityId, getEntity, EntityAdded } from "./gamda/entities";
import { Soccer, Team } from "./soccer";
import { BodyPart } from "./gamda/physics/body";
import { Sphere, Segment } from "./gamda/physics/shape";
import { Physical } from "./gamda/entitiesPhysics";
import { GameEvents, game } from "./gamda/game";
import { Character, CharacterSelected } from "./character";
import { Wall } from "./wall";
import { Ball } from "./ball";
import { Application, Graphics, DisplayObject } from "pixi.js";
import { Meters } from "./gamda/physics/units";
import { DivideUnits, Unit, mul, sub } from "uom-ts";

type Pixels = Unit<{px: 1}>;

export interface View {
    app: Application,
    viewPosition: [Pixels, Pixels],
    viewScale: DivideUnits<Pixels, Meters>,
    entitiesViews: Map<EntityId, DisplayObject>;
}

export const createView = async (): Promise<View> => {
    console.log('view ok')
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const app = new Application({width: 256, height: 256, view: canvas, antialias: true, backgroundColor: 0xFFFFFF});
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);

    await loadResources();

    const entitiesViews = Map<EntityId, DisplayObject>();

    return {
        app,
        entitiesViews,
        viewPosition: [-app.view.width / 2.0 as Pixels, -app.view.height / 2.0 as Pixels],
        viewScale: 15.0 as DivideUnits<Pixels, Meters>
    };
};

const loadResources = async (): Promise<void> => {
    return new Promise(resolve => {
        PIXI.loader.add([
            "../assets/icons1.jpg",
            "../assets/icons2.jpg",
        ]).load(resolve);
    });
};

export const updateEntitiesViewPositions = (game: Soccer): Soccer => {
    game.view.entitiesViews.forEach(
        (view, entityId) => {
            let entity = getEntity(entityId, game.entities) as Entity<Physical>;
            view.position.set(...vecToViewCoords(entity.body.position, game.view));
        }
    );
    return game;
};

const createCharacterView = (view: View, character: Character): DisplayObject => {
    const body = character.body;
    const sphereBody = body.parts[0] as BodyPart<Sphere>;
    const graphics = new Graphics();
    let color;
    if (character.teamAssign.team === Team.A) {
        color = 0xFF0000; 
    } else {
        color = 0x00FF00; 
    }
    graphics.lineStyle(5, color, 1);
    graphics.beginFill(0xFFFFFF);
    graphics.arc(0, 0, (sphereBody.shape.radius * view.viewScale) - 5/2, 0, 2*Math.PI);
    graphics.endFill();
    graphics.position.set(...vecToViewCoords(body.position, view));
    return graphics;
};

const createBallView = (view: View, ball: Ball): DisplayObject => {
    const body = ball.body;
    const sphereBody = body.parts[0] as BodyPart<Sphere>;
    const graphics = new Graphics();
    graphics.lineStyle(5, 0x000000, 1);
    graphics.beginFill(0xFFFFFF);
    graphics.arc(0, 0, sphereBody.shape.radius * view.viewScale, 0, 2*Math.PI);
    graphics.endFill();
    graphics.position.set(...vecToViewCoords(body.position, view));
    return graphics;
};

const createWallView = (view: View, wall: Wall): DisplayObject => {
    const segment = wall.body.parts[0] as BodyPart<Segment>;
    const graphics = new Graphics();
    graphics.lineStyle(1, 0x000000, 1);
    const pointA = addVectors(addVectors(wall.body.position, segment.relativePosition), segment.shape.pointA);
    const graphicsPointA = vecToViewCoords(pointA, view) as [Pixels, Pixels];
    const pointB = addVectors(pointA, segment.shape.pointB);
    const graphicsPointB = vecToViewCoords(pointB, view) as [Pixels, Pixels];

    graphics.position.set(...graphicsPointA);
    graphics.moveTo(0, 0);
    graphics.lineTo(graphicsPointB[0] - graphicsPointA[0], graphicsPointB[1] - graphicsPointA[1]);
    
    return graphics;
}

export const addEntityViewToView = (entity: Entity<Physical & unknown>, view: View): View => {
    let displayObject;
    switch (entity.type) {
        case 'character':
            displayObject = createCharacterView(view, entity as Character);
            break;
        case 'ball':
            displayObject = createBallView(view, entity as Ball);
            break;
        case 'wall':
            displayObject = createWallView(view, entity as Wall);
            break;
        default:
            throw new Error("Unknown entity type");
    }
    view.app.stage.addChild(displayObject);
    return {
        ...view,
        entitiesViews: view.entitiesViews.set(entity.id!, displayObject),
    };
};

const vecToViewCoords = (vec: Vec<Meters>, view: View): Pixels[] => {
    const [x, _, z] = vecToArray(vec);
    const [scaledX, scaledZ] = [mul(x, view.viewScale), mul(z, view.viewScale)]
    return [sub(scaledX, view.viewPosition[0]), sub(view.app.view.height as Pixels, sub(scaledZ, view.viewPosition[1]))];
}

export const addEntityView = (event: EntityAdded) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    view: addEntityViewToView(getEntity(event.entityId, game.entities) as Entity<Physical>, game.view)
}, []];

export const changeSelectedViewCharacter = (event: CharacterSelected) => (game: Soccer): [Soccer, GameEvents] => {
    return [game, []];
};
