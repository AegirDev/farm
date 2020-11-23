import React, { Component, Suspense } from "react";
import Web3 from 'web3';
import { farmContractABI } from './abi.js';
import { uniswapLPABI } from './abiUni.js';
import { buccv2ABI } from './buccABI.js';

//General Style Imports
import twitter from './twitterLogo.png';
import telegram from './telegramLogo.png';

//CSS STYLESHEETS
import './loader.css';
import './App.css';
import './design.css';
import 'bootstrap/dist/css/bootstrap.min.css';

//REBASS STYLE
import {
  Button,
  Text
} from 'rebass';
import { Input } from '@rebass/forms';
import preset from '@rebass/preset';

//IMAGES IMPORTS
import Bucc from "./black.png";

//Bootstrap
import Card from 'react-bootstrap/Card';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
var ethereum_address = require('ethereum-address');


const contractAddress = "0x0ffaa8eeb2ee18c9174e4c5d6af6ce48199c6879";
const oldcontractAddress = "0x8F1Ec68fa204B77d5f5AE69a78A221AC850F2B4D";
const uniswapLPAddress = "0x7772612549f27aa49c83fa59ab726f4799e4ecdc";
const buccv2 = "0xd5a7d515fb8b3337acb9b053743e0bc18f50c855";

/*
const contractAddress = "0x3d79227A9C264d774A6503708d816197662448F3";
const oldcontractAddress = "0x8F1Ec68fa204B77d5f5AE69a78A221AC850F2B4D";
const uniswapLPAddress = "0xC56fCF5b83663cF6F78FaDE3176E85134A500599";
const buccv2 = "0x8fdeca64ac845da33ef6b3890c910aca0a7e3346";
const getInfoAddr = "0xe65f0594a82da2089d5B860A63290B5b2F8b4bC6";
 */

export default class App extends Component {
  constructor(props) {
    super(props);
    this.web3 = "";
    this.contractAddress = "";
    this.accounts = "";
    //ON ADDRESS UPDATE
    this.addrUpdate = this.addrUpdate.bind(this);
    //FUNCTIONS
    this.executeDeposit = this.executeDeposit.bind(this);
    this.executeWithdrawl = this.executeWithdrawl.bind(this);
    this.privateClaim = this.privateClaim.bind(this);
    //INPUTS
    this.privateaddressToSend = this.privateaddressToSend.bind(this);
    //LOADER
    this.setupLoader = this.setupLoader.bind(this);
    //Set State
    this.state = {
      progressVisibility: false,
      progressBar: true,
      progress: 0,
      progressDescription: "",
      fadeOut: "",
      buccFarmed: "Loading...",
      fellowBuccaneers: "",
      //LOADER ELEMENTS
      loader: true,
      percentageLoader: "0%",
      visibility: "visible",
      loaderCSS: "loaderCoverSheet",
    }
    document.body.style.overflowY = "hidden";
  }

  componentDidMount = async () => {
    this.initateEthereum = this.initateEthereum.bind(this);
    this.initateEthereum();
  }

  setupLoader = async () => {
    var that = this;
    setTimeout(function(){that.setState({percentageLoader: "95%", loaderCSS: "loaderCoverSheet2"});
    document.body.style.overflowY = "scroll";}, 480);
    setTimeout(function(){that.setState({loader: false, loaderCSS: "loaderCoverSheet2"});}, 600);
    }

initateEthereum = async () => {
  if (typeof window.web3 !== 'undefined') {
  const that = this;
  this.setState({percentageLoader: "Web3 Sign-In"});
  this.getEthereumAccount = this.getEthereumAccount.bind(this);
    try {            
      await window.web3.currentProvider.enable().finally(
        async () => {
          that.setState({percentageLoader: "15%"});
          that.getEthereumAccount();
          that.setState({percentageLoader: "35%"});
          }
      );
    } catch (e) {
        console.log(e);
        this.setState({buccFarmed: "User likely rejected connection to the site."});
    }
  } else {
    this.setState({buccFarmed: "Metamask or a web3 portal not detected."});
    console.log("Metamask not detected or installed.")
  }
  }

    /* INPUTS */
  privateaddressToSend(amount) {
    this.setState({privateaddressToSend: amount.target.value});
  }

