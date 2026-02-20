import { useState } from "react";
import SignClient from "@walletconnect/sign-client";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);

      const signClient = await SignClient.init({
        projectId: "YOUR_PROJECT_ID", // вставь свой projectId
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
        // 🔥 Открываем Trust Wallet через Deep Link
        window.location.href =
          "https://link.trustwallet.com/wc?uri=" + encodeURIComponent(uri);
      }

      const session = await approval();
      const account = session.namespaces.eip155.accounts[0];
      const walletAddress = account.split(":")[2];

      alert("Кошелек подключен:\n" + walletAddress);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-8">AML Checker</h1>
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
    </>
  );
}

export default App;
