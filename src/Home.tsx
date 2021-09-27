import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./packages/candy-machine";

const ConnectButton = styled(WalletDialogButton)``;
const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here
const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!);

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(true); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;

      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection
        );

      setIsSoldOut(itemsRemaining === 0);
      // setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  return (
    <div>
      <header>
        <nav id="nav1">
          <div className="nav_icon_img">
            <div className="icon_img">
              <a href="https://twitter.com/SolardustNFT">
                <img src="./images/Twitter.png" alt="Twitter" />
              </a>
            </div>
            <div className="icon_img">
              <a href="https://discord.com/invite/HbBbrt3u3w">
                <img src="./images/Discord.png" alt="discord" />
              </a>
            </div>
          </div>
          <div className="nav_button" id="balanc_button">
            {!wallet.connected && (
                  <ConnectButton>CONNECT WALLET</ConnectButton>
            )}
          </div>

          {wallet.connected && (
              <div id="balanc">
                <div className="nav_text">
                  <span className="title_nav_text">Address:</span>
                  <span className="nav_text_main">{shortenAddress(wallet.publicKey?.toBase58() || "")}</span>
                </div>
                <div className="nav_text">
                  <span className="title_nav_text">Balance:</span>
                  <span className="nav_text_main">{(balance || 0).toLocaleString()} SOL</span>
                </div>
              </div>
          )}
        </nav>
      </header>
      <main>
        <article className="section1">
          <div className="logo">
            <img src="./images/logo.png" alt="" />
          </div>
          <div className="section1_main_text">
            <span>
              This world is lifeless. This world will turn into a global arena of military actions of a universal scale and Elves Enchantresses have already found their way here. Thousands of beautiful, dangerous and deadly she-elves are about to open the portals leading to the world filled with SolarDust. Will it be enough for those who desperately desire to possess it?
              <h3><p>There are a total of 10k brave elven beauties in the Squad ...</p></h3>
              <p>&nbsp;</p>
              <h1><b>Presale is ongoing</b></h1>
              <h3>Mint 1 NFT for 2 SOL and get another one absolutely free</h3>

            </span>


          </div>
          {startDateSeed + 500 > Math.floor(Date.now() / 1000) && (
              <Countdown
                  date={(startDateSeed + 500) * 1000}
                  onMount={({ completed }) => !completed && setIsActive(false)}
                  onComplete={() => setIsActive(true)}
                  renderer={renderCounter}
              />
          )}
          <div className="portaltime_button" id="portaltime_button">
            <MintContainer>
              {wallet.connected && (
                isSoldOut ? (
                    <MintButton disabled={isSoldOut || isMinting || !isActive} onClick={onMint} variant="contained">
                      SOLD OUT
                    </MintButton>
                ) : isActive && (
                    isMinting ? (
                        <MintButton disabled={isSoldOut || isMinting || !isActive} onClick={onMint} variant="contained">
                          <CircularProgress />
                        </MintButton>
                    ) : (
                        <MintButton disabled={isSoldOut || isMinting || !isActive} onClick={onMint} variant="contained">
                          {process.env.REACT_APP_MINT_BUTTON_TEXT || "MINT"}
                        </MintButton>
                    )
                )
              )}
            </MintContainer>
          </div>
        </article>
        <article className="section2">
          <div className="user_img">
            <video style={{boxShadow: '0px 0px 64px 0px #CC8823'}} width="100%" height="100%" playsInline={true} autoPlay={true} muted={true} loop={true}>
              <source src="./images/final.mp4" type="video/ogg" />
            </video>
          </div>
        </article>
      </main>
      <footer>
        <nav id="nav2">
          <div className="nav_button" id="balanc_button1">
            {!wallet.connected && (
                <ConnectButton>CONNECT WALLET</ConnectButton>
            )}
          </div>
          {wallet.connected && (
            <div id="balanc1">
              <div className="nav_text">
                <span className="title_nav_text">Address:</span>
                <span className="nav_text_main">{shortenAddress(wallet.publicKey?.toBase58() || "")}</span>
              </div>
              <div className="nav_text">
                <span className="title_nav_text">Balance:</span>
                <span className="nav_text_main">{(balance || 0).toLocaleString()}</span>
              </div>
            </div>
          )}
          <div className="nav_icon_img">
            <div className="icon_img">
              <a href="https://twitter.com/SolardustNFT">
                <img src="./images/Twitter.png" alt="Twitter" />
              </a>
            </div>
            <div className="icon_img">
              <a href="https://discord.com/invite/HbBbrt3u3w">
                <img src="./images/Discord.png" alt="discord" />
              </a>
            </div>
          </div>
        </nav>
      </footer>

      <Snackbar
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      <div className="portal_open_time_title" id="portaltime">
        <h4>Portal open at:</h4>
        <div className="portal_open_time">
          <div className="portal_open_blok">
            <span>{days}</span>
            <span>Days</span>
          </div>
          <div className="portal_open_blok">
            <span>{hours}</span>
            <span>Hours</span>
          </div>
          <div className="portal_open_blok">
            <span>{minutes}</span>
            <span>Minutes</span>
          </div>
          <div className="portal_open_blok">
            <span>{seconds}</span>
            <span>Seconds</span>
          </div>
        </div>
      </div>
    </CounterText>
  );
};

export default Home;
