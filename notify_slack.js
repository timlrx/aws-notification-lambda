const https = require("https");

const postRequest = (webhookUrl, payload) => {
  const { title, statusCode, body, timestamp } = payload;
  const formattedBody = typeof body === "string" ? body : JSON.stringify(body);

  const slack_data = {
    attachments: [
      {
        color: statusCode === 200 ? "#008000" : "#DC3545",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: title,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                statusCode === 200
                  ? `${timestamp} \n ${formattedBody}`
                  : `⚠️ ${timestamp} \n ${formattedBody}`,
            },
          },
        ],
      },
    ],
  };

  const options = {
    hostname: "hooks.slack.com",
    path: webhookUrl.split("hooks.slack.com")[1],
    port: 443,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let rawData = "";

      res.on("data", (chunk) => {
        rawData += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: 200,
          body: `${rawData}`,
        });
      });
    });

    req.on("error", (err) => {
      reject(new Error(err));
    });

    req.write(JSON.stringify(slack_data));
    req.end();
  });
};

exports.handler = async (event) => {
  let payload = {};
  let webhookUrl = "";
  // SNS
  if (event.Records) {
    payload = {
      statusCode:
        Number(
          event.Records[0].Sns.MessageAttributes["statusCode"] &&
            event.Records[0].Sns.MessageAttributes["statusCode"]["Value"]
        ) || 200,
      title: event.Records[0].Sns.Subject || null,
      body: event.Records[0].Sns.Message || "",
      timestamp: event.Records[0].Sns.Timestamp || null,
    };
    webhookUrl = event.Records[0].Sns.MessageAttributes["webhookUrl"]["Value"];
  } else {
    // Non-SNS
    payload = {
      statusCode: event.statusCode || 200,
      title: event.title || null,
      body: event.body || "",
      timestamp: event.timestamp || null,
    };
    webhookUrl = event.webhookUrl;
  }

  const result = await postRequest(webhookUrl, payload);

  return result;
};
