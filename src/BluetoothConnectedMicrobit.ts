import MicrobitBluetooth from "./microbit-interface/Bluetooth/MicrobitBluetooth";
import EventEmittingMicrobitBluetooth from "./microbit-interface/Bluetooth/EventEmittingMicrobitBluetooth";

class BluetoothConnectedMicrobit {
	private constructor(private mbBluetooth: MicrobitBluetooth) {
	}

	public static async createConnection(nameOfMicrobit:string): Promise<BluetoothConnectedMicrobit> {
		const onError = (err) => {
			console.log(err)
		}
		// This is a generic bluetooth device, could be anything
		const device: BluetoothDevice = await EventEmittingMicrobitBluetooth.eventEmittingRequestDevice(nameOfMicrobit, onError);


		// Supported callbacks for connection
		const onFailedConnection = (err) => {
			console.log(err)
		}
		const onConnectionSuccess = () => {
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
		const mbBt = await EventEmittingMicrobitBluetooth.createEventEmittingConnection(device,onConnectionSuccess,onDisconnect,onFailedConnection);
		return new BluetoothConnectedMicrobit(mbBt);
	}
}

export default BluetoothConnectedMicrobit;