[![Netlify Status](https://api.netlify.com/api/v1/badges/982304fa-1fa7-4d69-8993-75c6c7ab461f/deploy-status)](https://app.netlify.com/projects/planner-hub/deploys)

# PLANNER HUB
> A personal, single-page weekly planning application designed to work entirely in the browser using **LocalStorage** for persistent data storage. No backend or API is required, making it perfect for free deployment on GitHub Pages or Netlify.

## Motivation
> Tired of using paper planners, this project aims to create a highly functional, responsive digital planner. The core constraint—no database—is solved by leveraging browser storage and file export for backups, giving the user full control over their data.

## Technologies Used
* **Framework:** React v18+
* **Language:** TypeScript
* **Bundler:** Vite
* **Styling:** Modern CSS (Flexbox/Grid for responsiveness)
* **Data Management:** LocalStorage & JSON

## Project Architecture Flow (Mermaid Diagram)
```mermaid
graph TD
    A[User Loads App] --> B{Check LocalStorage};
    B -- Empty/Cleared --> C[Load PlannerHub.json];
    B -- Data Found --> D[Load Data from LocalStorage];
    C --> D;
    D --> E(Planner Hub State: App/Menu/Tasks);
    E -- User Edit --> F[Update React State];
    F -- Change Detected --> G[Status: Not Saved];
    G --> H{User Action};
    H -- Click 'SAVE' --> I[Save State to LocalStorage];
    H -- Click 'EXPORT' --> J[Export JSON File];
    H -- Click 'RESET' --> K[Clear LocalStorage & Reload];
    I --> L[Status: Saved];
    L --> E;