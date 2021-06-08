const Client = require("infinimesh").Client;

function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

Client.fromCredentials({
  endpoint: "https://api.endpoint",
  username: "joe",
  password: "password",
})
  .then((client) => {
    console.log("Token: ", client.token);
    console.log("Token content:");
    console.log(parseJwt(client.token));
  })
  .catch((err) => {
    console.log(err);
    if (!err.isAxiosError) {
      console.log("Unhandled error", err);
      return;
    }
    if (err.code == "ENOTFOUND") {
      console.log("Endpoint is not found, check your input data");
      return;
    }
    if (err.response.status == 401) {
      console.log("Credentials are incorrect!");
    }
  });
