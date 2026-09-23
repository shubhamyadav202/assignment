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
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { TRANSLATIONS, POSITION_KEY } from "../translations";
import { fetchCompetition, Competition } from "../api";

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

// ─── Fallback Data (used when backend is unavailable) ───────────────────────
const FALLBACK_WINNERS = [
  { name: "Riya Shah", position: "1st Winner", hasVideo: true },
  { name: "Aarav Mehta", position: "1st Winner", hasVideo: true },
  { name: "Neha Verma", position: "2nd Winner", hasVideo: true },
  { name: "Ishita Cha...", position: "3rd Winner", hasVideo: true },
];

const FALLBACK_REWARDS = [
  { position: "1st Winner", amount: 550, icon: "🏆" },
  { position: "2nd Winner", amount: 300, icon: "🥈" },
  { position: "3rd Winner", amount: 240, icon: "🥉" },
  { position: "4th Winner", amount: 200, icon: "⭐" },
  { position: "5th Winner", amount: 130, icon: "☆" },
  { position: "6th Winner", amount: 80, icon: "☆" },
];

// ─── Countdown Timer Hook ──────────────────────────────────────────────────
function useCountdown(targetDate?: string) {
  const computeTimeLeft = () => {
    if (targetDate) {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    return { days: 1, hours: 6, minutes: 28, seconds: 32 };
  };

  const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

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

// ─── Helper: format Date for display ────────────────────────────────────────
function formatDate(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return {
    date: `${day} ${month} ${year}`,
    time: `${pad(displayHour)}:${pad(minutes)} ${ampm}`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CompetitionDetailScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeLang, setActiveLang] = useState("ENG");
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState("https://feedants.com/r/referral123");
  const scrollViewRef = useRef<ScrollView>(null);
  const referInputY = useRef(0);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Fetch competition from backend ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCompetition();
        if (!cancelled) {
          setCompetition(data);
          setError(null);
        }
      } catch (err: any) {
        console.warn("Failed to fetch from backend, using fallback data:", err.message);
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Translation helper ──────────────────────────────────────────────────
  const t = TRANSLATIONS[activeLang] || TRANSLATIONS["ENG"];

  // ── Translate a position string (e.g. "1st Winner" → "प्रथम विजेता") ──
  const translatePosition = (pos: string) => {
    const key = POSITION_KEY[pos];
    return key && t[key] ? t[key] : pos;
  };

  // ── Derived data from API or fallback ──────────────────────────────────
  const comp = competition;
  const title = comp?.title ?? t.competitionTitle;
  const tags = comp?.tags ?? ["Dance", "Multi-Win"];
  const prizePool = comp ? `₹ ${comp.prizePool.toLocaleString("en-IN")}` : t.prizeAmount;
  const entryFee = comp ? `₹ ${comp.entryFee}` : t.entryFeeAmount;
  const spotsLeft = comp ? comp.spotsLeft : 19;
  const totalSpots = comp?.totalSpots ?? 20;
  const bookedSpots = comp?.bookedSpots ?? 1;
  const hasCertificate = comp?.certificateForWinners ?? true;
  const judgeName = comp?.judge?.name ?? "Manju Dubey";
  const judgeDesc = comp?.judge?.description ?? "Professional Kathak Dancer";
  const judgeExp = comp?.judge?.experience ?? "12+ Years of Experience";
  const aboutContent = comp?.aboutContent ?? [t.aboutText1, t.aboutText2, t.aboutText3];
  const rewards = comp?.rewards ?? FALLBACK_REWARDS;
  const previousWinners = comp?.previousWinners ?? FALLBACK_WINNERS;
  const disclaimer = comp?.disclaimer ?? t.disclaimerText;
  const referralEarning = comp?.referralEarning ?? 10;

  // ── Dates from API or fallback ──────────────────────────────────────────
  const regEnd = comp?.dates?.registrationEnd
    ? formatDate(comp.dates.registrationEnd)
    : { date: t.date1, time: t.time1 };
  const subStart = comp?.dates?.submissionStart
    ? formatDate(comp.dates.submissionStart)
    : { date: t.date2, time: t.time2 };
  const subEnd = comp?.dates?.submissionEnd
    ? formatDate(comp.dates.submissionEnd)
    : { date: t.date3, time: t.time3 };
  const resultDate = comp?.dates?.resultDate
    ? formatDate(comp.dates.resultDate)
    : { date: t.date4, time: t.time4 };

  const countdown = useCountdown(comp?.dates?.registrationEnd);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.gray500 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.goBackBtn}>
          <Text style={styles.goBackArrow}>←</Text>
          <Text style={styles.goBackText}>{t.goBack}</Text>
        </TouchableOpacity>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.organiserHeaderBtn}
            onPress={() => router.push("/organiser")}
          >
            <Text style={styles.organiserHeaderIcon}>👑</Text>
            <Text style={styles.organiserHeaderText}>{t.organiserPortal}</Text>
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
      </View>

      {/* ── Scrollable Content ──────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Title Section ─────────────────────────────────────────── */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.competitionTitle}>
              {activeLang === "ENG" ? title : t.competitionTitle}
            </Text>
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredCheckmark}>✓</Text>
              <Text style={styles.registeredText}>{t.registered}</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t.tagDance}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t.tagMultiWin}</Text>
            </View>
            {hasCertificate && (
              <View style={styles.tagCertificate}>
                <Text style={styles.tagCertificateIcon}>🏅</Text>
                <Text style={styles.tagCertificateText}>
                  {t.winnersGetCertificate}
                </Text>
              </View>
            )}
          </View>

          {/* Prize & Entry Fee */}
          <View style={styles.prizeRow}>
            <View style={styles.prizeCol}>
              <Text style={styles.prizeLabel}>{t.prizePool}</Text>
              <Text style={styles.prizeAmount}>{prizePool}</Text>
            </View>
            <View style={styles.entryFeeCol}>
              <Text style={styles.prizeLabel}>{t.entryFee}</Text>
              <Text style={styles.entryFeeAmount}>{entryFee}</Text>
            </View>
            <View style={styles.spotsCol}>
              <View style={styles.spotsRow}>
                <Text style={styles.spotsIcon}>👥</Text>
                <Text style={styles.spotsHighlight}>
                  {activeLang === "ENG"
                    ? `Only ${spotsLeft} spots left`
                    : `केवल ${spotsLeft} स्थान शेष`}
                </Text>
              </View>
              <Text style={styles.bookedText}>
                {`${bookedSpots} / ${totalSpots} ${activeLang === "ENG" ? "Booked" : "बुक"}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Dance Team Application & Organiser Portal Card ───────────── */}
        <View style={styles.appBannerCard}>
          <View style={styles.appBannerBadge}>
            <Text style={styles.appBannerBadgeText}>✨ TEAM REGISTRATION OPEN</Text>
          </View>
          <Text style={styles.appBannerTitle}>Dance Team Auditions & Proposal</Text>
          <Text style={styles.appBannerSubtitle}>
            Apply with your dance crew details, leader email & audition video. The organiser reviews incoming applications and sends an acceptance email via Resend!
          </Text>
          <View style={styles.appBannerActions}>
            <TouchableOpacity
              style={styles.appBannerApplyBtn}
              onPress={() => router.push("/apply")}
            >
              <Text style={styles.appBannerApplyBtnText}>📝 Apply as Dance Team →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appBannerOrganiserBtn}
              onPress={() => router.push("/organiser")}
            >
              <Text style={styles.appBannerOrganiserBtnText}>👑 Organiser Portal</Text>
            </TouchableOpacity>
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
              <Text style={styles.judgeRole}>{t.judgeRole}</Text>
              <Text style={styles.judgeName}>
                {activeLang === "ENG" ? judgeName : t.judgeName}
              </Text>
              <Text style={styles.judgeDesc}>
                {activeLang === "ENG" ? judgeDesc : t.judgeDesc}
              </Text>
              <Text style={styles.judgeDesc}>
                {activeLang === "ENG" ? judgeExp : t.judgeExp}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.introVideoBtn}>
            <View style={styles.playIcon}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
            <Text style={styles.introVideoText}>{t.introVideo}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Registration Timer ─────────────────────────────────────── */}
        <View style={styles.timerBar}>
          <View style={styles.timerLeft}>
            <Text style={styles.timerIcon}>⏰</Text>
            <Text style={styles.timerLabel}>{t.regClosesIn}</Text>
          </View>
          <Text style={styles.timerValue}>
            {`${pad(countdown.days)}d : ${pad(countdown.hours)}h : ${pad(countdown.minutes)}m : ${pad(countdown.seconds)}s`}
          </Text>
          <View style={styles.timerRight}>
            <Text style={styles.hurryIcon}>🔥</Text>
            <Text style={styles.hurryText}>{t.hurryUp}</Text>
          </View>
        </View>

        {/* ── Important Dates ────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t.importantDates}</Text>
          <View style={styles.datesGrid}>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>📋</Text>
              <Text style={styles.dateLabel}>{t.registerBefore}</Text>
              <Text style={styles.dateValue}>{regEnd.date}</Text>
              <Text style={styles.dateTime}>{regEnd.time}</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>📝</Text>
              <Text style={styles.dateLabel}>{t.submissionStarts}</Text>
              <Text style={styles.dateValue}>{subStart.date}</Text>
              <Text style={styles.dateTime}>{subStart.time}</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>⏳</Text>
              <Text style={styles.dateLabel}>{t.submissionEnds}</Text>
              <Text style={styles.dateValue}>{subEnd.date}</Text>
              <Text style={styles.dateTime}>{subEnd.time}</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateIcon}>🏆</Text>
              <Text style={styles.dateLabel}>{t.resultDate}</Text>
              <Text style={styles.dateValue}>{resultDate.date}</Text>
              <Text style={styles.dateTime}>{resultDate.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Previous Winners ───────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t.previousWinners}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.winnersScroll}
          >
            {previousWinners.map((winner, idx) => (
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
                <Text style={styles.winnerPosition}>
                  {translatePosition(winner.position)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <View style={styles.tabsContainer}>
          {[t.tabAbout, t.tabJudging, t.tabRules].map((tab, idx) => (
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
          {activeTab === 0 &&
            (activeLang === "ENG" ? aboutContent : [t.aboutText1, t.aboutText2, t.aboutText3]).map(
              (text, idx) => (
                <Text key={idx} style={styles.aboutText}>
                  {text}
                </Text>
              )
            )}
          {activeTab === 1 &&
            (comp?.judgingParameters ?? [
              "Technique and form accuracy",
              "Expression and emotional depth (abhinaya)",
              "Rhythm and timing (taal)",
              "Costume and presentation",
              "Overall performance impact",
            ]).map((text, idx) => (
              <Text key={idx} style={styles.aboutText}>
                • {text}
              </Text>
            ))}
          {activeTab === 2 &&
            (comp?.rulesAndEligibility ?? [
              "Open to all age groups",
              "Only classical dance forms are allowed",
              "Video must be between 2-5 minutes",
              "Solo performances only",
            ]).map((text, idx) => (
              <Text key={idx} style={styles.aboutText}>
                • {text}
              </Text>
            ))}
          <TouchableOpacity style={styles.viewMoreBtn}>
            <Text style={styles.viewMoreText}>{t.viewMore}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Rewards ────────────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.sectionTitle}>{t.rewards}</Text>
            <Text style={styles.rewardsSubtitle}>{t.allPositions}</Text>
          </View>
          {rewards.map((reward, idx) => (
            <View
              key={idx}
              style={[
                styles.rewardRow,
                idx < rewards.length - 1 && styles.rewardRowBorder,
              ]}
            >
              <View style={styles.rewardLeft}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <Text style={styles.rewardPosition}>
                  {translatePosition(reward.position)}
                </Text>
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
            <Text style={styles.disclaimerBold}>{t.disclaimerLabel}</Text>
            {activeLang === "ENG" ? disclaimer : t.disclaimerText}
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
              <Text style={styles.infoTitle}>{t.howReceivePrize}</Text>
              <Text style={styles.infoSubtitle}>{t.watchVideo}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoItemRight} onPress={() => setShowRefundModal(true)}>
            <Text style={styles.refundIcon}>📋</Text>
            <Text style={styles.refundTitle}>{t.refundPolicy}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securePaymentRow}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>{t.securePayments}</Text>
          <Text style={styles.razorpayText}>{t.razorpay}</Text>
        </View>

        <View style={styles.divider} />

        {/* ── Refer & Earn ────────────────────────────────────────────── */}
        <View style={styles.referSection}>
          <View style={styles.referHeader}>
            <Text style={styles.referMegaphone}>📢</Text>
            <Text style={styles.referTitle}>{t.referEarn}</Text>
          </View>
          <View style={styles.referLinkRow}>
            <View
              style={styles.referLinkInput}
              onLayout={(e) => {
                referInputY.current = e.nativeEvent.layout.y;
              }}
            >
              <TextInput
                style={styles.referLinkTextInput}
                value={referralLink}
                onChangeText={setReferralLink}
                placeholder="Enter referral link"
                placeholderTextColor={COLORS.gray400}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                numberOfLines={1}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: referInputY.current + 200, animated: true });
                  }, 300);
                }}
              />
              <TouchableOpacity
                style={styles.copyLinkBtn}
                onPress={async () => {
                  await Clipboard.setStringAsync(referralLink);
                  setCopied(true);
                  Alert.alert("✅ Copied!", "Referral link copied to clipboard.");
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Text style={styles.copyLinkText}>{copied ? "✓ Copied" : t.copyLink}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.referNowBtn}>
              <Text style={styles.referNowText}>{t.referNow}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.referEarnText}>
            {t.youEarn}
            <Text style={styles.referEarnBold}>₹{referralEarning}</Text>
            {t.forEverySignup}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Hear From Our Users ─────────────────────────────────────── */}
        <TouchableOpacity style={styles.hearFromUsersRow} onPress={() => setShowFeedbackModal(true)}>
          <View style={styles.hearFromUsersLeft}>
            <Text style={styles.hearFromUsersIcon}>💬</Text>
            <View>
              <Text style={styles.hearFromUsersTitle}>
                {t.hearFromUsers}
              </Text>
              <Text style={styles.hearFromUsersSubtitle}>
                {t.hearFromUsersSub}
              </Text>
            </View>
          </View>
          <Text style={styles.hearFromUsersArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ── Ad Placeholder ──────────────────────────────────────────── */}
        <View style={styles.adPlaceholder}>
          <Text style={styles.adIcon}>📢</Text>
          <Text style={styles.adText}>{t.adHere}</Text>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Upload Submission Button ──────────────────────────────────── */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.uploadSubmissionBtn}
          onPress={() => router.push("/apply")}
        >
          <Text style={styles.uploadSubmissionText}>Upload Submission</Text>
          <Text style={styles.uploadSubmissionSub}>registration</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom Tab Bar ─────────────────────────────────────────────── */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIcon}>🏠</Text>
          <Text style={styles.bottomTabLabel}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIcon}>🔍</Text>
          <Text style={styles.bottomTabLabel}>{t.explore}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomTabCenter}
          onPress={() => router.push("/apply")}
        >
          <View style={styles.plusButton}>
            <Text style={styles.plusButtonText}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab}>
          <Text style={styles.bottomTabIconActive}>🏆</Text>
          <Text style={styles.bottomTabLabelActive}>{t.competitions}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            }}
            style={styles.tabProfileImage}
          />
          <Text style={styles.bottomTabLabel}>{t.profile}</Text>
        </TouchableOpacity>
      </View>
      {/* ── Refund Policy Modal ──────────────────────────────────────── */}
      <Modal
        visible={showRefundModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRefundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 {t.refundPolicy}</Text>
              <TouchableOpacity onPress={() => setShowRefundModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>Eligibility for Refund</Text>
              <Text style={styles.modalText}>
                • Full refund is available if you cancel your registration before the submission period starts.{"\n"}
                • 50% refund if cancelled within 24 hours after submission period starts.{"\n"}
                • No refund once you have submitted your entry.
              </Text>

              <Text style={styles.modalSectionTitle}>Processing Time</Text>
              <Text style={styles.modalText}>
                • Refunds are processed within 5–7 business days.{"\n"}
                • The amount will be credited back to the original payment method (UPI, card, or wallet).
              </Text>

              <Text style={styles.modalSectionTitle}>Non-Refundable Cases</Text>
              <Text style={styles.modalText}>
                • Disqualification due to rule violations.{"\n"}
                • Failure to submit within the given deadline.{"\n"}
                • Duplicate or fraudulent registrations.
              </Text>

              <Text style={styles.modalSectionTitle}>How to Request a Refund</Text>
              <Text style={styles.modalText}>
                • Go to My Registrations → Select the competition → Tap {"\"Request Refund\""}.{"\n"}
                • Alternatively, email support@feedants.com with your registration ID.
              </Text>

              <Text style={[styles.modalText, { marginTop: 12, fontStyle: "italic", color: COLORS.gray400 }]}>
                Feedants reserves the right to modify this refund policy at any time. Changes will be communicated via app notification.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── User Feedback Modal ────────────────────────────────────────── */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💬 {t.hearFromUsers}</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {[
                {
                  name: "Priya Sharma",
                  avatar: "P",
                  rating: 5,
                  text: "Amazing platform! I won 2nd prize in the Bharatanatyam competition. The judging was fair and transparent. Highly recommended for all dancers!",
                  time: "2 weeks ago",
                },
                {
                  name: "Rahul Verma",
                  avatar: "R",
                  rating: 4,
                  text: "Very easy to use. I uploaded my Kathak performance and got detailed feedback from the judge. The certificate looks great too!",
                  time: "1 month ago",
                },
                {
                  name: "Ananya Patel",
                  avatar: "A",
                  rating: 5,
                  text: "Love that I can participate from home! No need to travel anywhere. The prize money was credited within 3 days. Super smooth experience.",
                  time: "1 month ago",
                },
                {
                  name: "Vikram Singh",
                  avatar: "V",
                  rating: 4,
                  text: "Good concept! Participated with my daughter in the kids category. She was so happy to receive the participation certificate. Will definitely join again.",
                  time: "2 months ago",
                },
                {
                  name: "Sneha Reddy",
                  avatar: "S",
                  rating: 5,
                  text: "Feedants is the best platform for online dance competitions. I've participated 3 times and won twice! The referral program is a nice bonus too.",
                  time: "3 months ago",
                },
              ].map((review, idx) => (
                <View key={idx} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.feedbackAvatar}>
                      <Text style={styles.feedbackAvatarText}>{review.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedbackName}>{review.name}</Text>
                      <View style={styles.feedbackStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Text key={i} style={{ fontSize: 12, color: i < review.rating ? COLORS.accent : COLORS.gray300 }}>
                            ★
                          </Text>
                        ))}
                        <Text style={styles.feedbackTime}>{review.time}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.feedbackText}>{review.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  organiserHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  organiserHeaderIcon: {
    fontSize: 12,
  },
  organiserHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
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

  // ── Dance Team Banner ────────────────────────────────────
  appBannerCard: {
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: "#F0F9F9",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#B2DFDB",
  },
  appBannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  appBannerBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  appBannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  appBannerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 17,
    marginBottom: 12,
  },
  appBannerActions: {
    flexDirection: "row",
    gap: 8,
  },
  appBannerApplyBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  appBannerApplyBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  appBannerOrganiserBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  appBannerOrganiserBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
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
  referLinkTextInput: {
    flex: 1,
    fontSize: 11,
    color: COLORS.gray600,
    paddingVertical: 0,
    height: 36,
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
  applyTeamBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  applyTeamBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  applyTeamBtnSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
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
  tabProfileImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
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

  // ── Modal Styles ─────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
  },
  modalCloseBtn: {
    fontSize: 20,
    color: COLORS.gray500,
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginTop: 14,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 8,
  },

  // ── Feedback Card Styles ─────────────────────────────────
  feedbackCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  feedbackAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  feedbackName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  feedbackStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    marginTop: 2,
  },
  feedbackTime: {
    fontSize: 10,
    color: COLORS.gray400,
    marginLeft: 6,
  },
  feedbackText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 19,
  },
});
