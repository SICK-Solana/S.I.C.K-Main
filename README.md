
# S.I.C.K 
Welcome to **S.I.C.K**, a decentralized investment platform designed to simplify crypto investing for everyone—from beginners to seasoned pros. S.I.C.K combines the power of social sharing with decentralized finance (DeFi) to create a seamless, intuitive experience. Users can flex their gains, copy trades, and share strategies, making crypto investment both social and secure.

Visit the official site at: [sickfreak.club](https://sickfreak.club)

## Project Overview

S.I.C.K is structured as an end-to-end platform with multiple repositories that handle various components, including the frontend, backend APIs, smart contracts, and app-specific functionality. The platform integrates **Tiplink** as a primary login option, simplifying onboarding for Web2 users who are new to crypto.

**Key Features**:
- **Copy Trades**: Mimic the trades of seasoned investors.
- **Social Flexing**: Share your investment strategies and flex gains with followers.
- **Investment Crates**: Save and share investment crates with others.
- **Pro-Grade Tools**: Access professional-level crypto investment tools in an easy-to-use app.

## Demo Video

Watch the demo video to learn more about S.I.C.K in action:
[Demo Video Link](https://www.youtube.com/watch?v=m-T75VVZ3l4)

## Repositories

This organization consists of five core repositories, each playing a vital role in the platform's architecture:

### 1. **Main Repository** (Integration of Backend, Frontend, and Contracts)
This is the primary repository that ties together the platform’s backend APIs, frontend interfaces, and smart contracts. It acts as the central hub for the application, ensuring seamless interaction between the various components.

- **Tech Stack**: React+Vite , Jup.ag Apis , Coingecko Apis, Tiplink & Solana wallet adapter
- **Main Responsibilities**:
  - Connect backend services and APIs with frontend UI.
  - Integrate blockchain contracts for trade execution.
  - Handle user authentication (via Tiplink) and session management.

### 2. **Backend API**
This repository handles the server-side logic, managing user data, trade copying, analytics, and secure interactions with the blockchain.

- **Tech Stack**: Nextjs , Supabase ! 
- **Main Responsibilities**:
  - Manage API endpoints for trade interactions.
  - Handle database queries and updates for user information.
  - Ensure secure communication between frontend and blockchain.

### 3. **Blinks** 
This respository will be used to create blinks so u can buy crates without ever leaving the site its being sent on 

- **Tech Stack**: Nextjs
- **Main Responsibilities**:
 - solana-blinks

### 4. **App**
This is the repository for the consumer-facing application, providing an intuitive interface for users to access the platform’s features.

- **Tech Stack**: ReactNative 
- **Main Responsibilities**:
  - User interface for copying trades, flexing gains, and managing crates.
  - Manage user portfolios and investment dashboards.
  - Handle user onboarding and Tiplink authentication or Okto authentication or Deeplinks.

### 5. **Frontend V2**
This repository handles specific frontend features related to OKTO integration, ensuring smooth interaction with third-party services.

- **Tech Stack**: React+Vite
- **Main Responsibilities**:
  - OKTO integration as an alternatice
  - Provide a frontend layer for additional DeFi features.

## Getting Started

### Prerequisites
To set up and run the project locally, make sure you have the following installed:

- Node.js
- Tiplink integration setup (API keys.)
- Okto integration setup (API keys.)
- Gemini (API keys.)


## Contributing

We welcome contributions! To get started:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

S.I.C.K is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, visit our site at [sickfreak.club](https://sickfreak.club) or reach out to the project maintainer at [rahulsinghhh2312@gmail.com].
