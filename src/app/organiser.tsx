import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  fetchDanceApplications,
  updateDanceApplicationStatus,
  seedDanceApplications,
  DanceApplication,
  ApplicationCounts,
} from "../api";

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
  greenDark: "#1E8449",
  red: "#E74C3C",
  redLight: "#FDEED9",
  redDark: "#C0392B",
  yellow: "#F39C12",
  yellowLight: "#FEF9E7",
  cardBorder: "#E5E7EB",
};

export default function OrganiserScreen() {
  const [applications, setApplications] = useState<DanceApplication[]>([]);
  const [counts, setCounts] = useState<ApplicationCounts>({
    all: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState<DanceApplication | null>(null);

  const loadData = useCallback(
    async (showSpinner: boolean = true) => {
      try {
        if (showSpinner) setLoading(true);
        const res = await fetchDanceApplications(activeTab, searchQuery);
        setApplications(res.data);
        setCounts(res.counts);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load applications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, searchQuery]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await seedDanceApplications(true);
      Alert.alert("Success", "Seeded 4 realistic dance team applications!");
      loadData(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to seed sample applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (app: DanceApplication, newStatus: "accepted" | "rejected") => {
    const isAccepting = newStatus === "accepted";
    const title = isAccepting ? "Accept Team Application?" : "Reject Proposal?";
    const message = isAccepting
      ? `Accepting "${app.teamName}" will automatically trigger an email to ${app.leaderEmail} via Resend informing them that their dance team has been selected!`
      : `Are you sure you want to mark "${app.teamName}" as rejected?`;

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: isAccepting ? "✓ Yes, Accept & Send Email" : "✕ Reject Proposal",
        style: isAccepting ? "default" : "destructive",
        onPress: async () => {
          try {
            setActionLoadingId(app._id);
            const res = await updateDanceApplicationStatus(app._id, newStatus);

            // Update in local state
            setApplications((prev) =>
              prev.map((item) => (item._id === app._id ? res.data : item))
            );

            // Update selectedApp if modal is open
            if (selectedApp && selectedApp._id === app._id) {
              setSelectedApp(res.data);
            }

            if (isAccepting) {
              const emailNote = res.emailResult?.simulated
                ? `\n\n📬 [Resend Test Mode]: Selection email event simulated for ${app.leaderEmail}.`
                : res.emailResult?.success
                ? `\n\n✉️ Official selection email delivered to ${app.leaderEmail} via Resend! (ID: ${res.emailResult.id})`
                : `\n\n⚠️ Resend Note: ${res.emailResult?.error || "Email delivery failed"}`;
              Alert.alert("🎉 Team Accepted!", `"${app.teamName}" has been selected!${emailNote}`);
            } else {
              Alert.alert("Application Rejected", `"${app.teamName}" has been marked as rejected.`);
            }

            // Refresh counts
            loadData(false);
          } catch (err: any) {
            Alert.alert("Status Update Failed", err.message || "Could not update status.");
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const openVideoLink = (url: string) => {
    if (!url) {
      Alert.alert("No Video URL", "This applicant did not provide a video link.");
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Cannot Open URL", `Unable to open: ${url}`);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Organiser Dashboard</Text>
          <Text style={styles.headerSubtitle}>Review & Select Dance Teams</Text>
        </View>
        <TouchableOpacity style={styles.seedButton} onPress={handleSeed}>
          <Text style={styles.seedButtonText}>🌱 Seed Teams</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* ── Stats Metric Cards ────────────────────────────────── */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.metricNumber}>{counts.all}</Text>
            <Text style={styles.metricLabel}>Total Teams</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: COLORS.yellow }]}>
            <Text style={[styles.metricNumber, { color: COLORS.yellow }]}>{counts.pending}</Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: COLORS.green }]}>
            <Text style={[styles.metricNumber, { color: COLORS.green }]}>{counts.accepted}</Text>
            <Text style={styles.metricLabel}>Selected</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: COLORS.red }]}>
            <Text style={[styles.metricNumber, { color: COLORS.red }]}>{counts.rejected}</Text>
            <Text style={styles.metricLabel}>Rejected</Text>
          </View>
        </View>

        {/* ── Resend Integration Notice ─────────────────────────── */}
        <View style={styles.resendCard}>
          <View style={styles.resendCardHeader}>
            <Text style={styles.resendIcon}>✉️</Text>
            <Text style={styles.resendTitle}>Resend Email Automation Active</Text>
          </View>
          <Text style={styles.resendBody}>
            When you tap <Text style={{ fontWeight: "700" }}>"Accept & Send Email"</Text>, Resend dispatches the official congratulations notice with event guidelines directly to the leader's email.
          </Text>
        </View>

        {/* ── Search Bar ────────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by team, leader, dance style, or city..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filter Tabs ───────────────────────────────────────── */}
        <View style={styles.tabsRow}>
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "accepted", label: "Accepted", count: counts.accepted },
            { id: "rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Application Cards List ────────────────────────────── */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching applications...</Text>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No Applications Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No matches for "${searchQuery}". Try a different keyword.`
                : "No teams have applied under this category yet."}
            </Text>
            <TouchableOpacity style={styles.emptySeedBtn} onPress={handleSeed}>
              <Text style={styles.emptySeedBtnText}>🌱 Load Sample Teams for Demo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          applications.map((app) => {
            const isPending = app.status === "pending";
            const isAccepted = app.status === "accepted";
            const isRejected = app.status === "rejected";
            const isActionBusy = actionLoadingId === app._id;

            return (
              <View key={app._id} style={styles.appCard}>
                {/* Card Top: Team Name & Status Badge */}
                <View style={styles.appCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{app.teamName}</Text>
                    <View style={styles.styleBadge}>
                      <Text style={styles.styleBadgeText}>{app.danceStyle}</Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  {isPending && (
                    <View style={styles.statusBadgePending}>
                      <Text style={styles.statusTextPending}>⏳ Pending Review</Text>
                    </View>
                  )}
                  {isAccepted && (
                    <View style={styles.statusBadgeAccepted}>
                      <Text style={styles.statusTextAccepted}>✓ Selected (Accepted)</Text>
                    </View>
                  )}
                  {isRejected && (
                    <View style={styles.statusBadgeRejected}>
                      <Text style={styles.statusTextRejected}>✕ Rejected</Text>
                    </View>
                  )}
                </View>

                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👑 Leader:</Text>
                    <Text style={styles.detailValue}>{app.leaderName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📧 Email:</Text>
                    <Text style={[styles.detailValue, styles.emailHighlight]}>{app.leaderEmail}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📞 Phone:</Text>
                    <Text style={styles.detailValue}>{app.leaderPhone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👥 Size:</Text>
                    <Text style={styles.detailValue}>{app.memberCount} dancers ({app.city})</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🌟 Level:</Text>
                    <Text style={styles.detailValue}>{app.experienceLevel}</Text>
                  </View>
                </View>

                {/* Video Link */}
                {app.videoUrl && (
                  <TouchableOpacity
                    style={styles.videoLinkRow}
                    onPress={() => openVideoLink(app.videoUrl)}
                  >
                    <Text style={styles.videoIcon}>▶</Text>
                    <Text style={styles.videoText} numberOfLines={1}>
                      Watch Audition Video: {app.videoUrl}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Proposal Snippet */}
                {app.proposal ? (
                  <View style={styles.proposalBox}>
                    <Text style={styles.proposalLabel}>Proposal Concept:</Text>
                    <Text style={styles.proposalText} numberOfLines={3}>
                      "{app.proposal}"
                    </Text>
                  </View>
                ) : null}

                {/* Resend Email Status Badge */}
                {isAccepted && app.emailDelivery?.sent && (
                  <View style={styles.emailSentBadge}>
                    <Text style={styles.emailSentIcon}>✉️</Text>
                    <Text style={styles.emailSentText}>
                      Resend Email Delivered to {app.leaderEmail}
                    </Text>
                  </View>
                )}

                {/* Organiser Action Buttons */}
                <View style={styles.actionRow}>
                  {isActionBusy ? (
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 8 }} />
                  ) : (
                    <>
                      {/* Accept Button */}
                      {!isAccepted && (
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleStatusChange(app, "accepted")}
                        >
                          <Text style={styles.acceptButtonText}>✓ Accept & Send Email</Text>
                        </TouchableOpacity>
                      )}

                      {/* Reject Button */}
                      {!isRejected && (
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleStatusChange(app, "rejected")}
                        >
                          <Text style={styles.rejectButtonText}>✕ Reject</Text>
                        </TouchableOpacity>
                      )}

                      {/* Detail View Button */}
                      <TouchableOpacity
                        style={styles.viewDetailBtn}
                        onPress={() => setSelectedApp(app)}
                      >
                        <Text style={styles.viewDetailBtnText}>Details</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Detail Modal ────────────────────────────────────────── */}
      <Modal
        visible={!!selectedApp}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedApp(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTeamName}>{selectedApp?.teamName}</Text>
                <Text style={styles.modalStyle}>{selectedApp?.danceStyle}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedApp(null)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Leader Information</Text>
                <Text style={styles.modalText}>
                  • <Text style={{ fontWeight: "700" }}>Name:</Text> {selectedApp?.leaderName}
                </Text>
                <Text style={styles.modalText}>
                  • <Text style={{ fontWeight: "700" }}>Email:</Text> {selectedApp?.leaderEmail}
                </Text>
                <Text style={styles.modalText}>
                  • <Text style={{ fontWeight: "700" }}>Phone:</Text> {selectedApp?.leaderPhone}
                </Text>
                <Text style={styles.modalText}>
                  • <Text style={{ fontWeight: "700" }}>City / Location:</Text> {selectedApp?.city}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Audition & Proposal</Text>
                <TouchableOpacity
                  style={styles.modalVideoBtn}
                  onPress={() => selectedApp && openVideoLink(selectedApp.videoUrl)}
                >
                  <Text style={styles.modalVideoBtnText}>▶ Open Performance Video Link</Text>
                </TouchableOpacity>
                <Text style={styles.modalProposalText}>
                  {selectedApp?.proposal || "No choreography proposal written."}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Resend Email Delivery Status</Text>
                {selectedApp?.emailDelivery?.sent ? (
                  <View style={styles.emailStatusBox}>
                    <Text style={styles.emailStatusSuccess}>
                      ✅ Acceptance Email Sent via Resend
                    </Text>
                    <Text style={styles.emailStatusSub}>
                      Sent to: {selectedApp.leaderEmail}
                    </Text>
                    {selectedApp.emailDelivery.resendId && (
                      <Text style={styles.emailStatusSub}>
                        Resend ID: {selectedApp.emailDelivery.resendId}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.modalText}>
                    {selectedApp?.status === "accepted"
                      ? "Email dispatch in progress / simulated."
                      : "Pending acceptance. Email will be sent when application is accepted."}
                  </Text>
                )}
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalActions}>
              {selectedApp?.status !== "accepted" && (
                <TouchableOpacity
                  style={styles.modalAcceptBtn}
                  onPress={() => selectedApp && handleStatusChange(selectedApp, "accepted")}
                >
                  <Text style={styles.modalAcceptBtnText}>✓ Accept & Send Resend Email</Text>
                </TouchableOpacity>
              )}
              {selectedApp?.status !== "rejected" && (
                <TouchableOpacity
                  style={styles.modalRejectBtn}
                  onPress={() => selectedApp && handleStatusChange(selectedApp, "rejected")}
                >
                  <Text style={styles.modalRejectBtnText}>✕ Reject Application</Text>
                </TouchableOpacity>
              )}
            </View>
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
  seedButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  seedButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.gray500,
    marginTop: 2,
  },
  resendCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  resendCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  resendIcon: {
    fontSize: 16,
  },
  resendTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  resendBody: {
    fontSize: 12,
    color: "#15803D",
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.black,
  },
  searchClear: {
    fontSize: 14,
    color: COLORS.gray400,
    padding: 4,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.gray600,
  },
  tabBtnTextActive: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: COLORS.gray200,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: COLORS.accent,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.gray700,
  },
  tabBadgeTextActive: {
    color: COLORS.black,
  },
  centerBox: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.gray500,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  emptySeedBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptySeedBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  // App Card
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  teamName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.black,
  },
  styleBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  statusBadgePending: {
    backgroundColor: COLORS.yellowLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FAD7A0",
  },
  statusTextPending: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B7950B",
  },
  statusBadgeAccepted: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A9DFBF",
  },
  statusTextAccepted: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.greenDark,
  },
  statusBadgeRejected: {
    backgroundColor: COLORS.redLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F5B7B1",
  },
  statusTextRejected: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.redDark,
  },
  detailsGrid: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    width: 70,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray500,
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: "500",
  },
  emailHighlight: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  videoLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  videoIcon: {
    fontSize: 12,
    color: COLORS.red,
  },
  videoText: {
    flex: 1,
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  proposalBox: {
    backgroundColor: "#FAFAFA",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  proposalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  proposalText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: "italic",
    lineHeight: 16,
  },
  emailSentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  emailSentIcon: {
    fontSize: 13,
  },
  emailSentText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065F46",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: COLORS.green,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.red,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  rejectButtonText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "700",
  },
  viewDetailBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    alignItems: "center",
  },
  viewDetailBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray600,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTeamName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  modalStyle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  modalClose: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.gray400,
    fontWeight: "700",
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  modalVideoBtn: {
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  modalVideoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  modalProposalText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    backgroundColor: COLORS.gray100,
    padding: 12,
    borderRadius: 8,
  },
  emailStatusBox: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  emailStatusSuccess: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
  },
  emailStatusSub: {
    fontSize: 11,
    color: "#047857",
    marginTop: 2,
  },
  modalActions: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: 8,
  },
  modalAcceptBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalAcceptBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  modalRejectBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.red,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalRejectBtnText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "700",
  },
});
