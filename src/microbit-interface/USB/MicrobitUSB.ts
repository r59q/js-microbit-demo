import { CortexM, DAPLink, WebUSB } from "dapjs";
import MBSpecs from "../MBSpecs";

/**
 * A USB connection to a micro:bit.
 */
class MicrobitUSB extends CortexM {

	protected readonly transport: WebUSB;

	/**
	 * Creates a new MicrobitUSB object.
	 *
	 * Use MicrobitUSB.requestConnection() or MicrobitUSB.createWithoutRequest() to create a new MicrobitUSB object.
	 * @param usbDevice The USB device to connect to.
	 * @protected constructor for internal use.
	 */
	protected constructor(protected usbDevice: USBDevice) {
		const transport: WebUSB = new WebUSB(usbDevice);
		super(transport);
		this.transport = transport;
	}

	/**
	 * Open prompt for USB connection.
	 * @returns {Promise<MicrobitUSB>} A promise that resolves to a new MicrobitUSB object.
	 */
	protected static async requestConnection(): Promise<MicrobitUSB | undefined> {
		const requestOptions: USBDeviceRequestOptions = {
			filters: [
				{
					vendorId: MBSpecs.USBSpecs.VENDOR_ID,
					productId: MBSpecs.USBSpecs.PRODUCT_ID
				}
			]
		};

		try {
			const device: USBDevice = await navigator.usb.requestDevice(
				requestOptions
			);
			return new MicrobitUSB(device);
		} catch (e) {
			console.log(e);
			return Promise.reject(e);
		}
	}

	/**
	 * Returns the USB serial number of the device
	 */
	public getSerialNumber(): string {
		return this.usbDevice.serialNumber!.toString();
	}

	/**
	 * Uses the serial number from dapjs to determine the model number of the board.
	 * Read more: https://support.microbit.org/support/solutions/articles/19000035697-what-are-the-usb-vid-pid-numbers-for-micro-bit
	 * @returns The hardware model of the micro:bit. Either 1 or 2.
	 */
	public getModelNumber(): 1 | 2 {
		const sernoPrefix: string = this.usbDevice.serialNumber!
			.toString()
			.substring(0, 4);
		if (parseInt(sernoPrefix) < 9903) return 1;
		else return 2;
	}

	/**
	 * @returns {string} The friendly name of the micro:bit.
	 */
	public async getFriendlyName(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			let result = "";
			let err = undefined;
			try {
				await this.connect();
				// BluetoothConnectedMicrobit only uses MSB of serial number
				let serial = await this.readMem32(
					MBSpecs.USBSpecs.FICR + MBSpecs.USBSpecs.DEVICE_ID_1
				);
				console.log(serial);
				result = MBSpecs.Utility.serialNumberToName(serial);
			} catch (e: any) {
				console.log(e);
				err = e;
			} finally {
				await this.disconnect();
			}
			if (!result) {
				reject(err);
			}
			resolve(result);
		});
	}

	/**
	 * Flashes a .hex file to the micro:bit.
	 * @param {string} hex The hex file to flash. (As a link)
	 * @param {(progress: number) => void} progressCallback A callback for progress.
	 */
	protected async flashHex(
		hex: string,
		progressCallback: (progress: number) => void
	): Promise<void> {
		return new Promise(async (resolve, reject) => {

			const hexFile: Response = await fetch(hex);
			const buffer: ArrayBuffer = await hexFile.arrayBuffer();

			const target = new DAPLink(this.transport);

			target.on(DAPLink.EVENT_PROGRESS, (progress) => {
				progressCallback(progress);
			});

			try {
				await target.connect();
				await target.flash(buffer);
				await target.disconnect();
			} catch (error) {
				console.log(error);
				reject(error);
			}
			resolve();
		});

	}
}

export default MicrobitUSB;
