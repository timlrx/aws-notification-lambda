const https = require("https");

const postRequest = (webhookUrl, payload) => {
  discord_data = {
    username: "AWS",
    avatar_url:
      "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
    embeds: [
      {
        title: payload.title,
        color: payload.statusCode === 200 ? 2538752 : 14177041,
        description:
          payload.statusCode === 200 ? payload.body : `⚠️ ${payload.body}`,
      },
    ],
  };

  const options = {
    hostname: "discordapp.com",
    path: webhookUrl.split("discordapp.com")[1],
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

    req.write(JSON.stringify(discord_data));
    req.end();
  });
};

exports.handler = async (event) => {
  const payload = {
    statusCode: event.statusCode,
    title: event.title || null,
    body: event.body || "",
  };
  const webhookUrl = process.env.WEBHOOK_URL;
  const result = await postRequest(webhookUrl, payload);

  return result;
};
