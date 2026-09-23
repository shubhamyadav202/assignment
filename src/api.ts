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

export interface EmailDeliveryInfo {
  sent: boolean;
  sentAt: string | null;
  resendId: string | null;
  error: string | null;
}

export interface DanceApplication {
  _id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  danceStyle: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  city: string;
  videoUrl: string;
  proposal: string;
  competition?: string | { _id: string; title: string } | null;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string | null;
  statusUpdatedAt?: string | null;
  emailDelivery?: EmailDeliveryInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationCounts {
  all: number;
  pending: number;
  accepted: number;
  rejected: number;
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

export interface UploadVideoResponse {
  success: boolean;
  url: string;
  publicId?: string;
  duration?: number;
  simulated?: boolean;
  message?: string;
}

/**
 * Upload an audition video file to Cloudinary via backend.
 */
export async function uploadAuditionVideo(video: {
  uri: string;
  name?: string;
  type?: string;
}): Promise<UploadVideoResponse> {
  const formData = new FormData();
  const filename = video.name || video.uri.split("/").pop() || "audition.mp4";
  const mimeType = video.type || "video/mp4";

  formData.append("video", {
    uri: video.uri,
    type: mimeType,
    name: filename,
  } as any);

  const res = await fetch(`${BASE_URL}/upload/video`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to upload video to Cloudinary");
  }

  return json;
}

/**
 * Submit a dance team application to the competition.
 */
export async function submitDanceApplication(data: Partial<DanceApplication>): Promise<{
  success: boolean;
  message: string;
  data: DanceApplication;
}> {
  const res = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to submit application");
  }

  return json;
}

/**
 * Fetch all dance applications for the organiser dashboard.
 */
export async function fetchDanceApplications(
  status: string = "all",
  search?: string
): Promise<{
  data: DanceApplication[];
  counts: ApplicationCounts;
  count: number;
}> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search && search.trim()) params.append("q", search.trim());

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE_URL}/applications${queryStr}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to fetch applications");
  }

  return {
    data: json.data,
    counts: json.counts || { all: 0, pending: 0, accepted: 0, rejected: 0 },
    count: json.count,
  };
}

/**
 * Update application status (accept/reject) and trigger Resend email when accepted.
 */
export async function updateDanceApplicationStatus(
  id: string,
  status: "accepted" | "rejected" | "pending",
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: DanceApplication;
  emailResult?: any;
}> {
  const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, reason }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to update status to ${status}`);
  }

  return json;
}

/**
 * Seed sample applications (for quick testing)
 */
export async function seedDanceApplications(force: boolean = false): Promise<any> {
  const res = await fetch(`${BASE_URL}/applications/seed${force ? "?force=true" : ""}`, {
    method: "POST",
  });
  return res.json();
}

