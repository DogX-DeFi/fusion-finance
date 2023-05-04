import React from "react";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="flex justify-center items-center sm:my-16 my-6 sm:px-16 px-6 sm:py-12 py-4 sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow">
      <div className="flex flex-col flex-1">
        <h2 className="font-poppins font-semibold xs:text-[48px] text-[40px] text-white text-shadow-white xs:leading-[76.8px] leading-[66.8px] w-full">
          Earn $DOGX here!
        </h2>
        <p className="font-poppins font-normal text-secondary text-[18px] leading-[30.8px] max-w-[470px] mt-5">
          More info coming soon...
        </p>
      </div>

      <div
        className={`flex justify-center items-center sm:ml-10 ml-0 sm:mt-0 mt-10`}
      >
        <Link href="/app">
          <a className="relative inline-flex items-center justify-center p-4 px-10 py-2 mr-16 overflow-hidden font-medium transition duration-300 ease-out border-2 rounded-full shadow-md text-primary border-primary group">
            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-primary group-hover:translate-x-0 ease">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </span>
            <span className="absolute flex items-center justify-center w-full h-full transition-all duration-300 transform text-primary group-hover:translate-x-full ease">
              Launch App
            </span>
            <span className="relative invisible">Launch App</span>
          </a>
        </Link>
      </div>
    </section>
  );
};

export default CTA;
