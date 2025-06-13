import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  MessageCircle,
  Headphones,
  ArrowLeft,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Welcome to Fantasy AI Support! 🎯 I'm powered by advanced AI to understand your questions better. How can I assist you today?",
      timestamp: new Date(),
      confidence: 1.0,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [escalated, setEscalated] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [userContext, setUserContext] = useState({
    lastIntent: null,
    conversationHistory: [],
    preferredLanguage: "english",
    sentiment: "neutral",
  });
  const messagesEndRef = useRef(null);

  const categories = [
    {
      id: "withdrawal",
      title: "Withdrawal",
      icon: "💸",
      color: "bg-green-500",
      keywords: [
        "withdraw",
        "cash out",
        "money",
        "payout",
        "transfer",
        "cancel withdrawal",
        "delayed",
        "wrong bank",
        "pending",
        "panding",
        "delayed withdrawal",
        "withdrawal delay",
        "wrong bank details",
        "incorrect bank",
      ],
    },
    {
      id: "kyc",
      title: "KYC Verification",
      icon: "📋",
      color: "bg-blue-500",
      keywords: [
        "kyc",
        "verification",
        "document",
        "identity",
        "verify",
        "approve",
        "aadhaar",
        "pan",
        "pending kyc",
        "stuck",
        "banned",
        "only aadhaar",
        "aadhaar kyc",
        "pan card",
        "kyc stuck",
        "kyc pending 3 days",
        "someone else's documents",
        "other documents",
      ],
    },
    {
      id: "account",
      title: "Account Issues",
      icon: "👤",
      color: "bg-purple-500",
      keywords: [
        "account",
        "profile",
        "login",
        "password",
        "forgot",
        "locked",
        "mobile number",
        "change",
        "banned",
        "suspended",
        "change mobile number",
        "update mobile number",
        "account banned",
        "account suspended",
      ],
    },
    {
      id: "deposit",
      title: "Deposit",
      icon: "💰",
      color: "bg-orange-500",
      keywords: [
        "deposit",
        "add money",
        "payment",
        "fund",
        "recharge",
        "top up",
        "failed payment",
        "paytm",
        "upi",
        "pending",
        "charged",
        "failed payment charged",
        "payment failed charged",
        "paytm only",
        "upi only",
        "add funds paytm",
        "add funds upi",
      ],
    },
    {
      id: "games",
      title: "Games & Contests",
      icon: "🎮",
      color: "bg-red-500",
      keywords: [
        "game",
        "contest",
        "match",
        "team",
        "play",
        "fantasy",
        "cricket",
        "points",
        "edit team",
        "canceled",
        "entry",
      ],
    },
    {
      id: "rewards",
      title: "Rewards & Bonuses",
      icon: "🎁",
      color: "bg-pink-500",
      keywords: [
        "bonus",
        "reward",
        "referral",
        "cashback",
        "offer",
        "promotion",
        "bonus cash",
        "not received",
      ],
    },
    {
      id: "technical",
      title: "Technical Issues",
      icon: "🔧",
      color: "bg-indigo-500",
      keywords: [
        "app",
        "crash",
        "not opening",
        "technical",
        "bug",
        "delete account",
        "permanently",
        "update",
      ],
    },
  ];

  // Enhanced NLP Processing
  const nlpProcessor = {
    // Tokenize and clean text
    tokenize: (text) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 1);
    },

    // Extract entities (amounts, dates, etc.)
    extractEntities: (text) => {
      const entities = {
        amounts: [],
        timeframes: [],
        actions: [],
      };

      // Detect not credited expressions
      if (
        /(?:not|wasn['']?t|is\s+not)\s+(credited|received|reflected)/i.test(
          text
        )
      ) {
        entities.notCredited = true;
      }

      // Detect pending status
      if (/pending|panding/i.test(text)) {
        entities.pending = true;
      }

      // Detect cancellation requests
      if (/cancel|stop|halt/i.test(text)) {
        entities.cancellation = true;
      }

      // Extract monetary amounts
      const amountRegex =
        /₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs?|₹)?/gi;
      const amounts = text.match(amountRegex);
      if (amounts) {
        entities.amounts = amounts.map((amount) =>
          amount.replace(/[^\d.]/g, "")
        );
      }

      // Extract time-related entities
      const timeRegex =
        /(today|tomorrow|yesterday|(\d+)\s*(hours?|days?|weeks?|months?))/gi;
      const timeMatches = text.match(timeRegex);
      if (timeMatches) {
        entities.timeframes = timeMatches;
      }

      // Extract action verbs
      const actionWords = [
        "withdraw",
        "deposit",
        "add",
        "remove",
        "update",
        "change",
        "verify",
        "submit",
        "cancel",
        "edit",
        "delete",
      ];
      entities.actions = nlpProcessor
        .tokenize(text)
        .filter((word) => actionWords.includes(word));
      return entities;
    },

    // Analyze sentiment
    analyzeSentiment: (text) => {
      const positiveWords = [
        "good",
        "great",
        "excellent",
        "happy",
        "satisfied",
        "love",
        "like",
        "perfect",
        "amazing",
      ];
      const negativeWords = [
        "bad",
        "terrible",
        "hate",
        "frustrated",
        "angry",
        "disappointed",
        "problem",
        "issue",
        "error",
        "bug",
        "stuck",
        "delayed",
        "failed",
        "wrong",
      ];
      const urgentWords = [
        "urgent",
        "immediately",
        "asap",
        "emergency",
        "critical",
        "important",
        "help",
        "stuck",
      ];
      const tokens = nlpProcessor.tokenize(text);

      const positiveCount = tokens.filter((word) =>
        positiveWords.includes(word)
      ).length;
      const negativeCount = tokens.filter((word) =>
        negativeWords.includes(word)
      ).length;
      const urgentCount = tokens.filter((word) =>
        urgentWords.includes(word)
      ).length;
      if (urgentCount > 0)
        return { sentiment: "urgent", score: 0.8 + urgentCount * 0.1 };
      if (negativeCount > positiveCount)
        return { sentiment: "negative", score: 0.3 + negativeCount * 0.1 };
      if (positiveCount > negativeCount)
        return { sentiment: "positive", score: 0.7 + positiveCount * 0.1 };
      return { sentiment: "neutral", score: 0.5 };
    },

    // Intent classification with confidence scoring
    classifyIntent: (text, entities) => {
      const tokens = nlpProcessor.tokenize(text);
      const intentScores = {};

      categories.forEach((category) => {
        let score = 0;

        // Boost for known context
        if (
          (category.id === "withdrawal" || category.id === "deposit") &&
          entities.notCredited
        ) {
          score += 1;
        }

        // Boost for pending status
        if (
          entities.pending &&
          (category.id === "withdrawal" || category.id === "deposit")
        ) {
          score += 1;
        }

        // Boost for cancellation
        if (entities.cancellation && category.id === "withdrawal") {
          score += 1;
        }

        category.keywords.forEach((keyword) => {
          if (
            tokens.includes(keyword) ||
            text.toLowerCase().includes(keyword)
          ) {
            score += 1;
          }
        });

        // Boost score based on entities
        if (category.id === "withdrawal" && entities.amounts.length > 0)
          score += 0.5;
        if (category.id === "deposit" && entities.amounts.length > 0)
          score += 0.5;
        if (category.id === "kyc" && text.includes("document")) score += 0.3;
        if (category.id === "account" && entities.actions.includes("change"))
          score += 0.5;
        intentScores[category.id] = score / Math.sqrt(category.keywords.length);
      });

      const bestIntent = Object.keys(intentScores).reduce((a, b) =>
        intentScores[a] > intentScores[b] ? a : b
      );
      return {
        intent: intentScores[bestIntent] > 0.2 ? bestIntent : "general",
        confidence: Math.min(intentScores[bestIntent] || 0, 1),
        allScores: intentScores,
      };
    },
  };

  const quickAnswers = {
    withdrawal: {
      questions: [
        "How to withdraw money?",
        "Withdrawal processing time?",
        "Minimum withdrawal amount?",
        "Withdrawal fees?",
        "Bank account issues?",
        "Can I cancel a withdrawal request?",
        "Why is my withdrawal delayed beyond 24 hours?",
        "What if I entered wrong bank details?",
        "Withdraw pending issue",
      ],
      contextualAnswers: {
        high_amount:
          "For large withdrawals (₹10,000+), additional verification may be required. Processing time: 4-24 hours.",
        urgent:
          "For urgent withdrawals, ensure KYC is complete. Contact support for priority processing if needed.",
        weekend:
          "Weekend withdrawals are processed on Monday. Bank transfers may take additional time.",
        first_time:
          "First withdrawal? Ensure: 1) KYC verified 2) Bank account added 3) Minimum ₹100 amount",
        pending:
          "Withdrawal pending? Usually processes within 24 hours. If delayed beyond 48 hours, contact support with transaction ID.",
        cancellation:
          "Withdrawal requests once initiated cannot be canceled. Please wait for it to process or contact support if there's an issue.",
      },
      answers: {
        "How to withdraw money?":
          "To withdraw: 1) Go to Wallet section 2) Click Withdraw 3) Enter amount 4) Select bank account 5) Confirm transaction. Ensure your KYC is completed for smooth withdrawals.",
        "Withdrawal processing time?":
          "Withdrawals typically process within 24-48 hours on working days. Bank transfers may take 1-3 business days depending on your bank.",
        "Minimum withdrawal amount?":
          "Minimum withdrawal amount is ₹100. Maximum daily limit is ₹50,000 for verified accounts.",
        "Withdrawal fees?":
          "No withdrawal fees for amounts above ₹200. For amounts below ₹200, a GST,Taxes applies.",
        "Bank account issues?":
          "Bank account problems: 1) Verify account details 2) Ensure account is active 3) Check if account supports IMPS/NEFT 4) Contact bank if needed.",
        "Can I cancel a withdrawal request?":
          "Withdrawal requests once initiated cannot be canceled. Please wait for it to process or contact support if there's an issue.",
        "Why is my withdrawal delayed beyond 24 hours?":
          "Delays can happen due to bank processing time, verification issues, or weekends. If delayed over 48 hours, please contact support with your transaction ID.",
        "What if I entered wrong bank details?":
          "If incorrect bank details were entered, the amount will usually be reversed within 5–7 business days. Update your bank details in the app immediately.",
        "Withdraw pending issue":
          "If your withdrawal is pending: 1) Check if it's been less than 24 hours 2) Verify your bank details are correct 3) Ensure KYC is complete 4) Contact support if delayed beyond 48 hours with transaction ID",
      },
    },
    kyc: {
      questions: [
        "KYC verification process?",
        "Required documents?",
        "KYC approval time?",
        "KYC rejected reasons?",
        "Update KYC documents?",
        "Can I complete KYC with only Aadhaar?",
        "KYC stuck in pending for 3+ days",
        "Can I use someone else's documents?",
      ],
      contextualAnswers: {
        rejected:
          "KYC rejected? Common issues: blurry images, mismatched details, expired documents. Upload clear, valid documents.",
        urgent:
          "Need urgent KYC approval? Ensure all documents are clear and details match exactly. Contact support for priority review.",
        update:
          "To update KYC: Go to Profile > KYC > Upload new documents. Previous documents will be replaced.",
        stuck:
          "If KYC is pending beyond 72 hours, ensure documents are clear and valid. Contact support with your registered email or mobile number.",
      },
      answers: {
        "KYC verification process?":
          "KYC Process: 1) Upload Aadhaar & PAN 2) Bank statement/passbook 3) Selfie verification 4) Wait for approval. Ensure all documents are clear and valid.",
        "Required documents?":
          "Required: Valid Aadhaar Card, PAN Card, Bank Statement (last 3 months) or Passbook front page, and a clear selfie.",
        "KYC approval time?":
          "KYC verification typically takes 24-48 hours. You'll receive notification once approved.",
        "KYC rejected reasons?":
          "Common reasons: Blurry documents, mismatched details, expired documents, or unclear selfie. Please resubmit with clear, valid documents.",
        "Update KYC documents?":
          "Update KYC: Profile > KYC Section > Re-upload documents. Ensure new documents are clear and valid.",
        "Can I complete KYC with only Aadhaar?":
          "You need both Aadhaar and PAN card for full KYC. Bank statement or passbook is required for account verification.",
        "KYC stuck in pending for 3+ days":
          "If KYC is pending beyond 72 hours, ensure documents are clear and valid. Contact support with your registered email or mobile number.",
        "Can I use someone else's documents?":
          "No. KYC must be completed with your own valid government-issued documents. Using someone else’s details violates our policies.",
      },
    },
    account: {
      questions: [
        "Forgot password?",
        "Account locked?",
        "Update profile info?",
        "Delete account?",
        "Login issues?",
        "How do I change my registered mobile number?",
        "My account was banned — why?",
      ],
      contextualAnswers: {
        locked:
          "Account locked? Usually due to multiple failed attempts. Wait 30 minutes or contact support for immediate unlock.",
        forgot_password:
          "Forgot password? Use 'Forgot Password' on login screen. You'll receive OTP on registered mobile/email.",
        urgent:
          "Urgent account access needed? Contact support with account details for immediate assistance.",
        banned:
          "Accounts may be suspended due to suspicious activity, multiple accounts, or T&C violations. Please contact support to review your case.",
      },
      answers: {
        "Forgot password?":
          'Reset password: 1) Click "Forgot Password" on login 2) Enter registered mobile/email 3) Enter OTP 4) Set new password. Use a strong password with 8+ characters.',
        "Account locked?":
          "Account locked due to security reasons or multiple failed login attempts. Try after 30 minutes or contact support for immediate assistance.",
        "Update profile info?":
          "Update profile: Go to Settings > Profile > Edit details. Note: Some details like mobile number may require verification.",
        "Delete account?":
          "To delete account: Settings > Account > Delete Account. Warning: This action is irreversible and you'll lose all data and wallet balance.",
        "Login issues?":
          "Login problems: 1) Check internet connection 2) Clear app cache 3) Update app 4) Try forgot password 5) Contact support if persists.",
        "How do I change my registered mobile number?":
          "To change your mobile number, go to Settings > Profile > Change Mobile. You’ll be asked to verify the new number with an OTP.",
        "My account was banned — why?":
          "Accounts may be suspended due to suspicious activity, multiple accounts, or T&C violations. Please contact support to review your case.",
      },
    },
    deposit: {
      questions: [
        "How to add money?",
        "Payment methods?",
        "Deposit not credited?",
        "Deposit limits?",
        "Payment failed?",
        "I made a payment but it failed. Will I be charged?",
        "Can I add funds using Paytm/UPI only?",
        "Deposits money pending",
      ],
      contextualAnswers: {
        failed:
          "Payment failed? Check: 1) Internet connection 2) Card/bank balance 3) Daily limits 4) Try different payment method",
        not_credited:
          "Deposit not reflected? Wait 10 minutes, check bank statement, note transaction ID, contact support with screenshot.",
        high_amount:
          "Large deposits (₹10,000+) may need additional verification. Keep transaction receipts handy.",
        pending:
          "Deposit pending? Usually reflects within 10 minutes. If still pending after 30 minutes, contact support with transaction details.",
      },
      answers: {
        "How to add money?":
          "Add money: 1) Go to Wallet 2) Click Add Cash 3) Enter amount 4) Choose payment method 5) Complete payment. Money reflects instantly in most cases.",
        "Payment methods?":
          "Accepted: UPI, Net Banking, Debit/Credit Cards, Paytm, PhonePe, Google Pay. All major banks supported.",
        "Deposit not credited?":
          "If deposit not credited within 10 minutes: 1) Check bank statement 2) Note transaction ID 3) Contact support with screenshot. Usually resolves within 2-4 hours.",
        "Deposit limits?":
          "Minimum deposit: ₹25. Maximum: ₹10,000+ per transaction, ₹999999 per day for verified accounts.",
        "Payment failed?":
          "Payment failure reasons: Insufficient balance, network issues, bank limits, or card restrictions. Try different payment method.",
        "I made a payment but it failed. Will I be charged?":
          "If payment fails, the amount is auto-reversed by your bank within 2–5 working days. Keep an eye on your statement.",
        "Can I add funds using Paytm/UPI only?":
          "Yes! We support Paytm, PhonePe, Google Pay, UPI, debit/credit cards, and net banking.",
        "Deposits money pending":
          "If your deposit is pending: 1) Wait 10-15 minutes for processing 2) Check your bank statement 3) Note the transaction ID 4) Contact support if not credited within 30 minutes",
      },
    },
    games: {
      questions: [
        "How to join contests?",
        "Contest rules?",
        "Prize distribution?",
        "Game not loading?",
        "Team selection tips?",
        "How are fantasy points calculated?",
        "Can I edit my team after joining a contest?",
        "Why was my contest entry canceled?",
      ],
      contextualAnswers: {
        beginner:
          "New to fantasy cricket? Start with smaller contests, study player stats, and diversify your team selection.",
        urgent:
          "Contest starting soon? Quickly create team, focus on in-form players, check pitch conditions.",
        technical:
          "Technical issues? Try: refresh app, check internet, clear cache, update app, restart device.",
        canceled:
          "Contests can be canceled if minimum participants aren't met. In such cases, entry fees are refunded automatically.",
      },
      answers: {
        "How to join contests?":
          "Join contests: 1) Select sport 2) Choose contest 3) Create team 4) Pay entry fee 5) Track live scores. Join before contest deadline.",
        "Contest rules?":
          "Each contest has specific rules for team selection, player limits, and scoring. Check contest details before joining.",
        "Prize distribution?":
          "Prizes distributed within 24 hours after contest completion. Winners announced based on final rankings.",
        "Game not loading?":
          "Try: 1) Refresh app 2) Check internet connection 3) Update app 4) Clear cache 5) Restart device. Contact support if issue persists.",
        "Team selection tips?":
          "Tips: 1) Pick in-form players 2) Check pitch conditions 3) Balance budget 4) Choose reliable captain/vice-captain 5) Monitor weather updates.",
        "How are fantasy points calculated?":
          "Points are based on live match stats (runs, wickets, catches, etc.) and follow the official scoring system. You can find the full breakdown in 'How to Play'.",
        "Can I edit my team after joining a contest?":
          "Yes — you can edit your team until the match starts. After the deadline, no changes are allowed.",
        "Why was my contest entry canceled?":
          "Contests can be canceled if minimum participants aren't met. In such cases, entry fees are refunded automatically.",
      },
    },
    rewards: {
      questions: [
        "Referral bonus?",
        "Daily bonuses?",
        "Cashback offers?",
        "Bonus not credited?",
        "Promo codes?",
        "How do I use my bonus cash?",
        "Referral bonus not received — why?",
      ],
      contextualAnswers: {
        not_credited:
          "Bonus not credited? Check: 1) Terms and conditions met 2) Wait 24-48 hours 3) Contact support with details",
        referral:
          "Referral bonus: Share code > Friend deposits ₹100+ > Both get ₹50. Bonus credited within 24 hours.",
        expired:
          "Promo code expired? Check validity dates. New offers available in 'Offers' section.",
      },
      answers: {
        "Referral bonus?":
          "Refer friends: Share your code > Friend signs up & deposits ₹100+ > Both get ₹50 bonus. Bonus credited within 24 hours.",
        "Daily bonuses?":
          "Daily login bonus, spin wheel rewards, and special weekend bonuses available. Check Rewards section daily.",
        "Cashback offers?":
          "Cashback on deposits during special promotions. Check Offers section for current cashback deals and terms.",
        "Bonus not credited?":
          "Bonus delays: Check if terms met, wait 24-48 hours, or contact support with details for manual credit.",
        "Promo codes?":
          "Apply promo codes during deposit/contest entry. Check 'Offers' section for active codes and validity dates.",
        "How do I use my bonus cash?":
          "Bonus cash can be used to join eligible contests (usually up to 10–20% of entry fee). It cannot be withdrawn.",
        "Referral bonus not received — why?":
          "Ensure your friend signed up using your code and deposited ₹100+. Bonuses are credited within 24 hours after successful deposit.",
      },
    },
    technical: {
      questions: [
        "App is not opening or keeps crashing",
        "How can I delete my account permanently?",
        "Update app issues",
      ],
      contextualAnswers: {
        crash:
          "App crashing? Try: update app, clear cache, restart device, ensure stable internet connection.",
        delete:
          "Deleting account is permanent and cannot be reversed. You'll lose all data and wallet balance.",
      },
      answers: {
        "App is not opening or keeps crashing":
          "Please update the app, clear cache, or reinstall. Ensure you have a stable internet connection.",
        "How can I delete my account permanently?":
          "To delete your account, go to Settings > Account > Delete Account. This action is permanent and cannot be reversed.",
        "Update app issues":
          "If you're having trouble updating: 1) Check available storage 2) Clear Play Store cache 3) Try updating via different network 4) Restart device and try again",
      },
    },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Enhanced AI Response Generation
  const generateAIResponse = (userMessage) => {
    const entities = nlpProcessor.extractEntities(userMessage);
    const sentiment = nlpProcessor.analyzeSentiment(userMessage);
    const intentResult = nlpProcessor.classifyIntent(userMessage, entities);

    // Update user context
    setUserContext((prev) => ({
      ...prev,
      lastIntent: intentResult.intent,
      sentiment: sentiment.sentiment,
      conversationHistory: [
        ...prev.conversationHistory.slice(-5),
        {
          message: userMessage,
          intent: intentResult.intent,
          sentiment: sentiment.sentiment,
        },
      ],
    }));

    // Handle complex queries that need escalation
    const complexKeywords = [
      "problem",
      "issue",
      "error",
      "bug",
      "complaint",
      "refund",
      "legal",
      "fraud",
    ];
    const isComplex = complexKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword)
    );
    if (isComplex && sentiment.sentiment === "urgent") {
      return { response: "ESCALATE", confidence: 0.9 };
    }

    // Generate contextual response
    if (intentResult.confidence > 0.3) {
      const categoryData = quickAnswers[intentResult.intent];

      // Check for contextual answers
      let contextualResponse = null;
      // Prioritize specific contexts
      if (entities.pending) {
        contextualResponse = categoryData.contextualAnswers?.pending;
      } else if (
        entities.cancellation &&
        intentResult.intent === "withdrawal"
      ) {
        contextualResponse = categoryData.contextualAnswers?.cancellation;
      } else if (
        /(?:not|wasn['']?t|is\s+not)\s+(credited|received|reflected)/i.test(
          userMessage
        )
      ) {
        contextualResponse = categoryData.contextualAnswers?.not_credited;
      } else if (
        entities.amounts.length > 0 &&
        parseInt(entities.amounts[0]) > 10000
      ) {
        contextualResponse = categoryData.contextualAnswers?.high_amount;
      } else if (sentiment.sentiment === "urgent") {
        contextualResponse = categoryData.contextualAnswers?.urgent;
      } else if (userMessage.toLowerCase().includes("reject")) {
        contextualResponse = categoryData.contextualAnswers?.rejected;
      } else if (userMessage.toLowerCase().includes("stuck")) {
        contextualResponse = categoryData.contextualAnswers?.stuck;
      } else if (userMessage.toLowerCase().includes("banned")) {
        contextualResponse = categoryData.contextualAnswers?.banned;
      }

      if (contextualResponse) {
        return {
          response: contextualResponse,
          confidence: intentResult.confidence,
          intent: intentResult.intent,
          entities: entities,
          sentiment: sentiment,
        };
      }

      // Find best matching answer
      const userText = userMessage.toLowerCase();
      let bestMatch = categoryData.questions.find((q) =>
        userText.includes(q.toLowerCase().split(" ")[0])
      );
      // Enhanced matching for specific queries
      if (!bestMatch) {
        // Check for partial matches
        bestMatch = categoryData.questions.find((q) => {
          const qWords = q.toLowerCase().split(" ");
          return qWords.some((word) => userText.includes(word));
        });
      }

      // Fallback to first if no match
      if (!bestMatch) {
        bestMatch = categoryData.questions[0];
      }

      return {
        response: categoryData.answers[bestMatch],
        confidence: intentResult.confidence,
        intent: intentResult.intent,
        entities: entities,
        sentiment: sentiment,
      };
    }

    // Fallback response with intelligence
    const fallbackResponses = [
      "I understand you're looking for help. Let me analyze your question better - could you please provide more details?",
      "Based on what I understand, this seems to be about general support. Could you specify which area you need help with?",
      "I'm processing your request using AI. For the best assistance, could you select a category above or rephrase your question?",
    ];
    return {
      response:
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      confidence: 0.2,
      intent: "general",
      entities: entities,
      sentiment: sentiment,
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setShowCategories(false);

    // AI processing with realistic delay
    setTimeout(() => {
      const aiResult = generateAIResponse(inputMessage);
      if (aiResult.response === "ESCALATE") {
        escalateToHuman();
      } else {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          text: aiResult.response,
          timestamp: new Date(),
          confidence: aiResult.confidence,
          intent: aiResult.intent,
          aiInsights: {
            entities: aiResult.entities,
            sentiment: aiResult.sentiment,
            processingTime: "0.3s",
          },
          // This line ensures the follow-up options appear
          showFollowUp: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
      setIsTyping(false);
    }, Math.random() * 1000 + 1000); // Variable response time for realism
  };

  const handleCategoryClick = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const questions = quickAnswers[categoryId].questions;
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: `I need help with ${category.title}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setShowCategories(false);

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: `I can help with ${category.title}! Here are the most common questions I can answer:`,
        timestamp: new Date(),
        suggestions: questions,
        confidence: 0.95,
        intent: categoryId,
        // Set showFollowUp to true for messages with suggestions
        showFollowUp: true,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const escalateToHuman = () => {
    setEscalated(true);
    const escalationMessage = {
      id: messages.length + 1,
      type: "bot",
      text: "I understand this needs human expertise. Connecting you with our support team... 🎧\n\nA customer support agent will assist you shortly. Average wait time: 2-3 minutes.\n\n*AI Context shared with agent for faster resolution*",
      timestamp: new Date(),
      isEscalation: true,
      confidence: 1.0,
    };
    setMessages((prev) => [...prev, escalationMessage]);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        text: "Welcome back to fantasy AI Support! 🎯 I've learned from our previous conversation. How can I help you today?",
        timestamp: new Date(),
        confidence: 1.0,
      },
    ]);
    setShowCategories(true);
    setEscalated(false);
    setUserContext({
      lastIntent: null,
      conversationHistory: [],
      preferredLanguage: "english",
      sentiment: "neutral",
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion); // This puts the question into the input field
    handleSendMessage(); // This automatically sends the message
    // Removed the recursive call: handleSuggestionClick();
  };

  const handleFollowUpResponse = (responseType, messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, showFollowUp: false } : msg
      )
    );
    if (responseType === "yes") {
      const thankYouMessage = {
        id: messages.length + 1,
        type: "bot",
        text: "Great! I'm glad I could help. Thank You😊",
        timestamp: new Date(),
        confidence: 1.0,
      };
      setMessages((prev) => [...prev, thankYouMessage]);
    } else if (responseType === "no") {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, showFeedback: true } : msg
        )
      );
    } else if (responseType === "connect") {
      escalateToHuman();
    }
  };

  const handleFeedbackSubmit = (feedback) => {
    // In a real application, this feedback would be sent to a backend system
    console.log("Feedback submitted:", feedback);
    const feedbackConfirmMessage = {
      id: messages.length + 1,
      type: "bot",
      text: "Thank you for your feedback! We'll use this to improve our AI. If you need immediate assistance, please connect with a human agent.",
      timestamp: new Date(),
      confidence: 1.0,
      showConnectOption: true,
    };
    setMessages((prev) => [...prev, feedbackConfirmMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              {escalated ? (
                <Headphones className="w-6 h-6 text-white" />
              ) : (
                <Brain className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center">
                Fantasy AI Assistant{" "}
                {!escalated && <Zap className="w-4 h-4 ml-2 text-yellow-400" />}
              </h1>
              <p className="text-sm text-purple-200">
                {escalated
                  ? "Connected to Human Support Agent"
                  : `AI-Powered • Context-Aware • Sentiment: ${userContext.sentiment}`}
              </p>
            </div>
          </div>
          {escalated && (
            <button
              onClick={resetChat}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> <span>New AI Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages with AI Indicators */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === "user"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : message.isEscalation
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-white/90 text-gray-800"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === "bot" && (
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {message.isEscalation ? (
                      <Headphones className="w-3 h-3 text-white" />
                    ) : (
                      <Brain className="w-3 h-3 text-white" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.text}
                  </p>
                  {/* AI Confidence Indicator */}
                  {message.type === "bot" &&
                    message.confidence &&
                    !message.isEscalation && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              message.confidence > 0.7
                                ? "bg-green-500"
                                : message.confidence > 0.4
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                            }`}
                          ></div>
                          <span className="text-gray-600">
                            AI Confidence:{" "}
                            {Math.round(message.confidence * 100)}%
                          </span>
                        </div>
                        {message.intent && (
                          <span className="text-gray-500">
                            {" "}
                            Intent: {message.intent}{" "}
                          </span>
                        )}
                      </div>
                    )}
                  {/* Question Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Follow-up Options */}
                  {message.showFollowUp && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Did this answer help you?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleFollowUpResponse("yes", message.id)
                          }
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                        >
                          ✅ Yes, it helped
                        </button>
                        <button
                          onClick={() =>
                            handleFollowUpResponse("no", message.id)
                          }
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors"
                        >
                          ❌ No, need more help
                        </button>
                        <button
                          onClick={() =>
                            handleFollowUpResponse("connect", message.id)
                          }
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                        >
                          🎧 Connect to Support
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback Form */}
                  {message.showFeedback && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Please tell us what didn't work or what additional help you need..."
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3"
                      />
                      <button
                        onClick={() => {
                          if (feedbackInput.trim()) {
                            handleFeedbackSubmit(feedbackInput);
                            setFeedbackInput("");
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? { ...msg, showFeedback: false }
                                  : msg
                              )
                            );
                          }
                        }}
                        disabled={!feedbackInput.trim()}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}

                  {/* Connect Option */}
                  {message.showConnectOption && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          escalateToHuman();
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === message.id
                                ? { ...msg, showConnectOption: false }
                                : msg
                            )
                          );
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                      >
                        Connect to Human Support
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white/90 text-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm">Typing...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Category Bubbles */}
      {showCategories && (
        <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/20 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`${category.color} text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-all hover:scale-105`}
            >
              <span>{category.icon}</span>
              <span>{category.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-4 flex items-center space-x-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              escalated
                ? "Chat is escalated to human support..."
                : "Type your message..."
            }
            className="w-full bg-white/20 text-white placeholder-purple-200 border border-purple-400 pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={escalated}
          />
          {!escalated && inputMessage.trim() && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || escalated}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white p-3 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          {!escalated && <Brain className="w-4 h-4" />}
        </button>
      </div>

      {!escalated && (
        <div className="mt-2 flex items-center justify-between text-xs text-purple-200">
          <span>
            🤖 AI understands context, sentiment, and entities • Natural
            language processing enabled
          </span>
          {userContext.sentiment !== "neutral" && (
            <span className="px-2 py-1 bg-white/10 rounded-full">
              Sentiment: {userContext.sentiment}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
