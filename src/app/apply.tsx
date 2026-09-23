import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { submitDanceApplication, DanceApplication } from "../api";

const COLORS = {
  primary: "#0B6B6B",
  primaryDark: "#084E4E",
  primaryLight: "#E6F5F5",
  accent: "#F5A623",
  white: "#FFFFFF",
  black: "#1A1A1A",
  gray100: "#F7F8F9",
  gray200: "#ECEEF0",
  gray300: "#D4D8DC",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  green: "#27AE60",
  greenLight: "#E8F8EE",
  red: "#E74C3C",
  cardBorder: "#E5E7EB",
};

const DANCE_STYLES = [
  { id: "hiphop", name: "Hip-Hop / Popping", icon: "🕺" },
  { id: "contemporary", name: "Contemporary / Lyrical", icon: "💃" },
  { id: "bollywood", name: "Bollywood / Commercial", icon: "🌟" },
  { id: "classical", name: "Classical / Folk", icon: "🪘" },
  { id: "urban", name: "Urban Choreography", icon: "⚡" },
  { id: "freestyle", name: "Freestyle / B-Boying", icon: "🔥" },
];

const EXPERIENCE_LEVELS: ("Beginner" | "Intermediate" | "Advanced" | "Professional")[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
];

export default function ApplyScreen() {
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [memberCount, setMemberCount] = useState(6);
  const [selectedStyle, setSelectedStyle] = useState("Hip-Hop / Popping");
  const [experienceLevel, setExperienceLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "Professional">("Advanced");
  const [city, setCity] = useState("Mumbai");
  const [videoUrl, setVideoUrl] = useState("");
  const [proposal, setProposal] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<DanceApplication | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fillSampleData = () => {
    setTeamName("Vibe Dynasty Crew");
    setLeaderName("Rohit Sharma");
    setLeaderEmail("delivered@resend.dev");
    setLeaderPhone("+91 98765 12345");
    setMemberCount(8);
    setSelectedStyle("Hip-Hop / Popping");
    setExperienceLevel("Professional");
    setCity("Mumbai");
    setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    setProposal("An explosive fusion of krump, locking, and synchronized formation drops highlighting youth energy and cultural pride.");
  };

  const handleSubmit = async () => {
    if (!teamName.trim()) {
      Alert.alert("Missing Detail", "Please enter your Dance Team Name.");
      return;
    }
    if (!leaderName.trim()) {
      Alert.alert("Missing Detail", "Please enter the Team Leader / Choreographer's Name.");
      return;
    }
    if (!leaderEmail.trim() || !leaderEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address so the organiser can send your selection letter.");
      return;
    }
    if (!leaderPhone.trim()) {
      Alert.alert("Missing Detail", "Please enter a contact phone number.");
      return;
    }
    if (!videoUrl.trim()) {
      Alert.alert("Missing Video Link", "Please provide a link to your audition or past stage performance video.");
      return;
    }

    try {
      setLoading(true);
      const res = await submitDanceApplication({
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        leaderEmail: leaderEmail.trim().toLowerCase(),
        leaderPhone: leaderPhone.trim(),
        memberCount,
        danceStyle: selectedStyle,
        experienceLevel,
        city: city.trim(),
        videoUrl: videoUrl.trim(),
        proposal: proposal.trim(),
      });

      setSubmittedData(res.data);
      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message || "Could not submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Dance Team Application</Text>
            <Text style={styles.headerSubtitle}>Official Entry Registration</Text>
          </View>
          <TouchableOpacity style={styles.sampleButton} onPress={fillSampleData}>
            <Text style={styles.sampleButtonText}>⚡ Auto-Fill</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Banner Card ─────────────────────────────────────── */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>🏆 AUDITIONS OPEN</Text>
            </View>
            <Text style={styles.bannerTitle}>Feedants National Championship</Text>
            <Text style={styles.bannerDescription}>
              Complete the crew profile and paste your audition video link. Once the organiser reviews and accepts your proposal, a confirmation email will be delivered to you via Resend!
            </Text>
          </View>

          {/* ── Section 1: Team Details ─────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👥</Text>
              <Text style={styles.sectionTitle}>Dance Crew Information</Text>
            </View>

            <Text style={styles.inputLabel}>
              Team / Crew Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Desi Hip-Hop Kings"
              placeholderTextColor={COLORS.gray400}
              value={teamName}
              onChangeText={setTeamName}
            />

            <Text style={styles.inputLabel}>
              Dance Category / Style <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipContainer}>
              {DANCE_STYLES.map((style) => {
                const isSelected = selectedStyle === style.name;
                return (
                  <TouchableOpacity
                    key={style.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedStyle(style.name)}
                  >
                    <Text style={styles.chipIcon}>{style.icon}</Text>
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {style.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stepper for Member Count */}
            <View style={styles.stepperRow}>
              <View>
                <Text style={styles.inputLabel}>Crew Size (Dancers)</Text>
                <Text style={styles.inputSubtext}>Min: 2 • Max: 50 members</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMemberCount((prev) => Math.max(2, prev - 1))}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{memberCount}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMemberCount((prev) => Math.min(50, prev + 1))}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.inputLabel}>Home City / State</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Mumbai, Maharashtra"
              placeholderTextColor={COLORS.gray400}
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* ── Section 2: Leader & Contact Info ─────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👑</Text>
              <Text style={styles.sectionTitle}>Leader & Contact Details</Text>
            </View>

            <Text style={styles.inputLabel}>
              Team Leader / Choreographer Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Rohit Sharma"
              placeholderTextColor={COLORS.gray400}
              value={leaderName}
              onChangeText={setLeaderName}
            />

            <Text style={styles.inputLabel}>
              Contact Email (for Selection Letters) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="leader.dance@example.com"
              placeholderTextColor={COLORS.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              value={leaderEmail}
              onChangeText={setLeaderEmail}
            />
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxIcon}>ℹ️</Text>
              <Text style={styles.infoBoxText}>
                When the organiser approves your application, your official selection letter and stage pass instructions will be emailed to this address via Resend.
              </Text>
            </View>

            <Text style={styles.inputLabel}>
              WhatsApp / Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.gray400}
              keyboardType="phone-pad"
              value={leaderPhone}
              onChangeText={setLeaderPhone}
            />

            <Text style={styles.inputLabel}>Crew Experience Level</Text>
            <View style={styles.experienceRow}>
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isSelected = experienceLevel === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.expPill, isSelected && styles.expPillActive]}
                    onPress={() => setExperienceLevel(lvl)}
                  >
                    <Text style={[styles.expPillText, isSelected && styles.expPillTextActive]}>
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Section 3: Audition Video & Concept Proposal ──────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎬</Text>
              <Text style={styles.sectionTitle}>Audition Video & Concept</Text>
            </View>

            <Text style={styles.inputLabel}>
              Performance / Audition Video URL <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://youtube.com/watch?v=... or Google Drive link"
              placeholderTextColor={COLORS.gray400}
              autoCapitalize="none"
              keyboardType="url"
              value={videoUrl}
              onChangeText={setVideoUrl}
            />

            <Text style={styles.inputLabel}>Choreography Proposal & Theme</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Tell the judges about your routine, music mix, theme, props, or why your crew should take the stage..."
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={proposal}
              onChangeText={setProposal}
            />
          </View>

          {/* ── Submit Action ───────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>🚀 Submit Dance Application</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomLinkContainer}>
            <Text style={styles.bottomLinkText}>Are you the competition organiser?</Text>
            <TouchableOpacity onPress={() => router.push("/organiser")}>
              <Text style={styles.bottomLinkAction}>Open Organiser Review Dashboard →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Success Modal ────────────────────────────────────────── */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successIcon}>🎉</Text>
            </View>
            <Text style={styles.modalTitle}>Application Submitted!</Text>
            <Text style={styles.modalSubtitle}>
              Your dance crew <Text style={styles.modalHighlight}>{submittedData?.teamName}</Text> has successfully registered for the auditions.
            </Text>

            <View style={styles.modalSummaryBox}>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Leader: </Text>
                {submittedData?.leaderName}
              </Text>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Style: </Text>
                {submittedData?.danceStyle}
              </Text>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Email: </Text>
                {submittedData?.leaderEmail}
              </Text>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Status: </Text>
                <Text style={{ color: COLORS.accent, fontWeight: "700" }}>Pending Review</Text>
              </Text>
            </View>

            <Text style={styles.modalNotice}>
              ✉️ When the organiser accepts your entry, an automated notification will be sent to your email via Resend.
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/organiser");
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Go to Organiser Portal to Review →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <Text style={styles.modalSecondaryBtnText}>Back to Competition</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.black,
    fontWeight: "700",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  sampleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  sampleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  bannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.black,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 6,
  },
  bannerDescription: {
    fontSize: 13,
    color: "#E2E8F0",
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray700,
    marginTop: 10,
    marginBottom: 6,
  },
  inputSubtext: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  required: {
    color: COLORS.red,
  },
  textInput: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 90,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: "500",
  },
  chipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray200,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
  },
  stepperValue: {
    minWidth: 32,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  infoBoxIcon: {
    fontSize: 14,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: "#0369A1",
    lineHeight: 16,
  },
  experienceRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  expPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: "center",
  },
  expPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  expPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.gray600,
  },
  expPillTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  bottomLinkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  bottomLinkText: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  bottomLinkAction: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.greenLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  successIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.gray600,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  modalHighlight: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  modalSummaryBox: {
    width: "100%",
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 4,
  },
  summaryItem: {
    fontSize: 13,
    color: COLORS.gray700,
  },
  summaryLabel: {
    fontWeight: "600",
    color: COLORS.gray500,
  },
  modalNotice: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 18,
  },
  modalPrimaryBtn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  modalSecondaryBtn: {
    paddingVertical: 6,
  },
  modalSecondaryBtnText: {
    fontSize: 13,
    color: COLORS.gray500,
  },
});
