function getOrigin() {
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3000";
  }

  if (process.env.VERVEL_ENV === "preview") {
    return `https://${process.env.VERVEL_URL}`;
  }

  return "https://kamilastore.com.br/";
}

const webserver = {
  origin: getOrigin(),
};

export default webserver;
