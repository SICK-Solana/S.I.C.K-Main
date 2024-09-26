import { Scroll, ShoppingBag, Share2, TrendingUp, DollarSign, Zap } from 'lucide-react';

const WhitepaperSICK = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-center">S.I.C.K. Whitepaper</h1>
      <h2 className="text-2xl font-semibold mb-4 text-center">Scroll Invest Calculate Krypto</h2>
      
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        <p className="mb-4">
          S.I.C.K. revolutionizes crypto investing by bringing the concept of curated stock baskets 
          to the world of cryptocurrency. Users can create, share, and invest in custom-made crypto 
          portfolios, making it easier for both experts and newcomers to navigate the crypto space.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Key Features</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li className="flex items-center">
            <ShoppingBag className="mr-2" size={20} />
            Custom Crypto Krates: Users create their own baskets of cryptocurrencies
          </li>
          <li className="flex items-center">
            <Share2 className="mr-2" size={20} />
            Social Sharing: Easy sharing of Krates on social media platforms
          </li>
          <li className="flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Influencer Krates: Follow and copy trades from crypto influencers
          </li>
          <li className="flex items-center">
            <Scroll className="mr-2" size={20} />
            GoalSync krate: An AI assistant that analyzes your monthly income, personal aspirations, family goals, and dreams to recommend tailored Krates that align with your financial journey.</li>
          <li className="flex text-gray-400 opacity-70 items-center">
            <Scroll className="mr-2" size={20} />
           [by feedback we r decidin to move on from this idea] Web3 Reels Feed: Discover new Krates while scrolling through crypto content
          </li>
          <li className="flex items-center">
            <DollarSign className="mr-2" size={20} />
            Platform Fee: A small percentage fee on trades to sustain the platform and reward creators
          </li>
          <li className="flex items-center">
            <Zap className="mr-2" size={20} />
            JUP.ag Integration: Efficient swapping of SOL or USDC for tokens in Krates
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Users create custom Krates by selecting their preferred cryptocurrencies</li>
          <li>Krates can be shared on social media platforms like X (formerly Twitter)</li>
          <li>Influencers and Web3 experts create and share their own Krates</li>
          <li>Users can easily copy and invest in Krates created by others</li>
          <li>A dedicated feed section allows users to discover new Krates while consuming Web3 content</li>
          <li>Trades are executed through JUP.ag, with a small platform fee added</li>
          <li>Krate creators receive a portion of the platform fee when others invest in their Krates</li>
        </ol>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Use Case Examples</h3>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Influencer Krates:</strong> "HariKrat," a popular Web3 influencer, creates a high-risk, 
            high-reward Krate featuring Solana, Bonk, and other emerging tokens. Their followers can instantly 
            invest in this Krate with a single click.
          </li>
          <li>
            <strong>Thematic Investing:</strong> A user creates a "DeFi Innovators" Krate, bundling tokens of 
            promising decentralized finance projects. They share it on X, attracting attention from DeFi enthusiasts.
          </li>
          <li>
            <strong>Contrarian Plays:</strong> Some users might create "Short Krates" for influencers they perceive 
            as unlucky or "panauti." For example, a "Reverse MBAChaiwala" Krate that bets against the influencer's picks.
          </li>
          <li>
            <strong>Content-Driven Discovery:</strong> While scrolling through Web3 reels about NFT projects, 
            a user discovers a curated "NFT Ecosystem" Krate featuring tokens of platforms and projects mentioned in the content.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Platform Mechanics</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Users can invest in Krates using SOL or USDC</li>
          <li>Trades are executed through JUP.ag for optimal pricing and liquidity</li>
          <li>A small platform fee (X%) is added to each trade</li>
          <li>Krate creators receive a portion of the platform fee when their Krates are invested in</li>
          <li>The remaining fee is used for platform maintenance and development</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Coming Soon / Roadmap</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Advanced analytics for Krate performance tracking</li>
          <li>Integration with more blockchains beyond Solana</li>
          <li>Gamification features to incentivize successful Krate creation</li>
          <li>Mobile app for on-the-go investing and content consumption</li>
          <li>Partnerships with major crypto influencers and content creators</li>
        </ul>
      </section>

      <footer className="text-sm text-gray-600 mt-8">
        <p>This whitepaper is for informational purposes only. Cryptocurrency investments carry high risk. Always do your own research before investing. S.I.C.K. is not responsible for any losses incurred through the use of our platform.</p>
      </footer>
    </div>
  );
};

export default WhitepaperSICK;