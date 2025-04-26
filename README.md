# Audio Tour App (Work In Progress)

This is an [Expo](https://expo.dev) project aiming to create a mobile and web application for discovering and taking audio tours.

The project is currently under active development.

## Purpose

The goal is to allow users to find audio tours based on their location or search criteria and listen to them directly within the app.

## Current Features (MVP)

*   Basic user interface.
*   Location search/autocomplete input (powered by Google Places API).
*   (Functionality for actually loading/playing tours is pending development).

## Setup and Run

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the development server:**

    ```bash
    npx expo start
    ```

    Follow the prompts in the terminal to open the app on a simulator/emulator, a physical device via Expo Go, or in a web browser.

## Important Notes

*   **Web Autocomplete & CORS:** The location autocomplete feature works correctly on native builds (iOS/Android). However, due to browser security restrictions (CORS), the web version requires a proxy server or a dedicated backend to handle requests to the Google Places API. This project is currently frontend-only.
*   **Backend Development:** A proper backend is planned for future development to handle API requests securely, manage tour data, user accounts, etc.
