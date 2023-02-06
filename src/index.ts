import MicrobitBluetooth from "./microbit-interface/Bluetooth/MicrobitBluetooth";
import EventEmittingMicrobitBluetooth from "./microbit-interface/Bluetooth/EventEmittingMicrobitBluetooth";
import MBSpecs from "./microbit-interface/MBSpecs";
import ButtonStates = MBSpecs.ButtonStates;
import EventEmittingMicrobitUSB from "./microbit-interface/USB/EventEmittingMicrobitUSB";

// Elements in index.html for visual feedback
const connectButton = document.getElementById("connect_button");
const usbConnectButton = document.getElementById("usb_connect");
const nameInputField = document.getElementById("name_field") as HTMLInputElement;
const jsonDump = document.getElementById("jsondump");
const accelOutput = document.getElementById("accelOutput");
const mbVersion = document.getElementById("mbVersion");
const buttonAState = document.getElementById("buttonAState");
const buttonBState = document.getElementById("buttonBState");

const usbVersion = document.getElementById("usbVersion");
const usbName = document.getElementById("usbName");
const usbSerial = document.getElementById("usbSerial");

const nameToPattern = document.getElementById("nameToPattern") as HTMLInputElement;
const nameToPatternConvert = document.getElementById("nameToPatternConvert");
const nameToPatternOutput = document.getElementById("nameToPatternOutput");

const getNameFromInputField = () => nameInputField.value
// Adding functionality to the html
connectButton.addEventListener("click", async () => {
    // In order to connect, we need the name of the micro:bit to find it through bluetooth.
    const microbitName = getNameFromInputField();

    const onError = (err) => {
        console.log(err)
    }
    // This is a generic bluetooth device, could be anything
    const device: BluetoothDevice = await EventEmittingMicrobitBluetooth.eventEmittingRequestDevice(microbitName, onError);

    // Now we will create a wrapper around the bluetooth device, which we call MicrobitBluetooth
    // Supported callbacks for connection
    const onFailedConnection = (err) => {
        console.log(err)
    }
    const onConnectionSuccess = (gattServer?) => {
        console.log("Micro:bit connected successfully !")
    }
    const onDisconnect = (manual?: boolean) => {
        console.log("Micro:bit got disconnected")
        console.log("Was the microbit disconnected manually ? ", manual)
        // Note: manual disconnects means, explicitly calling the method
        //  	mbBt.disconnect();
        // Unplugging or resetting the micro:bit does NOT constitute as a manual disconnect.
        // - This could be used for detecting if the connection has been lost
    }
    // This is the bluetooth device with a microbit functionality wrapper around it.
    const mbBt = await EventEmittingMicrobitBluetooth.createEventEmittingConnection(
        device,
        onConnectionSuccess,
        onDisconnect,
        onFailedConnection
    );
    jsonDump.innerHTML = JSON.stringify(mbBt)

    // Now lets look at some ways to use it, follow the function
    microbitConnected(mbBt);
})

const accelChange = (x, y, z) => {
    const asText = `x:${x} y:${y} y:${z}`
    accelOutput.innerHTML = asText;
}

const buttonAChange = (state: ButtonStates) => {
    buttonAState.innerHTML = state.toString()
}
const buttonBChange = (state: ButtonStates) => {
    buttonBState.innerHTML = state.toString()
}

const microbitConnected = async (microbit: MicrobitBluetooth) => {
    // Above is defined an accelChange function. This we will use as a callback for when the microbit's accelerometer changes
    await microbit.listenToAccelerometer(accelChange);

    // Now let's see what version we are running:
    const microbitVersion = microbit.getVersion()
    mbVersion.innerHTML = microbitVersion.toString();

    // Above is another function, buttonChange(for both A and B button),
    // which we will use as a callback for when the microbit's button state changes.
    await microbit.listenToButton("A", buttonAChange)
    await microbit.listenToButton("B", buttonBChange)
}

// Usb stuff
usbConnectButton.addEventListener("click", async () => {
    const mbUsb = await EventEmittingMicrobitUSB.eventEmittingRequestConnection();

    const microbitVersion = mbUsb.getModelNumber();
    usbVersion.innerHTML = microbitVersion.toString();

    const microbitName = await mbUsb.getFriendlyName();
    usbName.innerHTML = microbitName;

    const serno = mbUsb.getSerialNumber()
    usbSerial.innerHTML = serno;
    // If one should want to flash a .hex file onto the microbit, it would be done like so
    /*
    mbUsb.flashHex("./public/some.hex", (progress) => {
        const progressInPercentage = progress * 100
        console.log(`Flashing progress ${progressInPercentage}%`)
    }).then(() => {
        console.log("Flashing finished!")
    })
     */
})

// Pattern / name stuff
const getNameToPatternField = () => nameToPattern.value;

nameToPatternConvert.addEventListener("click", () => {
    const name = getNameToPatternField();
    const pattern = MBSpecs.Utility.nameToPattern(name);
    console.log(pattern)
    const formattedPattern = pattern.map(value => value ? "x" : "o")
    let result = ""
    for (let i = 0; i < 5; i++) {
        result += "<p style='line-height: 3px; font-size: 20px'>"
        for (let j = 0; j < 5; j++) {
            result += " " + formattedPattern[5*i + j];
        }
        result += "</p>"
    }
    nameToPatternOutput.innerHTML = result;

    // We can convert patterns back to names using
    console.log(MBSpecs.Utility.patternToName(pairingPatternForZuzag))
})

// https://support.microbit.org/support/solutions/articles/19000067679-how-to-find-the-name-of-your-micro-bit
// The pairing pattern for a microbit named zuzag
const pairingPatternForZuzag = [
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true
]