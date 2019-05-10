
import  { Map } from "immutable";
import { isNil } from "ramda";
import { 
    Engine, Scene, Vector3, MeshBuilder, DirectionalLight, Mesh, ArcRotateCamera,
    ShadowGenerator,
    Material,
    Color3,
    StandardMaterial,
    PointLight,
    Color4,
    DefaultRenderingPipeline,
 } from "babylonjs";
import "babylonjs-materials";

import { Vec, vecToArray, Radians, normalizeVector } from "./gamda/vectors";
import { Entity, EntityId, getEntity, EntityAdded } from "./gamda/entities";
import { Soccer } from "./soccer";
import { Meters } from "./gamda/physics/units";
import { Body, BodyPart } from "./gamda/physics/body";
import { Sphere, Triangle } from "./gamda/physics/shape";
import { Physical } from "./gamda/entitiesPhysics";
import { GameEvents } from "./gamda/game";
import { Character, CharacterSelected } from "./character";
import { Wall } from "./wall";
import { flatten } from "remeda";
import { Scalar } from "uom-ts";
import { pipe } from "rxjs";
import { Ball } from "./ball";

export interface View {
    engine: Engine;
    scene: Scene;
    entitiesMesh: Map<EntityId, Mesh>;
    shadowGenerators: ShadowGenerator[];
    camera: ArcRotateCamera;
    materials: {
        [name:string]: Material
    }
}

export const createView = (): View => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const engine = new Engine(canvas, false);

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1);

    const light1 = new PointLight("pointLight", new Vector3(-28, 28, -28), scene);
    light1.intensity = 1.0;
    const shadowGenerator1 = new ShadowGenerator(1024, light1);
    shadowGenerator1.useExponentialShadowMap = true;
    const light2 = new PointLight("pointLight", new Vector3(28, 28, 28), scene);
    // const shadowGenerator2 = new ShadowGenerator(1024, light2);
    // shadowGenerator2.useExponentialShadowMap = true;

    const camera = createCamera(scene);
    camera.attachControl(canvas, true);

    const pipeline = new DefaultRenderingPipeline(
        "default", // The name of the pipeline
        true, // Do you want HDR textures ?
        scene, // The scene instance
        [camera] // The list of cameras to be attached to
    );
    pipeline.samples = 4;
    pipeline.imageProcessing.contrast = 1.0;

    const entitiesMesh = Map<EntityId, Mesh>();

    const wallMaterial = new StandardMaterial("WallMaterial", scene);
    wallMaterial.diffuseColor = new Color3(79/255.0, 57/255.0, 35/255.0);
    wallMaterial.specularColor = new Color3(79/255.0, 57/255.0, 35/255.0);

    const ballMaterial = new StandardMaterial("BallMaterial", scene);
    ballMaterial.diffuseColor = new Color3(40/255.0, 54/255.0, 76/255.0);
    ballMaterial.specularColor = new Color3(40/255.0, 54/255.0, 76/255.0);

    return {
        engine,
        scene,
        entitiesMesh,
        shadowGenerators: [shadowGenerator1],
        camera,
        materials: {
            'wall': wallMaterial,
            'ball': ballMaterial,
        }
    };
};

export const createCamera = (scene: Scene): ArcRotateCamera => {
    const camera = new ArcRotateCamera("Camera", 0 as Radians, Math.PI / 4 as Radians, 100.0 as Meters, Vector3.Zero(), scene);
    camera.angularSensibilityX = 5000.0;
    camera.angularSensibilityY = 5000.0;
    camera.lowerAlphaLimit = -Math.PI / 2 as Radians;
    camera.upperAlphaLimit = -Math.PI / 2 as Radians;
    camera.lowerBetaLimit = Math.PI / 4 as Radians;
    camera.upperBetaLimit = Math.PI / 4 as Radians;
    camera.lowerRadiusLimit = 100.0 as Meters;
    camera.upperRadiusLimit = 100.0 as Meters;
    return camera;
};

