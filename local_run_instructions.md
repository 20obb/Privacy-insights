# Instructions for Running Privacy Insights Locally

These instructions will guide you through running both the backend (FastAPI) and frontend (React) components of the Privacy Insights application on your local network.

**Prerequisites:**

*   Python 3.10+ installed.
*   Node.js (v18 or later) and pnpm installed.
*   Git (optional, for cloning if you receive the code via a repository).
*   The project code (unzipped from `privacy_checker_project.zip`).

**1. Running the Backend (FastAPI):**

   a.  **Navigate to the backend directory:**
      ```bash
      cd path/to/privacy_checker_project/backend
      ```

   b.  **Create and activate a Python virtual environment:**
      ```bash
      # Create virtual environment (only needed once)
      python3 -m venv venv

      # Activate virtual environment
      # On macOS/Linux:
      source venv/bin/activate
      # On Windows (Command Prompt):
      # venv\Scripts\activate.bat
      # On Windows (PowerShell):
      # .\venv\Scripts\Activate.ps1
      ```
      *You should see `(venv)` at the beginning of your terminal prompt.*

   c.  **Install dependencies:**
      ```bash
      pip install -r requirements.txt
      ```

   d.  **Run the FastAPI server:**
      ```bash
      uvicorn main:app --host 0.0.0.0 --port 8000 --reload
      ```
      *   `--host 0.0.0.0` makes the server accessible from other devices on your network.
      *   `--port 8000` specifies the port (you can change this if 8000 is busy).
      *   `--reload` automatically restarts the server when code changes (useful for development).
      *   The backend API will be running at `http://<your-local-ip>:8000`.

**2. Running the Frontend (React):**

   a.  **Navigate to the frontend directory:**
      ```bash
      # Open a NEW terminal window or tab
      cd path/to/privacy_checker_project/frontend
      ```

   b.  **Install dependencies:**
      ```bash
      pnpm install
      ```

   c.  **Configure the Backend API Address:**
      *   Find the local IP address of the machine running the backend server. (See "Finding Your Local IP Address" below).
      *   Create a file named `.env` in the `frontend` directory.
      *   Add the following line to the `.env` file, replacing `<backend-local-ip>` with the actual IP address found:
         ```
         VITE_API_ENDPOINT=http://<backend-local-ip>:8000
         ```
         *Example: `VITE_API_ENDPOINT=http://192.168.1.10:8000`*

   d.  **Run the React development server:**
      ```bash
      pnpm run dev --host
      ```
      *   `--host` makes the development server accessible on your network.
      *   The frontend will typically be available at `http://<your-local-ip>:5173` (Vite usually defaults to port 5173, but check the terminal output for the exact "Network" URL).

**3. Finding Your Local IP Address:**

   *   **On macOS:** Go to System Preferences > Network > Select your active connection (Wi-Fi or Ethernet) > Your IP address is listed there.
   *   **On Windows:** Open Command Prompt and type `ipconfig`. Look for the "IPv4 Address" under your active network adapter (Wireless LAN adapter Wi-Fi or Ethernet adapter).
   *   **On Linux:** Open a terminal and type `ip addr show` or `hostname -I`. Look for the IP address associated with your network interface (e.g., `eth0` or `wlan0`).

**4. Accessing the Application:**

   *   Once both servers are running, open a web browser on any device connected to the **same local network**.
   *   Navigate to the frontend URL provided in the terminal output when you started the frontend server (e.g., `http://<your-local-ip>:5173`).
   *   You should now be able to use the Privacy Insights application.

**Stopping the Servers:**

*   Go back to the terminal windows where you started the backend and frontend servers.
*   Press `Ctrl + C` in each terminal to stop the servers.
*   If you activated a virtual environment for the backend, you can deactivate it by typing `deactivate`.

