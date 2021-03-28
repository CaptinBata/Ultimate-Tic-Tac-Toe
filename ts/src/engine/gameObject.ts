import { minMax, Engine } from './engine.js'
import { Vector } from "./vector.js"

interface drawObject {
    drawPoints: Vector[],
    fillColour: string,
    strokeColour: string,
    minMax?: minMax
}

class GameObject {
    drawObjects: drawObject[] = [];
    position: Vector = null;
    toDelete = false;
    minMax: minMax

    constructor(x: number, y: number) {
        this.position = new Vector(x, y);
    }

    destructor() {
        this.drawObjects = undefined;
        this.position = undefined;
        this.minMax = undefined;
    }

    setDrawObject(drawObject: drawObject[]) {
        this.drawObjects = drawObject;
        this.getObjectBounds();
    }

    getMinMax() {
        return this.minMax;
    }

    checkDelete(gameObjects: GameObject[]): void {
        return null;
    }

    update(gameObjects: GameObject[]): void {
        return null;
    }

    detectAABBCollision(other: GameObject) {
        let collisions = {
            minX: false, maxX: false, minY: false, maxY: false
        }

        let otherMinGlobal = other.toGlobalCoords(other.getMinMax().min);
        let otherMaxGlobal = other.toGlobalCoords(other.getMinMax().max);

        let thisMinGlobal = this.toGlobalCoords(this.getMinMax().min)
        let thisMaxGlobal = this.toGlobalCoords(this.getMinMax().max)

        if (otherMinGlobal.x > thisMinGlobal.x
            && otherMinGlobal.x < thisMaxGlobal.x)
            collisions.minX = true;
        if (otherMaxGlobal.x > thisMinGlobal.x
            && otherMaxGlobal.x < thisMaxGlobal.x)
            collisions.maxX = true;


        if (otherMinGlobal.y > thisMinGlobal.y
            && otherMinGlobal.y < thisMaxGlobal.y)
            collisions.minY = true;
        if (otherMaxGlobal.y > thisMinGlobal.y
            && otherMaxGlobal.y < thisMaxGlobal.y)
            collisions.maxY = true;

        return (collisions.minX || collisions.maxX) && (collisions.minY || collisions.maxY); //If horizontal point and vertical point overlapping, doesn't matter which ones or if multiple of either
    }

    assignIndividualObjectBounds() {
        for (let drawObject of this.drawObjects) {
            let min = new Vector(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
            let max = new Vector(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

            for (let point of drawObject.drawPoints) {
                if (point.x < min.x)
                    min = new Vector(point.x, min.y)
                if (point.y < min.y)
                    min = new Vector(min.x, point.y)

                if (point.x > max.x)
                    max = new Vector(point.x, max.y)
                if (point.y > max.y)
                    max = new Vector(max.x, point.y)
            };

            let minMax = {
                min: min,
                max: max
            }

            drawObject.minMax = minMax; //Assign each individual part of a drawObject's minMax
        }
    }

    rotateAroundPoint(point: Vector, angle: number) {
        this.position = Vector.rotateVectorAroundPoint(this.position, point, angle)
    }

    translatePosition(otherVector: Vector) {
        this.position = Vector.translate(this.position, otherVector);
    }

    assignTotalObjectBounds() {
        let min = new Vector(1000000, 1000000);
        let max = new Vector(-1000000, -1000000);

        for (let drawObject of this.drawObjects) {
            if (drawObject.minMax.max.x > max.x)
                max = new Vector(drawObject.minMax.max.x, max.y)
            if (drawObject.minMax.max.y > max.y)
                max = new Vector(max.x, drawObject.minMax.max.y)
            if (drawObject.minMax.min.x < min.x)
                min = new Vector(drawObject.minMax.min.x, min.y)
            if (drawObject.minMax.min.y < min.y)
                min = new Vector(min.x, drawObject.minMax.min.y)
        }

        let minMax = {
            min: min,
            max: max
        }

        this.minMax = minMax; //Assign overall box of the entire object
    }

    getObjectBounds() { //Used to find the AABB (Axis-Aligned Bounding Box). Basically the basic box around the object to be used as primitive hit detection
        this.assignIndividualObjectBounds();
        this.assignTotalObjectBounds();
    }

    draw() {
        this.drawByLine();
    }

    toGlobalCoords(localVector: Vector) {
        return new Vector(this.position.x + localVector.x, this.position.y + localVector.y);
    }

    getWidth() {
        return this.getMinMax().max.x - this.getMinMax().min.x
    }

    getHeight() {
        return this.getMinMax().max.y - this.getMinMax().min.y
    }

    drawByLine() {
        for (let drawable of this.drawObjects) {
            Engine.context.beginPath();
            Engine.context.moveTo(this.toGlobalCoords(drawable.drawPoints[0]).x, this.toGlobalCoords(drawable.drawPoints[0]).y);

            for (let drawPoint of drawable.drawPoints) {
                if (drawPoint != drawable.drawPoints[0]) {
                    let drawPointGlobal = this.toGlobalCoords(drawPoint);
                    Engine.context.lineTo(drawPointGlobal.x, drawPointGlobal.y)
                }
            };

            Engine.context.closePath();
            this.setDrawModes(drawable.strokeColour, drawable.fillColour);
        };
    }

    drawByPixel() {
        for (let drawable of this.drawObjects) {
            Engine.context.beginPath();

            for (let drawPoint of drawable.drawPoints) {
                let drawPointGlobal = this.toGlobalCoords(drawPoint);
                Engine.context.rect(drawPointGlobal.x, drawPointGlobal.y, 1, 1);
            };

            Engine.context.closePath();
            this.setDrawModes(drawable.strokeColour, drawable.fillColour);
        };
    }

    setDrawModes(strokeStyle: string, fillStyle: string) {
        if (strokeStyle != "" || undefined) {
            Engine.context.strokeStyle = strokeStyle
            Engine.context.stroke();
        }
        if (fillStyle != "" || undefined) {
            Engine.context.fillStyle = fillStyle
            Engine.context.fill();
        }
    }
}

export { GameObject, drawObject }