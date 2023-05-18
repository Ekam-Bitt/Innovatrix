// import { Contract, providers } from "ethers";
// import { formatEther } from "ethers/lib/utils";
// import Head from "next/head";
// import { useEffect, useRef, useState } from "react";
// import Web3Modal from "web3modal";
// import {
//   CRYPTODEVS_DAO_ABI,
//   CRYPTODEVS_DAO_CONTRACT_ADDRESS,
//   CRYPTODEVS_NFT_ABI,
//   CRYPTODEVS_NFT_CONTRACT_ADDRESS,
// } from "../constants";
// import styles from "../styles/Home.module.css";

// export default function Home() {
//   // ETH Balance of the DAO contract
//   const [treasuryBalance, setTreasuryBalance] = useState("0");
//   // Number of proposals created in the DAO
//   const [numProposals, setNumProposals] = useState("0");
//   // Array of all proposals created in the DAO
//   const [proposals, setProposals] = useState([]);
//   // User's balance of CryptoDevs NFTs
//   const [nftBalance, setNftBalance] = useState(0);
//   // Fake NFT Token ID to purchase. Used when creating a proposal.
//   const [fakeNftTokenId, setFakeNftTokenId] = useState("");
//   // One of "Create Proposal" or "View Proposals"
//   const [selectedTab, setSelectedTab] = useState("");
//   // True if waiting for a transaction to be mined, false otherwise.
//   const [loading, setLoading] = useState(false);
//   // True if user has connected their wallet, false otherwise
//   const [walletConnected, setWalletConnected] = useState(false);
//   // isOwner gets the owner of the contract through the signed address
//   const [isOwner, setIsOwner] = useState(false);
//   const web3ModalRef = useRef();

//   // Helper function to connect wallet
//   const connectWallet = async () => {
//     try {
//       await getProviderOrSigner();
//       setWalletConnected(true);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   /**
//    * getOwner: gets the contract owner by connected address
//    */
//   const getDAOOwner = async () => {
//     try {
//       const signer = await getProviderOrSigner(true);
//       const contract = getDaoContractInstance(signer);

//       // call the owner function from the contract
//       const _owner = await contract.owner();
//       // Get the address associated to signer which is connected to Metamask
//       const address = await signer.getAddress();
//       if (address.toLowerCase() === _owner.toLowerCase()) {
//         setIsOwner(true);
//       }
//     } catch (err) {
//       console.error(err.message);
//     }
//   };

//   /**
//    * withdrawCoins: withdraws ether by calling
//    * the withdraw function in the contract
//    */
//   const withdrawDAOEther = async () => {
//     try {
//       const signer = await getProviderOrSigner(true);
//       const contract = getDaoContractInstance(signer);

//       const tx = await contract.withdrawEther();
//       setLoading(true);
//       await tx.wait();
//       setLoading(false);
//       getDAOTreasuryBalance();
//     } catch (err) {
//       console.error(err);
//       window.alert(err.reason);
//     }
//   };

//   // Reads the ETH balance of the DAO contract and sets the `treasuryBalance` state variable
//   const getDAOTreasuryBalance = async () => {
//     try {
//       const provider = await getProviderOrSigner();
//       const balance = await provider.getBalance(
//         CRYPTODEVS_DAO_CONTRACT_ADDRESS
//       );
//       setTreasuryBalance(balance.toString());
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
//   const getNumProposalsInDAO = async () => {
//     try {
//       const provider = await getProviderOrSigner();
//       const contract = getDaoContractInstance(provider);
//       const daoNumProposals = await contract.numProposals();
//       setNumProposals(daoNumProposals.toString());
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Reads the balance of the user's CryptoDevs NFTs and sets the `nftBalance` state variable
//   const getUserNFTBalance = async () => {
//     try {
//       const signer = await getProviderOrSigner(true);
//       const nftContract = getCryptodevsNFTContractInstance(signer);
//       const balance = await nftContract.balanceOf(signer.getAddress());
//       setNftBalance(parseInt(balance.toString()));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Calls the `createProposal` function in the contract, using the tokenId from `fakeNftTokenId`
//   const createProposal = async () => {
//     try {
//       const signer = await getProviderOrSigner(true);
//       const daoContract = getDaoContractInstance(signer);
//       const txn = await daoContract.createProposal(fakeNftTokenId);
//       setLoading(true);
//       await txn.wait();
//       await getNumProposalsInDAO();
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       window.alert(error.reason);
//     }
//   };

