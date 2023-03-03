let model_url;
let base_url;
let websocketUrl;
if (
  window.location.hostname.indexOf("172.10.40") != -1 ||
  window.location.hostname.indexOf("localhost") != -1
) {
  //   console.log("ok");
  websocketUrl = process.env.VUE_APP_API_INTRANET_WEBSOCKET_URL;
  model_url = process.env.VUE_APP_API_INTRANET_MODEL;
  base_url = process.env.VUE_APP_API_INTRANET_BASE_URL;
} else {
  websocketUrl = process.env.VUE_APP_API_NETWORK_WEBSOCKET_URL;
  model_url = process.env.VUE_APP_API_NETWORK_MODEL;
  base_url = process.env.VUE_APP_API_NETWORK_BASE_URL;
}

export { model_url, base_url, websocketUrl };
