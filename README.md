# js-microbit-demo

A demo for the interface used on ml-machine.org

## Getting started.

- Clone the repository
- Run `npm install`
- Run `npm start`
- Open http://localhost:8080/
- If your micro:bit doesnt have accelerometer / buttons enabled for reading
   - Either use the website to flash by connecting the micro:bit using USB or transfer them manually

### The code

Contains

- `index.html` - For demoing
- `src/index.ts` - Shows example of how to use the interface
  - I strongly recommend you start here!

inside `src/microbit-interface` are the interfaces we use. If you are comfortable, take a look.

### Dependencies
The following npm packages are needed for typechecking, bluetooth and usb. Should not be needed if running `npm install`
```shell
npm i dapjs
```
```shell
npm i webusb
```
```shell
npm install --save @types/w3c-web-usb
```
```shell
npm install --save @types/web-bluetooth
```
```shell
npm i typescript
```