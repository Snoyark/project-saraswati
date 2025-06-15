## What is this?
If you ever wanted to see a bunch of research papers in a field (say, artificial intelligence) listed for you, so you could keep up-to-date with the latest papers, AND wanted to spend less than an hour per paper, this project is for you! After setting it up, this project creates a chatbot that pulls papers from Arxiv that have been recently published and gives explanations of the paper itself. It can also dive deeper into single papers if something doesn't make sense. Ideally, it should make paper reading faster and more approachable for someone without a scientific/academic background.

## Next steps
1. Host this on some local hardware so anyone can just start interacting with it using a website.
2. Add tests and valdation on behavior.
3. Improve the UI so it's more intuitive and professional.
4. Allow for multiple chats per user session.
5. Allow for history/accounts.

## Basic Local Setup
If you're running Windows, I'd recommend using [git bash](https://gitforwindows.org), which allows Linux style commands easily. This will install `git` in general (a version control software), in addition to a shell that's essential to running the following commands.

To run this locally, you'll need to install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), which is the package manager used to install all of the dependencies. After installation, in the terminal, run:

```
npm install typescript --save-dev
```

You'll also need to install [Ollama](https://ollama.com/download) for your system (which should be OS agnostic). After installing Ollama, you'll need to start running the model locally. This project uses `llama3.2` by default, but this can be changed in the `src/utils/constants.ts` file, under the variable `OLLAMA_MODEL`.

Run:
```
ollama run llama3.2
```
And wait for it to complete. Once it does, you'll need to run the actual files in the repository. First, under the project-saraswati folder:
```
npm ci && tsc
```
Then run these two commands in separate terminal windows:
```
npm run dev

node built/src/main/server.js
```
Then go to localhost:3000, and start asking your questions!

### Logging Setup (only necessary for debugging/developers)
You'll need to create a .env file in the home directory if you want to use LangSmith to debug this going forward
```
echo 'LANGSMITH_TRACING="true" \
LANGSMITH_ENDPOINT="https://api.smith.langchain.com" \
LANGSMITH_API_KEY="" \
LANGSMITH_PROJECT=""' > test
```
