import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  FlatList,
  Linking,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Color Palette ──────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0B6B6B",
  primaryDark: "#084E4E",
  primaryLight: "#E6F5F5",
  accent: "#F5A623",
  white: "#FFFFFF",
  black: "#1A1A1A",
  gray100: "#F7F7F7",
  gray200: "#EEEEEE",
  gray300: "#D9D9D9",
  gray400: "#AAAAAA",
  gray500: "#777777",
  gray600: "#555555",
  gray700: "#333333",
  green: "#27AE60",
  greenLight: "#E8F8EE",
  red: "#E74C3C",
  orange: "#F39C12",
  teal: "#14908B",
  tealBg: "#E8F6F6",
  border: "#E0E0E0",
};

// ─── Winner Data ────────────────────────────────────────────────────────────
const PREVIOUS_WINNERS = [
  { name: "Riya Shah", position: "1st Winner", hasVideo: true },
  { name: "Aarav Mehta", position: "1st Winner", hasVideo: true },
  { name: "Neha Verma", position: "2nd Winner", hasVideo: true },
  { name: "Ishita Cha...", position: "3rd Winner", hasVideo: true },
];

// ─── Rewards Data ───────────────────────────────────────────────────────────
const REWARDS = [
  { position: "1st Winner", amount: "550", icon: "🏆" },
  { position: "2nd Winner", amount: "300", icon: "🥈" },
  { position: "3rd Winner", amount: "240", icon: "🥉" },
  { position: "4th Winner", amount: "200", icon: "⭐" },
  { position: "5th Winner", amount: "130", icon: "☆" },
  { position: "6th Winner", amount: "80", icon: "☆" },
];

// ─── Tab Options ────────────────────────────────────────────────────────────
const TABS = ["About Competition", "Judging Parameters", "Rules & Eligibility"];

// ─── Countdown Timer Hook ──────────────────────────────────────────────────
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 6,
    minutes: 28,
    seconds: 32,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// ─── Helper: pad number ─────────────────────────────────────────────────────
