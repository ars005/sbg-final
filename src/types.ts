import { Object3D, Vector3 } from "three";

export interface ExtendedObject3D extends Object3D {
  userData: {
    hit?: boolean;
    velocity?: Vector3;
  };
}
