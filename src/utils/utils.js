import CryptoJS from "crypto-js";
import {
  AUTHENTICATION_API_KEY,
  OPACITY_KEY,
  RESTRICTION_TIME,
  SESSION_ID,
  SPECIAL_CHARACTERS_REGEX,
  USER_EMAIL,
  emailRegex,
} from "../constant/const";

const password = process.env.REACT_APP_SECURITY_KEY;

/**
 * The function is used to create padding for encrypting data
 * @param {string} key
 * @returns
 */
export const padKey = (key) => {
  const paddedKey = CryptoJS.enc.Utf8.parse(key);
  const hash = CryptoJS.SHA256(paddedKey);
  return CryptoJS.lib.WordArray.create(hash.words.slice(0, 8));
};

/**
 * The function is used to encrypt text using AES algorithm
 * @param {string} message
 * @returns {string}
 */
export const encryptData = (message) => {
  const key = padKey(password?.toString());
  const iv = CryptoJS.lib.WordArray.random(16); // Generate random IV

  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const cipherText = iv
    .concat(encrypted.ciphertext)
    .toString(CryptoJS.enc.Base64);
  return cipherText;
};

/**
 * The function is to validate email
 * @param {string} email
 * @returns {string}
 */
export const validateEmail = (email) => {
  return emailRegex.test(email);
};

/**
 * The function is used to formate the Date object.
 * @param {Date} timeUnit
 * @returns {string}
 */
export function formatTime(timeUnit) {
  return timeUnit?.toString()?.padStart(2, "0");
}

/**
 * The function is used to make sure the mouse cursor remains at the end of the text in the input box
 * @param {Element} inputElementRef
 * @param {string} inputText
 */
export const putCursorFocusAtTheEnd = (inputElementRef, inputText) => {
  if (!inputText) {
    return;
  }
  const elementRefValue = inputElementRef?.current;
  if (elementRefValue) {
    elementRefValue.selectionStart = elementRefValue.selectionEnd =
      inputText.length;
    elementRefValue?.focus();
    elementRefValue.scrollTop = elementRefValue.scrollHeight;
  }
};

/**
 * The function is used to re-structure the tags entered by the user and to remove unwanted symbols.
 * @param {string} tagsStr
 * @returns
 */
export const removeExtraSpacesBetweenTags = (tagsStr) => {
  if (!tagsStr) {
    return "";
  }
  let strArr = tagsStr?.split(",");
  strArr = strArr?.map((word) => word?.trim());
  strArr = strArr?.map((word) => word?.replace(SPECIAL_CHARACTERS_REGEX, ""));
  strArr = strArr?.filter((word) => word?.length > 0);
  const commaSeparatedString = strArr?.reduce(
    (word, finalOutput) => finalOutput + "," + word,
    ""
  );

  return commaSeparatedString?.slice(0, commaSeparatedString?.length - 1);
};

/**
 * The function is used to formate the date and time provided the backend
 * @param {string} input
 * @returns {string} human readable date and time string
 */
export const formatDate = (input) => {
  const date = new Date(input);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const formattedDate = `${month} ${day}, ${year}`;

  return formattedDate;
};
/**
 * The function is used to create a delay of provided time
 * @param {number} time
 * @returns {Promise} return a Promise which will resolve after time sections
 */
export const delay = async (time) => {
  return new Promise((res, rej) =>
    setTimeout(() => {
      res();
    }, time)
  );
};

/**
 * Generate a random hex color code
 * @returns A random color hexadecimal code
 */
export const getRandomHexColor = () => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};
/**
 * Function for splitting an string based on comma (,) and to filter out the empty string
 * @param {String} str
 * @returns A str array of words
 */
export const splitStrBasedOnCommaAndFilterEmptyStr = (str) => {
  if (Array?.isArray(str)) {
    return str;
  }
  if (!str || typeof str !== "string") {
    return [];
  }
  return str?.split(",")?.filter((s) => s?.trim()?.length > 0);
};
/**
 * Function for checking does the current time lies between the provided start and end time.
 * @param {String} startTime
 * @param {String} endTime
 * @returns
 */
export const isCurrentTimeBetween = (startTimeCST, endTimeCST) => {
  // Parse the provided start and end times in CST

  const pStartTime = new Date(startTimeCST);
  const pEndTime = new Date(endTimeCST);

  const unixStartTime = pStartTime.getTime();
  const unixEndTime = pEndTime.getTime();

  const currentTime = new Date().getTime();

  return currentTime >= unixStartTime && currentTime <= unixEndTime;
};
/**
 * Function to find out does the user is allowed to use the application or not
 * @returns boolean value determining does the user is allowed to use the application or not
 */
export const isUserAllowed = () => {
  const isValid = localStorage?.getItem(RESTRICTION_TIME);
  if (!isValid) {
    return true;
  }
  return isValid === "false";
};
/**
 * Function for comparing 2 strings case-insensitive way.
 * @param {String} str1
 * @param {String} str2
 * @returns
 */
