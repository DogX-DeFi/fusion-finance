import { Gradient } from "./Gradient.js";

import { useEffect } from "react";

const ErrorSection = ({ x }) => {
  useEffect(() => {
    const gradient = new Gradient();
    gradient.initGradient("#gradient-canvas");
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-primaryBg">
      <div className="absolute xl:max-w-[1280px] w-full">
        <section className="flex flex-col px-10 pt-72">
          <h1 className="font-bold text-white text-shadow-white text-[42px] leading-[75px]">
            {x ? "Connect Wallet!" : "Wrong Network"}
          </h1>
          {!x && (
            <p className="font-bold text-white text-shadow-white text-[18px] max-w-[470px] mt-5">
              Please, connect to JFIN Chain or J2O!
            </p>
          )}
        </section>
      </div>
      <canvas id="gradient-canvas" data-js-darken-top data-transition-in />
    </div>
  );
};

export default ErrorSection;
