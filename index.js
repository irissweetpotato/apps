import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const APPSFLYER_API_URL = "https://api3.appsflyer.com/inappevent/";
const API_KEYS_BY_BUNDLE = {
  "com.pm.primalmatch":
    "d79da64e-2982-41b1-8490-3e767e71e2b0",

  // Добавьте другие bundleIdentifier и их ключи здесь
};

const sendEventToAppsFlyer = async (bundleIdentifier, eventData, apiKey) => {
  const options = {
    method: "POST",
    url: APPSFLYER_API_URL + bundleIdentifier,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authentication: apiKey,
    },
    data: eventData,
  };
  return await axios.request(options);
};
app.get("/send-event", async (req, res) => {
  try {
    const { appsflyer_id, advertising_id, eventName, bundleIdentifier } =
      req.query;

    if (!appsflyer_id || !advertising_id || !eventName || !bundleIdentifier) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const apiKey = API_KEYS_BY_BUNDLE[bundleIdentifier];
    if (!apiKey) {
      return res.status(400).json({ error: "Invalid bundleIdentifier" });
    }
    let eventValue;
    if (eventName === "reg" || "af_complete_registration") {
      eventValue = JSON.stringify({
        af_revenue: 0,
        af_currency: "USD",
      });
    } else if (eventName === "dep" || "af_purchase") {
      eventValue = JSON.stringify({
        af_revenue: 20,
        af_currency: "USD",
      });
    }

    const eventTime = new Date().toISOString();
    const eventData = {
      appsflyer_id,
      advertising_id,
      eventName,
      eventValue,
      eventTime,
      eventCurrency: "USD",
      bundleIdentifier,
    };

    let response;
    if (eventName === "reg" || eventName === "dep") {
      response = await sendEventToAppsFlyer(
        bundleIdentifier,
        eventData,
        apiKey
      );
    } else {
      return res.status(400).json({ error: "Invalid event name" });
    }

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