//   // Helper function to fetch and parse one proposal from the DAO contract
//   // Given the Proposal ID
//   // and converts the returned data into a Javascript object with values we can use
//   const fetchProposalById = async (id) => {
//     try {
//       const provider = await getProviderOrSigner();
//       const daoContract = getDaoContractInstance(provider);
//       const proposal = await daoContract.proposals(id);
//       const parsedProposal = {
//         proposalId: id,
//         nftTokenId: proposal.nftTokenId.toString(),
//         deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
//         yayVotes: proposal.yayVotes.toString(),
//         nayVotes: proposal.nayVotes.toString(),
//         executed: proposal.executed,
//       };
//       return parsedProposal;
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Runs a loop `numProposals` times to fetch all proposals in the DAO
//   // and sets the `proposals` state variable
//   const fetchAllProposals = async () => {
//     try {
//       const proposals = [];
//       for (let i = 0; i < numProposals; i++) {
//         const proposal = await fetchProposalById(i);
//         proposals.push(proposal);
//       }
//       setProposals(proposals);
//       return proposals;
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Calls the `voteOnProposal` function in the contract, using the passed
//   // proposal ID and Vote
//   const voteOnProposal = async (proposalId, _vote) => {
//     try {
//       const signer = await getProviderOrSigner(true);
//       const daoContract = getDaoContractInstance(signer);

//       let vote = _vote === "YAY" ? 0 : 1;
//       const txn = await daoContract.voteOnProposal(proposalId, vote);
//       setLoading(true);
//       await txn.wait();
//       setLoading(false);
//       await fetchAllProposals();
//     } catch (error) {
//       console.error(error);
//       window.alert(error.reason);
//     }
//   };

//   // Calls the `executeProposal` function in the contract, using
//   // the passed proposal ID
//   const executeProposal = async (proposalId) => {
//     try {
//       const signer = await getProviderOrSigner(true);
//       const daoContract = getDaoContractInstance(signer);
//       const txn = await daoContract.executeProposal(proposalId);
//       setLoading(true);
//       await txn.wait();
//       setLoading(false);
//       await fetchAllProposals();
//       getDAOTreasuryBalance();
//     } catch (error) {
//       console.error(error);
//       window.alert(error.reason);
//     }
//   };

//   // Helper function to fetch a Provider/Signer instance from Metamask
//   const getProviderOrSigner = async (needSigner = false) => {
//     const provider = await web3ModalRef.current.connect();
//     const web3Provider = new providers.Web3Provider(provider);

//     const { chainId } = await web3Provider.getNetwork();
//     if (chainId !== 11155111) {
//       window.alert("Please switch to the Sepoila network!");
//       throw new Error("Please switch to the Sepoila network");
//     }

//     if (needSigner) {
//       const signer = web3Provider.getSigner();
//       return signer;
//     }
//     return web3Provider;
//   };

//   // Helper function to return a DAO Contract instance
//   // given a Provider/Signer
//   const getDaoContractInstance = (providerOrSigner) => {
//     return new Contract(
//       CRYPTODEVS_DAO_CONTRACT_ADDRESS,
//       CRYPTODEVS_DAO_ABI,
//       providerOrSigner
//     );
//   };

//   // Helper function to return a CryptoDevs NFT Contract instance
//   // given a Provider/Signer
//   const getCryptodevsNFTContractInstance = (providerOrSigner) => {
//     return new Contract(
//       CRYPTODEVS_NFT_CONTRACT_ADDRESS,
//       CRYPTODEVS_NFT_ABI,
//       providerOrSigner
//     );
//   };

//   // piece of code that runs everytime the value of `walletConnected` changes
//   // so when a wallet connects or disconnects
//   // Prompts user to connect wallet if not connected
//   // and then calls helper functions to fetch the
//   // DAO Treasury Balance, User NFT Balance, and Number of Proposals in the DAO
//   useEffect(() => {
//     if (!walletConnected) {
//       web3ModalRef.current = new Web3Modal({
//         network: "goerli",
//         providerOptions: {},
//         disableInjectedProvider: false,
//       });

