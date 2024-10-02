import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SendIcon, Loader2 } from 'lucide-react';

export default function SickAi() {
    const [inputValue, setInputValue] = useState('');
    const [promptResponses, setPromptResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        age: '',
        salary: '',
        familyMembers: '',
        netWorth: ''
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);

    const genAI = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_KEY
    );

    const fetchCrates = async () => {
        try {
            const response = await fetch('https://sickb.vercel.app/api/crates');
            if (!response.ok) {
                throw new Error("Failed to fetch crates");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching crates:", error);
            return [];
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleUserInfoSubmit = () => {
        const steps = ['age', 'salary', 'familyMembers', 'netWorth'];
        const currentField = steps[currentStep];
        setUserInfo(prevState => ({
            ...prevState,
            [currentField]: inputValue
        }));
        setChatHistory(prevHistory => [
            ...prevHistory,
            { type: 'user', message: inputValue },
            { type: 'bot', message: getNextQuestion() }
        ]);
        setInputValue('');
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(currentStep + 1);
            getResponseForGivenPrompt();
        }
    };

    const getNextQuestion = () => {
        const questions = [
            "Great! Now, what's your annual salary?",
            "Thanks! How many family members do you have?",
            "Almost done! What's your estimated net worth?",
            "Thank you for providing all the information. I'll now analyze the best crates for you based on your profile."
        ];
        return questions[currentStep];
    };

    const getResponseForGivenPrompt = async () => {
        try {
            setLoading(true);
            const crates = await fetchCrates();
            console.log("Fetched Crates:", crates);

            async function getTokenData(tokens) {
                if (!Array.isArray(tokens) || tokens.length === 0) {
                    return 'empty crate';
                }
                const formatToken = (token) => {
                    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
                };
                try {
                    const tokenPrices = await Promise.all(tokens.map(async (token) => {
                        const formattedToken = formatToken(token);
                        const response = await fetch(`https://price.jup.ag/v6/price?ids=${formattedToken}`);
                        const data = await response.json();
                        return `${formattedToken}: ${data[formattedToken]?.price || 'N/A'}`;
                    }));
                    return tokenPrices.join(', ');
                } catch (error) {
                    console.error("Error fetching token prices:", error);
                    return 'empty crate';
                }
            }

            const cratesData = (await Promise.all(crates.map(async (crate) => {
                const tokenData = await getTokenData(crate.token);
                return `id: ${crate.id}, name: ${crate.name}, token data: ${tokenData}`;
            }))).join('; ');

            console.log("Transformed Crates Data:", cratesData);

            const inputPromptText = `Based on the following user profile details, recommend the most suitable crates from the available options: Age: ${userInfo.age}, Annual Salary: ${userInfo.salary}, Number of Family Members: ${userInfo.familyMembers}, and Net Worth: ${userInfo.netWorth}. Consider these crates: ${cratesData}. Please return the names of crates that best match this user's financial profile and investment needs, it should be a list of crate ids separated with ,`;

            console.log(inputPromptText);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(inputPromptText);

            const response = result.response;
            const text = response.text();
            console.log(text);
            setChatHistory(prevHistory => [...prevHistory, { type: 'bot', message: text }]);
            setLoading(false);
        } catch (error) {
            console.log(error);
            console.log("Something Went Wrong");
            setLoading(false);
            setChatHistory(prevHistory => [...prevHistory, { type: 'bot', message: "I'm sorry, but I encountered an error while processing your request. Please try again later." }]);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        setChatHistory([{ type: 'bot', message: "Hello! To help you find the best crates, I need some information. First, could you tell me your age?" }]);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto px-4 py-6" ref={chatContainerRef}>
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`rounded-lg px-4 py-2 max-w-[70%] ${chat.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                                {chat.message}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white border-t border-gray-200 px-4 py-4">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={currentStep < 4 ? "Type your answer here..." : "Ask me anything about the recommended crates"}
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleUserInfoSubmit();
                            }
                        }}
                    />
                    <button
                        onClick={handleUserInfoSubmit}
                        className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <SendIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}