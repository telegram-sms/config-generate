# Telegram SMS Config generator

## Description
This project is a configuration generator for Telegram SMS. It provides a user-friendly interface built with React for managing configurations. The project supports encryption and decryption of data using Rust and WebAssembly, ensuring secure handling of sensitive information. It leverages Node.js and npm for package management and build processes, and integrates with Rust and Cargo for cryptographic operations.

## Features
- Generates configuration for Telegram SMS
- Supports encryption and decryption of data using Rust and WebAssembly
- Provides a React-based user interface for configuration management
- Utilizes Node.js and npm for package management and build processes
- Integrates with Rust and Cargo for cryptographic operations

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
    cargo build
    ```
3. Build the wasm project:
    ```sh
    cargo install wasm-pack
    cd wasm-rs
    wasm-pack build
    mkdir -p ../src/wasm
    cp pkg/* ../src/wasm/
    ```
4. Start the development server:
    ```sh
   
    npm run dev
    ```

## License
This project is licensed under the BSD 3-Clause License - see the `LICENSE` file for details.