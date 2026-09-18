const form = document.querySelector("#campaignForm");
const emptyState = document.querySelector("#emptyState");
const report = document.querySelector("#report");
const checkList = document.querySelector("#checkList");
const scoreRing = document.querySelector("#scoreRing");
const scoreValue = document.querySelector("#scoreValue");
const scoreMessage = document.querySelector("#scoreMessage");
const scoreSummary = document.querySelector("#scoreSummary");
const statusBadge = document.querySelector("#statusBadge");
const finalUrl = document.querySelector("#finalUrl");
const copyStatus = document.querySelector("#copyStatus");
const copyButton = document.querySelector("#copyButton");
const loadSampleButton = document.querySelector("#loadSample");

const field = (name) => form.elements[name];

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const normaliseTag = (value) => value
  .trim()
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
};

const makeCheck = (status, title, detail) => ({ status, title, detail });

function buildCampaignUrl(values) {
  if (!isValidUrl(values.landingUrl)) return "";

  const url = new URL(values.landingUrl);
  url.searchParams.set("utm_source", normaliseTag(values.source));
  url.searchParams.set("utm_medium", normaliseTag(values.medium));
  url.searchParams.set("utm_campaign", normaliseTag(values.campaign));

  if (values.content.trim()) {
    url.searchParams.set("utm_content", normaliseTag(values.content));
  } else {
    url.searchParams.delete("utm_content");
  }

  return url.toString();
}

function runChecks(values) {
  const urlOkay = isValidUrl(values.landingUrl);
  const isHttps = urlOkay && new URL(values.landingUrl).protocol === "https:";
  const campaignIsClean = values.campaign !== "" && values.campaign === normaliseTag(values.campaign);
  const sourceIsClean = values.source !== "" && values.source === normaliseTag(values.source);
  const mediumIsClean = values.medium !== "" && values.medium === normaliseTag(values.medium);

  return [
    makeCheck(urlOkay ? "pass" : "fail", "Landing page URL", urlOkay ? "The destination URL is valid." : "Enter a complete URL such as https://example.com/page."),
    makeCheck(isHttps ? "pass" : "fail", "Secure destination", isHttps ? "The landing page uses HTTPS." : "Use HTTPS so visitors and tracking data are protected."),
    makeCheck(values.channel ? "pass" : "fail", "Channel selected", values.channel ? "A campaign channel has been recorded." : "Select the channel this campaign will run on."),
    makeCheck(sourceIsClean ? "pass" : values.source ? "warn" : "fail", "UTM source", sourceIsClean ? "Source is present and follows the naming convention." : values.source ? `It will be standardised to “${normaliseTag(values.source)}”.` : "Add the platform or publisher, such as linkedin."),
    makeCheck(mediumIsClean ? "pass" : values.medium ? "warn" : "fail", "UTM medium", mediumIsClean ? "Medium is present and follows the naming convention." : values.medium ? `It will be standardised to “${normaliseTag(values.medium)}”.` : "Add the traffic type, such as paid_social."),
    makeCheck(campaignIsClean ? "pass" : values.campaign ? "warn" : "fail", "Campaign naming", campaignIsClean ? "Campaign name is lowercase with no spaces." : values.campaign ? `It will be standardised to “${normaliseTag(values.campaign)}”.` : "Add a clear campaign name."),
    makeCheck(values.content ? (values.content === normaliseTag(values.content) ? "pass" : "warn") : "warn", "Creative identifier", values.content ? (values.content === normaliseTag(values.content) ? "UTM content will distinguish this creative." : `It will be standardised to “${normaliseTag(values.content)}”.`) : "Recommended when testing multiple ads, links or creative versions."),
    makeCheck(values.goal ? "pass" : "warn", "Conversion goal", values.goal ? `Primary goal recorded as “${values.goal.trim()}”.` : "Record the action this campaign should drive so success is clear.")
  ];
}

function calculateScore(checks) {
  const points = checks.reduce((total, check) => {
    if (check.status === "pass") return total + 1;
    if (check.status === "warn") return total + 0.5;
    return total;
  }, 0);
  return Math.round((points / checks.length) * 100);
}

function renderReport(checks, score, campaignUrl) {
  emptyState.classList.add("hidden");
  report.classList.remove("hidden");
  scoreRing.style.setProperty("--score", score);
  scoreRing.setAttribute("aria-label", `Readiness score ${score} percent`);
  scoreValue.textContent = `${score}%`;
  finalUrl.value = campaignUrl;
  copyButton.disabled = !campaignUrl;

  const failed = checks.filter((check) => check.status === "fail").length;
  const warnings = checks.filter((check) => check.status === "warn").length;

  statusBadge.className = "status-badge";
  if (failed === 0 && score >= 90) {
    statusBadge.textContent = "Ready to launch";
    statusBadge.classList.add("ready");
    scoreMessage.textContent = "Ready to launch";
    scoreSummary.textContent = warnings ? `${warnings} optional improvement to consider.` : "All tracking checks passed.";
  } else if (failed === 0) {
    statusBadge.textContent = "Review suggested";
    statusBadge.classList.add("review");
    scoreMessage.textContent = "Nearly there";
    scoreSummary.textContent = `Review ${warnings} recommendation${warnings === 1 ? "" : "s"} before launch.`;
  } else {
    statusBadge.textContent = "Action required";
    statusBadge.classList.add("blocked");
    scoreMessage.textContent = "Needs attention";
    scoreSummary.textContent = `Fix ${failed} required item${failed === 1 ? "" : "s"} before launch.`;
  }

  checkList.innerHTML = checks.map((check) => {
    const symbol = check.status === "pass" ? "✓" : check.status === "warn" ? "!" : "×";
    return `
      <article class="check-item ${check.status}">
        <span class="check-icon" aria-hidden="true">${symbol}</span>
        <div>
          <h4>${escapeHtml(check.title)}</h4>
          <p>${escapeHtml(check.detail)}</p>
        </div>
      </article>`;
  }).join("");
}

