export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    success: true,
    service: "TechLink API",
    status: "operational",
    endpoints: ["/api/health", "/api/github", "/api/messages"]
  });
}
