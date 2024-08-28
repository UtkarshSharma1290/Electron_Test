import { useEffect, useState } from "react";
const { useNavigate } = require("react-router-dom");

//Global-variables
let ipcRenderer;
const Dependencies = () => {
  //states
  const [blackHole, setBlackHole] = useState(true);
  const [brew, setBrew] = useState(true);
  const [sox, setSox] = useState(true);

  //react-hooks
  const navigate = useNavigate();

  //functions
  const onInstallBlackHoleHandler = () => {
    ipcRenderer.send("install-blackhole");
  };

  //use-effects
  useEffect(() => {
    if (!blackHole && !brew && !sox) {
      navigate("/home");
    }
  }, [blackHole, brew, sox]);

  useEffect(() => {
    /**
     * Checking do we have all the necessary software dependencies to run our application or not
     */
    if (window.require) {
      const electron = window.require("electron");
      ipcRenderer = electron.ipcRenderer;
      ipcRenderer.send("isBrewInstalled");
      ipcRenderer.send("isSoxInstalled");

      ipcRenderer.on("blackhole", (event, args) => {
        setBlackHole(args);
      });
      ipcRenderer.on("brew", (event, args) => {
        setBrew(args);
      });
      ipcRenderer.on("sox", (event, args) => {
        setSox(args);
      });

      return () => {
        ipcRenderer.removeAllListeners("blackhole");
        ipcRenderer.removeAllListeners("brew");
        ipcRenderer.removeAllListeners("sox");
      };
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
    <div className="flex flex-col items-center justify-center h-screen bg-black flex-1">
      <div className="text-center mb-3 text-white">
        This Application uses BlackHole as a dependency.
      </div>
      <button
        onClick={onInstallBlackHoleHandler}
        className="text-base  border-2 rounded-full border-white text-white p-3 hover:border-3 hover:text-black hover:bg-white"
      >
        Install Dependency
      </button>
    </div>
  );
};

export default Dependencies;