export const updateEntitiesMeshPositions = (game: Soccer): Soccer => {
    game.view.entitiesMesh.forEach(
        (mesh, entityId) => {
            let entity = getEntity(entityId, game.entities) as Entity<Physical>;
            mesh.setAbsolutePosition(vecToBabylonVec(entity.body.position));
        }
    );
    return game;
};

export const runRenderLoop = (view: View): View => {
    view.engine.runRenderLoop(() => {
        view.scene.render();
    });
    return view;
};

const createCharacterView = (view: View, character: Character): Mesh => {
    const body = character.body;
    const sphereBody = body.parts[0] as BodyPart<Sphere>;
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: sphereBody.shape.radius * 2, segments: 12 }, view.scene);
    sphere.setAbsolutePosition(vecToBabylonVec(body.position));
    view.shadowGenerators.forEach(generator => generator.addShadowCaster(sphere));
    return sphere;
};

const createBallView = (view: View, ball: Ball): Mesh => {
    const body = ball.body;
    const sphereBody = body.parts[0] as BodyPart<Sphere>;
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: sphereBody.shape.radius * 2, segments: 12 }, view.scene);
    sphere.setAbsolutePosition(vecToBabylonVec(body.position));
    sphere.material = view.materials["ball"];
    view.shadowGenerators.forEach(generator => generator.addShadowCaster(sphere));
    return sphere;
};

const createWallView = (view: View, wall: Wall): Mesh => {
    const triangle1 = wall.body.parts[0] as BodyPart<Triangle>;
    const triangle2 = wall.body.parts[1] as BodyPart<Triangle>;
    const mesh = new Mesh("wall", view.scene);
    mesh.material = view.materials["wall"];
    mesh.receiveShadows = true;
    const positions = flatten(
        [triangle1.shape.p1, triangle2.shape.p3, triangle1.shape.p3, triangle1.shape.p2].map(vecToArray)
    );
    const indices = [0, 1, 2, 0, 2, 3];    

    const normals: number[] = [];

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);

    const vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.applyToMesh(mesh);

    mesh.setAbsolutePosition(vecToBabylonVec(wall.body.position));
    return mesh;
}

export const addEntityMeshToView = (entity: Entity<Physical & unknown>, view: View): View => {
    let mesh;
    switch (entity.type) {
        case 'character':
            mesh = createCharacterView(view, entity as Character);
            break;
        case 'ball':
            mesh = createBallView(view, entity as Ball);
            break;
        case 'wall':
            mesh = createWallView(view, entity as Wall);
            break;
        default:
            throw new Error("Unknown entity type");
    }
    return {
        ...view,
        entitiesMesh: view.entitiesMesh.set(entity.id!, mesh),
    };
};

export const getPointerCurrent3dPosition = (view: View): Vec<Meters> | null => {
    const pickInfo = view.scene.pick(view.scene.pointerX, view.scene.pointerY);
    if (isNil(pickInfo) || isNil(pickInfo.pickedPoint)) {
        return null;
    }
    return babylonVectorToVec(pickInfo.pickedPoint);
};

export const getCameraDirection = (view: View): Vec<Scalar> => {
    return normalizeVector(babylonVectorToVec(view.camera.target.subtract(view.camera.position)));
}

export const changeCameraEntityTarget = (entity: Entity<Physical>, view: View): View => {
    view.camera.setTarget(view.entitiesMesh.get(entity.id!)!);
    return view;
};

const vecToBabylonVec = (vec: Vec): Vector3 => Vector3.FromArray(vecToArray(vec));
const babylonVectorToVec = (vec: Vector3): Vec<Meters> => ({x: vec.x as Meters, y: vec.y as Meters, z: vec.z as Meters});

export const addEntityView = (event: EntityAdded) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    view: addEntityMeshToView(getEntity(event.entityId, game.entities) as Entity<Physical>, game.view)
}, []];

export const changeViewCameraTarget = (event: CharacterSelected) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    // view: changeCameraEntityTarget(getEntity(event.characterId, game.entities) as Entity<Physical>, game.view),
}, []];
