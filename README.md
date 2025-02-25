# Valthera  

**Valthera** is a simple tool for watching file changes and automatically restarting processes.  

## Installation  

Run the following command:  

```sh
curl -L https://github.com/wxn0brP/valthera/raw/main/valthera -o /usr/local/bin/valthera && chmod +x /usr/local/bin/valthera
```

This downloads the `valthera` script and makes it executable.  

## Usage  

Run with the default command:  
```sh
valthera
```

Run with a custom command:  
```sh
valthera -c "node server.js"
```

Use a predefined configuration:  
```sh
valthera -p ts
```

Show available options:  
```sh
valthera -h
```

## Configuration  

Create a `valthera.json` file in your project directory:  
```json
{
  "cmd": "npm start",
  "watch": ["src"],
  "ignore": ["node_modules"],
  "restart_cmd": "clear",
  "events": {
    "clean": "rm -rf dist"
  }
}
```

## Interactive Commands  

While `valthera` is running, you can type:  
- `rs` – manual restart  
- `quit` – exit the program  
- `help` – list available commands  
- `config` – show current configuration  
- `<command>` – execute a custom command from `events`