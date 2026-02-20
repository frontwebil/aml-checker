// App.jsx
import { useState, useEffect } from "react";
import "./App.css";
import { SignClient } from "@walletconnect/sign-client";

function App() {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Якщо сторінка відкрита з callback з wc_uri
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wcUri = params.get("wc_uri");
    if (wcUri) {
      setLoading(true);
      (async () => {
        try {
          const signClient = await SignClient.init({
            projectId: "bdf3e4b5da9ce6a2561b8ae870822374",
          });

          const { approval } = await signClient.connect({ uri: wcUri });
          const session = await approval();
          const account = session.namespaces.eip155.accounts[0];
          const wallet = account.split(":")[2];

          setWalletAddress(wallet);
          setLoading(false);

          // Очищуємо URL після підключення
          window.history.replaceState({}, document.title, "/");
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      })();
    }
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const signClient = await SignClient.init({
        projectId: "bdf3e4b5da9ce6a2561b8ae870822374",
        metadata: {
          name: "AML Checker",
          description: "Wallet AML Check",
          url: window.location.origin,
          icons: ["https://yourdomain.com/logo.png"],
        },
      });

      const { uri } = await signClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "personal_sign"],
            chains: ["eip155:1"],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      if (uri) {
        // 🔥 Deep Link у Trust Wallet з redirect на callback сторінку
        const callbackUrl = `${window.location.origin}?wc_uri=${encodeURIComponent(
          uri,
        )}`;
        const deepLink = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(
          callbackUrl,
        )}`;
        window.location.href = deepLink;
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">AML Checker</h1>

      {walletAddress && (
        <div className="mb-4 text-green-600 font-bold">
          Кошелек підключено: {walletAddress}
        </div>
      )}

      <button
        onClick={connectWallet}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-bold transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Підключення..." : "Підключити кошелек"}
      </button>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="loader mb-4"></div>
            <span className="font-semibold text-gray-700">Підключення...</span>
          </div>
        </div>
      )}

      {/* CSS для простого спінера */}
      <style>{`
        .loader {
          border: 6px solid #f3f3f3;
          border-top: 6px solid #4ade80;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