function collectValues() {
  return {
    landingUrl: field("landingUrl").value.trim(),
    channel: field("channel").value,
    goal: field("goal").value.trim(),
    campaign: field("campaign").value.trim(),
    source: field("source").value.trim(),
    medium: field("medium").value.trim(),
    content: field("content").value.trim()
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = collectValues();

  ["landingUrl", "channel", "campaign", "source", "medium"].forEach((name) => {
    const control = field(name);
    const invalid = name === "landingUrl" ? !isValidUrl(control.value.trim()) : !control.value.trim();
    control.setAttribute("aria-invalid", invalid ? "true" : "false");
  });

  const checks = runChecks(values);
  renderReport(checks, calculateScore(checks), buildCampaignUrl(values));

  if (window.innerWidth < 1020) {
    document.querySelector("#results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    emptyState.classList.remove("hidden");
    report.classList.add("hidden");
    statusBadge.className = "status-badge";
    statusBadge.textContent = "Waiting for details";
    copyStatus.textContent = "";
    form.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
  }, 0);
});

loadSampleButton.addEventListener("click", () => {
  field("landingUrl").value = "https://example.com/product-launch";
  field("channel").value = "paid-social";
  field("goal").value = "Demo request";
  field("campaign").value = "autumn_product_launch";
  field("source").value = "linkedin";
  field("medium").value = "paid_social";
  field("content").value = "video_ad_a";
  form.requestSubmit();
});

copyButton.addEventListener("click", async () => {
  if (!finalUrl.value) return;
  try {
    await navigator.clipboard.writeText(finalUrl.value);
  } catch {
    finalUrl.select();
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges();
  }
  copyStatus.textContent = "Campaign URL copied to your clipboard.";
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy URL";
    copyStatus.textContent = "";
  }, 2200);
});

["landingUrl", "channel", "campaign", "source", "medium"].forEach((name) => {
  field(name).addEventListener("input", (event) => event.currentTarget.removeAttribute("aria-invalid"));
});

function registerCampaignCheckTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const allowedChannels = ["paid-social", "organic-social", "email", "paid-search", "display", "affiliate", "other"];

  try {
    void Promise.resolve(context.registerTool({
      name: "check_campaign_tracking",
      title: "Check campaign tracking",
      description: "Validate campaign details, update the visible launch report and return the tracking-readiness result.",
      inputSchema: {
        type: "object",
        properties: {
          landingUrl: { type: "string", description: "Complete landing-page URL." },
          channel: { type: "string", enum: allowedChannels },
          campaign: { type: "string", description: "Campaign name." },
          source: { type: "string", description: "UTM source, such as linkedin." },
          medium: { type: "string", description: "UTM medium, such as paid_social." },
          content: { type: "string", description: "Optional creative identifier." },
          goal: { type: "string", description: "Optional conversion goal." }
        },
        required: ["landingUrl", "channel", "campaign", "source", "medium"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== "object") throw new TypeError("Campaign details must be an object.");
        const required = ["landingUrl", "channel", "campaign", "source", "medium"];
        if (required.some((key) => typeof input[key] !== "string" || !input[key].trim())) {
          throw new TypeError("Landing URL, channel, campaign, source and medium are required.");
        }
        if (!allowedChannels.includes(input.channel)) throw new TypeError("Choose a supported campaign channel.");

        const values = {
          landingUrl: input.landingUrl.trim(),
          channel: input.channel,
          campaign: input.campaign.trim(),
          source: input.source.trim(),
          medium: input.medium.trim(),
          content: typeof input.content === "string" ? input.content.trim() : "",
          goal: typeof input.goal === "string" ? input.goal.trim() : ""
        };

        Object.entries(values).forEach(([name, value]) => { field(name).value = value; });
        const checks = runChecks(values);
        const score = calculateScore(checks);
        const campaignUrl = buildCampaignUrl(values);
        renderReport(checks, score, campaignUrl);

        return {
          score,
          status: checks.some((check) => check.status === "fail") ? "action_required" : score >= 90 ? "ready" : "review_suggested",
          campaignUrl,
          checks
        };
      }
    })).catch(() => {});
  } catch {
    // The checker remains fully usable when the browser does not support WebMCP.
  }
}

registerCampaignCheckTool();
