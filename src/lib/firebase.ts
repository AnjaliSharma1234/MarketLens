// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  getDoc, 
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  startAfter,
  QueryDocumentSnapshot
} from "firebase/firestore";

// Types for chat functionality
export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Timestamp;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage: string;
  messageCount?: number;
}

export interface Analysis {
  id: string;
  userId: string;
  companyName: string;
  companyURL: string;
  competitorName: string;
  competitorURL: string;
  competitorLogo: string;
  analysisJson?: any;
  createdAt: Timestamp;
  context?: any;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQYkJWSHTb9meGROg9ATaYPxo-PCxCko8",
  authDomain: "marketlens-8f0fe.firebaseapp.com",
  projectId: "marketlens-8f0fe",
  storageBucket: "marketlens-8f0fe.appspot.com",
  messagingSenderId: "778519545268",
  appId: "1:778519545268:web:a0339b036b51a1afd4dee1",
  measurementId: "G-TWL4HYNZLM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };

// Chat-related functions
export async function createNewChat(userId: string, initialMessage: string): Promise<string> {
  try {
    // Create the main chat document
    const chatRef = await addDoc(collection(db, "chats"), {
      userId,
      title: initialMessage.slice(0, 50) + (initialMessage.length > 50 ? "..." : ""),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: initialMessage,
      messageCount: 1
    });

    // Add the first message to the messages subcollection
    await addDoc(collection(db, `chats/${chatRef.id}/messages`), {
      content: initialMessage,
      sender: "user",
      timestamp: serverTimestamp()
    });

    return chatRef.id;
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw new Error("Failed to create new chat. Please try again.");
  }
}

export async function addMessageToChat(
  chatId: string, 
  content: string, 
  sender: "user" | "assistant"
): Promise<void> {
  try {
    // Add message to the messages subcollection
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      content,
      sender,
      timestamp: serverTimestamp()
    });

    // Update the main chat document
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: content,
      updatedAt: serverTimestamp(),
      messageCount: (await getChatMessageCount(chatId)) + 1
    });
  } catch (error) {
    console.error("Error adding message to chat:", error);
    throw new Error("Failed to save message. Please try again.");
  }
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    const chatsQuery = query(
      collection(db, "chats"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(chatsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Chat));
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw new Error("Failed to load chat history. Please try again.");
  }
}

export async function getChatMessages(
  chatId: string, 
  lastMessageId?: string,
  pageSize: number = 50
): Promise<ChatMessage[]> {
  try {
    let messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp", "desc"),
      limit(pageSize)
    );

    if (lastMessageId) {
      const lastMessageDoc = await getDoc(doc(db, `chats/${chatId}/messages/${lastMessageId}`));
      if (lastMessageDoc.exists()) {
        messagesQuery = query(
          collection(db, `chats/${chatId}/messages`),
          orderBy("timestamp", "desc"),
          startAfter(lastMessageDoc),
          limit(pageSize)
        );
      }
    }

    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw new Error("Failed to load messages. Please try again.");
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    // Delete all messages in the subcollection first
    const messagesQuery = query(collection(db, `chats/${chatId}/messages`));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the main chat document
    await deleteDoc(doc(db, "chats", chatId));
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Failed to delete chat. Please try again.");
  }
}

