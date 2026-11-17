# CasePath — refined tort-law prototype

## Website design
- More restrained editorial styling, typography, spacing, and colour palette.
- A floating CasePath Intake Assistant chat panel is included.
- The chat panel is a user interface only until you connect the Worker backend.

## Publish the website with GitHub Pages
1. Upload `index.html` to the root of your public GitHub repository.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/(root)`, then Save.

## Connect the AI assistant (GitHub Pages + Cloudflare Worker)
GitHub Pages only serves static files. The included Cloudflare Worker acts as the secure server-side endpoint and keeps the OpenAI API key out of the browser.

### 1. Create a Cloudflare Worker
1. Sign in to Cloudflare and open **Workers & Pages**.
2. Create a Worker and paste the contents of `worker/index.js` into its editor.
3. Deploy it. Copy the Worker URL (for example, `https://your-worker.your-subdomain.workers.dev`).

### 2. Add the API key securely
1. In the Worker, open **Settings → Variables and Secrets**.
2. Add a secret named `OPENAI_API_KEY` with your API key as its value.
3. Add a plain-text variable named `SITE_ORIGIN` with your exact GitHub Pages origin, such as `https://YOUR-USERNAME.github.io` (no repository path).
4. Optional: add `OPENAI_MODEL` if you want to select a model available to your API project. The default in the sample is `gpt-6.2-astra`.
5. Save and deploy again.

Do not put the API key in `index.html`, GitHub, or any browser code. The API is billed separately from static hosting; set an API usage budget/limit and have a parent or guardian handle account and payment setup where required.

### 3. Point the website chat to the Worker
In `index.html`, find:

```js
const CASEPATH_API_URL = "";
```

Replace the empty string with your Worker URL:

```js
const CASEPATH_API_URL = "https://your-worker.your-subdomain.workers.dev";
```

Commit the updated `index.html` to GitHub. GitHub Pages will publish the update. Test the chat with fictional information only.

## Important limitations and safeguards
- The current intake form's file picker only selects files locally; it does not upload or analyze them.
- The chat sends the text conversation to the Worker and then to the OpenAI API. Do not invite public users to submit confidential legal documents or sensitive personal information until you have implemented and reviewed appropriate privacy, security, consent, retention, access-control, and legal-compliance measures.
- The assistant is a preliminary information organizer, not a lawyer. It cannot decide whether a claim is valid, assess liability, predict success, or calculate recoverable damages. A licensed lawyer must review any real matter.
- Add authentication, abuse protection/rate limiting, monitoring, and stricter request validation before public launch. The sample is a learning prototype, not production-ready legal infrastructure.