//       connectWallet().then(() => {
//         getDAOTreasuryBalance();
//         getUserNFTBalance();
//         getNumProposalsInDAO();
//         getDAOOwner();
//       });
//     }
//   }, [walletConnected]);

//   // Piece of code that runs everytime the value of `selectedTab` changes
//   // Used to re-fetch all proposals in the DAO when user switches
//   // to the 'View Proposals' tab
//   useEffect(() => {
//     if (selectedTab === "View Proposals") {
//       fetchAllProposals();
//     }
//   }, [selectedTab]);

//   // Render the contents of the appropriate tab based on `selectedTab`
//   function renderTabs() {
//     if (selectedTab === "Create Proposal") {
//       return renderCreateProposalTab();
//     } else if (selectedTab === "View Proposals") {
//       return renderViewProposalsTab();
//     }
//     return null;
//   }

//   // Renders the 'Create Proposal' tab content
//   function renderCreateProposalTab() {
//     if (loading) {
//       return (
//         <div className={styles.description}>
//           Loading... Waiting for transaction...
//         </div>
//       );
//     } else if (nftBalance === 0) {
//       return (
//         <div className={styles.description}>
//           You do not own any CryptoDevs NFTs. <br />
//           <b>You cannot create or vote on proposals</b>
//         </div>
//       );
//     } else {
//       return (
//         <div className={styles.container}>
//           <label>Fake NFT Token ID to Purchase: </label>
//           <input
//             placeholder="0"
//             type="number"
//             onChange={(e) => setFakeNftTokenId(e.target.value)}
//           />
//           <button className={styles.button2} onClick={createProposal}>
//             Create
//           </button>
//         </div>
//       );
//     }
//   }

//   // Renders the 'View Proposals' tab content
//   function renderViewProposalsTab() {
//     if (loading) {
//       return (
//         <div className={styles.description}>
//           Loading... Waiting for transaction...
//         </div>
//       );
//     } else if (proposals.length === 0) {
//       return (
//         <div className={styles.description}>No proposals have been created</div>
//       );
//     } else {
//       return (
//         <div>
//           {proposals.map((p, index) => (
//             <div key={index} className={styles.proposalCard}>
//               <p>Proposal ID: {p.proposalId}</p>
//               <p>Fake NFT to Purchase: {p.nftTokenId}</p>
//               <p>Deadline: {p.deadline.toLocaleString()}</p>
//               <p>Yay Votes: {p.yayVotes}</p>
//               <p>Nay Votes: {p.nayVotes}</p>
//               <p>Executed?: {p.executed.toString()}</p>
//               {p.deadline.getTime() > Date.now() && !p.executed ? (
//                 <div className={styles.flex}>
//                   <button
//                     className={styles.button2}
//                     onClick={() => voteOnProposal(p.proposalId, "YAY")}
//                   >
//                     Vote YAY
//                   </button>
//                   <button
//                     className={styles.button2}
//                     onClick={() => voteOnProposal(p.proposalId, "NAY")}
//                   >
//                     Vote NAY
//                   </button>
//                 </div>
//               ) : p.deadline.getTime() < Date.now() && !p.executed ? (
//                 <div className={styles.flex}>
//                   <button
//                     className={styles.button2}
//                     onClick={() => executeProposal(p.proposalId)}
//                   >
//                     Execute Proposal{" "}
//                     {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
//                   </button>
//                 </div>
//               ) : (
//                 <div className={styles.description}>Proposal Executed</div>
//               )}
//             </div>
//           ))}
//         </div>
//       );
//     }
//   }

