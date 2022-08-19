# Twitch chatbot with predefined commands 

## Features

- notable commands
    - ^hangman
        - starts an interactive hangman game in the specified channel
    - ^braille
        - converts text into a picture form using Braille patterns, example: HELLO ->
          ⣿⣿⣿⣿⠉⣿⣿⡏⢹⡏⣉⣉⣉⣹⡏⣿⣿⣿⡏⢹⣿⣿⣿⠟⢉⣉⠙⣿⣿⣿⣿⣿ 
          ⣿⣿⣿⣿⠀⣤⣤⡄⢸⡇⣉⣉⣉⣿⡇⣿⣿⣿⡇⢸⣿⣿⣿⢸⣿⣿⣿⠀⣿⣿⣿⣿ 
          ⣿⣿⣿⣿⣀⣿⣿⣇⣸⣇⣉⣉⣉⣹⣇⣉⣉⣉⣧⣈⣉⣉⣿⣦⣈⣉⣠⣿⣿⣿⣿⣿
    - ^yourmom
        - gets a random yo-mama joke from an internet database
    - ^huntweebs, ^killweebs, ^tortureweebs
        - Point system with values stored in a database


## what u need
- .env file with the following properties:
    - USERNAME=[twitch username]
        - the username of the twitch account used to connect to Twitch's servers
    - PASSWORD=[password]
        - the OAuth password for the twitch account that is used to authenticate with the Twitch IRC server
    - CLIENT_ID=[id]
        - Requied to use Twitch API
    - CLIENT_SECRET=[secret]
        - The client secret for API endpoints
    - APP_ACCESS_TOKEN=[token]
        - making POST requests for Webhook Subscriptions. this will expire and must be periodically changed: 'Bearer APP_ACCESS_TOKEN'
    - CHANNELS=[id1],[id2],...
        - the ids of the channels that the bot will connect to on startup.

- channelsettings.json