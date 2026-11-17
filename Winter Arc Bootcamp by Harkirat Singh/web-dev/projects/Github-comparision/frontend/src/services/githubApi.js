const BASE_URL = "https://api.github.com";

function extractUsername(input) {
  const value = input.trim();

  if (!value) {
    throw new Error("Please enter both GitHub profile URLs.");
  }

  // Allow a username or a GitHub profile URL.
  let username = value;

  if (value.includes("://") || value.includes("/")) {
    let url;

    try {
      url = new URL(value.includes("://") ? value : `https://${value}`);
    } catch {
      throw new Error(`Invalid GitHub URL: ${value}`);
    }

    if (
      !["github.com", "www.github.com"].includes(url.hostname.toLowerCase()) ||
      url.search ||
      url.hash
    ) {
      throw new Error("Please enter a valid GitHub profile URL.");
    }

    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length !== 1) {
      throw new Error("Enter a GitHub profile URL, not a repository URL.");
    }

    username = parts[0];
  }

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    throw new Error(`Invalid GitHub username: ${username}`);
  }

  return username;
}

async function githubFetch(url) {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("GitHub profile not found. Check the username.");
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub API rate limit reached. Please try again later.");
    }

    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

async function fetchRepositories(username) {
  const repositories = [];
  let page = 1;

  while (true) {
    const url =
      `${BASE_URL}/users/${encodeURIComponent(username)}/repos` +
      `?per_page=100&page=${page}&type=owner&sort=updated`;

    const pageData = await githubFetch(url);

    repositories.push(...pageData);

    if (pageData.length < 100) {
      break;
    }

    page += 1;
  }

  return repositories;
}

export async function fetchGithubUser(input) {
  const username = extractUsername(input);

  // Fetch the profile and repository list concurrently.
  const [profile, repositories] = await Promise.all([
    githubFetch(`${BASE_URL}/users/${encodeURIComponent(username)}`),
    fetchRepositories(username),
  ]);

  const originalRepositories = repositories.filter((repo) => !repo.fork);

  const stars = repositories.reduce(
    (total, repo) => total + repo.stargazers_count,
    0,
  );

  const forks = repositories.reduce(
    (total, repo) => total + repo.forks_count,
    0,
  );

  return {
    ...profile,
    repositories,
    stats: {
      stars,
      forks,
      originalRepos: originalRepositories.length,
    },
  };
}

export async function fetchGithubProfiles(input1, input2) {
  return Promise.all([fetchGithubUser(input1), fetchGithubUser(input2)]);
}
