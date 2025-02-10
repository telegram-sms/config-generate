# Telegram SMS Config generator

## Description
This project is a configuration generator for Telegram SMS. It provides a user-friendly interface built with React for managing configurations. 


## What can this project do?
This project is a configuration generator for Telegram SMS. It provides a user-friendly interface for generating and transmitting configurations for Telegram SMS. You can use this project to generate the following configs:

### Main Configuration
Via the main configuration, you can set up all of the necessary parameters for Telegram SMS to function properly. You can even get the chat ID of the Telegram user you want to send SMS to and test the whole configuration just here, without having to use the app itself.


### Carbon Copy Providers
Carbon Copy is a feature in Telegram SMS that allows you to send a copy of the SMS **other than** Telegram Bot HTTP API itself using Webhooks.

Telegram SMS supports multiple Carbon Copy Providers being enabled at the same time. Here are the Carbon Copy Providers that have been implemented in the project:
- [Bark](https://github.com/Finb/Bark)
- [cURL](https://curl.se/)
- [Gotify](https://gotify.net/)
- [Lark](https://www.larksuite.com/)
- [Push Deer](https://pushdeer.com/)


You can implement a new Carbon Copy Provider by following the instructions [here](./docs/CarbonCopyProvider.md).


## Installation

### Prerequisites
- Node.js
- npm
- Rust
- Cargo

### Steps
1. Clone the repository:
    ```sh
    git clone https://github.com/telegram-sms/config-generate.git
    cd config-generate
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Build the wasm project:
    ```sh
    cargo install wasm-pack
    mkdir -p ../src/wasm
    npm run build:wasm
    ```
4. Start the development server:
    ```sh
    npm run dev
    ```

## License
This project is licensed under the BSD 3-Clause License - see the `LICENSE` file for details.