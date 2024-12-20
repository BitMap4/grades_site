# Grade Cutoff Squeezer

Website for approximating the grade cutoffs for courses by using user-submitted data.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)
- [Python 3](https://www.python.org/downloads/)

### Running

1. Backend
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python3 run.py
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   npx @chakra-ui/cli snippet add toaster
   npx @chakra-ui/cli snippet add field
   npx @chakra-ui/cli snippet add provider
   npx @chakra-ui/cli snippet add select
   npm run dev # for development, otherwise: npm run build
    ```

## TODO
- [ ] Allow users to add courses
- [x] Fix width when no course is selected
- [x] Interface for viewing grade cutoffs
- [x] [!] Add info for users, like "only one submission per course"
- [x] Styling
- [x] [!!] Refactor backend code
- [x] [!] Use dropdown with search input for course selection
- [x] Mobile responsiveness
- [x] [!!] Replace temp and secret stuff with env variables
- [x] [!!] use jwt for cookies
- [x] Allow same course in different years
- [x] Rate limiting