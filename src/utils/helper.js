import axios from 'axios';

export const getData = async (url, method) => {
  const serverUrl = `${process.env.REACT_APP_SERVER_URL}${url}`;
  return axios({
    url: serverUrl,
    method: method
  })
}

export const uploadFile = async (url, body, method) => {
  const serverUrl = `${process.env.REACT_APP_SERVER_URL}${url}`;
  return axios({
    url: serverUrl,
    method: method,
    data: body
  })
}

export const getPrefernce = async (url, body, method) => {
  const serverUrl = `${process.env.REACT_APP_SERVER_URL}${url}`;
  return axios({
    url: serverUrl,
    method: method
  })
}

export const tempGetData = async (url, body, method) => {
  const serverUrl = `${process.env.REACT_APP_SERVER_URL}${url}`;
  return axios({
    url: serverUrl,
    method: method
  })
}

export const sendEmail = async (url, body, method) => {
  const serverUrl = `${process.env.REACT_APP_VERIFICATION_URL}/${url}`;
  return axios({
    url: serverUrl,
    method: method,
    data: body
  })
}

export const setOrRemoveHtmlElementClass = ({ isDelete, className }) => {
  if (!isDelete) {
    document?.documentElement?.classList?.add(className)
    return;
  }
  document?.documentElement?.classList?.remove(className)
}