//   return (
//     <div>
//       <Head>
//         <title>CryptoDevs DAO</title>
//         <meta name="description" content="CryptoDevs DAO" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <div className={styles.main}>
//         <div>
//           <h1 className={styles.title}>Welcome to Crypto GOV!</h1>
//           <div className={styles.description}>Welcome to the DAO!</div>
//           <div className={styles.description}>
//             Your CryptoDevs NFT Balance: {nftBalance}
//             <br />
//             Treasury Balance: {formatEther(treasuryBalance)} ETH
//             <br />
//             Total Number of Proposals: {numProposals}
//           </div>
//           <div className={styles.flex}>
//             <button
//               className={styles.button}
//               onClick={() => setSelectedTab("Create Proposal")}
//             >
//               Create Proposal
//             </button>
//             <button
//               className={styles.button}
//               onClick={() => setSelectedTab("View Proposals")}
//             >
//               View Proposals
//             </button>
//           </div>
//           {renderTabs()}
//           {/* Display additional withdraw button if connected wallet is owner */}
//           {isOwner ? (
//             <div>
//               {loading ? (
//                 <button className={styles.button}>Loading...</button>
//               ) : (
//                 <button className={styles.button} onClick={withdrawDAOEther}>
//                   Withdraw DAO ETH
//                 </button>
//               )}
//             </div>
//           ) : (
//             ""
//           )}
//         </div>
//         <div>
//           <img className={styles.image} src="/cryptodevs/0.svg" />
//         </div>
//       </div>

//       <footer className={styles.footer}>
//         Made with &#10084; by Stealthy Hackers
//       </footer>
//     </div>
//   );
// }
import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Governance Dapp</title>
        <link rel="stylesheet" type="text/css" href="styles.css" />
        <script
          src="https://kit.fontawesome.com/d1c523657e.js"
          crossorigin="anonymous"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function (w, d, s, o, f, js, fjs) {
                w["chatsonic_widget"] = o;
                w[o] =
                  w[o] ||
                  function () {
                    (w[o].q = w[o].q || []).push(arguments);
                  };
                (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
                js.id = o;
                js.src = f;
                js.async = 1;
                fjs.parentNode.insertBefore(js, fjs);
              })(window, document, "script", "ws", "https://writesonic.s3.amazonaws.com/frontend-assets/CDN/botsonic.min.js");
              ws("init", {
                serviceBaseUrl: "https://api.writesonic.com",
                token: "622f96b8-f9fc-43f5-99d9-386631367775",
              });
            `,
          }}
        />
      </Head>

      <header>
        <nav className="navbar">
          <div className="logo">
            <a href="index.html">
              <img src="C (2).png" height="100px" width="100px" />
            </a>
          </div>
          <ul className="menu">
            <li>
              <a href="index.html">Home</a>
            </li>
            <li>
              <a href="about.html">About</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <div
          className="hero"
          style={{
            backgroundImage: "url(CRYPTOGOV.jpeg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="container2">
            <h1>Welcome to Crypto Gov</h1>
            <p>A decentralized platform for community governance</p>
            <a href="#" className="cta-button">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <section className="features" id="features">
        <div className="container1">
          <h2>Key Features</h2>
          <div className="feature feature-one">
            <h3>Decentralized Governance</h3>
            <p>
              Enable community-driven decision-making through decentralized
              governance protocols.
            </p>
          </div>
          <div className="feature feature-two">
            <h3>Voting Mechanism</h3>
            <p>
              Implement secure and transparent voting mechanisms to reach
              consensus on proposals.
            </p>
          </div>
          <div className="feature feature-three">
            <h3>Reward Distribution</h3>
            <p>
              Incentivize participation and engagement by distributing rewards
              to active community members.
            </p>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h2>About Governance Dapp</h2>
          <p>
            Governance Dapp is a revolutionary decentralized application that
            empowers communities to govern themselves in a transparent and
            inclusive manner. By utilizing blockchain technology, we provide the
            tools and infrastructure necessary for community members to propose,
            discuss, and vote on important decisions.
          </p>
          <a href="about.html" className="cta-button">
            Learn More
          </a>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="container">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or would like to get in touch, please fill
            out the form below.
          </p>
          <form>
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" required></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2023 Crypto Gov. All rights reserved.</p>
          <ul className="social-media">
            <li>
              <a href="https://www.youtube.com/watch?v=oHg5SJYRHA0">
                <i className="fab fa-github"></i>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=oHg5SJYRHA0">
                <i className="fab fa-twitter"></i>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=oHg5SJYRHA0">
                <i className="fab fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=oHg5SJYRHA0">
                <i className="fab fa-instagram"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            ws('chatWindow', {
              language: 'en',
              showHeader: true,
              headerText: 'Chat with us',
            });
          `,
        }}
      />
    </div>
  );
}