export async function getChatMessageCount(chatId: string): Promise<number> {
  try {
    const messagesQuery = query(collection(db, `chats/${chatId}/messages`));
    const snapshot = await getDocs(messagesQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting message count:", error);
    return 0;
  }
}

export async function updateChatTitle(chatId: string, newTitle: string): Promise<void> {
  try {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw new Error("Failed to update chat title. Please try again.");
  }
}

export async function exportChatHistory(chatId: string): Promise<{ chat: Chat; messages: ChatMessage[] }> {
  try {
    // Get chat details
    const chatDoc = await getDoc(doc(db, "chats", chatId));
    if (!chatDoc.exists()) {
      throw new Error("Chat not found");
    }
    
    const chat = { id: chatDoc.id, ...chatDoc.data() } as Chat;
    
    // Get all messages
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp", "asc")
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    
    return { chat, messages };
  } catch (error) {
    console.error("Error exporting chat history:", error);
    throw new Error("Failed to export chat history. Please try again.");
  }
}

export async function searchChats(userId: string, searchTerm: string): Promise<Chat[]> {
  try {
    // Get all user chats and filter client-side for now
    // In a production app, you might want to use Algolia or similar for better search
    const chatsQuery = query(
      collection(db, "chats"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(chatsQuery);
    const allChats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Chat));
    
    if (!searchTerm.trim()) {
      return allChats;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allChats.filter(chat => 
      chat.title.toLowerCase().includes(lowerSearchTerm) ||
      chat.lastMessage.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error("Error searching chats:", error);
    throw new Error("Failed to search chats. Please try again.");
  }
}

// Call this after successful sign-up
async function createUserProfile(user) {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    avatarUrl: user.photoURL || "",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    provider: user.providerData[0]?.providerId || "password",
    role: "member"
  });
}

export { createUserProfile };

export async function seedPlans() {
  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: 0,
      analysesPerMonth: 1
    },
    {
      id: "basic",
      name: "Basic Plan",
      price: 19,
      analysesPerMonth: 15
    },
    {
      id: "advanced",
      name: "Advanced Plan",
      price: 49,
      analysesPerMonth: -1 // unlimited
    }
  ];
  for (const plan of plans) {
    const ref = doc(collection(db, "plans"), plan.id);
    const exists = await getDoc(ref);
    if (!exists.exists()) {
      await setDoc(ref, plan);
    }
  }
}