  withdrawOld = async () => {
    const oldbuccFarm = await new this.state.web3.eth.Contract(farmContractABI, oldcontractAddress);
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 10, 
      progressDescription: "Currently Checking: User LP Balance",
      progressBar: true});
    var recipient = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.accounts[0])).call({from: this.state.accounts[0]});
    if (recipient == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
      }
    var lpBalance = await oldbuccFarm.methods.viewLPPerson("0").call({from: this.state.accounts[0]});
    if (lpBalance == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "You have not deposited any Uniswap LP to this contract.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
    }
    try {
      this.setState({progress: 50,
      progressDescription: "Withdrawing LP..."});
      await oldbuccFarm.methods.withdraw("0", lpBalance).send({from: this.state.accounts[0]});
      this.setState({progress: 100,
      progressDescription: "Successfully withdrawn all rewards...",
      buttonClaimColor: "dark"});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
              progressDescription: "Withdrawl either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
    }
  }
  

  getEthereumAccount = async () => {
    if (window.web3.currentProvider.selectedAddress !== null) {
        const web3 = new Web3(window.ethereum);
        this.setState({percentageLoader: "45%"});
        const accounts = await web3.eth.getAccounts();
        this.setState({percentageLoader: "50%"});
        const buccFarm = await new web3.eth.Contract(farmContractABI, contractAddress);
        const uniLP = await new web3.eth.Contract(uniswapLPABI, uniswapLPAddress);
        const buccV2Contract = await new web3.eth.Contract(buccv2ABI, buccv2);
        this.setState({percentageLoader: "60%"});
        //set the state variables for implementation
        this.setState({web3, accounts, buccFarm, uniLP, buccV2Contract});
        this.castScreenshots = this.castScreenshots.bind(this);
        var checkUser = await this.state.buccFarm.methods.isUser().call({from: this.state.accounts[0]});
        window.ethereum.on('accountsChanged', this.addrUpdate);
        this.setState({percentageLoader: "70%"});
        if (checkUser == false) {
          var fellowBuccaneers = await this.state.buccFarm.methods.viewFellowBuccaneers().call({from: this.state.accounts[0]});
          var viewContractTokens = await this.state.buccFarm.methods.viewContractTokens().call({from: this.state.accounts[0]});
          this.setState({fellowBuccaneers, viewContractTokens, buccFarmed: "Deposit Liquidity on Uniswap, then deposit that liquidity here to farm."});
          this.setState({percentageLoader: "80%"});
          this.setupLoader();
        } else {
          this.setupLoader();
          this.setState({percentageLoader: "80%"});
          this.castScreenshots();
        }
    }
  }

  addrUpdate = async () => {
    window.location.reload();
  }

  castScreenshots = async () => {
     var buccFarmed = await this.state.buccFarm.methods.pendingBucc("0").call({from: this.state.accounts[0]});
     var fellowBuccaneers = await this.state.buccFarm.methods.viewFellowBuccaneers().call({from: this.state.accounts[0]});
     var viewContractTokens = await this.state.buccFarm.methods.viewContractTokens().call({from: this.state.accounts[0]});
     this.setState({buccFarmed: "Your BUCC earnings: " + Number(buccFarmed / 10000000000), fellowBuccaneers, viewContractTokens});
     setTimeout(() => {this.castScreenshots();}, 15000);
  }

  executeDeposit = async () => {
    var that = this;
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking: LP",
      progressBar: true});
    var balance = await this.state.uniLP.methods.balanceOf(this.state.accounts[0]).call({from: this.state.accounts[0]});
    this.setState({progress: 15, progressDescription: "Currently Checking: Approval"});
    var allowance = await this.state.uniLP.methods.allowance(this.state.accounts[0], contractAddress).call({from: this.state.accounts[0]});
            try {
              if (allowance < balance) {
              this.setState({progress: 30,
              progressDescription: "Approving deposit/claim...",
              progressVisibility: true,
              progressBar: true,
              fadeOut: "fadeIn",});
              await this.state.uniLP.methods.approve(contractAddress, balance).send({from: this.state.accounts[0]});
              } 
                    this.setState({progress: 55,
                    progressDescription: "Depositing/Claiming...",
                    progressBar: true,
                    progressVisibility: true,
                    fadeOut: "fadeIn",});
                    try {
                      await this.state.buccFarm.methods.deposit("0", balance).send({from: this.state.accounts[0]});
                      this.setState({progress: 100,
                      progressDescription: "Deposit/Claim approved.",
                      progressBar: true,
                      progressVisibility: true,});
                      setTimeout(() => {(that.setState({progressVisibility: false}));}, 10000);
                      this.castScreenshots();
                      return;
                    } catch (e) {
                          console.log(e);
                          this.setState({fadeOut: "fadeOut",
                          progressDescription: "The deposit was either rejected or failed. Try using more gas.",
                          progressBar: false});
                          setTimeout(() => {(that.setState({progressVisibility: false}));}, 10000);
                          return;
                    }
            } catch (e) {
              this.setState({fadeOut: "fadeOut",
              progressDescription: "Approval either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(that.setState({progressVisibility: false}));}, 10000);
              return;
            }
  }


  privateClaim = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking Address",
      progressBar: true});
      if (!ethereum_address.isAddress(String(this.state.privateaddressToSend))) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a valid Ethereum address.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
      this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 25, 
      progressDescription: "Currently Checking Whitelist",
      progressBar: true});
      var recipient = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.privateaddressToSend)).call({from: this.state.accounts[0]});
      if (recipient == 0) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
        }
        try {
          this.setState({progress: 50,
            progressDescription: "Privately Claiming Rewards...",
            progressBar: true,
            progressVisibility: true});
            await this.state.buccFarm.methods.specialdeposit("0", recipient).send({from: this.state.accounts[0]});
            this.setState({progress: 100,
            progressDescription: "Successfully withdrawn all rewards...",
            buttonClaimColor: "dark"});
            setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        } catch (e) {
          this.setState({fadeOut: "fadeOut",
              progressDescription: "Private Claim either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
        }
  }

  executeWithdrawl = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 10, 
      progressDescription: "Currently Checking: User LP Balance",
      progressBar: true});
    var recipient = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.accounts[0])).call({from: this.state.accounts[0]});
    if (recipient == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
      }
    var lpBalance = await this.state.buccFarm.methods.viewLPPerson("0").call({from: this.state.accounts[0]});
    if (lpBalance == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "You have not deposited any Uniswap LP to this contract.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
    }
    try {
      this.setState({progress: 50,
      progressDescription: "Withdrawing LP..."});
      await this.state.buccFarm.methods.withdraw("0", lpBalance).send({from: this.state.accounts[0]});
      this.setState({progress: 100,
      progressDescription: "Successfully withdrawn all rewards...",
      buttonClaimColor: "dark"});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
              progressDescription: "Withdrawl either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
    }
  }


  render () {
  return (
  <>

        <Suspense>
        { this.state.loader && (
            <React.Fragment>
            <div className={this.state.loaderCSS}>
            <Container>
            <Row>
            <Col>
            <div class="loader">
            <div class="inner one"></div>
            <div class="inner two"></div>
            <div class="inner three"></div>
            </div>
            </Col>
            </Row>
            <Row>
            <Col>
            <span className="loaderText loaderLight">Loading... {this.state.percentageLoader}</span>
            </Col>
            </Row>
            </Container>
            </div>
            </React.Fragment>
          )}
        </Suspense>

        <Navbar>
        <Navbar.Brand href="#home">
        <Container className="text-center">
          <Row>
            <Col>
            <a href="https://buccaneer.eth" target="_blank"><Button className="wp buttonFormat" theme={preset} variant='outline'>Homepage</Button></a>
            </Col>
            <Col>
            <a href="https://buccapi.eth" target="_blank"><Button className="wp buttonFormat" theme={preset} variant='outline'>Bermuda</Button></a>
            </Col>
          </Row>
        </Container> 
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
          <a href="https://t.me/BuccaneerV2"><img src={telegram} className="shareButtonSpacing" /></a>
            <a href="https://twitter.com/BuccaneerV2"><img src={twitter} className="shareButtonSpacing" /></a>
          </Navbar.Text>
        </Navbar.Collapse>
        </Navbar>


      <Container className="text-center">
      <Row>
      <Col md={3}>
      </Col>
      <Col md={6} className="text-center">
      <img src={Bucc} className="logo" />
      <Text className="headerText"
        fontSize={[ 3, 4, 5 ]}
        fontWeight='bold'>
        Sargasso
      </Text>
      </Col>
      <Col md={3}>
      </Col>
      </Row>


      <Row>
      <Col md={2}>
      </Col>
      <Col md={8} className="text-center">
      <Text
        fontSize={[ 3 ]}
        color='primary'
        className="text">
        {this.state.buccFarmed}
      </Text>
      </Col>
      <Col md={2}>
      </Col>
      </Row>


      <Row>
      <Col md={2}>
      </Col>
      <Col md={8} className="text-center">
      <Text
        fontSize={[ 3 ]}
        color='primary'
        className="text specialErrorHighlight">
            { this.state.progressVisibility && (
              <React.Fragment>
              <Modal.Title className={this.state.fadeOut}>{this.state.progressDescription}</Modal.Title>
              { this.state.progressBar && (
              <ProgressBar animated now={this.state.progress} />
              )}
              </React.Fragment>
              )}
      </Text>
      </Col>
      <Col md={2}>
      </Col>
      </Row>

      <Row className="rowSpacing">
      <Col md={2}>
      </Col>
      <Col >
      <Button className="buttonFormat mainInterfaceButtons" variant='outline' theme={preset} target="_blank" href="https://app.uniswap.org/#/add/ETH/0xd5a7d515Fb8B3337ACb9B053743E0BC18f50C855">
        Add Liquidity
        </Button>
      </Col>
      <Col>
        <Button className="buttonFormat mainInterfaceButtons" variant='outline' theme={preset} onClick={this.executeDeposit}>
          Deposit LP
        </Button>
        </Col>
      <Col>
        <Button className="buttonFormat mainInterfaceButtons" variant='outline' theme={preset} onClick={this.executeWithdrawl}>
          Withdraw LP
        </Button>
      </Col>
      <Col md={2}>
      </Col>
      </Row>

      <Row className="rowSpacing">
          <Col md={2}>
          </Col>
          <Col>
          <Text
            fontSize={[ 3 ]}
            color='primary'
            className="text ">
            Input address to privately claim:
          </Text>
          </Col>
          <Col>
          <Input className="input" placeholder="Address" onChange={this.privateaddressToSend} />
          </Col>
          <Col>
          <Button theme={preset} variant='outline' className="buttonFormat" onClick={this.privateClaim}>
            Private Claim
          </Button>
          </Col>
          <Col md={2}>
          </Col>
      </Row>


      <Row className="rowSpacing">
          <Col md={2}>
          </Col>
          <Col>
          <Text
            fontSize={[ 3 ]}
            color='primary'
            className="text">
            BUCC in farm: {(this.state.viewContractTokens / 10000000000 ).toFixed(0)}
          </Text>
          </Col>
          <Col>
          <Text
            fontSize={[ 3 ]}
            color='primary'
            className="text">
            Farmers: {this.state.fellowBuccaneers}
          </Text>
          </Col>
          <Col md={2}>
          </Col>
      </Row>


      <Row>
          <Col md={1}>
          </Col>
          <Col md={10}>  
          <Card variant="dark" bg="blackbg" className="text-center lastCard">
          <Card.Body className="adjustCardBody">
          <Text
                          className="text"
                          fontSize={[ 5 ]}
                          fontWeight='bold'>
                          Sargasso Basics
                        </Text>
                    <hr className="whiteHRLINE" />
                        <Text
                          className="text"
                          fontSize={[ 3, 4, 5 ]}>
                          Current APY: 1200%
                        </Text>
                        <Text
                          className="text"
                          fontSize={[ 2 ]}>
                        <br />
                        Liquidity farming is a simple concept. When one adds liquidity to Uniswap, they add both ETH or wrapped ETH and the native token. They receive an LP token, which is a token from Uniswap which is part of the share of the total liquidity based on their ratio. This is a regular ERC-20 token in essence and this is then deposited into a staking contract which rewards users every Ethereum block, on average every 15 seconds. The rewards in most liquidity farming contracts come from tokens which are minted, however since there is no mint function for BUCC, those tokens must be manually deposited and are shown as a total amount of BUCC that is available to gain from farming. The Sargasso contract has been verified and can be seen <a href="https://etherscan.io/address/0x0ffaa8eeb2ee18c9174e4c5d6af6ce48199c6879" target="_blank">here</a>. 
                        <br /><br />
                        To begin farming, visit the Uniswap trading pair of ETH to BUCC and then go to 'Add Liquidity'. Once you have done so, you will not see the token in your wallet, but you can if you add the 
                        BUCC Uniswap address pair <a href="https://etherscan.io/address/0x7772612549f27aa49c83fa59ab726f4799e4ecdc" target="_blank">here</a>. You can then deposit that into the liquidity farming contract. You will have to approve the deposit, then send the deposit and await confirmation. Then almost instantly, you will begin to see that you're farming BUCC with a real-time updating gains indicator. You can withdraw at any time or claim back your LP position and doing so will claim any amount of BUCC you have been awarded. The headlining feature with Sargasso is the ability to claim your BUCC rewards privately as long as the claiming address has previously received any amount of BUCC. This private claim system uses the same internal BUCC-Bermuda system to enable traceless claims on private farming. Make sure that if you are tumbling tokens to the contract address, to not utilize your private claim or your tumbled tokens will get sent to the receiver. 
                        
                    </Text>
                    <hr className="whiteHRLINE" />
                  </Card.Body>
          </Card>
          </Col>
          <Col md={1}>
          </Col>
        </Row>
      
      </Container>
      
</>
  );
}
}

