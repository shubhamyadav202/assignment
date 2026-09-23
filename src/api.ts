/**
 * API service layer – connects the React Native frontend to the Express backend.
 *
 * • Android emulator reaches the host machine via 10.0.2.2
 * • iOS simulator / web use localhost
 */

import { Platform } from "react-native";

const HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const PORT = 5000;
export const BASE_URL = `http://${HOST}:${PORT}/api`;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Judge {
  name: string;
  role: string;
  description: string;
  experience: string;
  avatarUrl: string | null;
  introVideoUrl: string | null;
}

export interface Reward {
  position: string;
  amount: number;
  icon: string;
}

export interface CompetitionDates {
  registrationEnd: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
}

export interface Winner {
  _id: string;
  name: string;
  position: string;
  hasVideo: boolean;
}

export interface Competition {
  _id: string;
  title: string;
  tags: string[];
  prizePool: number;
  entryFee: number;
  totalSpots: number;
  bookedSpots: number;
  spotsLeft: number;
  certificateForWinners: boolean;
  judge: Judge;
  dates: CompetitionDates;
  aboutContent: string[];
  judgingParameters: string[];
  rulesAndEligibility: string[];
  rewards: Reward[];
  disclaimer: string;
  referralEarning: number;
  status: string;
  previousWinners?: Winner[];
}

// ─── Fetch helpers ──────────────────────────────────────────────────────────

/**
 * Fetch the first active competition with its winners from the backend.
 * Calls GET /api/competitions then GET /api/competitions/:id for full detail.
 */
export async function fetchCompetition(): Promise<Competition> {
  // 1. Get all competitions
  const listRes = await fetch(`${BASE_URL}/competitions`);
  if (!listRes.ok) throw new Error(`API error: ${listRes.status}`);
  const listData = await listRes.json();

  if (!listData.success || !listData.data?.length) {
    throw new Error("No competitions found");
  }

  // 2. Get full detail of the first competition (includes winners)
  const id = listData.data[0]._id;
  const detailRes = await fetch(`${BASE_URL}/competitions/${id}`);
  if (!detailRes.ok) throw new Error(`API error: ${detailRes.status}`);
  const detailData = await detailRes.json();

  if (!detailData.success) {
    throw new Error("Failed to fetch competition detail");
  }

  return detailData.data as Competition;
}
