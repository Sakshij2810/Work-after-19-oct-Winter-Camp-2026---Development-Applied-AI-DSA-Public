# GitDuel ⚔️

### Two profiles. One duel.

GitDuel is a web application that compares two GitHub profiles side by side using publicly available GitHub statistics. It highlights individual metric winners and determines an overall winner using a weighted scoring system.

Compare repositories, stars, forks, followers, and more — all in one place.

## ✨ Features

- **GitHub Profile Comparison:** Compare two developers using their GitHub usernames or profile URLs.
- **Profile Overview:** View profile avatars, names, usernames, bios, repository counts, followers, and following.
- **Detailed Statistics:** Compare public repositories, original repositories, stars, forks, followers, following, and public gists.
- **Metric-wise Winners:** Identify which profile leads in each statistic, with ties handled automatically.
- **Percentage Lead:** See the relative difference between two metric values.
- **Weighted Scoring:** Assign different importance weights to metrics and calculate an overall result.
- **Final Winner Summary:** Display the overall winner, weighted points, and score distribution.
- **Input Validation:** Handle empty inputs, invalid usernames, malformed URLs, and repository URLs.
- **Loading Indicators:** Show feedback while profile data is being fetched.
- **Error Handling:** Display helpful messages for unavailable profiles, API errors, and rate limits.
- **Responsive UI:** Present profile cards and comparison results in a layout that adapts to different screen sizes.
- **Direct Profile Links:** Open either developer's GitHub profile directly from the app.

## 🛠️ Tech Stack

- **React** — Component-based user interface
- **JavaScript (ES6+)** — Application logic and asynchronous operations
- **Tailwind CSS** — Styling and responsive layouts
- **GitHub REST API** — Public profile and repository data
- **Fetch API** — HTTP requests
- **React Icons** — Interface icons
- **Vite** — Development server and build tooling, if configured in the project

## 📊 Metrics Compared

| Metric                | Description                                      | Weight |
| --------------------- | ------------------------------------------------ | -----: |
| Public repositories   | Number of public repositories reported by GitHub |      1 |
| Original repositories | Public repositories that are not forks           |      2 |
| Total stars           | Stars across the fetched public repositories     |      3 |
| Total forks           | Forks across the fetched public repositories     |      2 |
| Followers             | Number of GitHub followers                       |      2 |
| Following             | Number of GitHub users followed                  |      1 |
| Public gists          | Number of public gists reported by GitHub        |      1 |

## 🧮 How the Scoring Works

GitDuel uses a weighted scoring system to calculate the overall result.

1. Each metric has a predefined weight.
2. The profile with the higher metric value earns that metric's full weight.
3. If both profiles have equal values, the weight is split equally between them.
4. The points from all metrics are added together.
5. The profile with the higher total score wins. If both totals are equal, the result is a tie.

### Percentage lead

For unequal values, the percentage lead is calculated relative to the lower value:

`((Higher Value - Lower Value) / Lower Value) × 100`

If the lower value is zero, the percentage lead is displayed as N/A because the relative percentage cannot be calculated.

**Note:** GitDuel compares selected public GitHub metrics. Its result is not a measure of a developer's actual programming skill, code quality, or professional experience.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- Git installed
- A GitHub account is not required to compare public profiles

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/gitduel.git
```

Replace `YOUR_USERNAME` with your GitHub username.

**2. Navigate to the project directory**

```bash
cd gitduel
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL printed in your terminal by the development server.

> These commands assume the project is configured with Vite and has the corresponding npm scripts. Adjust them if your project uses a different setup.

## 📁 Project Structure

```text
gitduel/
├── public/
├── src/
│   ├── components/
│   │   ├── SearchForm.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── ComparisonTable.jsx
│   │   ├── MetricRow.jsx
│   │   └── WinnerCard.jsx
│   ├── services/
│   │   └── githubApi.js
│   ├── utils/
│   │   └── scoring.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

## 🔌 API Usage

GitDuel uses the public GitHub REST API to retrieve profile and repository information.

Profile endpoint:

```text
GET https://api.github.com/users/{username}
```

Repository endpoint:

```text
GET https://api.github.com/users/{username}/repos
```

Repository requests are paginated to retrieve repository data across multiple pages.

No personal GitHub access token is required for basic public-profile comparisons. However, unauthenticated API requests are subject to GitHub's rate limits.

## ⚠️ Limitations

- Only publicly available GitHub data is compared.
- Private repositories and private activity are not included.
- API availability and rate limits can affect requests.
- Statistics may change as GitHub profiles and repositories are updated.
- The scoring weights are configurable and represent the project's chosen comparison criteria.
- A higher score does not necessarily indicate greater coding ability or better software engineering practices.

## 🔮 Future Enhancements

Potential improvements for future versions include:

- Repository language distribution and language-wise comparisons
- Contribution activity and contribution calendar summaries
- Repository-level comparisons, including README quality and license information
- Interactive charts and historical statistics
- Shareable comparison links
- Comparison history and saved profiles
- Dark mode
- Improved accessibility and automated tests
- Optional GitHub authentication for features that require additional permissions

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Commit your changes with a clear message.
5. Open a pull request describing your improvements.

## 📄 License

Choose a license before distributing the project. For example, you may use the MIT License by adding a `LICENSE` file containing the appropriate license text.

---

**GitDuel — Two profiles. One duel. ⚔️**
