import "./App.css";
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import Dependencies from "./pages/dependencies";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Loading from "./components/molecules/loading";
import SharedSession from "./pages/SharedSession";
import { SHARED_SESSION } from "./constant/routesNames";
import { useEffect } from "react";
import useFetchUserProfile from "./hooks/useFetchUserProfile";
import {
  RESTRICTION_TIME,
  TIME_INTERVAL_FOR_RESTRICTION_API,
} from "./constant/const";
import PrivateAndPublicRoute from "./components/includes/PrivateAndPublicRoute";

function App() {
  const isElectron =
    navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;

  // Choose the appropriate router based on the environment
  const RouterComponent = isElectron ? HashRouter : BrowserRouter;

  //custom-hooks
  const { fetchUserProfile } = useFetchUserProfile({ isCallApiOnLoad: false });

  const setUserRestrictionHandler = () => {
    fetchUserProfile({
      onSuccessCallback: (data) => {
        const startTime = data?.start_time;
        const endTime = data?.end_time;
        const obj = { startTime, endTime };
        const stringifyObj = JSON.stringify(obj);
        localStorage?.setItem(RESTRICTION_TIME, stringifyObj);
      },
    });
  };

  useEffect(() => {
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
        <Route path="/" element={<PrivateAndPublicRoute />}>
          <Route path="dependency" element={<Dependencies />} />
          <Route path="home" element={<Dashboard />} />
          <Route path="shared-session" element={<SharedSession />} />
        </Route>

        <Route path="/" element={<PrivateAndPublicRoute isPublic />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* <Route path="/dependency" element={<Dependencies />}>
          <Route index element={<Dependencies />} />
        </Route>
        <Route path="/" element={<Login />}>
          <Route index element={<Login />} />
        </Route>
        <Route path="/home" element={<Dashboard />}>
          <Route element={<Dashboard />} />
        </Route>
        <Route path={SHARED_SESSION} element={<SharedSession />} /> */}

        {/* <Route element={<RedirectComponent />}>
          <Route element={<RedirectComponent />} path="/redirect/?email=:email?" />
        </Route> */}
        <Route path="/progressbar" element={<Loading />}>
          <Route element={<Loading />} />
        </Route>
      </Routes>
    </RouterComponent>
  );
}

export default App;
