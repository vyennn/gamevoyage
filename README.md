
GameVoyage is a dynamic, interactive, single-page web application that tells a visual story about free-to-play games using data from the FreeToGame API. 

Features
- Fetches free-to-play PC games from the FreeToGame API
- Interactive animations with Framer Motion
- 3D game models and visuals using @google/model-viewer
- Custom icons with Lucide React
- Smooth navigation with Inertia.js

Tech Stack
- Frontend: React, Framer Motion, Lucide React, Inertia.js
- Backend: Laravel
- Database: MySQL
- 3D Models: @google/model-viewer
- API: FreeToGame (Category: Fun & Games)

Setup Instructions
Follow these steps to set up and run the project locally:

1. Clone the repository
git clone <your-repo-url>
cd quest-chronicle

2. Install Backend Dependencies
Make sure Composer is installed. Then run:
composer install

3. Install Frontend Dependencies
Make sure Node.js and npm are installed. Then run:
npm install
npm install framer-motion lucide-react @google/model-viewer

⚠️ If you encounter dependency issues, try adding --legacy-peer-deps when installing npm packages:
npm install --legacy-peer-deps

4. Configure Environment
Copy the .env.example file to .env:
cp .env.example .env

Update the database settings:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password

Then generate the app key:

php artisan key:generate

5. Run Database Migrations
Run the migrations to set up the database schema:
php artisan migrate

6. Run the Application
You need two terminals:
Terminal 1: Run the frontend development server
npm run dev

Terminal 2: Run the Laravel backend server
php artisan serve

Once both servers are running, open your browser and go to:

http://localhost:8000

API Details
- API Name: FreeToGame
- Category: Fun & Games
- Description: Free-to-play games

Sample Endpoint:
https://www.freetogame.com/api/games?platform=pc

Additional Notes
- Use Framer Motion for animations and transitions
- 3D models are rendered with <model-viewer>
- Lucide React provides all icons
- Ensure Node.js >= 18, PHP >= 8.1, and MySQL >= 8 for compatibility

Troubleshooting
Port conflict for Vite:
If npm run dev reports port 5173 in use, it will try another port automatically (e.g., 5174).

Three.js / @react-three/fiber errors:
Make sure package versions are compatible. Use older versions if needed:
npm install @react-three/fiber@8.13.3 @react-three/drei@9.57.3 three@0.172.0


npm dependency errors:
Add --legacy-peer-deps during npm install.

License
This project is for educational and portfolio purposes. Modify and redistribute freely with proper credit.

GDrive Link for our report:
https://drive.google.com/file/d/1L-HQxKtet-Lb7vXtD7-Ua-Hm5xblo8N_/view?usp=sharing
