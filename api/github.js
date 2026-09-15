function sendError(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  if (req.method !== "GET") return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only GET is supported.");

  const username = String(req.query?.username || "").trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9-]{1,39}$/.test(username)) {
    return sendError(res, 400, "INVALID_USERNAME", "Provide a valid GitHub username.");
  }

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "TechLink-Portfolio"
    };

    const [userResponse, repoResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=6&sort=updated&direction=desc`, { headers })
    ]);

    if (!userResponse.ok || !repoResponse.ok) {
      const status = userResponse.status === 404 || repoResponse.status === 404 ? 404 : 502;
      return sendError(res, status, "GITHUB_REQUEST_FAILED", status === 404 ? "GitHub user not found." : "GitHub API request failed.");
    }

    const user = await userResponse.json();
    const repos = await repoResponse.json();

    return res.status(200).json({
      success: true,
      data: {
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
          public_repos: user.public_repos,
          profile_url: user.html_url
        },
        repositories: repos.map(repo => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          updated_at: repo.updated_at
        }))
      }
    });
  } catch (error) {
    return sendError(res, 502, "GITHUB_UNAVAILABLE", "GitHub could not be reached.");
  }
}
