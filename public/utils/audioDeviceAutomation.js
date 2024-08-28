const audioDevices = require("macos-audio-devices");

const AI_MULTI_OUTPUT_DEVICE_NAME = "AI-Interview Audio";

function delay(time = 1000) {
  return new Promise((res, rej) =>
    setTimeout(() => {
      res();
    }, time)
  );
}

function checkDoesDeviceAlreadyExist() {
  const allDevices = audioDevices.getAllDevices.sync();
  const deviceExist = allDevices?.find((device) =>
    device?.name?.includes(AI_MULTI_OUTPUT_DEVICE_NAME)
  );
  if (deviceExist) return true;
  return false;
}

function selectOutMultiOutputDeviceAsDefault() {
  const listOfAllDevices = audioDevices.getAllDevices.sync();
  const outCustomDevice = listOfAllDevices.filter(
    (device) => device?.name === AI_MULTI_OUTPUT_DEVICE_NAME
  );

  const id = outCustomDevice?.[0].id;
  audioDevices.setDefaultOutputDevice(id);

  //selecting microphone
  //Will look for default microphone first,
  const defaultMicrophone = listOfAllDevices?.filter(
    (device) =>
      device?.name?.toLowerCase()?.includes("microphone") &&
      device?.name?.toLowerCase()?.includes("mac")
  )?.[0];
  // if not found, then we look for external microphone
  const externalMicrophone = listOfAllDevices?.filter((device) =>
    device?.name?.toLowerCase()?.includes("external microphone")
  )?.[0];

  if (defaultMicrophone) {
    audioDevices.setDefaultInputDevice(defaultMicrophone?.id);
    return;
  }
  if (externalMicrophone) {
    audioDevices.setDefaultInputDevice(externalMicrophone?.id);
    return;
  }
}

async function createNewMultiOutputDevice() {
  if (checkDoesDeviceAlreadyExist()) {
    selectOutMultiOutputDeviceAsDefault();
    return;
  }

  const listOfAllDefaultDevices = audioDevices.getAllDevices.sync();
  const blackHole2ChId = listOfAllDefaultDevices?.filter(
    (device) => device?.name === "BlackHole 2ch"
  )?.[0]?.id;
  const defaultMacSpeakerId = listOfAllDefaultDevices?.filter(
    (device) =>
      device?.name?.toLowerCase()?.includes("speaker") &&
      device?.name?.toLowerCase()?.includes("mac")
  )?.[0]?.id;

  audioDevices.createAggregateDevice(
    AI_MULTI_OUTPUT_DEVICE_NAME,
    defaultMacSpeakerId,
    [blackHole2ChId],
    {
      multiOutput: true,
    }
  );

  await delay(1000);

  selectOutMultiOutputDeviceAsDefault();
}

createNewMultiOutputDevice();
