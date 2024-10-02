import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function SickAi() {
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

    const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_KEY
        // add your api key here
    );

    const fetchCrates = async () => {
        try {
            // Fetch crates from the API with GEMINI_KEY as an authorization header
            const response = await fetch('https://sickb.vercel.app/api/crates');

            // Check if response is successful
            if (!response.ok) {
                throw new Error("Failed to fetch crates");
            }

            // Parse and return the crates data
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching crates:", error);
            return [];  // Return an empty array in case of error
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUserInfoSubmit = () => {
        const steps = ['age', 'salary', 'familyMembers', 'netWorth'];
        const currentField = steps[currentStep];
        setUserInfo(prevState => ({
            ...prevState,
            [currentField]: inputValue
        }));
        setChatHistory([...chatHistory, { type: 'user', message: inputValue }]);
        setInputValue('');
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(currentStep + 1); // Move to chat component
        }
    };

    const getResponseForGivenPrompt = async () => {
        try {
            setLoading(true);

            // Fetch crates
            const crates = await fetchCrates();

            // Print out the crate list
            console.log("Fetched Crates:", crates);

            async function getTokenData(tokens) {
                if (!Array.isArray(tokens) || tokens.length === 0) {
                    return 'empty crate';
                }

                // Helper function to capitalize the first letter of the token
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
            // Transform crates data into a string format
                        const cratesData = (await Promise.all(crates.map(async (crate) => {
                const tokenData = await getTokenData(crate.token);
                return `id: ${crate.id}, name: ${crate.name}, token data: ${tokenData}`;
            }))).join('; ');

            console.log("Transformed Crates Data:", cratesData);

            // Generate the input prompt text
            const inputPromptText = `Based on the following user profile details, recommend the most suitable crates from the available options: Age: ${userInfo.age}, Annual Salary: ${userInfo.salary}, Number of Family Members: ${userInfo.familyMembers}, and Net Worth: ${userInfo.netWorth}. Consider these crates: ${cratesData}. Please return the names of crates that best match this user's financial profile and investment needs, it should be a list of crate ids separated with ,`;

            console.log(inputPromptText)
            // Send user input and crates to Gemini API and get response
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(inputPromptText);

            setInputValue('');
            const response = result.response;
            const text = response.text();
            console.log(text);
            setPromptResponses([...promptResponses, text]);

            setLoading(false);
        } catch (error) {
            console.log(error);
            console.log("Something Went Wrong");
            setLoading(false);
        }
    };

    const renderUserInfoForm = () => {
        const questions = [
            "Please enter your age:",
            "Please enter your salary:",
            "Please enter the number of family members:",
            "Please enter your net worth:"
        ];
        return (
            <div className="chat-window">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`chat-message ${chat.type}`}>{chat.message}</div>
                ))}
                <div className="chat-input">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={questions[currentStep]}
                        className="form-control"
                    />
                    <button onClick={handleUserInfoSubmit} className="btn btn-primary">Send</button>
                </div>
            </div>
        );
    };

    const renderChatComponent = () => {
        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Ask Me Something You Want"
                            className="form-control"
                        />
                    </div>
                    <div className="col-auto">
                        <button onClick={getResponseForGivenPrompt} className="btn btn-primary">Send</button>
                    </div>
                </div>
                {loading ? (
                    <div className="text-center mt-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    promptResponses.map((promptResponse, index) => (
                        <div key={index}>
                            <div className={`response-text ${index === promptResponses.length - 1 ? 'fw-bold' : ''}`}>{promptResponse}</div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div>
            {currentStep < 4 ? renderUserInfoForm() : renderChatComponent()}
        </div>
    );
}

export default SickAi;