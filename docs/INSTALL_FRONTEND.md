# Artifact Registry Frontend - Installation Guide (Windows)

This guide provides step-by-step instructions for installing and running the Artifact Registry frontend on a Windows machine **without requiring administrator/elevated privileges**.

## Prerequisites

Before you begin, ensure you have:
- Windows 10 or later
- Network access to download packages
- Access to the backend API server (URL and port)

## Installation Steps

### 1. Install Node.js (Portable Version)

Since you don't have admin rights, use the portable version of Node.js:

1. **Download Node.js Portable**
   - Visit: https://nodejs.org/en/download/
   - Download the **Windows Binary (.zip)** for your architecture (likely x64)
   - Example: `node-v20.x.x-win-x64.zip`

2. **Extract Node.js**
   - Extract the ZIP file to a location you have write access to
   - Example: `C:\Users\YourUsername\nodejs`

3. **Add Node.js to PATH (User Environment Variable)**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to **Advanced** tab → **Environment Variables**
   - Under **User variables**, select `Path` → **Edit**
   - Click **New** and add the path to your Node.js folder
   - Example: `C:\Users\YourUsername\nodejs`
   - Click **OK** to save

4. **Verify Installation**
   - Open a **new** Command Prompt or PowerShell window
   - Run: `node --version`
   - Run: `npm --version`
   - Both should display version numbers

### 2. Get the Frontend Code

1. **Copy the Registry Folder**
   - Copy the entire `registry` folder to your machine
   - Place it somewhere you have write access
   - Example: `C:\Users\YourUsername\registry`

2. **Navigate to Frontend Directory**
   ```cmd
   cd C:\Users\YourUsername\registry\frontend
   ```

### 3. Install Dependencies

Install all required npm packages:

```cmd
npm install
```

This will download and install all dependencies listed in `package.json`. This may take a few minutes.

### 4. Configure Backend API URL

The frontend needs to know where the backend API is running.

1. **Open the OpenAPI Configuration File**
   - File: `frontend\src\client\core\OpenAPI.ts`

2. **Update the BASE URL**
   - Find the line with `BASE: 'http://localhost:8000'`
   - Change it to your backend server URL
   - Example: `BASE: 'http://192.168.1.100:8000'`
   - Or if using a domain: `BASE: 'https://api.yourserver.com'`

3. **Save the file**

### 5. Run the Frontend Development Server

Start the development server:

```cmd
npm run dev
```

You should see output like:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.XXX:5173/
```

### 6. Access the Application

1. **Open your web browser**
2. **Navigate to:** `http://localhost:5173`
3. **The Artifact Registry application should load**

## Building for Production (Optional)

If you want to create a production build that can be served by a web server:

```cmd
npm run build
```

This creates an optimized build in the `frontend\dist` folder. You can then:
- Copy the `dist` folder to any web server
- Serve it using a simple HTTP server
- Or use `npm run preview` to test the production build locally

## Troubleshooting

### "node is not recognized as an internal or external command"

**Solution:** Node.js is not in your PATH. Repeat step 1.3 to add it to your user environment variables, then open a **new** command prompt.

### "npm install" fails with permission errors

**Solution:** Make sure you're installing in a directory where you have write permissions (e.g., your user folder, not `C:\Program Files`).

### Frontend can't connect to backend

**Solution:** 
1. Verify the backend is running and accessible
2. Check the `BASE` URL in `frontend\src\client\core\OpenAPI.ts`
3. Ensure there are no firewall rules blocking the connection
4. Check browser console (F12) for CORS errors

### Port 5173 is already in use

**Solution:** The dev server will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual URL.

## Stopping the Server

To stop the development server:
- Press `Ctrl + C` in the terminal/command prompt
- Type `Y` when asked to terminate the batch job

## Notes

- The development server automatically reloads when you make code changes
- For production deployment, always use `npm run build` and serve the `dist` folder
- Keep your Node.js installation up to date for security patches
- The frontend requires the backend API to be running and accessible

## Support

For issues or questions:
- Check the browser console (F12) for error messages
- Check the terminal output for build/runtime errors
- Verify backend connectivity using the browser's Network tab (F12)
