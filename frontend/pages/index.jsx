import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { ConnectButton } from '@rainbow-me/rainbowkit';
export default function Home() {
  return (
    <>
    <div class="my-2 mx-4 float-right rounded-sl ">
   <ConnectButton 
  showBalance={{
    smallScreen: false,
    largeScreen: false,
  }}
/></div>
    </>
  );
}
