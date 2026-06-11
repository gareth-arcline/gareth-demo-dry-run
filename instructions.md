# Instructions for AI / App Training - Step By Step

## 1. Pre-workshop Scripts

### 1a.  Link to origin
```Git initialize this folder and use https://github.com/gareth-arcline/gareth-demo-dry-run as the origin.  Sync with origin```

### 1b.  Clone files from Template into codebase
```Clone the contents from  https://github.com/Arcline-Investment-Management/arcline-app-template to this repo.  Do not include the root folder```

### 1c.  Fix if the root folder is present from the template
```We do not need the root folder arcline-app-template in the folder structure, the correct structure should be Root>backend/frontend/docs with no intermediate root.  Please remove the intermediate root```

### 1d.  Claude File
```Included in the docs folder are multiple markdown files containing instructions on our corporate standards for multiple application features, update your Claude file to always check this folder for specific instructions to follow before planning or developing and features```

### 1e.  Install Dependencies
```Install all frontend and backend dependencies, use venv```

### 1f. Start backend and frontend
```Give me the commands to run from ./backend and ./frontend to manually start the services, I will start and stop all services - update your Claude file prohibiting you from starting or stopping services without explicit approval.```

## 2a. Starting Prompt
I want to create a notes summarizer. This will be an AI enabled app, but lets start by building out the user interface, workflows, and front end before integrating the LLM. Use randomly generated text as a placeholder for AI generated text outputs. The user workflow will be:
1.User uploads a set of notes files – use the .md file “File-Upload-Progress-Pattern” and have ability to drag and drop multiple files into a landing zone. It should accept emails, powerpoints, docs, text files, etc.
2.User then provides a prompt to the LLM that outlines in a couple bullets the themes they want to cover in the notes
3.LLM is passed a system prompt along with the user input and the provided raw notes files and generates an outline of the finalized notes.
4.The user then has an interactive way to drag and drop topics, delete topics or combine topics, or add their own, or provide a different prompt and have the notes summarizer re-generate or adjust the outline
5.Once the outline is finalized, the user can press a button to generate and the LLM will get called again to summarize all the raw notes files into the outline
6.User can then download the finished doc into .docx format.
I’ve uploaded some examples of 3 sets of notes that were consolidated into one set. The raw files are in the folder with the label “raw” in the beginning of the file name, and the final one says “final” in the filename. Please develop a plan to implement this so I can test the UI and workflow before adding in the AI integration. Before you proceed on implementation, clarify any questions you may have on the user workflow, UX design, backend design, etc.

