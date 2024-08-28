/**
 * String for checking "light" theme
 * @type {string}
 */
export const LIGHT = "light";
/**
 * String for checking "dark" theme
 * @type {string}
 */
export const DARK = "dark";
/**
 * An Enum for types of api and web-sockets getting used in this application, so we can select the appropiate message string ti send on the backend for authentication
 * @type {Object}
 */
export const API_TYPE = {
  DEFAULT: "default",
  OPEN_AI: "openAi",
  WEB_SOCKET: "web-socket",
};
/**
 * emailRegex
 * @type {RegExp}
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * emailRegex
 * @type {RegExp}
 */
export const SPECIAL_CHARACTERS_REGEX = /[&^%$#@!*()/]/g;
/**
 * Key to check user is verified or not
 * @type {string}
 */
export const VERIFIED_USER = "verified";
/**
 * Key to check user email
 * @type {string}
 */
export const USER_EMAIL = "emailForSignIn";
/**
 * Key to check user session id
 * @type {string}
 */
export const SESSION_ID = "sessionId";
/**
 * Key to check user persona
 * @type {string}
 */
export const USER_PERSONA = "user-persona";
/**
 * Key to storing the current system theme into the locale-storage
 * @type {string}
 */
export const SYSTEM_THEME = "theme";
/**
 * Event to trigger and listen for microphone related things between main and renderer process of electron
 * @type {string}
 */
export const MICROPHONE_TEXT = "microphone-text";
/**
 * A common/general error message
 * @type {string}
 */
export const COMMON_ERROR_MESSAGE = "Something went wrong!";
/**
 * To Control the maximum count to be showed on the shared chat icon on the bottom side of sidebar
 * @type {number}
 */
export const MAX_COUNT_OF_SHARED_CHAT_TO_SHOW = 10;
/**
 * Count of maximum tags we can show it to the user
 * @type {number}
 */
export const MAX_TAGS_TO_SHOW = 3;
/**
 * Key name for storing the restriction time
 * @type {String}
 */
export const RESTRICTION_TIME = "restrict";
/**
 * Time interval after which we call an api for checking does the user is allowed to use the application or not
 * @type {String}
 */
export const TIME_INTERVAL_FOR_RESTRICTION_API = 5 * 60 * 1000;
/**
 * A message to show to the user when he is restricted from using the application.
 * @type {String}
 */
export const RESTRICTION_MESSAGE =
  "You are restricted from using the application by the Admin";
/**
 * Maximum number of tags allowed to be enter at a time into the search bar.
 * @type {Number}
 */
export const MAX_ALLOWED_TAGS_TO_SEARCH = 3;
/**
 * A disclaimer message for AI-interview user.
 * @type {String}
 */
export const AI_INTERVIEW_DISCLAIMER =
  "Please ensure that you have the interviewer's consent when using this AI interview assistant.";

export const SHARED_SESSION_TYPES = {
  WITH_ME: 1,
  BY_ME: 2,
};

export const SILENCE_DETECTED_MESSAGE = "silence_detected";

export const DUPLICATE_MESSAGE =
  "It looks like the tag you are trying to add already exists. Please use a different tag or select the existing one from the list.";

export const TAGS_LIMIT_EXCEED_MESSAGE =
  "You have exceeded the limit of adding tags to a single chat. You can add up to 3 tags per message. Please remove some tags to proceed.";

export const TODAYS_KEY = "today";
export const SEVEN_DAYS_OLDER_KEY = "7_days_older";
export const EARLIER_KEY = "today";

export const PROCESS_TYPES = {
  AUTOMATIC: 1,
  MANUAL: 2,
};
export const PROCESS_TYPE_KEY = "process-type";
export const NO_SESSION_TITLE = "No Title";
export const INACTIVITY_MESSAGE = "inactive_more_than_10_min";
export const TIME_TO_WAIT_BEFORE_USER_CLICK_CONTINUE = 2 * 60 * 1000;
export const PAGINATION_LIMIT = 20;
export const AUTHENTICATION_API_KEY = "isAuthenticationApiCalled";
export const HIGHLIGHTED_TEXT_CLASS_NAME = "highlighted-text";
export const MINIMUM_OPACITY_RANGE = 25;
export const OPACITY_KEY = "theme-opacity";
export const MOBILE_WIDTH = 600;
export const DRAWER_SIZE = 320;

export const DRAWER_DARK_STYLES = {
  backgroundColor: "#1F1F1F",
};

export const DRAWER_LIGHT_STYLES = {
  backgroundColor: "white",
};