export const compareStrings = (str1, str2) => {
  if (!str1 || !str2) {
    return false;
  }

  return str1?.toLowerCase() === str2?.toLowerCase();
};
/**
 * Function for updating  the value of a particular session showing in the sidebar.
 * @param {Function} setSessionData
 * @param {Function} updatedTitle
 * @param {String} id
 * @param {Array} tags
 */
export const updateSessionTitle = ({
  setSessionData,
  updatedTitle,
  id,
  tags,
}) => {
  setSessionData((prev) => {
    const updatedData = prev?.map((session) => {
      if (session?.session === id) {
        if (updatedTitle) {
          session.title = updatedTitle;
        }
        if (tags) {
          session.tag = tags;
        }
        return session;
      }
      return session;
    });
    return updatedData;
  });
};
/**
 * Function for converting date object into human readable date and time values.
 * @param {String} dateTimeString
 * @returns
 */
export const convertToHumanReadableDateAndTime = (dateTimeString) => {
  const dateAndTime = new Date(dateTimeString);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "America/Chicago", // CST timezone
    timeZoneName: "short",
  };

  const formattedDateAndTime = dateAndTime.toLocaleString("en-US", options);

  return formattedDateAndTime;
};

export const markDownTextEdit = (node, index, parent) => {
  if (node.tagName === "a") {
    // Change the tag to 'span' to disable the link
    node.tagName = "span";
    // Optionally, remove the href attribute
    delete node.properties.href;
  }
  if (
    node.tagName === "a" &&
    parent &&
    /^h(1|2|3|4|5|6)/.test(parent.tagName)
  ) {
    parent.children = parent.children.slice(1);
  }
};
/**
 * Function for logging out the user
 * @param {*} callback
 */
export const logout = (callback) => {
  localStorage.removeItem(USER_EMAIL);
  localStorage.removeItem(SESSION_ID);
  localStorage.removeItem("verified");
  localStorage.removeItem("apiCalled");
  localStorage.removeItem(AUTHENTICATION_API_KEY);
  callback?.();
};
/**
 * Function for removing the collins from the string
 * @param {String} str
 * @returns
 */
export const removeCollins = (str) => {
  if (!str) {
    return;
  }
  if (str?.includes(":")) {
    return str?.split(":")?.[1];
  }
  return str;
};
/**
 * Function for checking is user has scrolled till bottom or not.
 * @param {HTMLElement} elementRef
 * @returns
 */
export function isScrolledToBottom(elementRef) {
  const element = elementRef.current;

  if (!element) {
    return false; // Return false if the element doesn't exist
  }

  // Calculate the scrollable height and current scroll position
  const scrollableHeight = element.scrollHeight - element.clientHeight;
  const currentScroll = element.scrollTop;

  // Check if scrolled to the bottom (with a small tolerance)
  return scrollableHeight - currentScroll <= 40; // Adjust the tolerance as needed
}
/**
 * A higher-order function which takes a function as input and return a throttled function
 * @param {Function} callBack
 * @param {Number} delay
 * @returns
 */
export function throttle(callBack, delay = 300) {
  let shouldWait = false;
  let waitingArgs = null;

  const executeCallback = (...args) => {
    shouldWait = true;
    callBack(...args);

    setTimeout(() => {
      shouldWait = false;
      if (waitingArgs) {
        const argsToCall = waitingArgs;
        waitingArgs = null;
        executeCallback(...argsToCall);
      }
    }, delay);
  };

  return (...args) => {
    if (!shouldWait) {
      executeCallback(...args);
    } else {
      waitingArgs = args;
    }
  };
}

/**
 * Function for making highlighted text as not highlighted.
 * @param {Boolean} isWhite
 * @returns
 */
export const unHighlightText = (isWhite) => {
  const elements = document.querySelectorAll(".highlighted-text");
  if (isWhite) {
    elements.forEach((element) => {
      element.classList.add("black-text");
    });
    return;
  }
  elements.forEach((element) => {
    element.classList.add("white-text");
  });
};

/**
 * Function for removing a specific session from the all sessions list/array
 * @param {Array} list
 * @param {String} sessionIdToRemove
 * @param {Function} setList
 */
export const removeParticularSessionTitleFromList = (
  list,
  sessionIdToRemove,
  setList
) => {
  const updatedData = list?.filter(
    (item) => item?.session !== sessionIdToRemove
  );
  setList(updatedData);
};

export const onOpacityChangeHandler = ({
  changedOpacity,
  ipcRenderer,
  setOpacityRange,
}) => {
  setOpacityRange?.(changedOpacity);
  const changedOpacityPercentage = Number((changedOpacity / 100).toFixed(1));
  localStorage.setItem(OPACITY_KEY, changedOpacity);
  ipcRenderer?.send("change-window-opacity", {
    opacity: changedOpacityPercentage,
  });
};