// Function to seed prompts collection
export async function seedPrompts() {
  const prompts = [
    {
      id: "competitorFetching",
      prompt: `Given the following company details:
- Name: {companyName}
- Description: {companyDesc}
List the top 5 real, well-known direct competitors as a JSON array with fields: name and website (URL).
Return ONLY the JSON array, no explanation, no extra text, no markdown.
Do NOT use placeholder names, fake URLs, or return an empty array. If you cannot find 5, return as many as possible, but only real companies.
Example: [{"name":"Airtable","website":"https://airtable.com"},{"name":"Coda","website":"https://coda.io"}]`,
      description: "Prompt template for fetching competitors list",
      lastUpdated: serverTimestamp()
    },
    {
      id: "fetchAnalysis",
      prompt: `You are a company intelligence expert. Given the following input:
- companyName: {companyName}
- companyURL: {companyURL}

Your task is to analyze the company and return a complete Company Overview section in the following strict JSON format. Follow these rules:

1. Return ONLY valid JSON, no explanation, no extra text, no markdown
2. All fields in the example are REQUIRED unless marked as optional
3. All array fields must have at least 2 items
4. All URLs must be valid and include https://
5. Do not include placeholder text like "string" or "e.g." in the response
6. Base all information on publicly available data
7. Keep descriptions concise but informative

{
  "companyOverview": {
    "companyName": "Actual company name",
    "companyURL": "https://company.com",
    "companyLogo": "https://logo.url/image.png",
    "tagline": "Official company tagline or slogan",
    "oneLiner": "Brief description of what the company does",
    "founders": [
      {
        "name": "Founder Name",
        "linkedin": "https://linkedin.com/in/founder"
      }
    ],
    "foundedYear": 2015,
    "headcount": "100-200",
    "hqLocation": "City, Country",
    "serviceLocations": ["Region 1", "Region 2"],
    "funding": "Latest funding round and amount",
    "lastValuation": "Latest valuation with date",
    "majorMilestones": [
      "Major milestone 1",
      "Major milestone 2"
    ],
    "businessModel": "Detailed explanation of revenue model",
    "revenueModel": "Specific revenue streams",
    "targetMarket": {
      "segments": ["Segment 1", "Segment 2"],
      "geography": ["Region 1", "Region 2"],
      "customerSize": "Target customer size range"
    },
    "keyMetrics": {
      "revenue": "Annual revenue if public",
      "growth": "YoY growth rate",
      "marketShare": "Market share percentage",
      "customerBase": "Number of customers",
      "retention": "Customer retention rate"
    },
    "competitiveAdvantages": [
      "Advantage 1",
      "Advantage 2"
    ],
    "partnerships": [
      "Partner 1",
      "Partner 2"
    ],
    "awards": [
      "Award 1",
      "Award 2"
    ],
    "marketPosition": "Analysis of market position",
    "growthStrategy": "Growth and expansion strategy",
    "socialAccounts": {
      "linkedin": "https://linkedin.com/company/name",
      "twitter": "https://twitter.com/handle",
      "facebook": "https://facebook.com/name",
      "instagram": "https://instagram.com/handle",
      "youtube": "https://youtube.com/channel/id"
    }
  }
}`,
      description: "Prompt template for fetching company overview",
      lastUpdated: serverTimestamp()
    },
    {
      id: "fetchMarketingInsights",
      prompt: `You are a marketing intelligence expert. Given the following input:
- companyName: {companyName}
- companyURL: {companyURL}

Your task is to analyze the company's marketing strategy and return a complete Marketing Insights section in the following strict JSON format:

{
  "marketingInsights": {
    "brandMessage": "string (main message the company communicates)",
    "brandTone": ["string (tone/voice attributes)", ...],
    "uniqueValueProposition": "string (core value proposition)",
    "websiteTraffic": {
      "monthlyVisitors": "string (e.g. 500K)",
      "topSources": [
        { "source": "string (e.g. Direct)", "percentage": "string (e.g. 40%)" },
        ...
      ]
    },
    "marketingChannels": [
      "string (e.g. Content Marketing)",
      "string (e.g. Social Media)",
      ...
    ],
    "targetAudience": [
      {
        "persona": "string (e.g. Marketing Manager)",
        "description": "string (detailed description)",
        "goals": ["string (specific goals)", ...]
      },
      ...
    ],
    "seoKeywords": [
      {
        "keyword": "string",
        "volume": "string (e.g. 10K/month)",
        "difficulty": "string (e.g. Medium)"
      },
      ...
    ],
    "competitors": [
      {
        "name": "string (competitor company name)",
        "website": "string (competitor website URL)"
      },
      ...
    ]
  }
}

Return ONLY valid JSON, no explanation, no extra text, no markdown. Focus on providing accurate, detailed information while maintaining professional tone. For competitors, include ONLY real, direct competitors with valid website URLs (no placeholders).`,
      description: "Prompt template for fetching marketing insights",
      lastUpdated: serverTimestamp()
    },
    {
      id: "fetchProductPricing",
      prompt: `You are a product and pricing intelligence expert. Given the following input:
- companyName: {companyName}
- companyURL: {companyURL}
Your task is to analyze the company's product and pricing strategy and return a complete Product & Pricing section in the following strict JSON format:
{
  "productAndPricing": {
    "keyFeatures": ["string (e.g. Feature 1)", "string (e.g. Feature 2)", ...],
    "uniqueValueProposition": "string (detailed explanation of core value proposition)",
    "businessModel": {
      "type": "string (e.g. SaaS, Marketplace, etc.)",
      "description": "string (detailed explanation of business model)"
    },
    "pricingTiers": [
      {
        "name": "string (e.g. Basic)",
        "price": "string (e.g. $19/mo)",
        "features": ["string", "string", ...],
        "targetAudience": "string (e.g. Small teams)"
      }
    ]
  }
}

Return ONLY valid JSON, no explanation, no extra text, no markdown. Focus on providing accurate, detailed information while maintaining professional tone.`,
      description: "Prompt template for fetching product and pricing info",
      lastUpdated: serverTimestamp()
    }
  ];

  // Check if prompts collection exists
  const promptsRef = collection(db, "prompts");
  
  for (const prompt of prompts) {
    const docRef = doc(promptsRef, prompt.id);
    const docSnap = await getDoc(docRef);
    
    // Only create if prompt doesn't exist
    if (!docSnap.exists()) {
      await setDoc(docRef, prompt);
    }
  }
}

export async function initializeUserPlanData(user) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    avatarUrl: user.photoURL || "",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    provider: user.providerData[0]?.providerId || "password",
    role: "member",
    plan: "free",
    analysesUsedThisMonth: 0,
    billingRenewalDate: Timestamp.now()
  }, { merge: true });
}

