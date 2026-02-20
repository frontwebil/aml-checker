import { useState } from "react";
import "./App.css";
import { SignClient } from "@walletconnect/sign-client";

function App() {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

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

      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "personal_sign"],
            chains: ["eip155:1"],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      if (uri) {
        // 🔥 Открываем Deep Link в новом окне, чтобы не терять состояние React
        window.open(
          "https://link.trustwallet.com/wc?uri=" + encodeURIComponent(uri),
          "_blank",
        );
      }

      // Ждем пока пользователь подтвердит соединение в кошельке
      const session = await approval();
      const account = session.namespaces.eip155.accounts[0];
      const wallet = account.split(":")[2];

      setWalletAddress(wallet);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">AML Checker</h1>

      {loading && (
        <div className="mb-4">
          <span className="text-gray-700 font-semibold">Подключение...</span>
        </div>
      )}

      {walletAddress ? (
        <div className="mb-4 text-green-600 font-bold">
          Кошелек подключен: {walletAddress}
        </div>
      ) : null}

      <button
        onClick={connectWallet}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-bold transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Подключение..." : "Подключить кошелек"}
      </button>
    </div>
  );
}

export default App;
