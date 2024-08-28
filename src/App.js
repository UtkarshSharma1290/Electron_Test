import { useEffect } from "react";
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import Dependencies from "./pages/dependencies";
import Loading from "./components/molecules/loading";
import Login from "./pages/login";
import SharedSession from "./pages/SharedSession";

import useFetchUserProfile from "./hooks/useFetchUserProfile";
import {
  RESTRICTION_TIME,
  TIME_INTERVAL_FOR_RESTRICTION_API,
} from "./constant/const";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const isElectron =
    navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;

  // Choose the appropriate router based on the environment
  const RouterComponent = isElectron ? HashRouter : BrowserRouter;

  //custom-hooks
  const { fetchUserProfile } = useFetchUserProfile({ isCallApiOnLoad: false });

  //functions
  const setUserRestrictionHandler = () => {
    fetchUserProfile({
      onSuccessCallback: (data) => {
        const isRestricted = data?.restrict;
        localStorage?.setItem(RESTRICTION_TIME, isRestricted);
      },
    });
  };

  //useEffects
  useEffect(() => {
    //for detecting the change in audio input/output device list in audio midi
    navigator.mediaDevices.ondevicechange=(event)=> {
      console.log({event}, "device change event triggered");
    };
    setUserRestrictionHandler();
    const intervalId = setInterval(() => {
      setUserRestrictionHandler();
    }, TIME_INTERVAL_FOR_RESTRICTION_API);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <RouterComponent>
      <Routes>
        <Route path="/dependency" element={<Dependencies />} />
        <Route path="/progressbar" element={<Loading />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/shared-session" element={<SharedSession />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </RouterComponent>
  );
}

export default App;
