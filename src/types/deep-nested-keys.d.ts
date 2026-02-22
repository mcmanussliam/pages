import {type Primitive} from './primitive';

export type DeepNestedKeys<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive
        ? K
        : `${K}.${DeepNestedKeys<T[K]>}`;
    }[keyof T & string];
