# Diagnostic Agent - Student Quality Index (SQI) System

A sophisticated React application built with TypeScript and Vite designed to analyze student performance data. It computes a Student Quality Index (SQI) to identify learning gaps and prioritize concepts for improvement.

## 🚀 Key Features

- **Secure Access**: Domain-restricted login system ensuring simplified security.
- **Admin Console**: Intuitive interface for educators to input diagnostic prompts and upload student data.
- **SQI Computation**: Advanced algorithm that factors in accuracy, time management, difficulty levels, and concept importance.
- **Interactive Dashboard**: Visualizes overall performance and highlights high-priority areas for student growth.
- **Data Export**: Easily download or copy analysis results in JSON format.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest for unit testing
- **Styling**: Modern CSS with glassmorphism design principles

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd diagnostic-agent
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📖 Usage Instructions

### 1. Authentication
To access the dashboard, use credentials from the authorized domain:
*   **Email**: Any email ending in `@intucate.com` (e.g., `admin@intucate.com`, `teacher@intucate.com`)
*   **Password**: Any password with at least **8 characters**.

### 2. Running an Analysis
1.  Navigate to the **Admin Console** after logging in.
2.  Input the **Diagnostic Prompt** to set the context.
3.  Upload a student data file (`.json` or `.csv`). The file should contain attempt data (question ID, concept, correctness, time taken, etc.).
4.  Click **Compute SQI**.
5.  Review the **Overall SQI Score** and **Priority Concepts** displayed on the dashboard.
6.  Use the **Download JSON** or **Copy JSON** buttons to export the results.

## 🧪 Testing

The project includes a comprehensive test suite for the SQI engine. To run the tests:

```bash
npm test
```

This ensures the accuracy of the SQI calculation logic, ranking system, and reasoning generation.

## 📄 License

This project is created for assessment and demonstration purposes.
