export interface User {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  bio?: string;
  photos: string[];
  avgRating: number;
}

export type Gender =
  | "male"
  | "female"
  | "prefer_not_to_say";