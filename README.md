# Campaign Launch Checker

The Campaign Launch Checker is a simple tool I created to help digital marketers check campaign links before they go live.
Small mistakes in UTM parameters can cause problems in GA4 reporting, especially when campaign names are inconsistent or information is missing. I wanted to create something practical that could flag those issues before a campaign launches, rather than finding them later when the data has already been collected incorrectly.


## Live project

View here: https://sharijo11.github.io/marketing-qa-tool/


## What it does

The user enters their landing page URL and campaign details, including channel, campaign name, source, medium and content. The tool then:

- checks that the landing page URL is valid and uses HTTPS;
- checks that the required campaign information has been added;
- reviews UTM values against a consistent naming format;
- standardises values using lowercase letters and underscores;
- generates a final campaign URL;
- gives the campaign a tracking-readiness score; and
- shows which checks have passed and which ones need attention.

There is also a copy button so the finished URL can be used straight away.


## Why I built it

I work with digital campaigns, analytics and reporting, so I know how easily inconsistent tracking can affect the quality of campaign data. This project gave me a chance to combine that marketing experience with my developing front-end skills.

I kept the first version focused on a common marketing problem and made sure the tool was easy to use without needing any instructions or technical knowledge.



## Technologies used

- HTML
- CSS
- JavaScript
- URL and URLSearchParams browser APIs

The project does not need a framework, database or external API. All checks run in the browser and the information entered by the user is not stored.


## Running the project locally

1. Download or clone the project files.
2. Make sure `index.html`, `styles.css` and `script.js` are in the same folder.
3. Open `index.html` in a web browser.

No installation or additional setup is required.



## What I learned

This project helped me practise:

- working with form data in JavaScript;
- validating user input;
- using functions, arrays and conditional logic;
- updating page content through the DOM;
- creating and editing URL parameters;
- designing clear success, warning and error states; and
- making a tool responsive and accessible across different screen sizes.



## Possible future improvements

Some features I may add in future are:

- downloadable campaign QA reports;
- checks for GA4 event naming conventions;
- channel-specific naming rules;
- saved campaign history; and
- campaign data exports in CSV format.
