import { Fragment, useState, useRef } from "react";
import { ethers } from "ethers";
import Modal from "./Modal.jsx";

import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ControlSection = ({ coreAddress, coreAbi, daiAddress, daiAbi }) => {
  const [showLend, setShowLend] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showRepay, setShowRepay] = useState(false);
  const [approvedLend, setApprovedLend] = useState(false);
  const [approvedRepay, setApprovedRepay] = useState(false);

  const lendAmount = useRef(0);
  const withdrawAmount = useRef(0);
  const borrowAmount = useRef(0);
  const repayAmount = useRef(0);
  const toastId = useRef(null);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const coreContract = new ethers.Contract(coreAddress, coreAbi, signer);

  const pending = () =>
    (toastId.current = toast.info("Transaction Pending...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    }));

  const success = () => {
    toast.dismiss(toastId.current);
    toast.success("Transaction Complete!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const error = (msg) => {
    toast.error(msg, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const approve = async (e, tokenAmount) => {
    e.preventDefault();
    try {
      let amount = ethers.utils.parseEther(tokenAmount);
      const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
      const tx = await daiContract.approve(coreAddress, amount);
      pending();
      await tx.wait();
      success();
    } catch (err) {
      error({ err }.err.reason);
    }
    e.target.id === "stake" ? setApprovedLend(true) : setApprovedRepay(true);
  };

  const stake = async (e) => {
    e.preventDefault();
    try {
      let amount = ethers.utils.parseEther(lendAmount.current.value);
      let tx = await coreContract.stake(amount);
      pending();
      await tx.wait();
      success();
      setApprovedLend(false);
    } catch (err) {
      error({ err }.err.reason);
    }
    setShowLend(false);
  };

  const withdraw = async (e) => {
    e.preventDefault();
    try {
      let amount = ethers.utils.parseEther(withdrawAmount.current.value);
      const tx = await coreContract.withdrawStaking(amount);
      pending();
      await tx.wait();
      success();
    } catch (err) {
      error({ err }.err.reason);
    }
    setShowWithdraw(false);
  };

  const borrow = async (e) => {
    e.preventDefault();
    try {
      let amount = ethers.utils.parseEther(borrowAmount.current.value);
      const tx = await coreContract.borrow(amount);
      pending();
      await tx.wait();
      success();
    } catch (err) {
      error({ err }.err.reason);
    }
    setShowBorrow(false);
  };

  const repay = async (e) => {
    e.preventDefault();
    try {
      let amount = ethers.utils.parseEther(repayAmount.current.value);
      const tx = await coreContract.repay(amount);
      pending();
      await tx.wait();
      success();
      setApprovedRepay(false);
    } catch (err) {
      error({ err }.err.reason);
    }
    setShowRepay(false);
  };

  const claimTokens = async (e) => {
    e.preventDefault();
    try {
      const tx = await coreContract.claimYield();
      pending();
      await tx.wait();
      success();
    } catch (err) {
      error({ err }.err.reason);
    }
  };

  return (
    <Fragment>
      <div className="flex flex-col p-6 bg-gray-900 rounded-lg gap-y-6">
        <button
          onClick={() => {
            setShowLend(true);
          }}
          className="py-3.5 rounded-lg w-full border border-secondary text-secondary text-sm font-semibold"
        >
          stake
        </button>
        <button
          onClick={() => {
            setShowWithdraw(true);
          }}
          className="py-3.5 rounded-lg w-full border border-primary text-primary text-sm font-semibold"
        >
          Withdraw
        </button>
        <button
          onClick={() => {
            setShowBorrow(true);
          }}
          className="py-3.5 rounded-lg w-full border border-secondary text-secondary text-sm font-semibold"
        >
          Borrow
        </button>
        <button
          onClick={() => {
            setShowRepay(true);
          }}
          className="py-3.5 rounded-lg w-full border border-primary text-primary text-sm font-semibold"
        >
          Repay
        </button>
        <button
          onClick={claimTokens}
          className="py-3.5 rounded-lg w-full bg-secondary text-white text-sm font-semibold"
        >
          Claim DOGX
        </button>
      </div>
      <Modal
        isVisible={showLend}
        onClose={() => {
          setShowLend(false);
        }}
      >
        <div className="flex items-center justify-center p-6 text-xl font-semibold">
          <div>stake DUSD</div>
        </div>
        <div className="flex justify-between px-6 py-4 my-3 text-xl bg-gray-700 rounded-md">
          <input
            type="text"
            className="w-full text-xl bg-transparent outline-none placeholder:text-gray-400"
            placeholder="0.00"
            ref={lendAmount}
          />
          <div className="text-white">DUSD</div>
        </div>
        <div className="p-8">
          {!approvedLend ? (
            <button
              id="stake"
              onClick={(event) => {
                approve(event, lendAmount.current.value);
              }}
              className="py-3.5 rounded-lg w-full border border-secondary hover:bg-secondary text-secondary hover:text-white  text-sm font-semibold"
            >
              Approve
            </button>
          ) : null}
          {approvedLend ? (
            <button
              onClick={stake}
              className="py-3.5 rounded-lg w-full border border-secondary hover:bg-secondary text-secondary hover:text-white  text-sm font-semibold"
            >
              stake
            </button>
          ) : null}
        </div>
      </Modal>
      <Modal
        isVisible={showWithdraw}
        onClose={() => {
          setShowWithdraw(false);
        }}
      >
        <div className="flex items-center justify-center p-6 text-xl font-semibold">
          <div>Withdraw DUSD</div>
        </div>
        <div className="flex justify-between px-6 py-4 my-3 text-xl bg-gray-700 rounded-md">
          <input
            type="text"
            className="w-full text-xl bg-transparent outline-none placeholder:text-gray-400"
            placeholder="0.00"
            ref={withdrawAmount}
          />
          <div className="text-white">DUSD</div>
        </div>
        <div className="p-8">
          <button
            onClick={withdraw}
            className="py-3.5 rounded-lg w-full border border-secondary hover:bg-secondary text-secondary hover:text-white  text-sm font-semibold"
          >
            Withdraw
          </button>
        </div>
      </Modal>
      <Modal
        isVisible={showBorrow}
        onClose={() => {
          setShowBorrow(false);
        }}
      >
        <div className="flex items-center justify-center p-6 text-xl font-semibold">
          <div>Borrow DUSD</div>
        </div>
        <div className="flex justify-between px-6 py-4 my-3 text-xl bg-gray-700 rounded-md">
          <input
            type="text"
            className="w-full text-xl bg-transparent outline-none placeholder:text-gray-400"
            placeholder="0.00"
            ref={borrowAmount}
          />
          <div className="text-white">DUSD</div>
        </div>
        <div className="p-8">
          <button
            onClick={borrow}
            className="py-3.5 rounded-lg w-full border border-secondary hover:bg-secondary text-secondary hover:text-white  text-sm font-semibold"
          >
            Borrow
          </button>
        </div>
      </Modal>
      <Modal
        isVisible={showRepay}
        onClose={() => {
          setShowRepay(false);
        }}
      >
        <div className="flex items-center justify-center p-6 text-xl font-semibold">
          <div>Repay DUSD</div>
        </div>
        <div className="flex justify-between px-6 py-4 my-3 text-xl bg-gray-700 rounded-md">
          <input
            type="text"
            className="w-full text-xl bg-transparent outline-none placeholder:text-gray-400"
            placeholder="0.00"
            ref={repayAmount}
          />
          <div className="text-white">DUSD</div>
        </div>
        <div className="p-8">
          {!approvedRepay ? (
            <button
              onClick={(event) => {
                approve(event, repayAmount.current.value);
              }}
              className="py-3.5 rounded-lg w-full border border-secondary hover:bg-secondary text-secondary hover:text-white  text-sm font-semibold"
            >
              Approve
            </button>
          ) : null}
          {approvedRepay ? (
            <button
              onClick={repay}
              className="py-3.5 rounded-lg w-full border border-secondary hover:bg-secondary text-secondary hover:text-white  text-sm font-semibold"
            >
              Repay
            </button>
          ) : null}
        </div>
      </Modal>
      <ToastContainer
        transition={Slide}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Fragment>
  );
};

export default ControlSection;
