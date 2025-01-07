// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2, Bot, User } from "lucide-react";
import SideBarPhone from "../../components/ui/sidebarPhone";
import SideBar from "../../components/ui/sidebar";
import CrateCard from "../../components/CrateCard";
import useCrateCharts from "../explorecrate/useCrateCharts";

interface UserInfo {
  age: string;
  salary: string;
  familyMembers: string;
  netWorth: string;
}

interface ChatMessage {
  type: "user" | "bot";
  message: string;
}

interface StoredSession {
  chatHistory: ChatMessage[];
  userInfo: UserInfo;
  suggestedCrate: any;
}

export default function SickAi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: "",
    salary: "",
    familyMembers: "",
    netWorth: "",
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [allCrates, setAllCrates] = useState<any[]>([]);
  const [suggestCrate, setSuggestedCrate] = useState<any | null>(null);
  const { chartsData, weightedPriceChanges } = useCrateCharts(allCrates);
  const [isNewUser, setIsNewUser] = useState<boolean>(true);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyBD9pdlngIoEVIT6EQFVH5DxY6yqST6IOs"
  );

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('aiRecommendationSession');
    if (storedSession) {
      const session: StoredSession = JSON.parse(storedSession);
      setChatHistory(session.chatHistory);
      setUserInfo(session.userInfo);
      setSuggestedCrate(session.suggestedCrate);
      setIsNewUser(false);
    } else {
      // Initialize new session
      const initialMessage = {
        type: "bot",
        message: "Hello! To help you find the best crates, I need some information. First, could you tell me your age?"
      };
      setChatHistory([initialMessage]);
      setIsNewUser(true);
    }
  }, []);

  const fetchCrates = async (): Promise<any[]> => {
    try {
      const response = await fetch("https://sickb.vercel.app/api/crates");
      if (!response.ok) {
        throw new Error("Failed to fetch crates");
      }
      const data: any[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching crates:", error);
      return [];
    }
  };

  const processUserInput = (input: string): void => {
    const steps = ["age", "salary", "familyMembers", "netWorth"];
    const currentField = steps[currentStep];
    
    const updatedUserInfo = {
      ...userInfo,
      [currentField]: input,
    };
    setUserInfo(updatedUserInfo);

    const updatedChatHistory = [
      ...chatHistory,
      { type: "user", message: input },
      { type: "bot", message: getNextQuestion() },
    ];
    setChatHistory(updatedChatHistory);

    // Store the updated session
    const sessionData: StoredSession = {
      chatHistory: updatedChatHistory,
      userInfo: updatedUserInfo,
      suggestedCrate: suggestCrate,
    };
    localStorage.setItem('aiRecommendationSession', JSON.stringify(sessionData));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
      getResponseForGivenPrompt(updatedUserInfo, updatedChatHistory);
    }
  };

  const getNextQuestion = (): string => {
    const questions = [
      "Great! Now, what's your annual salary?",
      "Thanks! How many family members do you have?",
      "Almost done! What's your estimated net worth?",
      "Thank you for providing all the information. I'll now analyze the best crates for you based on your profile.",
    ];
    return questions[currentStep];
  };

  const getResponseForGivenPrompt = async (
    currentUserInfo: UserInfo,
    currentChatHistory: ChatMessage[]
  ): Promise<void> => {
    try {
      setLoading(true);
      const crates = await fetchCrates();
      setAllCrates(crates);

      async function getTokenData(tokens: string[]): Promise<string> {
        if (!Array.isArray(tokens) || tokens.length === 0) {
          return "empty crate";
        }
        const formatToken = (token: string): string => {
          return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
        };
        try {
          const tokenPrices = await Promise.all(
            tokens.map(async (token) => {
              const formattedToken = formatToken(token);
              const response = await fetch(
                `https://price.jup.ag/v6/price?ids=${formattedToken}`
              );
              const data = await response.json();
              return `${formattedToken}: ${
                data[formattedToken]?.price || "N/A"
              }`;
            })
          );
          return tokenPrices.join(", ");
        } catch (error) {
          console.error("Error fetching token prices:", error);
          return "empty crate";
        }
      }

      const cratesData = (
        await Promise.all(
          crates.map(async (crate) => {
            const tokenData = await getTokenData(crate.token);
            return `id: ${crate.id}, name: ${crate.name}, token data: ${tokenData}`;
          })
        )
      ).join("; ");

      const inputPromptText = `Based on the following user profile details, recommend the most suitable single crate from the available options: Age: ${currentUserInfo.age}, Annual Salary: ${currentUserInfo.salary}, Number of Family Members: ${currentUserInfo.familyMembers}, and Net Worth: ${currentUserInfo.netWorth}. Consider these crates: ${cratesData}. Please return the names of crates that best match this user's financial profile and investment needs. It should be a single crate id.`;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(inputPromptText);
      const response = result.response;
      const text = await response.text();

      const crateId = text.trim();
      const matchingCrate = crates.find((crate) => crate.id === crateId);

      if (matchingCrate) {
        setSuggestedCrate(matchingCrate);
        const updatedChatHistory = [
          ...currentChatHistory,
          {
            type: "bot",
            message: `Based on your profile, we recommend the crate: ${matchingCrate.name}`,
          },
        ];
        setChatHistory(updatedChatHistory);

        // Store the complete session
        const sessionData: StoredSession = {
          chatHistory: updatedChatHistory,
          userInfo: currentUserInfo,
          suggestedCrate: matchingCrate,
        };
        localStorage.setItem('aiRecommendationSession', JSON.stringify(sessionData));
      } else {
        const updatedChatHistory = [
          ...currentChatHistory,
          {
            type: "bot",
            message: "I'm sorry, but I couldn't find a matching crate based on your input.",
          },
        ];
        setChatHistory(updatedChatHistory);
        
        // Store the session even if no crate was found
        const sessionData: StoredSession = {
          chatHistory: updatedChatHistory,
          userInfo: currentUserInfo,
          suggestedCrate: null,
        };
        localStorage.setItem('aiRecommendationSession', JSON.stringify(sessionData));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in getResponseForGivenPrompt:", error);
      setLoading(false);
      const errorChatHistory = [
        ...currentChatHistory,
        {
          type: "bot",
          message: "I'm sorry, but I encountered an error while processing your request. Please try again later.",
        },
      ];
      setChatHistory(errorChatHistory);
      
      // Store the session even if there was an error
      const sessionData: StoredSession = {
        chatHistory: errorChatHistory,
        userInfo: currentUserInfo,
        suggestedCrate: null,
      };
      localStorage.setItem('aiRecommendationSession', JSON.stringify(sessionData));
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Only show the input UI for new users who haven't completed the process
  return (
    <div>
      <div className="mx-4"></div>
      <div className="flex md:ml-20 flex-col h-[100vh] bg-[#02050A] text-gray-200">
        <div className="flex-1 mt-20 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-6" ref={chatContainerRef}>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${
                  chat.type === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[70%] ${
                    chat.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-shrink-0 flex">
                    {chat.type === "user" ? (
                      <img src="/pfp.jpeg" className="w-8 h-8 ml-2 bg-gray-700 rounded-full flex items-center justify-center" />
                      
                      
                    ) : (
                        <img src="/sickLogo.png" className="w-8 h-8 ml-2  flex items-center justify-center" />

                    )}
                  </div>
                  <div
                    className={`rounded-xl px-4 py-2 ${
                      chat.type === "user"
                        ? "bg-[#A4E734] text-[#02050A]"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {chat.message}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#A4E734]" />
              </div>
            )}
            {suggestCrate && (
          <div className="ml-10">
            <a
              href={`/crates/${suggestCrate.id}`}
              className="transform transition-all duration-300 hover:scale-105"
              key={suggestCrate.id}
            >
              <CrateCard
                chartData={chartsData[suggestCrate?.id]}
                title={suggestCrate?.name}
                creator={suggestCrate?.creator.name}
                subtitle={`Created: ${new Date(
                  suggestCrate?.createdAt
                ).toLocaleDateString()}`}
                percentage={0}
                tokens={suggestCrate?.tokens}
                weightedPriceChange={weightedPriceChanges[suggestCrate?.id] || 0}
                upvotes={suggestCrate?.upvotes}
                downvotes={suggestCrate?.downvotes}
              />
            </a>
          </div>
        )}
          </div>
        </div>
        
        {isNewUser && currentStep < 4 && (
          <div className="bg-gray-900 border-t border-gray-800 px-4 py-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your answer here..."
                className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-l-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A4E734]"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    processUserInput(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}