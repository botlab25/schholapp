export default async ({ req, res, log, error }) => {
  // Log request details for debugging
  log(req.bodyText); // Raw request body, contains request data
  log(JSON.stringify(req.bodyJson)); // Object from parsed JSON request body, otherwise string
  log(JSON.stringify(req.headers)); // String key-value pairs of all request headers, keys are lowercase
  log(req.scheme); // Value of the x-forwarded-proto header, usually http or https
  log(req.method); // Request method, such as GET, POST, PUT, DELETE, PATCH, etc.
  log(req.url); // Full URL, for example: http://awesome.appwrite.io:8000/v1/hooks?limit=12&offset=50
  log(req.host); // Hostname from the host header, such as awesome.appwrite.io
  log(req.port); // Port from the host header, for example 8000
  log(req.path); // Path part of URL, for example /v1/hooks
  log(req.queryString); // Raw query params string. For example "limit=12&offset=50"
  log(JSON.stringify(req.query)); // Parsed query params. For example, req.query.limit

  try {
    // Parse the request payload
    const payload = req.bodyJson || {};
    log("Parsed payload:", payload);

    // Extract numbers from the payload
    const { phoneNmber, otp } = payload;

    log("jjjjjjjjjjjjjkkkk", phoneNmber, otp);

    // Return the result
    return res.json({
      success: true,
      message: "Numbers added successfully!",
      result: result,
    });
  } catch (err) {
    error("Error processing request:", err);
    return res.json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
};
