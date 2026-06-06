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

export interface Sport {
  id: string;
  name: string;
}

export interface UserSport {
  sportId: string;
  level: "beginner" | "intermediate" | "professional";
}

export interface PayeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  sportId: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Session {
  id: string;
  requestId: string;
  startedAt: string;
  endedAt?: string;
}