const pad = (n: number) => n.toString().padStart(2, "0");

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CompetitionDetailScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeLang, setActiveLang] = useState("ENG");
  const countdown = useCountdown();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.goBackBtn}>
          <Text style={styles.goBackArrow}>←</Text>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              activeLang === "ENG" && styles.langBtnActive,
            ]}
            onPress={() => setActiveLang("ENG")}
          >
            <Text
              style={[
                styles.langBtnText,
                activeLang === "ENG" && styles.langBtnTextActive,
              ]}
            >
              ENG
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langBtn,
              activeLang === "हिंदी" && styles.langBtnActive,
            ]}
            onPress={() => setActiveLang("हिंदी")}
          >
            <Text
              style={[
                styles.langBtnText,
                activeLang === "हिंदी" && styles.langBtnTextActive,
              ]}
            >
              हिंदी
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable Content ──────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Title Section ─────────────────────────────────────────── */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.competitionTitle}>
              Feedants Classical Dance
            </Text>
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredCheckmark}>✓</Text>
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Dance</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Multi-Win</Text>
            </View>
            <View style={styles.tagCertificate}>
              <Text style={styles.tagCertificateIcon}>🏅</Text>
              <Text style={styles.tagCertificateText}>
                Winners get certificate
              </Text>
            </View>
          </View>

          {/* Prize & Entry Fee */}
          <View style={styles.prizeRow}>
            <View style={styles.prizeCol}>
              <Text style={styles.prizeLabel}>Prize Pool</Text>
              <Text style={styles.prizeAmount}>₹ 1,500</Text>
            </View>
            <View style={styles.entryFeeCol}>
              <Text style={styles.prizeLabel}>Entry Fee</Text>
              <Text style={styles.entryFeeAmount}>₹ 99</Text>
            </View>
            <View style={styles.spotsCol}>
              <View style={styles.spotsRow}>
                <Text style={styles.spotsIcon}>👥</Text>
                <Text style={styles.spotsHighlight}>Only 19 spots left</Text>
              </View>
              <Text style={styles.bookedText}>1 / 20 Booked</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Judge Section ──────────────────────────────────────────── */}
        <View style={styles.judgeSection}>
          <View style={styles.judgeLeft}>
            <View style={styles.judgeAvatarContainer}>
              <View style={styles.judgeAvatar}>
                <Text style={styles.judgeAvatarText}>👩</Text>
              </View>
            </View>
            <View style={styles.judgeInfo}>
              <Text style={styles.judgeRole}>Judge</Text>
              <Text style={styles.judgeName}>Manju Dubey</Text>
              <Text style={styles.judgeDesc}>Professional Kathak Dancer</Text>
              <Text style={styles.judgeDesc}>12+ Years of Experience</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.introVideoBtn}>
            <View style={styles.playIcon}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
            <Text style={styles.introVideoText}>Intro Video</Text>
          </TouchableOpacity>
        </View>

        {/* ── Registration Timer ─────────────────────────────────────── */}
        <View style={styles.timerBar}>
          <View style={styles.timerLeft}>
            <Text style={styles.timerIcon}>⏰</Text>
            <Text style={styles.timerLabel}>Registration closes in</Text>
          </View>
          <Text style={styles.timerValue}>
            {`${pad(countdown.days)}d : ${pad(countdown.hours)}h : ${pad(countdown.minutes)}m : ${pad(countdown.seconds)}s`}
          </Text>
          <View style={styles.timerRight}>
            <Text style={styles.hurryIcon}>🔥</Text>
            <Text style={styles.hurryText}>Hurry up!</Text>
          </View>
        </View>

        {/* ── Important Dates ────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Important Dates</Text>
          <View style={styles.datesGrid}>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>📋</Text>
              <Text style={styles.dateLabel}>Register Before</Text>
              <Text style={styles.dateValue}>10 Aug 26</Text>
              <Text style={styles.dateTime}>11:50 PM</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>📝</Text>
              <Text style={styles.dateLabel}>Submission Starts</Text>
              <Text style={styles.dateValue}>6 Aug 26</Text>
              <Text style={styles.dateTime}>04:00 AM</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>⏳</Text>
              <Text style={styles.dateLabel}>Submission Ends</Text>
              <Text style={styles.dateValue}>30 Aug 26</Text>
              <Text style={styles.dateTime}>11:55 PM</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>🏆</Text>
              <Text style={styles.dateLabel}>Result Date</Text>
              <Text style={styles.dateValue}>1 Sept 26</Text>
              <Text style={styles.dateTime}>11:50 PM</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Previous Winners ───────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Previous Winners</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.winnersScroll}
          >
            {PREVIOUS_WINNERS.map((winner, idx) => (
              <View key={idx} style={styles.winnerCard}>
                <View style={styles.winnerImageContainer}>
                  <View style={styles.winnerImage}>
                    <Text style={styles.winnerImagePlaceholder}>
                      {winner.name.charAt(0)}
                    </Text>
                  </View>
                  {winner.hasVideo && (
                    <View style={styles.winnerPlayBtn}>
                      <Text style={styles.winnerPlayIcon}>▶</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.winnerName} numberOfLines={1}>
                  {winner.name}
                </Text>
                <Text style={styles.winnerPosition}>{winner.position}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.tab, activeTab === idx && styles.activeTab]}
              onPress={() => setActiveTab(idx)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === idx && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ────────────────────────────────────────────── */}
        <View style={styles.tabContent}>
          <Text style={styles.aboutText}>
            This is an online classical dance competition open for all age
            groups.
          </Text>
          <Text style={styles.aboutText}>
            Participate from anywhere and showcase your talent.
          </Text>
          <Text style={styles.aboutText}>
            Express your passion through traditional dance.
          </Text>
          <TouchableOpacity style={styles.viewMoreBtn}>
            <Text style={styles.viewMoreText}>View more ∨</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Rewards ────────────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <Text style={styles.rewardsSubtitle}>(All Positions)</Text>
          </View>
          {REWARDS.map((reward, idx) => (
            <View
              key={idx}
              style={[
                styles.rewardRow,
                idx < REWARDS.length - 1 && styles.rewardRowBorder,
              ]}
            >
              <View style={styles.rewardLeft}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <Text style={styles.rewardPosition}>{reward.position}</Text>
              </View>
              <Text style={styles.rewardAmount}>₹ {reward.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* ── Disclaimer ─────────────────────────────────────────────── */}
        <View style={styles.disclaimerRow}>
          <Text style={styles.disclaimerIcon}>ⓘ</Text>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Disclaimer: </Text>
            Only contributions from paid participants will be considered for
            judging.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Info Row: Prize Money & Refund ──────────────────────────── */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconText}>▶</Text>
            </View>
            <View>
              <Text style={styles.infoTitle}>
                How will you receive{"\n"}prize money?
              </Text>
              <Text style={styles.infoSubtitle}>
                Watch video to know more
              </Text>
            </View>
          </View>
          <View style={styles.infoItemRight}>
            <Text style={styles.refundIcon}>📋</Text>
            <Text style={styles.refundTitle}>Refund policy</Text>
          </View>
        </View>

        <View style={styles.securePaymentRow}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>Secure payments powered by</Text>
          <Text style={styles.razorpayText}> Razorpay</Text>
        </View>

        <View style={styles.divider} />

        {/* ── Refer & Earn ────────────────────────────────────────────── */}
        <View style={styles.referSection}>
          <View style={styles.referHeader}>
            <Text style={styles.referMegaphone}>📢</Text>
            <Text style={styles.referTitle}>Refer & Earn more discount</Text>
          </View>
          <View style={styles.referLinkRow}>
            <View style={styles.referLinkInput}>
              <Text style={styles.referLinkText} numberOfLines={1}>
                https://feedants.com/r/referral123
              </Text>
              <TouchableOpacity style={styles.copyLinkBtn}>
                <Text style={styles.copyLinkText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.referNowBtn}>
              <Text style={styles.referNowText}>Refer Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.referEarnText}>
            You earn <Text style={styles.referEarnBold}>₹10</Text> for every
            signup
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Hear From Our Users ─────────────────────────────────────── */}
        <TouchableOpacity style={styles.hearFromUsersRow}>
          <View style={styles.hearFromUsersLeft}>
            <Text style={styles.hearFromUsersIcon}>💬</Text>
            <View>
              <Text style={styles.hearFromUsersTitle}>
                Hear From Our Users
              </Text>
              <Text style={styles.hearFromUsersSubtitle}>
                See what participants say about Feedants
              </Text>
            </View>
          </View>
          <Text style={styles.hearFromUsersArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ── Ad Placeholder ──────────────────────────────────────────── */}
        <View style={styles.adPlaceholder}>
          <Text style={styles.adIcon}>📢</Text>
          <Text style={styles.adText}>Ad Here</Text>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Upload Submission Button ──────────────────────────────────── */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.uploadSubmissionBtn}>
          <Text style={styles.uploadSubmissionText}>Upload Submission</Text>
          <Text style={styles.uploadSubmissionSub}>Registered</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom Tab Bar ─────────────────────────────────────────────── */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIcon}>🏠</Text>
          <Text style={styles.bottomTabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIcon}>🔍</Text>
          <Text style={styles.bottomTabLabel}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTabCenter}>
          <View style={styles.plusButton}>
            <Text style={styles.plusButtonText}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIconActive}>🏆</Text>
          <Text style={styles.bottomTabLabelActive}>Competitions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIcon}>👤</Text>
          <Text style={styles.bottomTabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  goBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goBackArrow: {
    fontSize: 20,
    color: COLORS.black,
  },
  goBackText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.gray200,
    borderRadius: 20,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  langBtnActive: {
    backgroundColor: COLORS.primary,
  },
  langBtnText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: "500",
  },
  langBtnTextActive: {
    color: COLORS.white,
  },

  // ── Scroll ──────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Title Section ────────────────────────────────────────
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  competitionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
    flex: 1,
    marginRight: 10,
  },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.green,
    gap: 4,
  },
  registeredCheckmark: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
  },
  registeredText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Tags ────────────────────────────────────────────────
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  tag: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  tagCertificate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagCertificateIcon: {
    fontSize: 14,
  },
  tagCertificateText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // ── Prize Row ────────────────────────────────────────────
  prizeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  prizeCol: {
    marginRight: 30,
  },
  entryFeeCol: {
    marginRight: 30,
  },
  spotsCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  prizeLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  prizeAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  entryFeeAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.black,
  },
  spotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  spotsIcon: {
    fontSize: 14,
  },
  spotsHighlight: {
    fontSize: 13,
    color: COLORS.red,
    fontWeight: "600",
  },
  bookedText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },

  // ── Divider ──────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 0,
  },

  // ── Judge ────────────────────────────────────────────────
  judgeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  judgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  judgeAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.gray200,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  judgeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8D5C4",
    justifyContent: "center",
    alignItems: "center",
  },
  judgeAvatarText: {
    fontSize: 28,
  },
  judgeInfo: {},
  judgeRole: {
    fontSize: 11,
    color: COLORS.gray500,
    marginBottom: 1,
  },
  judgeName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 2,
  },
  judgeDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 16,
  },
  introVideoBtn: {
    alignItems: "center",
    gap: 4,
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray200,
    justifyContent: "center",
    alignItems: "center",
  },
  playIconText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 2,
  },
  introVideoText: {
    fontSize: 11,
    color: COLORS.gray500,
  },

  // ── Timer Bar ────────────────────────────────────────────
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.tealBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 0,
  },
  timerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerIcon: {
    fontSize: 14,
  },
  timerLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "500",
  },
  timerValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  timerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  hurryIcon: {
    fontSize: 14,
  },
  hurryText: {
    fontSize: 12,
    color: COLORS.orange,
    fontWeight: "600",
  },

  // ── Section ──────────────────────────────────────────────
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 12,
  },

  // ── Important Dates Grid ──────────────────────────────────
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dateCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  dateIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  dateTime: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },

  // ── Previous Winners ──────────────────────────────────────
  winnersScroll: {
    gap: 12,
  },
  winnerCard: {
    alignItems: "center",
    width: 82,
  },
  winnerImageContainer: {
    position: "relative",
    marginBottom: 6,
  },
  winnerImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#E8D5C4",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  winnerImagePlaceholder: {
    fontSize: 28,
    color: COLORS.gray600,
    fontWeight: "700",
  },
  winnerPlayBtn: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  winnerPlayIcon: {
    fontSize: 10,
    color: COLORS.white,
    marginLeft: 1,
  },
  winnerName: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
  },
  winnerPosition: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // ── Tabs ─────────────────────────────────────────────────
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: "500",
    textAlign: "center",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // ── Tab Content ──────────────────────────────────────────
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aboutText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 2,
  },
  viewMoreBtn: {
    marginTop: 6,
    alignItems: "center",
  },
  viewMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // ── Rewards ──────────────────────────────────────────────
  rewardsHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 12,
  },
  rewardsSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rewardRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  rewardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rewardIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  rewardPosition: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // ── Disclaimer ───────────────────────────────────────────
  disclaimerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  disclaimerIcon: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 1,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.gray600,
    flex: 1,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: "700",
    color: COLORS.red,
  },

  // ── Info Row ─────────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  infoIconText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 2,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.black,
  },
  infoSubtitle: {
    fontSize: 10,
    color: COLORS.gray500,
    marginTop: 1,
  },
  infoItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  refundIcon: {
    fontSize: 16,
  },
  refundTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.black,
    textDecorationLine: "underline",
  },

  // ── Secure Payment ───────────────────────────────────────
  securePaymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  secureIcon: {
    fontSize: 12,
  },
  secureText: {
    fontSize: 10,
    color: COLORS.gray500,
  },
  razorpayText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2B83EA",
  },

  // ── Refer Section ────────────────────────────────────────
  referSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.tealBg,
  },
  referHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  referMegaphone: {
    fontSize: 22,
  },
  referTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  referLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  referLinkInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 0,
    height: 36,
    overflow: "hidden",
  },
  referLinkText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.gray500,
  },
  copyLinkBtn: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray300,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: "center",
  },
  copyLinkText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  referNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  referNowText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: "600",
  },
  referEarnText: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: "right",
  },
  referEarnBold: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  // ── Hear From Users ──────────────────────────────────────
  hearFromUsersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hearFromUsersLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hearFromUsersIcon: {
    fontSize: 26,
  },
  hearFromUsersTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  hearFromUsersSubtitle: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 1,
  },
  hearFromUsersArrow: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: "300",
  },

  // ── Ad Placeholder ───────────────────────────────────────
  adPlaceholder: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
    backgroundColor: COLORS.gray100,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray200,
  },
  adIcon: {
    fontSize: 16,
  },
  adText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: "500",
  },

  // ── Bottom Button ────────────────────────────────────────
  bottomButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  uploadSubmissionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadSubmissionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  uploadSubmissionSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 1,
  },

  // ── Bottom Tab Bar ───────────────────────────────────────
  bottomTabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 0 : 0,
  },
  bottomTab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 6,
  },
  bottomTabCenter: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: -20,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  plusButtonText: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: "300",
    marginTop: -2,
  },
  bottomTabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  bottomTabIconActive: {
    fontSize: 20,
    marginBottom: 2,
  },
  bottomTabLabel: {
    fontSize: 10,
    color: COLORS.gray500,
  },
  bottomTabLabelActive: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
