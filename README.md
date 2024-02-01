# Quickstart
```
sudo docker build -t auto-content-backend .
sudo docker run --env-file .env -v /home/user/repos/nodejs/auto-content-backend/out:/src/out -v /home/user/repos/nodejs/auto-content-backend/credentials:/src/credentials -d -p 5000:5000 auto-content-backend
```

# Setup
- Setup Openai
    - generate openai api key
    - put it in .env
- Setup Youtube
    - make google account
    - make youtube channel
    - generate google app
    - generate youtube data api key
    - put it client_secret_1
- Enjoy

# Build
```sudo docker build -t auto-content-backend .```

# Running
```sudo docker run --env-file .env --v ~/repos/nodejs/auto-content-backend:/out/in/container d -p 3000:3000 auto-content-backend```

# Testing
npm run test