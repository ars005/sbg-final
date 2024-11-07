import { Object3D, Vector3 } from "three";

export interface Human extends Object3D {
  userData: {
    hit?: boolean;
    velocity?: Vector3;
    id?: string;
    health?: number;
    bullets?: number;
  };
}
