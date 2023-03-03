import request from "./request";

export const $request = (method, url, value, contentType, responseType) => {
  return request({
    method,
    url,
    data: method == "post" ? value : null,
    params: method == "get" ? value : null,
    headers: contentType
      ? { "content-type": contentType }
      : { "content-type": "application/json" },
    responseType: responseType ? responseType : "json",
  });
};
