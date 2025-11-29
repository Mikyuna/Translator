# Github Page: 
https://mikyuna.github.io/Translator/

# Language Translator Web App
A simple interactive translator that uses the OpenL Translate API to convert text into different languages through a chat-style interface.

## Overview
The is a web application created to help users translate texts into different langauages in the style of a text or chat format. It was developed for my current project, the goal of this is to make this user friendly with a clean ui, that also make it feel like the user is chatting and learning instead of just translating

## Features
- Translate text to 6 languages (ES, ZH, JA, KO, FR, DE)
- Chat-style interface
- Text-to-speech for translated output
- Copy-to-clipboard
- Clear chat / clear input
- Mobile-responsive layout

## How the Website work
- Displays the user message in the chat window  
- Sends the text to the OpenL Translate API through RapidAPI  
- Receives the translated result  
- Shows the translation in a bot-style message bubble  
- Provides extra tools like speech and copy buttons for each translation

## API used
This project uses the OpenL Translate API via RapidAPI.
The app sends the user’s text and target language to the /translate/bulk endpoint and displays the translated result in a chat-style interface.

## How to run
1. Make sure index.html, style.css, and script.js are in the same folder.
2. Open script.js and replace "KEY" with your own RapidAPI key.
3. Double-click index.html (or open it in a browser like Chrome).
4. Type a sentence, choose a target language, and click Send to see the translation.

## Credits
Translation functionality uses the OpenL Translate API from RapidAPI.
https://rapidapi.com/lvwzhen/api/openl-translate

Text-to-Speech uses the browser’s built-in Web Speech API.