import { Inter } from "next/font/google";
//import Ballot from "@/components/Ballot";

// Step 1  
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { CONTRACT_ADDRESS, RPC_URL } from "@/helpers/constants";
import { useEffect, useState, useRef } from "react";

const inter = Inter({ subsets: ["latin"] });


  
  function App() {const [selectedValue, setSelectedValue] = useState('');

  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(false);
  const walletRef = useRef(null);
  const Tezos = new TezosToolkit(RPC_URL);

  const connectWallet = async () => {
    setMessage("Connect wallet");
    console.log("Connect wallet")
    try {
      const options = {
        name: "Vote for proposal",
        network: { type: "ghostnet" },
      };
      const wallet = new BeaconWallet(options);
      walletRef.current = wallet;
      await wallet.requestPermissions();
      Tezos.setProvider({ wallet: walletRef.current });
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

    // Step 8 - Create a function that calls the increase_votes entrypoint  
  // and reloads the page to update it and display the new state of the storage  
  const submitVote = async (voteSelection) => {
    try {
      console.log("in submitVote")
      await connectWallet();
      console.log("wallet connected")
      console.log(CONTRACT_ADDRESS)
      const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
      const op = await contract.methods.vote(selectedValue).send();
      setMessage("Awaiting Confirmation....");
      const hash = await op.confirmation(2);
      console.log("hash is " + hash);
      if (hash) {
        setMessage("Vote Confirmed.");
        setReload(true);
      }
    } catch (error) {
      setMessage(error.message);
      console.log(error);
    }
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  
  return (
    <main
    className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
  >
    <h1 className="text-2xl font-bold mb-3">Your chance to vote for the proposal</h1>
    <form>
      <div>
        <label>
          <input
            type="radio"
            value="yay"
            checked={selectedValue === "yay"}
            onChange={handleChange}
          />
          Vote yay
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="nay"
            checked={selectedValue === "nay"}
            onChange={handleChange}
          />
          Vote nay
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="pass"
            checked={selectedValue === "pass"}
            onChange={handleChange}
          />
          Vote pass
        </label>
      </div>
      <p>Selected value: {selectedValue}</p>
      <button onClick={() => { submitVote(selectedValue)}}>Submit vote</button>
    </form>
    </main>
  );
  }
  
  export default App;