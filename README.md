# Valthera  

**Valthera** is a simple tool for watching file changes and automatically restarting processes.  

## Installation  

Run the following command:  

```sh
yarn global add github:wxn0brP/valthera#dist
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

Set a configuration value:  
```sh
valthera --cmd="node server.js" --watch="src"
```

See `valthera --help` for more options.

## Configuration  

Create a `valthera.json` file in your project directory eg:  
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
or run
```sh
valthera -mc
```

## Interactive Commands  

While `valthera` is running, you can type:  
| Command | Description |
| --- | --- |
| `rs` | manual restart |
| `quit` | exit the program |
| `help` | list available commands |
| `config` | show current configuration |
| `cls` | clear the console |
| `$<command>` | execute a custom command (eg `$yarn add`) |
| `<command>` | execute a custom command from `events` |