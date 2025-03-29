# Claudia

Claudia is a Chromium extension that lets you talk to Claude about the current page.

![](./screenshot.png "Claudia screenshot")

## Features

- Ask Clade about the current page. For example, ask it to summarize the current page or find specific information.
- Page content is cached to save API costs.

## Installation

1. Download the latest [release](https://github.com/cubesort/claudia/releases).
2. Unzip the file.
3. Navigate to your browser’s extensions page, e.g. `chrome://extensions/`.
4. Enable "Developer mode" from the top right corner.
5. Click "Load unpacked" and select the unzipped folder.

## Usage

- Click on the extension icon in the toolbar.
- It will ask you to enter an Anthropic API key in the first use.
- Enter your API key and ask away!

---

## Developer guide

## Prerequisites

- Node >= v22

## Development

1. Clone the repo and `cd claudia`.
2. `npm install`.
3. `npm run dev`.
4. Manually load the extension from `./dist/chrome-mv3-dev`.