export async function getUserAnalyses(userId: string): Promise<Analysis[]> {
  if (!userId) {
    console.error("getUserAnalyses called without userId");
    throw new Error("User ID is required to fetch analyses");
  }

  try {
    console.log("Fetching analyses for user:", userId);
    
    // Create query
    const analysesQuery = query(
      collection(db, "savedAnalysis"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    console.log("Executing query for user analyses");
    const snapshot = await getDocs(analysesQuery);
    
    console.log(`Found ${snapshot.docs.length} analyses`);
    
    // Log each document for debugging
    snapshot.docs.forEach((doc, index) => {
      console.log(`Analysis ${index + 1}:`, {
        id: doc.id,
        data: doc.data()
      });
    });
    
    const analyses = snapshot.docs.map(doc => {
      const data = doc.data();
      const analysisJson = data.analysisJson || {};
      const companyOverview = analysisJson.companyOverview || {};
      
      return {
        id: doc.id,
        userId: data.userId,
        companyName: data.companyName || companyOverview.companyName || "",
        companyURL: data.companyURL || companyOverview.companyURL || "",
        competitorName: data.competitorName || companyOverview.companyName || "",
        competitorURL: data.competitorURL || companyOverview.companyURL || "",
        competitorLogo: data.competitorLogo || companyOverview.companyLogo || "",
        analysisJson: data.analysisJson || {},
        createdAt: data.createdAt,
        context: data.context || {}
      } as Analysis;
    });

    // Validate each analysis
    const validAnalyses = analyses.filter(analysis => {
      const isValid = analysis.userId === userId && 
                     (analysis.competitorName || analysis.companyName);
      
      if (!isValid) {
        console.warn("Invalid analysis found:", analysis);
      }
      
      return isValid;
    });

    console.log(`Returning ${validAnalyses.length} valid analyses`);
    return validAnalyses;

  } catch (error: any) {
    // Check for missing index error
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.error("Missing required index:", error);
      throw new Error("Database is not properly configured. Please contact support.");
    }
    
    console.error("Error getting user analyses:", error);
    throw new Error("Failed to load analyses. Please try again.");
  }
}

// Function to fetch overview prompt from Firestore
const fetchOverviewPrompt = async () => {
  try {
    const promptRef = doc(db, "prompts", "fetchAnalysis");
    const promptSnap = await getDoc(promptRef);
    if (promptSnap.exists()) {
      return promptSnap.data().prompt;
    }
    console.warn("Overview prompt not found, using default");
    return `You are a company intelligence expert. Given the following input:
- companyName: {companyName}
- companyURL: {companyURL}

Your task is to analyze the company and return a complete Company Overview section in the following strict JSON format. Follow these rules:

1. Return ONLY valid JSON, no explanation, no extra text, no markdown
2. All fields in the example are REQUIRED unless marked as optional
3. All array fields must have at least 2 items
4. All URLs must be valid and include https://
5. Do not include placeholder text like "string" or "e.g." in the response
6. Base all information on publicly available data
7. Keep descriptions concise but informative

{
  "companyOverview": {
    "companyName": "Actual company name",
    "companyURL": "https://company.com",
    "companyLogo": "https://logo.url/image.png",
    "tagline": "Official company tagline or slogan",
    "oneLiner": "Brief description of what the company does",
    "founders": [
      {
        "name": "Founder Name",
        "linkedin": "https://linkedin.com/in/founder"
      }
    ],
    "foundedYear": 2015,
    "headcount": "100-200",
    "hqLocation": "City, Country",
    "serviceLocations": ["Region 1", "Region 2"],
    "funding": "Latest funding round and amount",
    "lastValuation": "Latest valuation with date",
    "majorMilestones": [
      "Major milestone 1",
      "Major milestone 2"
    ],
    "businessModel": "Detailed explanation of revenue model",
    "revenueModel": "Specific revenue streams",
    "targetMarket": {
      "segments": ["Segment 1", "Segment 2"],
      "geography": ["Region 1", "Region 2"],
      "customerSize": "Target customer size range"
    },
    "keyMetrics": {
      "revenue": "Annual revenue if public",
      "growth": "YoY growth rate",
      "marketShare": "Market share percentage",
      "customerBase": "Number of customers",
      "retention": "Customer retention rate"
    },
    "competitiveAdvantages": [
      "Advantage 1",
      "Advantage 2"
    ],
    "partnerships": [
      "Partner 1",
      "Partner 2"
    ],
    "awards": [
      "Award 1",
      "Award 2"
    ],
    "marketPosition": "Analysis of market position",
    "growthStrategy": "Growth and expansion strategy",
    "socialAccounts": {
      "linkedin": "https://linkedin.com/company/name",
      "twitter": "https://twitter.com/handle",
      "facebook": "https://facebook.com/name",
      "instagram": "https://instagram.com/handle",
      "youtube": "https://youtube.com/channel/id"
    }
  }
}`;
  } catch (error) {
    console.error("Error fetching overview prompt:", error);
    throw new Error("Failed to fetch overview prompt. Please try again.");
  }
} 