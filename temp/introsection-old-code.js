import React, { useState, useEffect } from "react";

import BodyText from "../molecules/BodyText";
import BodyTextTitle from "../molecules/BodyTextTitle";

import { ToastContainer, toast } from "react-toastify";
import { sendEmail } from "../../utils/helper";
import { LogoAIInterviewer } from "../../assets/svgIcon";
import { USER_EMAIL } from "../../constant/const";
import "react-toastify/dist/ReactToastify.css";

const IntroSection = () => {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [apiResponse, setApiResponse] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(email));
  };

  const { useNavigate } = require("react-router-dom");

  const actionCodeSettings = {
    url: `${process.env.REACT_APP_REDIRECT_URL}${email}`,
    handleCodeInApp: true,
  };

  const handleSubmit = async (e) => {
    e?.preventDefault(e);
    setApiResponse(true);
    // sendSignInLinkToEmail(auth, email, actionCodeSettings)
    // .then(() => {
    //     setIsLogin(true);
    //     window.localStorage.setItem('emailForSignIn', email);
    //     toast.success("Login link sent to email!", { autoClose: 2000 });
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     toast.error("Unable to send verification link. Please try again.", { autoClose: 2000 });
    //   });
    try {
      toast.info("Sending you a verification link, please wait.", {
        autoClose: 2000,
      });
      const body = {
        email: email,
      };
      await sendEmail("emailVerfication", body, "POST");
      setIsLogin(true);
      window.localStorage.setItem(USER_EMAIL, email);
      toast.success("Login link sent to email!", { autoClose: 2000 });
      setApiResponse(false);
    } catch (error) {
      toast.error("Unable to send verification link. Please try again.", {
        autoClose: 2000,
      });
      setApiResponse(false);
    }
  };

  let ipcRenderer;
  const navigate = useNavigate();

  useEffect(() => {
    const isVerified = localStorage.getItem("verified");
    isVerified ? navigate("/dependency") : <></>;
    setIsLogin(false);
  }, []);

  useEffect(() => {
    if (window.require) {
      const electron = window.require("electron");
      ipcRenderer = electron.ipcRenderer;
      ipcRenderer.on("external-url-opened", (event, args) => {
        localStorage.setItem("verified", true);
        navigate("/dependency");
      });
    } else {
      ipcRenderer = {
        send: () => console.log("send is not available in web browser"),
        on: () => console.log("on is not available in web browser"),
        removeAllListeners: () =>
          console.log("removeAllListeners is not available in web browser"),
      };
    }
  }, []);

  return (
    <div className="flex flex-col md:justify-between justify-normal md:gap-3 gap-6 h-full border-1 border-white w-full">
      <div className="flex flex-col gap-2">
        <div className="block">
          <LogoAIInterviewer />
        </div>
        <BodyTextTitle
          text="Maximizing Interview Success Through AI-Powered Guidance"
          textColor="text-white"
          additionalClass="max-w-[292px] w-full"
        />
      </div>
      {isLogin ? (
        <div className="md:h-[calc(100vh_-_409px)] w-full flex flex-col">
          <BodyText
            text="We have emailed you the magic link. Please check your inbox."
            textColor="text-white"
          />
        </div>
      ) : (
        <div className="md:h-[calc(100vh_-_409px)] w-full flex flex-col md:gap-2 gap-10">
          <BodyText
            text="Enter your registered email to request the login link"
            textColor="text-white"
          />
          <form
            className="w-full h-full flex flex-col md:gap-3 gap-10 md:justify-between justify-normal"
            onSubmit={handleSubmit}
          >
            <div>
              <input
                type="email"
                placeholder="xyz@gmail.com"
                className={`w-full px-[14px] relative py-[10px] text-white bg-primaryBG border ${
                  isValid ? "border-[#FFFFFF80]" : "border-[#FF4949]"
                } placeholder:text-[#FFFFFFB2] rounded focus:outline-none ${
                  isValid
                    ? "focus:ring-none"
                    : "focus:ring-1 focus:ring-[#FF4949]"
                }`}
                value={email}
                onChange={handleChange}
              />
              {!isValid && (
                <p className="text-[#FF4949] mt-2">
                  Please enter a valid email
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full p-2 bg-Neon text-black text-base font-medium rounded ${
                email && isValid ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!email || !isValid || apiResponse}
            >
              Request link
            </button>
          </form>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />
    </div>
  );
};

export default IntroSection;
